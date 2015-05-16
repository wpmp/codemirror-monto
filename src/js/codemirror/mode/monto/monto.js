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

        MontoCommunicator.onmessage = function (e) {
            console.log(e.data);
        };

        editor.on('change', function (cm, change) {
            MontoCommunicator.Contents = editor.getValue();
            var version = {
                "source" : MontoCommunicator.FileName,
                "version_id" : MontoCommunicator.VersionId,
                "language" : MontoCommunicator.Language,
                "invalid" : MontoCommunicator.Invalid,
                "contents" : MontoCommunicator.Contents,
                "selections" : MontoCommunicator.Selection
            }
            console.log(version);
            MontoCommunicator.postMessage(version);
            MontoCommunicator.VersionId += 1;
        });

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

var MontoCommunicator = (function () {
    if (!!window.Worker) {
        var scripts = document.getElementsByTagName("script");
        var path = scripts[scripts.length - 1].src.replace(/\/monto\.js$/, '/');
        var communicator = new Worker(path + "communicator.js");
        communicator.FileName = "nofile";
        communicator.Language = "java";
        communicator.Invalid = [];
        communicator.VersionId = 0;
        communicator.Contents = "";
        communicator.Selection = [];
        return communicator;
    } else {
        alert("Your browser does not support web workers so monto plugin won't work.")
    }
})();