var Sink = (function () {
    var sink = new WebSocket('ws://localhost:5003/');
    var receiveEvents = [];

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
        version_id:-1
    };

    function toHtmlString(content) {
        return '<pre>' + JSON.stringify(content, null, 2).replace('<', '&lt').replace('>', '&gt') + '</pre>';
    }

    sink.onmessage = function (e) {
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
            var options = "";
            product.forEach(function(e) {
                   options +='<label class="checkbox-inline">' +
                       '<input type="checkbox"> ' + e.service_id +
                       '</label>';
            });
            $('#discovery').html(options);
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
        getErrors: function() {
            return errors;
        },
        subscribeOnReceive: function (func) {
            receiveEvents.push(func)
        }
    };
})();