module.exports = {
    validate(code){ //code será a linha digitável
        code = code.replace(/\D/g, '')
        //Regra de negócio para a validação
        //Variáveis inicializadas com mensagem de erro para evitar um código extenso. Em caso de sucesso, será alterada 
        let obj = {
            //objeto de retorno
            "mensagem" : "Código inválido!",
            "valido" : false,
            "valor" : 0,
            "dataVencimento" : "",
            "codigoBarra" : 0,
            "linhaDigitavel" : code
        }
        if(code.length == 47) { //boleto bancário com 47 dígitos
            //separando por campos (total de 3 com DV) 
            const codeInfo = {
                campo : [code.slice(0,9), code.slice(10, 20), code.slice(21, 31)], 
                dv : [parseInt(code.slice(9, 10)), parseInt(code.slice(20, 21)), parseInt(code.slice(31, 32))]
            };
            const fatorVencimento = parseInt(code.slice(33, 37));
            if(this.validarDVCampoBancario(codeInfo.campo[0], codeInfo.dv[0]) && this.validarDVCampoBancario(codeInfo.campo[1], codeInfo.dv[1]) && this.validarDVCampoBancario(codeInfo.campo[2], codeInfo.dv[2])){
                //se os três digitos estiverem válidos            
                let codigoBarra = code.slice(0, 4)+code.slice(32, 47)+code.slice(4, 9)+code.slice(10, 20)+code.slice(21, 31);
                if(this.validarDVGeral(codigoBarra)) { //Valida o digito geral do codigo de barras, parâmetro 1 (tipo boleto bancário)
                    obj.mensagem = "Boleto válido"; 
                    obj.valido = true;
                    obj.codigoBarra = codigoBarra;                
                    obj.valor = (code.slice(37, 47)/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\,/g, ".").replace(/\.+\d{2}$/g, ",")+code.slice(45, 47);
                    //Cálculo de vencimento
                    if(fatorVencimento !== 0000) {
                        let dataBase = new Date("1997/10/07");
                        //soma os dias totais capturados com a data base declarada acima
                        dataBase.setDate(dataBase.getDate() + fatorVencimento) ;
                        //captura a nova data somada (dava vencimento)
                        obj.dataVencimento = dataBase.getDate()+"/"+(dataBase.getMonth()+1)+"/"+dataBase.getFullYear();
                    }
                }
            }
        } else if(code.length == 48) { //boleto convenio com 48 dígitos
            let codeInfo = {
                campo : [code.slice(0, 11), code.slice(12, 23), code.slice(24,35), code.slice(36, 47)],
                dv : [parseInt(code.slice(11, 12)), parseInt(code.slice(23, 24)), parseInt(code.slice(35, 36)),parseInt(code.slice(47, 48))]
            };
            //Validando cada campo individualmente com seu dv página 14 do arquivo Convenio.pdf
            if(this.validarDVCampoConvenio(codeInfo.campo[0], codeInfo.dv[0]) && this.validarDVCampoConvenio(codeInfo.campo[1],codeInfo.dv[1]) && 
            this.validarDVCampoConvenio(codeInfo.campo[2], codeInfo.dv[2]) && this.validarDVCampoConvenio(codeInfo.campo[3], codeInfo.dv[3])) {
                //Validacao do quarto dígito - MODULO 10 - página 15 do arquivo Convenio.pdf
                //SV = Segunda validação
                let campo1SV = code.slice(0,3); //SV = campo 1 de segunda validação
                let dv = parseInt(code.slice(3, 4)); //digito verificador
                let campo2SV = code.slice(4, 11)+codeInfo.campo[1]+codeInfo.campo[2]+codeInfo.campo[3]; //campo restante sem o DV
                if(this.validarDVCampoConvenio(campo1SV+campo2SV, dv)) {
                    //Validou com sucesso o digito verificador
                    obj.mensagem="Boleto válido!";
                    obj.valido = true;
                    obj.valor = ((code.slice(5, 11)+code.slice(12, 16))/100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\,/g, ".").replace(/\.+\d{2}$/g, ",")+code.slice(14, 16);
                    obj.codigoBarra = codeInfo.campo[0]+codeInfo.campo[1]+codeInfo.campo[2]+codeInfo.campo[3];
                }
            }
        }
        return obj;
    },
    validarDVCampoBancario(campo, dv) {
        //retorna se o dv é valido com a sequencia numérica do campo (boleto)
        let mult = this.multiplicacaoDv(campo);
        let soma = 0;
        //soma todos os algarismos da multiplicacao
        mult.forEach(result => soma+=result);
        //Passo C Divida o total encontrado por 10, a fim de determinar o resto da divisão:
        const resto = parseInt(soma % 10);
        //Passo D Subtrair o “resto” apurado pela dezena imediatamente posterior. O resultado será igual ao DV
        let dezenaPosterior = parseInt(soma.toString().slice(0,1)+"0")+10; //captura o primeiro algarismo e concatena com 0, converte para int esoma mais 10
        //Substraindo dezena posterior com resto e capturando segundo algarismo (D.V)
        const dvFinal = parseInt((dezenaPosterior-resto).toString().slice(1,2))
        return dvFinal === dv;
    },
    validarDVCampoConvenio(campo, dv) {
        let mult = this.multiplicacaoDv(campo);
        let soma = 0;
        //soma todos os algarismos da multiplicação
        mult.forEach(result => soma+=result);
        //captura o resto da divisao para depois subtrair com 10
        const resto = parseInt(soma % 10);
        let dvFinal = 0
        //Se o resto for 0, o numero não vai ser subtraído com 10
        if(resto > 0) dvFinal = 10 - resto;
        return dvFinal === dv;
    },
    //realiza a multiplicacao da direita para a esquerda na ordem 2,1,2,1,2,1....
    multiplicacaoDv(sequencia) {
        sequencia = sequencia.split('').map(Number);
        return sequencia.reverse().map((seq, i) => {
            if (i % 2 === 0 ){ 
                let temp = seq * 2
                if (temp > 9) {
                    return Number(temp.toString()[0]) + Number(temp.toString()[1])
                } else return temp
            } else return seq
        }).reverse(); 
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
    }
}