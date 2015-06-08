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
        var src = new WebSocket('ws://localhost:5000/', ['soap', 'xmpp']);
        var sink = new WebSocket('ws://localhost:5001/', ['soap', 'xmpp']);

        // get instance of editor
        var editor = $('.CodeMirror')[0].CodeMirror;
        var lineSizes = [];
        var markers = [];
        var cursor;
        var message = {
            source: 'nofile',
            version_id: 0,
            language: 'javascript',
            invalid: [],
            contents: '',
            selections: []
        };
        var products = {
            tokens: {
                version_id: -1
            },
            ast: {
                version_id: -1
            },
            outline: {
                version_id: -1
            },
            codecompletion: {
                version_id: -1
            }
        };

        editor.on('cursorActivity', function (cm) {
            // always keep track of the current cursor position
            cursor = cm.getCursor();
        });

        editor.on('change', function (cm, change) {
            setLineSizes(cm);
            message.contents = cm.getValue();
            src.send(JSON.stringify(message));
            message.version_id += 1;
        });

        function setLineSizes(cm) {
            var lines = cm.getValue().split('\n');
            lineSizes = [];
            lines.forEach(function (line) {
                lineSizes.push(line.length);
            });
        }

        sink.onmessage = function (e) {
            var newProduct = JSON.parse(e.data);
            if (newProduct.product === 'tokens' && newProduct.version_id > products.tokens.version_id) {
                products.tokens = newProduct;
                editor.operation(function () {
                    markers.forEach(function (marker) {
                        marker.clear();
                    });
                    var contents = JSON.parse(products.tokens.contents);
                    var line = 0;
                    var offset = 0;
                    var lineReduction = 0;
                    contents.forEach(function (content) {
                        offset = content.offset - lineReduction;
                        if (lineSizes[line] < offset) {
                            lineReduction += offset;
                            offset = 0;
                            line++;
                        }
                        markers.push(editor.markText({line: line, ch: offset}, {
                            line: line,
                            ch: offset + content.length
                        }, {className: 'cm-' + content.category}));
                    });
                });
            } else if (newProduct.product === 'outline' && newProduct.version_id > products.outline.version_id) {
                products.outline = newProduct;
                var contents = JSON.parse(newProduct.contents);
                console.log(contents);
                $('#outline').html(refreshOutline(contents.children));
            }
        };

        //converts positions from  {offset, length} to {{line, ch},{line,ch}}
        function convertPosition(pos) {
            var chCount = 0;
            for (var i = 0; i < lineSizes.length; i++) {
                if (pos.offset < chCount + lineSizes[i]) {
                    return {
                        from: {line: i, ch: pos.offset - chCount},
                        to: {line: i, ch: pos.offset - chCount + pos.length}
                    };
                }
                //TODO +1 because of missing \n count ?
                chCount += lineSizes[i]+1;
            }
        }

        function refreshOutline(children) {
            if (typeof children === 'undefined' || children === null) {
                return '';
            }
            var outline = '<ul compact="compact">';
            children.forEach(function (child) {
                var pos = convertPosition(child.identifier)
                outline += '<li>' + editor.getRange(pos.from, pos.to) + '</li>' + refreshOutline(child.children);
            });
            outline += '</ul>';
            return outline;
        }

        return {
            token: function (stream) {
                stream.skipToEnd();
                return "";
            }
        };
    });
});