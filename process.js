module.exports = {
    validate(code){ //code será a linha digitável
        console.log(code);
        //Regra de negócio para a validação
        //Variáveis inicializadas com mensagem de erro para evitar um código extenso. Em caso de sucesso, será alterada 
        let obj = {
            //objeto de retorno
            "mensagem" : "Verifique o código digitado!",
            "valido" : false,
            "valor" : 0,
            "dataVencimento" : "",
            "codigoBarra" : 0
        }
        if(code.length == 47) { //boleto bancário com 47 dígitos
            //Passo 1 - verificar se é válida com a regra de negócio da documentação
            
        } else if(code.length == 48) { //boleto convenio com 48 dígitos
            
        } 
        return obj;
    }
}