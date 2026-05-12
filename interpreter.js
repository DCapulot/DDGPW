// ========================
// SINAIS DE CONTROLE
// ========================

class RetornarSignal {
    constructor(value) { this.value = value; }
}

class PararSignal {}

class ContinuarSignal {}


// ========================
// INTERPRETADOR
// ========================

class Interpreter {
    constructor(ast) {
        this.ast = ast;
        this.globalVars    = {};
        this.globalConsts  = new Set(); // nomes de constantes
        this.funcoes       = {};
        this.callStack     = [this.globalVars];
        this.constStack    = [this.globalConsts];
    }

    get vars() {
        return this.callStack[this.callStack.length - 1];
    }

    get consts() {
        return this.constStack[this.constStack.length - 1];
    }

    run() {
        for (let node of this.ast) {
            this.exec(node);
        }
    }

    // ========================
    // ESCOPOS
    // ========================

    pushScope(vars = {}) {
        this.callStack.push({ ...vars });
        this.constStack.push(new Set());
    }

    popScope() {
        this.callStack.pop();
        this.constStack.pop();
    }

    getVar(name) {
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            if (name in this.callStack[i]) return this.callStack[i][name];
        }
        this.error(`Variável '${name}' não definida`);
    }

    setVar(name, value) {
        // Verifica se é constante em algum escopo
        for (let i = this.constStack.length - 1; i >= 0; i--) {
            if (this.constStack[i].has(name)) {
                this.error(`Não é possível reatribuir a constante '${name}'`);
            }
        }
        for (let i = this.callStack.length - 1; i >= 0; i--) {
            if (name in this.callStack[i]) {
                this.callStack[i][name] = value;
                return;
            }
        }
        this.vars[name] = value;
    }

    declareConst(name, value) {
        this.vars[name] = value;
        this.consts.add(name);
    }

    // ========================
    // EXECUTOR
    // ========================

    exec(node) {
        if (!node) return null;

        switch (node.type) {

            // ----- Variáveis -----
            case "VAR":
                if (node.constante) {
                    this.declareConst(node.nome, this.eval(node.value));
                } else {
                    this.vars[node.nome] = this.eval(node.value);
                }
                break;

            case "VAR_ARRAY": {
                let arr;
                if (node.elementos.length > 0) {
                    arr = node.elementos.map(e => this.eval(e));
                } else {
                    let tam = node.tamanho ? this.eval(node.tamanho) : 0;
                    arr = new Array(tam).fill(null);
                }
                if (node.constante) {
                    this.declareConst(node.nome, arr);
                } else {
                    this.vars[node.nome] = arr;
                }
                break;
            }

            case "ARRAY_ASSIGN": {
                let arr = this.getVar(node.nome);
                if (!Array.isArray(arr)) this.error(`'${node.nome}' não é um vetor`);
                let idx = this.eval(node.indice);
                arr[idx] = this.eval(node.value);
                break;
            }

            case "ASSIGN":
                this.setVar(node.nome, this.eval(node.value));
                break;

            case "ASSIGN_COMPOSTA": {
                let cur = this.getVar(node.nome);
                let val = this.eval(node.value);
                let res;
                switch (node.op) {
                    case "MAIS_IGUAL":    res = cur + val; break;
                    case "MENOS_IGUAL":   res = cur - val; break;
                    case "VEZES_IGUAL":   res = cur * val; break;
                    case "MODULO_IGUAL":  res = cur % val; break;
                    case "DIVIDIR_IGUAL":
                        if (val === 0) this.error("Divisão por zero");
                        res = cur / val;
                        break;
                }
                this.setVar(node.nome, res);
                break;
            }

            case "INCREMENTO":
                this.setVar(node.nome, this.getVar(node.nome) + 1);
                break;

            case "DECREMENTO":
                this.setVar(node.nome, this.getVar(node.nome) - 1);
                break;

            // ----- Saída -----
            case "PRINT": {
                let partes = node.args.map(a => {
                    let v = this.eval(a);
                    return v == null ? "nulo" : String(v);
                });
                console.log(partes.join(" "));
                break;
            }

            // ----- Capturar stmt -----
            case "CAPTURAR": {
                let msg = node.prompt ? String(this.eval(node.prompt)) : "";
                window.prompt(msg);
                break;
            }

            // ----- Condicional -----
            case "IF":
                if (this.eval(node.condition)) {
                    return this.execBlock(node.block);
                } else if (node.elseBlock) {
                    return this.execBlock(node.elseBlock);
                }
                break;

            // ----- Escolha (switch) -----
            case "ESCOLHA": {
                let val = this.eval(node.expr);
                let achou = false;
                for (let caso of node.casos) {
                    if (this.eval(caso.valor) === val) {
                        let sinal = this.execBlock(caso.block);
                        if (sinal instanceof PararSignal)    { achou = true; break; }
                        if (sinal instanceof RetornarSignal) return sinal;
                        achou = true;
                    }
                }
                if (!achou && node.padraoBlock) {
                    let sinal = this.execBlock(node.padraoBlock);
                    if (sinal instanceof RetornarSignal) return sinal;
                }
                break;
            }

            // ----- Loops -----
            case "REPETIR": {
                while (this.eval(node.condition)) {
                    let sinal = this.execBlock(node.block);
                    if (sinal instanceof PararSignal)    break;
                    if (sinal instanceof ContinuarSignal) continue;
                    if (sinal instanceof RetornarSignal) return sinal;
                }
                break;
            }

            case "FAZER_ENQUANTO": {
                do {
                    let sinal = this.execBlock(node.block);
                    if (sinal instanceof PararSignal)    break;
                    if (sinal instanceof ContinuarSignal) continue;
                    if (sinal instanceof RetornarSignal) return sinal;
                } while (this.eval(node.condition));
                break;
            }

            case "PARA": {
                let ini   = this.eval(node.inicio);
                let fim   = this.eval(node.fim);
                let passo = this.eval(node.passo);

                this.vars[node.varNome] = ini;

                const continuar = passo > 0
                    ? () => this.getVar(node.varNome) <= fim
                    : () => this.getVar(node.varNome) >= fim;

                while (continuar()) {
                    let sinal = this.execBlock(node.block);
                    if (sinal instanceof PararSignal)    break;
                    if (sinal instanceof ContinuarSignal) {
                        this.setVar(node.varNome, this.getVar(node.varNome) + passo);
                        continue;
                    }
                    if (sinal instanceof RetornarSignal) return sinal;
                    this.setVar(node.varNome, this.getVar(node.varNome) + passo);
                }
                break;
            }

            // ----- Funções -----
            case "FUNCAO":
                this.funcoes[node.nome] = node;
                break;

            case "FUNC_CALL_STMT":
                this.eval(node.call);
                break;

            case "RETORNAR":
                return new RetornarSignal(node.value ? this.eval(node.value) : null);

            case "PARAR":
                return new PararSignal();

            case "CONTINUAR":
                return new ContinuarSignal();
        }

        return null;
    }

    execBlock(block) {
        for (let node of block) {
            let sinal = this.exec(node);
            if (sinal instanceof RetornarSignal)  return sinal;
            if (sinal instanceof PararSignal)     return sinal;
            if (sinal instanceof ContinuarSignal) return sinal;
        }
        return null;
    }

    // ========================
    // EVAL (expressões)
    // ========================

    eval(node) {
        if (!node) return null;

        // Primitivos
        if (node.type === "NUMBER") return node.value;
        if (node.type === "STRING") return node.value;
        if (node.type === "BOOL")   return node.value;
        if (node.type === "NULO")   return null;

        // Variável
        if (node.type === "VARIABLE") return this.getVar(node.name);

        // Acesso a array
        if (node.type === "ARRAY_ACCESS") {
            let arr = this.getVar(node.nome);
            if (!Array.isArray(arr)) this.error(`'${node.nome}' não é um vetor`);
            let idx = this.eval(node.indice);
            if (idx < 0 || idx >= arr.length) this.error(`Índice ${idx} fora dos limites do vetor '${node.nome}'`);
            return arr[idx];
        }

        // Unário
        if (node.type === "NEGATIVO")       return -this.eval(node.value);
        if (node.type === "NAO")            return !this.eval(node.value);
        if (node.type === "BIT_NAO_UNARIO") return ~this.eval(node.value);

        // Incremento/decremento como expressão
        if (node.type === "POS_INC") {
            let v = this.getVar(node.nome);
            this.setVar(node.nome, v + 1);
            return v;           // retorna valor ANTES
        }
        if (node.type === "POS_DEC") {
            let v = this.getVar(node.nome);
            this.setVar(node.nome, v - 1);
            return v;
        }
        if (node.type === "PRE_INC") {
            let v = this.getVar(node.nome) + 1;
            this.setVar(node.nome, v);
            return v;           // retorna valor DEPOIS
        }
        if (node.type === "PRE_DEC") {
            let v = this.getVar(node.nome) - 1;
            this.setVar(node.nome, v);
            return v;
        }

        // Aritmética
        if (node.type === "MAIS")    return this.eval(node.left) + this.eval(node.right);
        if (node.type === "MENOS")   return this.eval(node.left) - this.eval(node.right);
        if (node.type === "VEZES")   return this.eval(node.left) * this.eval(node.right);
        if (node.type === "MODULO")  return this.eval(node.left) % this.eval(node.right);

        if (node.type === "DIVIDIR") {
            let dir = this.eval(node.right);
            if (dir === 0) this.error("Divisão por zero");
            return this.eval(node.left) / dir;
        }

        // Comparação
        if (node.type === "MAIOR")       return this.eval(node.left) >   this.eval(node.right);
        if (node.type === "MENOR")       return this.eval(node.left) <   this.eval(node.right);
        if (node.type === "MAIOR_IGUAL") return this.eval(node.left) >=  this.eval(node.right);
        if (node.type === "MENOR_IGUAL") return this.eval(node.left) <=  this.eval(node.right);
        if (node.type === "IGUAL_IGUAL") return this.eval(node.left) === this.eval(node.right);
        if (node.type === "DIFERENTE")   return this.eval(node.left) !== this.eval(node.right);

        // Lógicos
        if (node.type === "E")  return this.eval(node.left) && this.eval(node.right);
        if (node.type === "OU") return this.eval(node.left) || this.eval(node.right);

        // Operadores bit a bit
        if (node.type === "BIT_E")    return this.eval(node.left) &  this.eval(node.right);
        if (node.type === "BIT_OU")   return this.eval(node.left) |  this.eval(node.right);
        if (node.type === "BIT_XOR")  return this.eval(node.left) ^  this.eval(node.right);
        if (node.type === "SHIFT_ESQ") return this.eval(node.left) << this.eval(node.right);
        if (node.type === "SHIFT_DIR") return this.eval(node.left) >> this.eval(node.right);

        // Operador ternário
        if (node.type === "TERNARIO")
            return this.eval(node.cond) ? this.eval(node.entao) : this.eval(node.senao);

        // Capturar como expressão
        if (node.type === "CAPTURAR") {
            let msg = node.prompt ? String(this.eval(node.prompt)) : "";
            let entrada = window.prompt(msg) ?? "";
            let num = Number(entrada);
            return isNaN(num) ? entrada : num;
        }

        // Chamada de função
        if (node.type === "FUNC_CALL") return this.chamarFuncao(node);

        return null;
    }

    // ========================
    // FUNÇÕES NATIVAS
    // ========================

    chamarFuncao(node) {
        switch (node.nome) {

            // --- Entrada/Saída ---
            case "imprimir": {
                let p = node.args.map(a => { let v = this.eval(a); return v == null ? "nulo" : String(v); });
                console.log(p.join(" "));
                return null;
            }
            case "capturar": {
                let msg = node.args.length ? String(this.eval(node.args[0])) : "";
                let entrada = window.prompt(msg) ?? "";
                let num = Number(entrada);
                return isNaN(num) ? entrada : num;
            }

            // --- Conversões ---
            case "inteiro":   return Math.trunc(this.eval(node.args[0]));
            case "decimal":   return parseFloat(String(this.eval(node.args[0])));
            case "texto":     return String(this.eval(node.args[0]));
            case "booleano":  return Boolean(this.eval(node.args[0]));

            // --- Strings ---
            case "tamanho": {
                let v = this.eval(node.args[0]);
                return v != null ? v.length ?? 0 : 0;
            }
            case "maiusculo":  return String(this.eval(node.args[0])).toUpperCase();
            case "minusculo":  return String(this.eval(node.args[0])).toLowerCase();
            case "fatiar": {
                let s = String(this.eval(node.args[0]));
                let ini = this.eval(node.args[1]);
                let fim = node.args[2] !== undefined ? this.eval(node.args[2]) : undefined;
                return s.slice(ini, fim);
            }
            case "substituir": {
                let s   = String(this.eval(node.args[0]));
                let de  = String(this.eval(node.args[1]));
                let por = String(this.eval(node.args[2]));
                return s.split(de).join(por);
            }
            case "contem": {
                let s  = String(this.eval(node.args[0]));
                let b  = String(this.eval(node.args[1]));
                return s.includes(b);
            }
            case "começa_com":
            case "comeca_com": {
                let s = String(this.eval(node.args[0]));
                let p = String(this.eval(node.args[1]));
                return s.startsWith(p);
            }
            case "termina_com": {
                let s = String(this.eval(node.args[0]));
                let p = String(this.eval(node.args[1]));
                return s.endsWith(p);
            }
            case "aparar":
            case "trim": return String(this.eval(node.args[0])).trim();
            case "dividir_texto": {
                let s   = String(this.eval(node.args[0]));
                let sep = node.args[1] !== undefined ? String(this.eval(node.args[1])) : "";
                return s.split(sep);
            }
            case "indice_de": {
                let s = String(this.eval(node.args[0]));
                let b = String(this.eval(node.args[1]));
                return s.indexOf(b);
            }
            case "repetir_texto": {
                let s = String(this.eval(node.args[0]));
                let n = this.eval(node.args[1]);
                return s.repeat(n);
            }
            case "inverter_texto": {
                return String(this.eval(node.args[0])).split("").reverse().join("");
            }
            case "char_em": {
                let s = String(this.eval(node.args[0]));
                let i = this.eval(node.args[1]);
                return s[i] ?? null;
            }
            case "codigo_char": {
                return String(this.eval(node.args[0])).charCodeAt(0);
            }
            case "char_de_codigo": {
                return String.fromCharCode(this.eval(node.args[0]));
            }

            // --- Vetores ---
            case "criar_vetor": {
                let tam = this.eval(node.args[0]);
                let val = node.args[1] !== undefined ? this.eval(node.args[1]) : null;
                return new Array(tam).fill(val);
            }
            case "tamanho_vetor": {
                let v = this.eval(node.args[0]);
                return Array.isArray(v) ? v.length : 0;
            }
            case "empurrar": {
                let arr = this.eval(node.args[0]);
                if (!Array.isArray(arr)) this.error("empurrar: argumento não é vetor");
                arr.push(this.eval(node.args[1]));
                return arr.length;
            }
            case "remover_ultimo": {
                let arr = this.eval(node.args[0]);
                if (!Array.isArray(arr)) this.error("remover_ultimo: argumento não é vetor");
                return arr.pop() ?? null;
            }
            case "remover_primeiro": {
                let arr = this.eval(node.args[0]);
                if (!Array.isArray(arr)) this.error("remover_primeiro: argumento não é vetor");
                return arr.shift() ?? null;
            }
            case "inserir_inicio": {
                let arr = this.eval(node.args[0]);
                if (!Array.isArray(arr)) this.error("inserir_inicio: argumento não é vetor");
                arr.unshift(this.eval(node.args[1]));
                return arr.length;
            }
            case "fatiar_vetor": {
                let arr = this.eval(node.args[0]);
                let ini = this.eval(node.args[1]);
                let fim = node.args[2] !== undefined ? this.eval(node.args[2]) : undefined;
                return arr.slice(ini, fim);
            }
            case "ordenar": {
                let arr = this.eval(node.args[0]);
                if (!Array.isArray(arr)) this.error("ordenar: argumento não é vetor");
                let copia = [...arr];
                copia.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
                return copia;
            }
            case "inverter": {
                let arr = this.eval(node.args[0]);
                if (!Array.isArray(arr)) this.error("inverter: argumento não é vetor");
                return [...arr].reverse();
            }
            case "juntar": {
                let arr = this.eval(node.args[0]);
                let sep = node.args[1] !== undefined ? String(this.eval(node.args[1])) : ",";
                return arr.join(sep);
            }
            case "contem_vetor": {
                let arr = this.eval(node.args[0]);
                let val = this.eval(node.args[1]);
                return Array.isArray(arr) && arr.includes(val);
            }

            // --- Matemática ---
            case "maximo":     return Math.max(...node.args.map(a => this.eval(a)));
            case "minimo":     return Math.min(...node.args.map(a => this.eval(a)));
            case "absoluto":   return Math.abs(this.eval(node.args[0]));
            case "arredondar": return Math.round(this.eval(node.args[0]));
            case "piso":       return Math.floor(this.eval(node.args[0]));
            case "teto":       return Math.ceil(this.eval(node.args[0]));
            case "potencia":   return Math.pow(this.eval(node.args[0]), this.eval(node.args[1]));
            case "raiz":       return Math.sqrt(this.eval(node.args[0]));
            case "raiz_cubica": return Math.cbrt(this.eval(node.args[0]));
            case "logaritmo":  return Math.log(this.eval(node.args[0]));
            case "log10":      return Math.log10(this.eval(node.args[0]));
            case "log2":       return Math.log2(this.eval(node.args[0]));
            case "seno":       return Math.sin(this.eval(node.args[0]));
            case "cosseno":    return Math.cos(this.eval(node.args[0]));
            case "tangente":   return Math.tan(this.eval(node.args[0]));
            case "aleatorio":  return Math.random();
            case "aleatorio_entre": {
                let min = this.eval(node.args[0]);
                let max = this.eval(node.args[1]);
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            case "pi":         return Math.PI;
            case "truncar":    return Math.trunc(this.eval(node.args[0]));
            case "sinal":      return Math.sign(this.eval(node.args[0]));

            // --- Verificação de tipo ---
            case "eh_numero": {
                let v = this.eval(node.args[0]);
                return typeof v === "number" && !isNaN(v);
            }
            case "eh_texto": {
                return typeof this.eval(node.args[0]) === "string";
            }
            case "eh_booleano": {
                return typeof this.eval(node.args[0]) === "boolean";
            }
            case "eh_nulo": {
                return this.eval(node.args[0]) == null;
            }
            case "eh_vetor": {
                return Array.isArray(this.eval(node.args[0]));
            }

            // --- Miscelânea ---
            case "tipo_de": {
                let v = this.eval(node.args[0]);
                if (v == null) return "nulo";
                if (Array.isArray(v)) return "vetor";
                if (typeof v === "number") return Number.isInteger(v) ? "inteiro" : "decimal";
                return typeof v === "boolean" ? "booleano" : "texto";
            }
        }

        // Função definida pelo usuário
        let funcDef = this.funcoes[node.nome];
        if (!funcDef) this.error(`Função '${node.nome}' não definida`);

        let escopo = {};
        funcDef.params.forEach((param, i) => {
            escopo[param.nome] = node.args[i] !== undefined ? this.eval(node.args[i]) : null;
        });

        this.pushScope(escopo);
        let sinal = this.execBlock(funcDef.block);
        this.popScope();

        if (sinal instanceof RetornarSignal) return sinal.value;
        return null;
    }

    // ========================
    // ERRO
    // ========================

    error(msg) {
        throw new Error(`[DDGPW ERROR] ${msg}`);
    }
}
