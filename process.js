module.exports = {
    validate(code){ //code será a linha digitável
        console.log(code);
        code = code.replace(/ /g , "")
        code = code.replace(/\./g, ""); // utlizando \. porque . é um caractere reservado para o regex
        console.log(code)
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
            let dvCampo1 = parseInt(code.slice(9, 10));
            let campo2 = code.slice(10, 20);
            let dvCampo2 = parseInt(code.slice(20, 21));
            let campo3 = code.slice(21, 31);
            let dvCampo3 = parseInt(code.slice(31, 32));
            let campos = (campo1+campo2+campo3).split("").map(Number); //Numeros dos campos sem o D.V de cada um. Necessário para calcular e validar se é gual ao d.v retirado acima
            let resultadoMultiplicacao = [];
            //passo A (arquivo titulo.pdf) Multiplicando a sequência dos campos pelos multiplicadores, iniciando por 2 da direita para a esquerda:

            for(i = campos.length-1; i >= 0; i--) { //percorre os numeros dos campos sem o D.V para multiplicar
                if(i % 2 == 0) {
                    /*Verifica se o I é par ou não, este algoritmo será para aplicar a divisao na ordem (divide por 2 e depois por 1)*/
                    let temp = campos[i]*2; //multiplica por 2
                    if(temp > 9) {
                        //somar os dois algarismos
                        let algarismo1 = parseInt(temp.toString().slice(0, 1));
                        let algarismo2 = parseInt(temp.toString().slice(1, 2));
                        temp = algarismo1+algarismo2;
                    }
                    resultadoMultiplicacao.unshift(parseInt(temp)); //adiciona no começo da array
                } else resultadoMultiplicacao.unshift(campos[i]*1); //adiciona sempre no começo da array
            }
            //Passo B (arquivo titulo.pdf) Some, individualmente, os algarismos dos resultados do produtos:
            //========================================================
            let campo1Somado = 0, campo2Somado = 0, campo3Somado = 0;
            resultadoMultiplicacao.slice(0, 9).map(result => campo1Somado+=result);
            resultadoMultiplicacao.slice(9, 19).map(result => campo2Somado+=result);
            resultadoMultiplicacao.slice(19, 29).map(result => campo3Somado+=result);
            
            //Passo C Divida o total encontrado por 10, a fim de determinar o resto da divisão:
            //==================================
            let restoCampo1 = campo1Somado % 10 
            let restoCampo2 = campo2Somado % 10
            let restoCampo3 = campo3Somado % 10

            //Passo D Subtrair o “resto” apurado pela dezena imediatamente posterior. O resultado será igual ao DV
            //=========================
            
            let dezenaPosteriorCampo1 = parseInt(campo1Somado.toString().slice(0,1)+"0")+10; //captura o primeiro algarismo e concatena com 0, depois soma mais 10 e converte para int
            let dezenaPosteriorCampo2 = parseInt(campo2Somado.toString().slice(0,1)+"0")+10;
            let dezenaPosteriorCampo3 = parseInt(campo3Somado.toString().slice(0,1)+"0")+10;

            
            //Substraindo dezena posterior com resto e capturando segundo algarismo (D.V)
            let dvCampo1Calculo = parseInt(parseInt(dezenaPosteriorCampo1-restoCampo1).toString().slice(1,2));
            let dvCampo2Calculo = parseInt(parseInt(dezenaPosteriorCampo2-restoCampo2).toString().slice(1,2));
            let dvCampo3Calculo = parseInt(parseInt(dezenaPosteriorCampo3-restoCampo3).toString().slice(1,2));
            //Se o digito verificador que ele capturou for igual 
            if(dvCampo1Calculo === dvCampo1 && dvCampo2Calculo === dvCampo2 && dvCampo3Calculo === dvCampo3) {
                console.log("Boleto válido!");
                obj.mensagem = "Boleto válido";
                obj.valido = true;
            }

            //Calculando valor do boleto
            //Divide por 100 para separar os centavos                 
            obj.valor = (code.slice(37, 47)/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\,/g, ".").replace(/\.+\d{2}$/g, ",")+code.slice(45, 47).toString();

        } else if(code.length == 48) { //boleto convenio com 48 dígitos
            
        }
        return obj;
    }
}