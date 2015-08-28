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

    //$('#outline').jstree({
    //    'core': {
    //        'themes': {
    //            'icons': false
    //        }
    //    }
    //});

    $('#fullscreen').on('click', function () {
        editor.setOption('fullScreen', !editor.getOption('fullScreen'))
    });

    $('#load').on('click', function () {
        $('#fileInput').trigger('click')
    });

    $('#discover').on('click', function () {
        Source.discoverServices();
    });

    $('#configure').on('click', function() {
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
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });

    $('#tabs').find('a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $('body').on('change', '.discoverOption', function(e) {
        if (this.checked) {
            Sink.enableService(this.id);
        } else {
            Sink.disableService(this.id);
        }
    });

    $('#programmingLanguage').val(localStorage.getItem("programmingLanguage"))
        .on('input', function(e) {
        var val = $('#programmingLanguage').val();
        Source.setMessageLanguage(val);
        localStorage.setItem("programmingLanguage", val);
    });

    setTimeout(function () {
        //TODO probably make this more safe
        $('#discover').trigger('click');
    }, 100);
};