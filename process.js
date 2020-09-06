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
            let fatorVencimento = parseInt(code.slice(33, 37))
            

            //passo A (arquivo titulo.pdf) Multiplicando a sequência dos campos pelos multiplicadores, iniciando por 2 da direita para a esquerda:
            
            let resultadoMultiplicacao = this.multiplicacaoDv(campos);
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

                 //Calculando valor do boleto
                //Divide por 100 para separar os centavos                 
                obj.valor = (code.slice(37, 47)/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\,/g, ".").replace(/\.+\d{2}$/g, ",")+code.slice(45, 47)
                
                //Cálculo de vencimento
                if(fatorVencimento !== 0000) {
                    let dataBase = new Date("1997/10/07");
                    //soma os dias totais capturados com a data base declarada acima
                    dataBase.setDate(dataBase.getDate() + fatorVencimento) 
                    //captura a nova data somada (dava vencimento)
                    const dia = dataBase.getDate();
                    const mes = dataBase.getMonth();
                    const ano = dataBase.getFullYear();
                    obj.dataVencimento = dia+"/"+(mes+1)+"/"+ano;
                }
                //gereando código de barra
                obj.codigoBarra = code.slice(0, 4)+code.slice(32, 47)+code.slice(4, 9)+code.slice(10, 20)+code.slice(21, 31);
            }
        } else if(code.length == 48) { //boleto convenio com 48 dígitos
            const campo1 = code.slice(0, 11);
            const dvCampo1 = parseInt(code.slice(11, 12));

            const campo2 = code.slice(12, 23);
            const dvCampo2 = parseInt(code.slice(23, 24));

            const campo3 = code.slice(24,35);
            const dvCampo3 = parseInt(code.slice(35, 36));

            const campo4 = code.slice(36, 47);
            const dvCampo4 = parseInt(code.slice(47, 48));
            //Primeira validacao (MODULO 10)
            //Validação dos quatros dígitos (DV) - página 14 do arquivo Convenio.pdf
            let resultadoMultiplicacaoCampo1 = this.multiplicacaoDv(campo1);
            let resultadoMultiplicacaoCampo2 = this.multiplicacaoDv(campo2);
            let resultadoMultiplicacaoCampo3 = this.multiplicacaoDv(campo3);
            let resultadoMultiplicacaoCampo4 = this.multiplicacaoDv(campo4);
            //soma todos os algarismos do resultado da multiplicação
            let campo1Somado = 0, campo2Somado = 0, campo3Somado = 0, campo4Somado = 0;
            resultadoMultiplicacaoCampo1.map(result => campo1Somado+=result);
            resultadoMultiplicacaoCampo2.map(result => campo2Somado+=result);
            resultadoMultiplicacaoCampo3.map(result => campo3Somado+=result);
            resultadoMultiplicacaoCampo4.map(result => campo4Somado+=result);
            //captura o resto da divisao para depois subtrair com 10
            let restoDVCampo1 = parseInt(campo1Somado % 10)
            let restoDVCampo2 = parseInt(campo2Somado % 10)
            let restoDVCampo3 = parseInt(campo3Somado % 10)
            let restoDVCampo4 = parseInt(campo4Somado % 10)
            let dvCampo1Calculo = 0, dvCampo2Calculo = 0, dvCampo3Calculo = 0, dvCampo4Calculo = 0;
            //Se o resto for 0, o numero não vai ser subtraído com 10
            if(restoDVCampo1 > 0) dvCampo1Calculo = 10 - restoDVCampo1;
            if(restoDVCampo2 > 0) dvCampo2Calculo = 10 - restoDVCampo2;
            if(restoDVCampo3 > 0) dvCampo3Calculo = 10 - restoDVCampo3;
            if(restoDVCampo4 > 0) dvCampo4Calculo = 10 - restoDVCampo4;
            if(dvCampo1Calculo === dvCampo1 && dvCampo2Calculo === dvCampo2 && dvCampo3Calculo === dvCampo3 && dvCampo4Calculo === dvCampo4) {
                console.log("Código DV válido")
                //Validacao do quarto dígito - MODULO 10 - página 15 do arquivo Convenio.pdf
                //SV = Segunda validação
                let campo1SV = code.slice(0,3); //SV = campo 1 de segunda validação
                let dv = parseInt(code.slice(3, 4)); //digito 
                let campo2SV = code.slice(4, 11)+campo2+campo3+campo4 //campo restante sem o DV 
                let resultadoMultiplicacaoSV = this.multiplicacaoDv(campo1SV+campo2SV);
                let campoSomadoSV = 0;
                resultadoMultiplicacaoSV.map(result => {campoSomadoSV += result})
                let restoDivisaoSV = parseInt(campoSomadoSV % 10);
                dvCampoSV = 0;
                if(restoDivisaoSV > 0) dvCampoSV = 10 - restoDivisaoSV;
                if(dvCampoSV === dv) {
                    console.log("Segunda validação OK");
                    obj.mensagem="Boleto válido!";
                    obj.valido = true;
                    obj.valor = ((code.slice(5, 11)+code.slice(12, 16))/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\,/g, ".").replace(/\.+\d{2}$/g, ",")+code.slice(14, 16);
                }
            }
        }
        return obj;
    },
    multiplicacaoDv(sequencia) {
        let resultadoMultiplicacao = [];
        for(i = sequencia.length-1; i >= 0; i--) { //percorre os numeros dos campos sem o D.V para multiplicar
            if(i % 2 == 0) {
                /*Verifica se o I é par ou não, este algoritmo será para aplicar a divisao na ordem (divide por 2 e depois por 1)*/
                let temp = sequencia[i]*2; //multiplica por 2
                if(temp > 9) {
                    //somar os dois algarismos
                    let algarismo1 = parseInt(temp.toString().slice(0, 1));
                    let algarismo2 = parseInt(temp.toString().slice(1, 2));
                    temp = algarismo1+algarismo2;
                }
                resultadoMultiplicacao.unshift(parseInt(temp)); //adiciona no começo da array
            } else resultadoMultiplicacao.unshift(sequencia[i]*1); //adiciona sempre no começo da array
        }
        return resultadoMultiplicacao;
    }
}