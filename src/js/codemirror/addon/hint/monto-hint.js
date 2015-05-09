(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../codemirror/lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../codemirror/lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    CodeMirror.registerHelper("hint", "anyword", function (editor, options) {
        var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
        var list = [];
        var j = Math.floor((Math.random() * 10) + 1);
        for (var i = 0; i < j; i++) {
            list.push(Math.floor((Math.random() * 100) + 1) + "");
        }
        return {
            list: list,
            from: CodeMirror.Pos(cur.line, cur.ch),
            to: CodeMirror.Pos(cur.line, cur.ch)
        };
    });
});
