window.onload = function () {
    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        extraKeys: {
            'Ctrl-Space': function () {
                Source.setPosAndSend()
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
        theme: 'monto',
        gutters: ["CodeMirror-lint-markers"],
        lint: true
    });

    function save() {
        saveTextAs(editor.getValue(), Source.getMessage().source);
    }

    CodeMirror.commands.save = save;
    $('#save').on('click', save);

    $('#fullscreen').on('click', function () {
        editor.setOption('fullScreen', !editor.getOption('fullScreen'))
    });

    $('#load').on('click', function () {
        $('#fileInput').trigger('click')
    });

    $('#discover').on('click', function () {
        Source.discoverServices();
    });

    $('#configure').on('click', function () {
        Source.configureServices();
    });

    $('#fileInput').on('change', function (e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = e.target.files[0];
            if (file.type.match('image.*')) {
                return;
            }
            if (Source.getMessage().source !== file.name) {
                Source.setMessageSource(file.name);
                Source.setMessageVersionId(0);
            }
            var reader = new FileReader();
            reader.onload = function () {
                var text = reader.result;
                editor.setValue(text);
            };
            // TODO fire change on editor, probably bug?
            reader.readAsText(file);
            $('#file-name').html(file.name);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });

    $('#tabs').find('a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $(document).on('change', '.discoverOption', function (e) {
        if (this.checked) {
            Sink.enableService(this.id);
        } else {
            Sink.disableService(this.id);
        }
    });

    var editorLang = localStorage.getItem('editor-language');
    $('#selected-editor-language').html(editorLang !== '' ? editorLang : 'text');
    Source.setMessageLanguage(editorLang !== '' ? editorLang : 'text');

    $(document).on('click', '.editor-language', function (e) {
        var val = e.target.text;
        Source.setMessageLanguage(val);
        localStorage.setItem("editor-language", val);
        $('#selected-editor-language').html(val);
    });

    var configLang = localStorage.getItem('config-language');
    $('#selected-config-language').html(configLang !== '' ? configLang : 'text');
    Sink.setOptionstLanguage(configLang !== '' ? configLang : 'text');

    $(document).on('click', '.config-language', function(e) {
        var val = e.target.text;
        Sink.setOptionstLanguage(val);
        localStorage.setItem("config-language", val);
        $('#selected-config-language').html(val);
    });

    setTimeout(function () {
        //TODO probably make this more safe
        $('#discover').trigger('click');
    }, 100);
};