const express = require('express');
const process = require('./process');
const http = require('http');
const fs = require('fs');
const cors = require('cors');

const server = express();
server.use(cors());
server.use(express.json());

server.post("/validate", (req, res) => {
    /*Requisicao de validação de boleto*/
    res.send(process.validate(req.body.code));
});

var httpServer = http.createServer(function (request, response) {
    fs.readFile("index.html", function(err, data){
        response.end(data);
    });
});

server.listen(3000);
httpServer.listen(3001);

console.log("API inicializada: http://localhost:3000");
console.log("Página html disponível em: http://localhost:3001");