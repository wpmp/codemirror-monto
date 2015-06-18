window.onload = function () {
    var editor_0 = createNewEditor('editor-0');
    //var editor_1 = createNewEditor('editor-1');
    //var editor_2 = createNewEditor('editor-2');
    //var editor_3 = createNewEditor('editor-3');
    //var editor_4 = createNewEditor('editor-4');
    //var editor_5 = createNewEditor('editor-5');
    CodeMirror.commands.save = function () {
        saveTextAs(editor_0.getValue(), 'monto.js');
    }
    Monto.setCM(editor_0);
    Monto.setPosAndSend = function () {
        var pos = Monto.convertCMToMontoPos(editor_0.getCursor());
        Monto.setMessageSelection([{end: pos, begin: pos}]);
        Monto.send();
    }

    $('#outline').jstree();

    $('#fullscreen').click(function () {
        editor_0.setOption('fullScreen', !editor_0.getOption('fullScreen'));
    });

    $('#save').click(function () {
        // TODO
        saveTextAs(editor_0.getValue(), 'monto.js');
    })

    $('#load').click(function () {
        $('#fileInput').trigger('click');
    })

    $('#fileInput').change(function (e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = e.target.files[0];
            if (file.type.match('image.*')) {
                return;
            }
            Monto.getMessage().source = '/' + file.name;
            Monto.getMessage().version_id = 0;
            editor_0.setValue('');
            var reader = new FileReader();
            reader.onload = function () {
                var text = reader.result;
                var cmContent = editor_0.getValue();
                editor_0.setValue(cmContent + text);
            };
            // TODO fire change on editor
            reader.readAsText(file);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });

    $('#tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })
};

function createNewEditor(id) {
    return CodeMirror.fromTextArea(document.getElementById(id), {
        extraKeys: {
            'Ctrl-Space': function () {
                Monto.setPosAndSend()
            },
            'F11': function (cm) {
                cm.setOption('fullScreen', !cm.getOption('fullScreen'));
            },
            'Esc': function (cm) {
                if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
            },
            'Ctrl-L': function (cm) {
                $('#fileInput').trigger('click');
            }
        },
        lineNumbers: true,
        viewportMargin: Infinity,
        mode: 'monto',
        theme: 'monto'
    });
}