window.onload = function () {
    var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "F11": function (cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function (cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
            }
        },
        lineNumbers: true,
        viewportMargin: Infinity,
        mode: "monto",
        theme: "monto"
    });

    $('#fullscreen').click(function () {
        editor.setOption("fullScreen", !editor.getOption("fullScreen"));
    });

    $('#load').click(function (){
        $('#fileInput').trigger("click");
    })

    $('#fileInput').change(function (e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = e.target.files[0];
            if (file.type.match('image.*')) {
                return;
            }
            // TODO
            //MontoHandler.source = '/'+file.name;
            //MontoHandler.version_id = 0;
            editor.setValue("");
            var reader = new FileReader();
            reader.onload = function(){
                var text = reader.result;
                var cmContent = editor.getValue();
                editor.setValue(cmContent + text);
            };
            reader.readAsText(file);
            //editor.setOption("fullScreen", !editor.getOption("fullScreen"));
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });
};