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
        if (newProduct.product === 'completions') {
            CodeMirror.commands.autocomplete($('.CodeMirror')[0].CodeMirror);
        }
    });

    CodeMirror.registerHelper('hint', 'monto', function (editor, options) {
        var list = [];
        var contents = JSON.parse(Sink.getCodecompletion().contents);
        var replacementLength = contents[0].description.split(' ')[1].length - contents[0].replacement.length;
        var pos = Source.convertMontoToCMPosWithLength({offset: contents[0].insertionOffset - replacementLength, length: replacementLength});
        contents.forEach(function (content) {
            list.push(content.description.split(' ')[1]);
        });
        return {
            list: list,
            from: CodeMirror.Pos(pos.from.line, pos.from.ch),
            to: CodeMirror.Pos(pos.to.line, pos.to.ch)
        };
    });
});
