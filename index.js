const express = require('express');
const process = require('./process');

const server = express();

server.use(express.json());

server.post("/validate", (req, res) => {
    /*Requisicao de validação de boleto*/
    res.send(process.validate(req.body.code));
});

server.listen(3000);
console.log("Servidor iniciado")