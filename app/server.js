const express = require('express');
const host = express();

const port = process.env.PORT || 1010;

var routes = require('./routes');
var mid = require('./middleware');

function server() {
    mid(host, express);
    routes(host);
    host.listen(port, function () {
        console.log('[SERVER] initialized.');
    });
}

module.exports = server;