(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    var TOKENS = "atom number property keyword string variable variable-2 def bracket tag link error";
    var TOKEN_LIST = TOKENS.split(' ');

    CodeMirror.defineMode("monto", function () {
        var editor = $('.CodeMirror')[0].CodeMirror;
        return {
            startState: function () {
                return {tokenize: null};
            },
            token: function (stream, state) {
                var curLine = editor.getCursor().line;
                var ch;
                if (stream.eatSpace()) return null;
                while (ch = stream.next()) {
                    var token_name = TOKEN_LIST[Math.floor(Math.random() * TOKEN_LIST.length - 1)];
                    return token_name;
                }
                return null;
            }
        };
    });
});
