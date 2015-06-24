var Monto = (function () {
    //if (!!window.Worker) {
    //    // get path to workerscript
    //    var scripts = document.getElementsByTagName('script');
    //    var path = scripts[scripts.length - 1].src.replace(/\/monto\.js$/, '/');
    //    return new Worker(path + 'montoWorker.js');
    //} else {
    //    alert("Your browser does not support web workers so monto plugin won't work.")
    //}
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

    function toPreString(content) {
        return '<pre>' + JSON.stringify(content, null, 2).replace('<', '&lt').replace('>', '&gt') + '</pre>';
    }

    sink.onmessage = function (e) {
        var product = JSON.parse(e.data);
        if (product.product === 'tokens' && (product.source !== tokens.source || product.version_id > tokens.version_id)) {
            tokens = product;
            $('#tab-tokens').html(toPreString(product));
        } else if (product.product === 'ast' && (product.source !== ast.source || product.version_id > ast.version_id)) {
            ast = product;
            $('#tab-ast').html(toPreString(product));
        } else if (product.product === 'outline' && (product.source !== outline.source || product.version_id > outline.version_id)) {
            outline = product;
            $('#tab-outline').html(toPreString(product));
        } else if (product.product === 'completions' && (product.source !== codecompletion.source || product.version_id > codecompletion.version_id)) {
            codecompletion = product;
            $('#tab-codecompletion').html(toPreString(product));
        }
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
        setMessageSource: function (value) {
            message.source = value;
        },
        setMessageLanguage: function (value) {
            message.language = value;
        },
        setMessageContents: function (value) {
            message.contents = value;
        },
        setMessageSelection: function (value) {
            message.selections = value;
        },
        setMessageVersionId: function (value) {
            message.version_id = value;
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
        send: function () {
            src.send(JSON.stringify(message));
            $('#tab-version').html(toPreString(message));
            message.version_id += 1;
            message.selections = [];
        },
        setPosAndSend: function() {
            var editor = $('.CodeMirror')[0].CodeMirror;
            var pos = Monto.convertCMToMontoPos(editor.getCursor());
            Monto.setMessageSelection([{end: pos, begin: pos}]);
            Monto.send();
        },
        registerOnReceive: function (func) {
            receiveEvents.push(func)
        },
        convertMontoToCMPosWithLength: function (pos) {
            //converts positions from  {offset, length} to {{line, ch},{line,ch}}
            var chCount = 0;
            for (var i = 0; i < lineSizes.length; i++) {
                if (pos.offset < chCount + lineSizes[i] + 1) {
                    return {
                        from: {line: i, ch: pos.offset - chCount},
                        to: {line: i, ch: pos.offset - chCount + pos.length}
                    };
                }
                //TODO +1 because of missing \n count ???
                chCount += lineSizes[i] + 1;
            }
        },
        convertMontoToCMPos: function (offset) {
            //converts positions from  offset to {line, ch}
            var chCount = 0;
            for (var i = 0; i < lineSizes.length; i++) {
                if (offset < chCount + lineSizes[i] + 1) {
                    return {line: i, ch: offset - chCount};
                }
                //TODO +1 because of missing \n count ???
                chCount += lineSizes[i] + 1;
            }
        },
        convertCMToMontoPos: function (pos) {
            //converts positions from  {line, ch} to offset
            var chCount = -1;
            for (var i = 0; i <= pos.line; i++) {
                var lineSize = lineSizes[i];
                if (i === pos.line) {
                    chCount += pos.ch;
                } else {
                    chCount += lineSize;
                }
                chCount += 1;
            }
            return chCount;
        },
        refreshLineSizes: function (content) {
            var lines = content.split('\n');
            lineSizes = [];
            lines.forEach(function (line) {
                lineSizes.push(line.length);
            });
        }
    }
})();