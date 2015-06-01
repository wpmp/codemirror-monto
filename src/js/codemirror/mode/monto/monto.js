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
        var product = {
            version_id: -1
        };
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

        sink.onmessage = function (e) {
            var newProduct = JSON.parse(e.data);
            if (newProduct.product === 'tokens' && newProduct.version_id > product.version_id) {
                product = newProduct;
                editor.operation(function () {
                    markers.forEach(function (marker) {
                        marker.clear();
                    });
                    var contents = JSON.parse(product.contents);
                    var content;
                    var line = 0;
                    var offset = 0;
                    var lineReduction = 0;
                    for (var i = 0; i < contents.length; i++) {
                        content = contents[i];
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
                    }
                });
            }
        };

        editor.on('cursorActivity', function (cm) {
            cursor = cm.getCursor();
        });

        editor.on('change', function (cm, change) {
            if (typeof change !== 'undefined') {
                setLineSizes(cm);
                message.contents = cm.getValue();
                src.send(JSON.stringify(message));
                message.version_id += 1;
            }
        });

        return {
            token: function (stream) {
                stream.skipToEnd();
                return "";
            }
        };

        function setLineSizes(cm) {
            var lines = cm.getValue().split('\n');
            lineSizes = [];
            lines.forEach(function (line) {
                lineSizes.push(line.length);
            });
        }
    });
});