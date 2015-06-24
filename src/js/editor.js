window.onload = function () {
    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
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

    function save() {
        saveTextAs(editor.getValue(), Monto.getMessage().source);
    }
    CodeMirror.commands.save = function () {
        save();
    };
    $('#save').click(function () {
        save();
    });

    $('#outline').jstree();

    $('#fullscreen').click(function () {
        editor.setOption('fullScreen', !editor.getOption('fullScreen'));
    });

    $('#load').click(function () {
        $('#fileInput').trigger('click');
    });

    $('#fileInput').change(function (e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = e.target.files[0];
            if (file.type.match('image.*')) {
                return;
            }
            var oldSource = Monto.getMessage().source;
            if (oldSource !== file.name) {
                Monto.setMessageSource(file.name);
                Monto.setMessageVersionId(0);
            }
            var reader = new FileReader();
            reader.onload = function () {
                var text = reader.result;
                editor.setValue(text);
            };
            // TODO fire change on editor, probably bug?
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