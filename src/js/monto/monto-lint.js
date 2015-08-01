(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    Sink.subscribeOnReceive(function (newProduct) {
        if (newProduct.product === 'errors') {
            $('.CodeMirror')[0].CodeMirror.performLint();
        }
    });

    CodeMirror.registerHelper("lint", "monto", function (text) {
        var list = [];
        var product = Sink.getErrors();
        var contents = JSON.parse(product.contents !== undefined ? product.contents : '[]');
        contents.forEach(function (content) {
            var position = Source.convertMontoToCMPosWithLength({offset: content.offset, length: content.length});
            list.push({
                message: content.description,
                severity: 'error',
                from: position.from,
                to: position.to
            });
        });
//      {message, severity, form, to}
        return list;
    });

});