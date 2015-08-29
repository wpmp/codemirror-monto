var Sink = (function () {
    var sink = new WebSocket('ws://localhost:5003/');
    var receiveEvents = [];
    var parse = false;
    var enabledServices = ["discover"];
    var availableServices = [];
    var languages = [];
    var optionLanguage = 'all';

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
    var errors = {
        version_id: -1
    };

    function toHtmlString(content) {
        var copy = $.extend(true, {}, content);
        if (copy.contents !== undefined && copy.contents !== null) {
            copy.contents = JSON.parse(copy.contents);
        }
        return '<pre>' + JSON.stringify(copy, null, 2).replace('<', '&lt').replace('>', '&gt') + '</pre>';
    }

    function arrayToHtmlString(content) {
        var copy = $.extend(true, [], content);
        copy.forEach(function (e) {
            if (e.options !== undefined && e.options !== null) {
                e.options = JSON.parse(e.options);
            }
            if (e.configurations !== undefined && e.options !== null) {
                e.configurations = JSON.parse(e.configurations);
            }
        });
        return '<pre>' + JSON.stringify(copy, null, 2).replace('<', '&lt').replace('>', '&gt') + '</pre>';
    }

    sink.onmessage = function (rawMessage) {
        if (parse) {
            var message = JSON.parse(rawMessage.data);
            if (message.product !== undefined) {
                acceptNewProduct(message);
            } else {
                acceptNewDiscoverResponse(message);
            }
            parse = false;
        } else {
            var index = enabledServices.indexOf(rawMessage.data);
            if (index > -1) {
                parse = true;
            }
        }
    };

    function acceptNewProduct(product) {
        if (product.product === 'tokens' && (product.source !== tokens.source || product.version_id > tokens.version_id)) {
            tokens = product;
            $('#tab-tokens').html(toHtmlString(product));
        } else if (product.product === 'ast' && (product.source !== ast.source || product.version_id > ast.version_id)) {
            ast = product;
            $('#tab-ast').html(toHtmlString(product));
        } else if (product.product === 'outline' && (product.source !== outline.source || product.version_id > outline.version_id)) {
            outline = product;
            $('#tab-outline').html(toHtmlString(product));
        } else if (product.product === 'completions' && (product.source !== codecompletion.source || product.version_id > codecompletion.version_id)) {
            codecompletion = product;
            $('#tab-codecompletion').html(toHtmlString(product));
        } else if (product.product === 'errors' && (product.source !== errors.source || product.version_id > errors.version_id)) {
            errors = product;
            $('#tab-errors').html(toHtmlString(product));
        }
        receiveEvents.forEach(function (event) {
            event(product);
        });
    }

    function acceptNewDiscoverResponse(response) {
        $('#discoverResponse').html(arrayToHtmlString(response));

        languages.forEach(function (language) {
            $('#editor-' + language).remove();
            $('#config-' + language).remove();
        });

        var foundLanguages = [];
        var foundServices = [];

        response.forEach(function (service) {
            if (foundLanguages.indexOf(service.language) == -1) {
                foundLanguages.push(service.language);
                $('#editor-languages').append('<li><a href="#" id="editor-' + service.language + '" class="editor-language">' + service.language + '</a></li>');
                $('#config-languages').append('<li><a href="#" id="config-' + service.language + '" class="config-language">' + service.language + '</a></li>');
            }
            foundServices.push(service);
        });

        availableServices = foundServices;
        languages = foundLanguages;
        buildServiceOptions();
    }

    function buildServiceOptions() {
        availableServices.forEach(function (service) {
            if (optionLanguage === 'all' || service.language === optionLanguage) {
                var tr = $('#' + service.service_id);
                if (tr.length === 0) {
                    var stored = localStorage.getItem(service.service_id);
                    var checked = '';
                    if (stored !== null && stored !== undefined) {
                        checked = 'checked';
                        enabledServices.push(service.service_id);
                    }
                    $('#services').append('<tr id="' + service.service_id + '">' +
                    '<td class="mid-align"><div class="checkbox checkbox-primary">' +
                    '<input id="' + service.service_id + '" type="checkbox" class="discoverOption styled"' + checked + '>' +
                    '<label for="' + service.service_id + '">' +
                    service.service_id +
                    '</label>' +
                    '</div></td>' +
                    '<td class="mid-align">' + service.label + '</td>' +
                    '<td class="mid-align">' + service.description + '</td>' +
                    '<td class="mid-align">' + service.language + '</td>' +
                    '<td class="mid-align">' + service.product + '</td>' +
                    '</tr>');
                }
            } else {
                $('#' + service.service_id).remove();
            }
        });
    }

    return {
        getTokens: function () {
            return tokens;
        },
        getAst: function () {
            return ast;
        },
        getOutline: function () {
            return outline;
        },
        getCodecompletion: function () {
            return codecompletion;
        },
        getErrors: function () {
            return errors;
        },
        registerFunctionOnReceive: function (func) {
            receiveEvents.push(func)
        },
        setOptionstLanguage: function (language) {
            optionLanguage = language;
            buildServiceOptions();
        },
        enableService: function (serviceID) {
            var index = enabledServices.indexOf(serviceID);
            if (index == -1) {
                enabledServices.push(serviceID);
                localStorage.setItem(serviceID, '');
            }
        },
        disableService: function (serviceID) {
            var index = enabledServices.indexOf(serviceID);
            if (index > -1) {
                enabledServices.splice(index, 1);
                localStorage.removeItem(serviceID);
            }
        }
    };
})();