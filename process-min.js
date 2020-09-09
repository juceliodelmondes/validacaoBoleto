//Menor versão possível do arquivo process.js
module.exports = {
    validate(code){
        code = this.formatarCodigo(code);
        let obj = {
            "mensagem" : "Código inválido!",
            "valido" : false,
            "valor" : 0,
            "dataVencimento" : "",
            "codigoBarra" : 0,
            "linhaDigitavel" : code
        }
        if(code.length == 47) {
            const infoCode = {campo : [code.slice(0,9), code.slice(10, 20), code.slice(21, 31)], dvCampo : [parseInt(code.slice(9, 10)), parseInt(code.slice(20, 21)), parseInt(code.slice(31, 32))]};
            const campos = (infoCode.campo[0]+infoCode.campo[1]+infoCode.campo[2]).split("").map(Number);
            let resultadoMultiplicacao = this.multiplicacaoDv(campos);
            let campo1Somado = 0, campo2Somado = 0, campo3Somado = 0;
            resultadoMultiplicacao.slice(0, 9).map(result => campo1Somado+=result);
            resultadoMultiplicacao.slice(9, 19).map(result => campo2Somado+=result);
            resultadoMultiplicacao.slice(19, 29).map(result => campo3Somado+=result);
            let dvCampo1Calculo = parseInt(parseInt((parseInt(campo1Somado.toString().slice(0,1)+"0")+10)-(campo1Somado % 10 )).toString().slice(1,2));
            let dvCampo2Calculo = parseInt(parseInt((parseInt(campo2Somado.toString().slice(0,1)+"0")+10)-(campo2Somado % 10 )).toString().slice(1,2));
            let dvCampo3Calculo = parseInt(parseInt((parseInt(campo3Somado.toString().slice(0,1)+"0")+10)-(campo3Somado % 10 )).toString().slice(1,2));
            if(dvCampo1Calculo === infoCode.dvCampo[0] && dvCampo2Calculo === infoCode.dvCampo[1] && dvCampo3Calculo === infoCode.dvCampo[2]) {
                let codigoBarra = code.slice(0, 4)+code.slice(32, 47)+code.slice(4, 9)+code.slice(10, 20)+code.slice(21, 31);
                if(this.validarDVGeral(codigoBarra)) {
                    obj.mensagem = "Boleto válido";
                    obj.valido = true;
                    obj.codigoBarra = codigoBarra;               
                    obj.valor = (code.slice(37, 47)/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\,/g, ".").replace(/\.+\d{2}$/g, ",")+code.slice(45, 47);
                    if(parseInt(code.slice(33, 37)) !== 0000) { //fator vencimento
                        let dataBase = new Date("1997/10/07");
                        dataBase.setDate(dataBase.getDate() + parseInt(code.slice(33, 37)));
                        obj.dataVencimento = dataBase.getDate()+"/"+(dataBase.getMonth()+1)+"/"+dataBase.getFullYear();
                    }
                }
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
                //Validacao do quarto dígito - MODULO 10 - página 15 do arquivo Convenio.pdf
                //SV = Segunda validação
                let campo1SV = code.slice(0,3); //SV = campo 1 de segunda validação
                let dv = parseInt(code.slice(3, 4)); //digito verificador
                let campo2SV = code.slice(4, 11)+campo2+campo3+campo4 //campo restante sem o DV 
                let resultadoMultiplicacaoSV = this.multiplicacaoDv(campo1SV+campo2SV);
                let campoSomadoSV = 0;
                resultadoMultiplicacaoSV.map(result => {campoSomadoSV += result})
                let restoDivisaoSV = parseInt(campoSomadoSV % 10);
                dvCampoSV = 0;
                if(restoDivisaoSV > 0) dvCampoSV = 10 - restoDivisaoSV;
                if(dvCampoSV === dv) {
                    //Validou com sucesso o digito verificador
                    obj.mensagem="Boleto válido!";
                    obj.valido = true;
                    obj.valor = ((code.slice(5, 11)+code.slice(12, 16))/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\,/g, ".").replace(/\.+\d{2}$/g, ",")+code.slice(14, 16);
                    obj.codigoBarra = campo1+campo2+campo3+campo4
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
    },
    validarDVGeral(codigoBarraCompleto) {
        //Valida o quinto dígito do codigo de barra com o cálculo
        let codigoDVGeral = parseInt(codigoBarraCompleto.slice(4, 5));
        let codigoBarraSemDV = (codigoBarraCompleto.slice(0, 4)+codigoBarraCompleto.slice(5, codigoBarraCompleto.length)).split("");
        let proximoNum = 2; //de 2 a 9 (multiplicador)
        let resultadoSoma = 0;
        for(i = codigoBarraSemDV.length-1; i >= 0; i--) {
            let mult = codigoBarraSemDV[i] * proximoNum
            resultadoSoma += (mult) //multiplica e soma
            if(proximoNum == 9) proximoNum=2; else if(proximoNum < 9) proximoNum++;
        }
        let resto = resultadoSoma % 11;
        let resultadoDV = parseInt(11 - resto)
        if(resultadoDV === 0 || resultadoDV === 10 || resultadoDV === 11) resultadoDV = 1; //REGRA I) da página 14 - PDF Titulo.pdf
        if(codigoDVGeral === resultadoDV) return true; else return false;
    },
    formatarCodigo(linhaDigitavel) {
        //Formata a linha digitável e retorna
        const caracteresPermitidos = ['0','1','2','3','4','5','6','7','8','9'];
        linhaDigitavel = linhaDigitavel.split('');
        let novoCodigo = "";
        linhaDigitavel.map(code => {
            let caractereProibido = true;
            caracteresPermitidos.map(char => {
                if(code === char) caractereProibido = false; //se conter na array acima, o caractere atual nao é proibido
            })
            if(caractereProibido === false) novoCodigo += code;
        })
        return novoCodigo;
    }
}