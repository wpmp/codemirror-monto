(function (mod) {
    mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    Sink.onTypeTriggerFunction('errors', function () {
        $('.CodeMirror')[0].CodeMirror.performLint();
    });

    CodeMirror.registerHelper("lint", "monto", function (text) {
        var list = [];
        var errors = Sink.getActiveProductsByType("errors");
        if (errors === undefined || errors === null) {
            return [];
        }
        errors.forEach(function (product) {
            var contents = product.contents !== undefined ? product.contents : '[]';
            contents.forEach(function (content) {
                var position = Source.convertMontoToCMPosWithLength({offset: content.offset, length: content.length});
                list.push({
                    message: content.description,
                    severity: content.level,
                    from: position.from,
                    to: position.to
                });
            });
        });
        return list;
    });

});