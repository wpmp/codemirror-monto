Codemirror Monto
================

This is a web-based editor for Monto using CodeMirror.

Install instructions
--------------------

1. Get the [Monto broker](https://github.com/monto-editor/broker)
   and follow the build instructions
2. Get the [services] (https://github.com/monto-editor) of your choice
3. Run the broker using the `start.sh` script located in the broker project folder
4. Run the services using the `start.sh` script located in the service project folder
5. Open `index.html` with a browser (tested with Chromium 44.0 and Firefox 40.0)
6. Click on `Options`, then `Discover`
7. Configure discovered services as wanted
8. Click on `Editor`
9. Select the language of your choice in the dropdown menu with the label `text`
10. Start coding

The broker should be started before the services, because they have to register themselves at the broker.
It may also work the other way round but this is not guaranteed.

Used libraries
-----------------

CodeMirror: 5.6
Bootstrap: 3.3.5
font-awesome: 4.4.0
jQuery: 2.1.4
FileSaver.js: accessed master on 02.09.2015
Awesome Bootstrap Checkbox: accessed master on 02.09.2015
sprintf.js: accessed master on 15.09.2015
