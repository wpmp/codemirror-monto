var Source = (function () {
    var src = new WebSocket('ws://localhost:5002/');
    var lineSizes = [];

    var versionMsg = {
        source: 'nofile',
        version_id: 0,
        language: localStorage.getItem('editor-language'),
        //invalid: [],
        contents: '',
        selections: []
    };

    var discoverReq = {
        discover_services: [
            {
                language: "javascript"
            }
        ]
    };

    var configuration = {
        configure_services: []
    };

    function toHtmlString(content) {
        return '<pre>' + JSON.stringify(content, null, 2).replace('<', '&lt').replace('>', '&gt') + '</pre>';
    }

    return {
        getLineSizes: function () {
            return lineSizes;
        },
        getMessage: function () {
            return versionMsg;
        },
        getConfigurationMessage : function () {
            return configuration;
        },
        setMessage: function (value) {
            versionMsg = value;
        },
        setMessageSource: function (value) {
            versionMsg.source = value;
        },
        setMessageLanguage: function (value) {
            versionMsg.language = value;
        },
        setMessageContents: function (value) {
            versionMsg.contents = value;
        },
        setMessageSelection: function (value) {
            versionMsg.selections = value;
        },
        setMessageVersionId: function (value) {
            versionMsg.version_id = value;
        },
        send: function () {
            src.send(JSON.stringify(versionMsg));
            $('#tab-version').html(toHtmlString(versionMsg));
            versionMsg.version_id += 1;
            versionMsg.selections = [];
        },
        discoverServices: function () {
            src.send(JSON.stringify(discoverReq));
            $('#discoverRequest').html(toHtmlString(discoverReq));
        },
        setConfigurationMessage: function (value) {
            configuration = value;
        },
        setConfiguration: function (serviceID, optionID, value) {
            configuration.configure_services.forEach(function(service) {
                if (service.service_id === serviceID) {
                    service.configurations.forEach(function (config) {
                        if (config.option_id === optionID) {
                            config.value = value;
                        }
                    });
                }
            });
        },
        configureServices: function () {
            src.send(JSON.stringify(configuration));
            $('#tab-configuration').html(toHtmlString(configuration));
        },
        setPosAndSend: function () {
            var editor = $('.CodeMirror')[0].CodeMirror;
            var pos = Source.convertCMToMontoPos(editor.getCursor());
            Source.setMessageSelection([{end: pos, begin: pos}]);
            Source.send();
        },
        refreshLineSizes: function (content) {
            var lines = content.split('\n');
            lineSizes = [];
            lines.forEach(function (line) {
                lineSizes.push(line.length);
            });
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
                    return {
                        line: i,
                        ch: offset - chCount
                    };
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
        }
    };
})();