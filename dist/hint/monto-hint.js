(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    Monto.registerOnReceive(function (newProduct) {
        if (newProduct.product === 'completions') {
            Monto.setCodecompletion(newProduct);
            CodeMirror.commands.autocomplete(Monto.getCM());
        }
    });

    CodeMirror.registerHelper('hint', 'monto', function (editor, options) {
        var list = [];
        var contents = JSON.parse(Monto.getCodecompletion().contents);
        console.log(contents);
        var replacementLength = contents[0].description.split(' ')[1].length - contents[0].replacement.length;
        var pos = Monto.convertMontoToCMPosWithLength({offset: contents[0].insertionOffset - replacementLength, length: replacementLength});
        contents.forEach(function (content) {
            list.push(content.description.split(' ')[1]);
        });
        console.log(list);
        return {
            list: list,
            from: CodeMirror.Pos(pos.from.line, pos.from.ch),
            to: CodeMirror.Pos(pos.to.line, pos.to.ch)
        };
    });
});
