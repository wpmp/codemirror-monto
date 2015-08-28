var Sink = (function () {
    var sink = new WebSocket('ws://localhost:5003/');
    var receiveEvents = [];
    var parse = false;
    var enabledServices = ["discover"];

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
        var string = '[';
        copy.forEach(function (e) {
            if (e.options !== undefined && e.options !== null) {
                e.options = JSON.parse(e.options);
            }
            if (e.configurations !== undefined && e.options !== null) {
                e.configurations = JSON.parse(e.configurations);
            }
            string += '\n' + JSON.stringify(e, null, 2);
        });
        string += '\n]';
        return '<pre>' + string.replace('<', '&lt').replace('>', '&gt') + '</pre>';
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
                console.log(rawMessage.data);
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
        var options = '<div class="table-responsive"><table class="table"><thead><tr><th>Service ID</th><th>Label</th><th>Description</th><th>Language</th><th>Product</th></tr></thead><tbody>';
        $('#discoverResponse').html(arrayToHtmlString(response));
        response.forEach(function (service) {
            var stored = localStorage.getItem(service.service_id);
            var checked = '';
            if (stored !== null && stored !== undefined) {
                checked = 'checked';
                enabledServices.push(service.service_id);
            }
            options +=
                '<tr>' +
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
                '</tr>';
        });
        options += '</tbody></table></div>';
        $('#discovery').html(options);
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