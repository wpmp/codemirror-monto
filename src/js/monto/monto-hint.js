(function (mod) {
    mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    Sink.onTypeTriggerFunction('completions', function () {
        CodeMirror.commands.autocomplete($('.CodeMirror')[0].CodeMirror);
    });

    CodeMirror.registerHelper('hint', 'monto', function (editor, options) {
        var list = [];
        var completions = Sink.getActiveProductsByType("completions");
        if (completions === undefined || completions === null || completions.length === 0) {
            return {
                list: []
            };
        }
        var replacementLength = completions[0].contents[0].description.split(' ')[1].length - completions[0].contents[0].replacement.length;
        var pos = Source.convertMontoToCMPosWithLength({
            offset: completions[0].contents[0].insertionOffset - replacementLength,
            length: replacementLength
        });
        completions.forEach(function (completion) {
            var contents = completion.contents;
            contents.forEach(function (content) {
                list.push(content.description.split(' ')[1]);
            });
        });
        return {
            list: list,
            from: CodeMirror.Pos(pos.from.line, pos.from.ch),
            to: CodeMirror.Pos(pos.to.line, pos.to.ch)
        };
    });
});
