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
        return '<pre>' + JSON.stringify(content, null, 2).replace('<', '&lt').replace('>', '&gt') + '</pre>';
    }

    sink.onmessage = function (e) {
        if (parse) {
            var product = JSON.parse(e.data);
            if (product.product !== undefined) {
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
            } else {
                var options = '<table class="table"><thead><tr><th>Service ID</th><th>Label</th><th>Description</th><th>Language</th><th>Product</th></tr></thead><tbody>';
                product.forEach(function (e) {
                    var stored = localStorage.getItem(e.service_id);
                    var checked = '';
                    if (stored !== null && stored !== undefined) {
                        checked = 'checked';
                        enabledServices.push(e.service_id);
                    }
                    options +=
                        '<tr>' +
                        '<td class="mid-align"><div class="checkbox checkbox-primary">' +
                        '<input id="' + e.service_id + '" type="checkbox" class="discoverOption styled"' + checked + '>' +
                        '<label for="' + e.service_id + '">' +
                        e.service_id +
                        '</label>' +
                        '</div></td>' +
                        '<td class="mid-align">' + e.label + '</td>' +
                        '<td class="mid-align">' + e.description + '</td>' +
                        '<td class="mid-align">' + e.language + '</td>' +
                        '<td class="mid-align">' + e.product + '</td>' +
                        '</tr>';
                });
                options += '</tbody></table>';
                $('#discovery').html(options);
            }
            parse = false;
        } else {
            var index = enabledServices.indexOf(e.data);
            if (index > -1) {
                parse = true;
            }
        }
    };

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