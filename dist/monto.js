(function (mod) {
    if (typeof exports == 'object' && typeof module == 'object') // CommonJS
        mod(require('../../lib/codemirror'));
    else if (typeof define == 'function' && define.amd) // AMD
        define(['../../lib/codemirror'], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    'use strict';

    CodeMirror.defineMode('monto', function () {
        // get instance of editor
        var editor = $('.CodeMirror')[0].CodeMirror;
        var markers = [];
        var cursor;

        editor.on('cursorActivity', function (cm) {
            // always keep track of the current cursor position
            cursor = cm.getCursor();
        });

        editor.on('change', function (cm, change) {
            Monto.refreshLineSizes();
            Monto.getMessage().contents = cm.getValue();
            Monto.send();
        });

        Monto.registerOnReceive(function (newProduct) {
            console.log(newProduct);
            if (newProduct.product === 'tokens' && newProduct.version_id > Monto.getTokens().version_id) {
                Monto.setTokens(newProduct);
                editor.operation(function () {
                    markers.forEach(function (marker) {
                        marker.clear();
                    });
                    var contents = JSON.parse(Monto.getTokens().contents);
                    var line = 0;
                    var offset = 0;
                    var lineReduction = 0;
                    contents.forEach(function (content) {
                        var pos = Monto.convertMontoToCMPosWithLength({offset: content.offset, length: content.length});
                        markers.push(editor.markText({line: pos.from.line, ch: pos.from.ch}, {
                            line: pos.to.line,
                            ch: pos.to.ch
                        }, {className: 'cm-' + content.category}));
                    });
                });
            } else if (newProduct.product === 'outline' && newProduct.version_id > Monto.getOutline().version_id) {
                Monto.setOutline(newProduct);
                var contents = JSON.parse(newProduct.contents);
                $('#outline').html(refreshOutline(contents.children));
            }
        });

        function refreshOutline(children) {
            if (typeof children === 'undefined' || children === null) {
                return '';
            }
            var outline = '<ul class="outline" compact="compact" list-style="none">';
            children.forEach(function (child) {
                var pos = Monto.convertMontoToCMPosWithLength(child.identifier)
                outline += '<li>' + editor.getRange(pos.from, pos.to) + '</li>' + refreshOutline(child.children);
            });
            outline += '</ul>';
            return outline;
        }

        return {
            token: function (stream) {
                stream.skipToEnd();
                return '';
            }
        };
    });
});

var Monto = (function () {
    //if (!!window.Worker) {
    //    // get path to workerscript
    //    var scripts = document.getElementsByTagName('script');
    //    var path = scripts[scripts.length - 1].src.replace(/\/monto\.js$/, '/');
    //    return new Worker(path + 'montoWorker.js');
    //} else {
    //    alert("Your browser does not support web workers so monto plugin won't work.")
    //}
    var cm = {};
    var src = new WebSocket('ws://localhost:5000/');
    var sink = new WebSocket('ws://localhost:5001/');
    var lineSizes = [];
    var receiveEvents = [];
    var message = {
        source: 'nofile',
        version_id: 0,
        language: 'javascript',
        invalid: [],
        contents: '',
        selections: []
    };
    var tokens = {
        version_id: -1
    };
    var ast = {
        version_id: -1
    };
    var outline = {
        version_id: -1
    };
    var codecompletion = {
        version_id: -1
    };

    sink.onmessage = function (e) {
        var product = JSON.parse(e.data)
        receiveEvents.forEach(function (event) {
            event(product);
        });
    };

    return {
        getLineSizes: function () {
            return lineSizes;
        },
        setLineSizes: function (value) {
            lineSizes = value;
        },
        getMessage: function () {
            return message;
        },
        setMessage: function (value) {
            message = value;
        },
        getTokens: function () {
            return tokens;
        },
        setTokens: function (value) {
            tokens = value;
        },
        getAst: function () {
            return ast;
        },
        setAst: function (value) {
            ast = value;
        },
        getOutline: function () {
            return outline;
        },
        setOutline: function (value) {
            outline = value;
        },
        getCodecompletion: function () {
            return codecompletion;
        },
        setCodecompletion: function (value) {
            codecompletion = value;
        },
        getCM: function () {
            return cm;
        },
        setCM: function (value) {
            cm = value;
        },
        send: function () {
            src.send(JSON.stringify(message));
            message.version_id += 1;
            message.selections = [];
        },
        registerOnReceive: function (func) {
            receiveEvents.push(func)
        },
        convertMontoToCMPosWithLength: function (pos) {
            //converts positions from  {offset, length} to {{line, ch},{line,ch}}
            var chCount = 0;
            for (var i = 0; i < lineSizes.length; i++) {
                if (pos.offset < chCount + lineSizes[i]) {
                    return {
                        from: {line: i, ch: pos.offset - chCount},
                        to: {line: i, ch: pos.offset - chCount + pos.length}
                    };
                }
                //TODO +1 because of missing \n count ???
                chCount += lineSizes[i] + 1;
            }
        },
        convertCMToMontoPos: function (pos) {
            //converts positions from  {line, ch} to offset
            var chCount = 0;
            for (var i = 0; i <= pos.line; i++) {
                var lineSize = lineSizes[i];
                if (i === pos.line) {
                    chCount += pos.ch;
                } else {
                    chCount += lineSize;
                }
            }
            return chCount;
        },
        refreshLineSizes: function () {
            var lines = cm.getValue().split('\n');
            lineSizes = [];
            lines.forEach(function (line) {
                lineSizes.push(line.length);
            });
        }
    }
})();