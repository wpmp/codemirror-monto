var src = new WebSocket('ws://localhost:5000/', ['soap', 'xmpp']);
var sink = new WebSocket('ws://localhost:5001/', ['soap', 'xmpp']);

sink.onmessage = function (e) {
    postMessage("sink received: " + e.data);
};

onmessage = function (e) {
    src.send(JSON.stringify(e.data));
};