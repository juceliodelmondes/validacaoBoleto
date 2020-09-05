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
            //separando por campos (total de 3 com DV) 
            let campo1 = code.slice(0,9);
            let dvCampo1 = code.slice(9, 10);
            let campo2 = code.slice(10, 20);
            let dvCampo2 = code.slice(20, 21);
            let campo3 = code.slice(21, 31);
            let dvCampo3 = code.slice(31, 32);
            let campos = (campo1+campo2+campo3).split("").map(Number); //Numeros dos campos sem o D.V de cada um. Necessário para calcular e validar se é gual ao d.v retirado acima
            let resultadoMultiplicacao = [];
            console.log("Numero a processar "+campos);
            for(i = campos.length-1; i >= 0; i--) { //percorre os numeros dos campos sem o D.V para multiplicar
                if(i % 2 == 0) {
                    /*Verifica se o I é par ou não, este algoritmo será para aplicar a divisao na ordem (divide por 2 e depois por 1)*/
                    let temp = campos[i]*2+"";
                    if(temp > 9) {
                        //somar os dois algarismos
                        let algarismo1 = parseInt(temp.slice(0, 1));
                        let algarismo2 = parseInt(temp.slice(1, 2));
                        temp = algarismo1+algarismo2;
                    }
                    temp = parseInt(temp);
                    resultadoMultiplicacao.unshift(temp); //adiciona no começo da array
                } else resultadoMultiplicacao.unshift(campos[i]*1); //adiciona sempre no começo da array
            }
            //separar novamente os campos já multiplicados            
            
            let campo1Somado = 0, campo2Somado = 0, campo3Somado = 0;
            resultadoMultiplicacao.slice(0, 9).map(result => campo1Somado+=result);
            resultadoMultiplicacao.slice(9, 19).map(result => campo2Somado+=result);
            resultadoMultiplicacao.slice(19, 29).map(result => campo3Somado+=result);
            
            console.log(campo1Somado);
            console.log(campo2Somado);
            console.log(campo3Somado);
        } else if(code.length == 48) { //boleto convenio com 48 dígitos
            
        } 
        return obj;
    }
}