window.onload = function () {
    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        extraKeys: {
            'Ctrl-Space': 'autocomplete',
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
    CodeMirror.commands.save = function() {
        saveTextAs(editor.getValue(), 'monto.js');
    }
    Monto.setCM(editor);

    $('#fullscreen').click(function () {
        editor.setOption('fullScreen', !editor.getOption('fullScreen'));
    });

    $('#save').click(function() {
        // TODO
        saveTextAs(editor.getValue(), 'monto.js');
    })

    $('#load').click(function (){
        $('#fileInput').trigger('click');
    })

    $('#fileInput').change(function (e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = e.target.files[0];
            if (file.type.match('image.*')) {
                return;
            }
            Monto.getMessage().source = '/'+file.name;
            Monto.getMessage().version_id = 0;
            editor.setValue('');
            var reader = new FileReader();
            reader.onload = function(){
                var text = reader.result;
                var cmContent = editor.getValue();
                editor.setValue(cmContent + text);
            };
            reader.readAsText(file);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });
};