/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var os_1 = require("os");
var crypto_1 = require("crypto");
var net_1 = require("net");
var messageReader_1 = require("./messageReader");
var messageWriter_1 = require("./messageWriter");
function generateRandomPipeName() {
    var randomSuffix = crypto_1.randomBytes(21).toString('hex');
    if (process.platform === 'win32') {
        return "\\\\.\\pipe\\vscode-jsonrpc-" + randomSuffix + "-sock";
    }
    else {
        // Mac/Unix: use socket file
        return path_1.join(os_1.tmpdir(), "vscode-" + randomSuffix + ".sock");
    }
}
exports.generateRandomPipeName = generateRandomPipeName;
function createClientPipeTransport(pipeName, encoding) {
    if (encoding === void 0) { encoding = 'utf-8'; }
    var connectResolve;
    var connected = new Promise(function (resolve, _reject) {
        connectResolve = resolve;
    });
    return new Promise(function (resolve, reject) {
        var server = net_1.createServer(function (socket) {
            server.close();
            connectResolve([
                new messageReader_1.SocketMessageReader(socket, encoding),
                new messageWriter_1.SocketMessageWriter(socket, encoding)
            ]);
        });
        server.on('error', reject);
        server.listen(pipeName, function () {
            server.removeListener('error', reject);
            resolve({
                onConnected: function () { return connected; }
            });
        });
    });
}
exports.createClientPipeTransport = createClientPipeTransport;
function createServerPipeTransport(pipeName, encoding) {
    if (encoding === void 0) { encoding = 'utf-8'; }
    var socket = net_1.createConnection(pipeName);
    return [
        new messageReader_1.SocketMessageReader(socket, encoding),
        new messageWriter_1.SocketMessageWriter(socket, encoding)
    ];
}
exports.createServerPipeTransport = createServerPipeTransport;
