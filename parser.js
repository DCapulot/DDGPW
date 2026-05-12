class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    current() { return this.tokens[this.pos]; }
    peek(offset = 1) { return this.tokens[this.pos + offset]; }
    eat() { return this.tokens[this.pos++]; }

    // ========================
    // ENTRY POINT
    // ========================

    parse() {
        let ast = [];
        while (this.pos < this.tokens.length) {
            let node = this.parseStatement();
            if (node) ast.push(node);
        }
        return ast;
    }

    isType(type) {
        return ["INTEIRO", "DECIMAL", "TEXTO", "BOOLEANO", "CARACTERE"].includes(type);
    }

    // ========================
    // STATEMENTS
    // ========================

    parseStatement() {
        let t = this.current();
        if (!t) return null;

        // Declaração com CONSTANTE
        if (t.type === "CONSTANTE" && this.peek() && this.isType(this.peek().type)) {
            return this.parseVar(true);
        }

        if (this.isType(t.type))                                                   return this.parseVar();
        if (t.type === "IDENTIFICADOR" && this.peek()?.type === "IGUAL")           return this.parseAssign();
        if (t.type === "IDENTIFICADOR" && this.peek()?.type === "MAIS_MAIS")       return this.parseIncrementoStmt();
        if (t.type === "IDENTIFICADOR" && this.peek()?.type === "MENOS_MENOS")     return this.parseDecrementoStmt();
        if (t.type === "IDENTIFICADOR" && this.isAtribComposta(this.peek()?.type)) return this.parseAtribComposta();
        if (t.type === "IDENTIFICADOR" && this.peek()?.type === "ABRE_COLCHETE"
            && this.peekAhead2IsIgual())                                            return this.parseArrayAssign();
        if (t.type === "IDENTIFICADOR" && this.peek()?.type === "ABRE_PAREN")      return this.parseFuncCallStmt();
        if (t.type === "IMPRIMIR")   return this.parsePrint();
        if (t.type === "CAPTURAR")   return this.parseCapturarStmt();
        if (t.type === "SE")         return this.parseIf();
        if (t.type === "REPETIR")    return this.parseRepetir();
        if (t.type === "FAZER")      return this.parseFazerEnquanto();
        if (t.type === "PARA")       return this.parsePara();
        if (t.type === "ESCOLHA")    return this.parseEscolha();
        if (t.type === "FUNCAO")     return this.parseFuncao();
        if (t.type === "RETORNAR")   return this.parseRetornar();

        if (t.type === "PARAR") {
            this.eat();
            if (this.current()?.type === "PONTO_VIRGULA") this.eat();
            return { type: "PARAR" };
        }

        if (t.type === "CONTINUAR") {
            this.eat();
            if (this.current()?.type === "PONTO_VIRGULA") this.eat();
            return { type: "CONTINUAR" };
        }

        this.eat(); // token desconhecido
        return null;
    }

    // Verifica se é operador de atribuição composta
    isAtribComposta(type) {
        return ["MAIS_IGUAL","MENOS_IGUAL","VEZES_IGUAL","DIVIDIR_IGUAL","MODULO_IGUAL"].includes(type);
    }

    // Verifica se IDENTIFICADOR[expr] = ...
    peekAhead2IsIgual() {
        let i = this.pos + 1;
        let depth = 0;
        while (i < this.tokens.length) {
            if (this.tokens[i].type === "ABRE_COLCHETE") depth++;
            else if (this.tokens[i].type === "FECHA_COLCHETE") {
                depth--;
                if (depth === 0) {
                    return this.tokens[i+1]?.type === "IGUAL";
                }
            }
            i++;
        }
        return false;
    }

    // ========================
    // DECLARAÇÃO DE VARIÁVEL / CONSTANTE / VETOR
    // ========================

    parseVar(isConst = false) {
        if (isConst) this.eat(); // CONSTANTE
        let tipo = this.current().type; this.eat();
        let nome = this.current().value; this.eat();

        // Vetor: inteiro v[10];   ou  inteiro v[] = {1,2,3};
        if (this.current()?.type === "ABRE_COLCHETE") {
            this.eat(); // [
            let tamanho = null;
            if (this.current()?.type !== "FECHA_COLCHETE") {
                tamanho = this.parseExpression();
            }
            this.eat(); // ]
            let elementos = [];
            if (this.current()?.type === "IGUAL") {
                this.eat();
                this.eat(); // {
                while (this.current() && this.current().type !== "FECHA_CHAVE") {
                    if (this.current().type === "VIRGULA") { this.eat(); continue; }
                    elementos.push(this.parseExpression());
                }
                this.eat(); // }
            }
            if (this.current()?.type === "PONTO_VIRGULA") this.eat();
            return { type: "VAR_ARRAY", nome, tipo, tamanho, elementos, constante: isConst };
        }

        this.eat(); // IGUAL
        let value = this.parseExpression();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "VAR", nome, tipo, value, constante: isConst };
    }

    // ========================
    // ATRIBUIÇÃO
    // ========================

    parseAssign() {
        let nome = this.current().value; this.eat();
        this.eat(); // IGUAL
        let value = this.parseExpression();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "ASSIGN", nome, value };
    }

    parseAtribComposta() {
        let nome = this.current().value; this.eat();
        let op = this.current().type; this.eat(); // +=, -=, etc.
        let value = this.parseExpression();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "ASSIGN_COMPOSTA", nome, op, value };
    }

    parseIncrementoStmt() {
        let nome = this.current().value; this.eat();
        this.eat(); // ++
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "INCREMENTO", nome };
    }

    parseDecrementoStmt() {
        let nome = this.current().value; this.eat();
        this.eat(); // --
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "DECREMENTO", nome };
    }

    // Atribuição de elemento de array: v[i] = expr;
    parseArrayAssign() {
        let nome = this.current().value; this.eat();
        this.eat(); // [
        let indice = this.parseExpression();
        this.eat(); // ]
        this.eat(); // =
        let value = this.parseExpression();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "ARRAY_ASSIGN", nome, indice, value };
    }

    // ========================
    // IMPRIMIR
    // ========================

    parsePrint() {
        this.eat(); // IMPRIMIR
        if (this.current()?.type === "ABRE_PAREN") this.eat();

        let args = [];
        if (this.current()?.type !== "FECHA_PAREN") {
            args.push(this.parseExpression());
            while (this.current()?.type === "VIRGULA") {
                this.eat();
                args.push(this.parseExpression());
            }
        }

        if (this.current()?.type === "FECHA_PAREN") this.eat();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "PRINT", args };
    }

    // ========================
    // CAPTURAR (statement)
    // ========================

    parseCapturarStmt() {
        this.eat(); // CAPTURAR
        if (this.current()?.type === "ABRE_PAREN") this.eat();
        let prompt = null;
        if (this.current()?.type !== "FECHA_PAREN") {
            prompt = this.parseExpression();
        }
        if (this.current()?.type === "FECHA_PAREN") this.eat();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "CAPTURAR", prompt };
    }

    // ========================
    // SE / SENÃO (suporta "senão se")
    // ========================

    parseIf() {
        this.eat(); // SE
        if (this.current()?.type === "ABRE_PAREN") this.eat();
        let condition = this.parseExpression();
        if (this.current()?.type === "FECHA_PAREN") this.eat();

        let block = this.parseBlock();
        let elseBlock = null;

        if (this.current()?.type === "SENAO") {
            this.eat();
            // "senão se" → encadeia como outro IF
            if (this.current()?.type === "SE") {
                elseBlock = [this.parseIf()];
            } else {
                elseBlock = this.parseBlock();
            }
        }

        return { type: "IF", condition, block, elseBlock };
    }

    // ========================
    // REPETIR (while)
    // ========================

    parseRepetir() {
        this.eat(); // REPETIR
        if (this.current()?.type === "ABRE_PAREN") this.eat();
        let condition = this.parseExpression();
        if (this.current()?.type === "FECHA_PAREN") this.eat();
        let block = this.parseBlock();
        return { type: "REPETIR", condition, block };
    }

    // ========================
    // FAZER...ENQUANTO (do...while)
    // ========================

    parseFazerEnquanto() {
        this.eat(); // FAZER
        let block = this.parseBlock();
        if (this.current()?.type === "ENQUANTO") this.eat();
        if (this.current()?.type === "ABRE_PAREN") this.eat();
        let condition = this.parseExpression();
        if (this.current()?.type === "FECHA_PAREN") this.eat();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "FAZER_ENQUANTO", condition, block };
    }

    // ========================
    // PARA (for)
    // ========================

    parsePara() {
        this.eat(); // PARA
        let varNome = this.current().value; this.eat();
        this.eat(); // DE
        let inicio = this.parseExpression();
        this.eat(); // ATE
        let fim = this.parseExpression();

        let passo = { type: "NUMBER", value: 1 };
        if (this.current()?.type === "PASSO") {
            this.eat();
            passo = this.parseExpression();
        }

        let block = this.parseBlock();
        return { type: "PARA", varNome, inicio, fim, passo, block };
    }

    // ========================
    // ESCOLHA (switch/case)
    // ========================

    parseEscolha() {
        this.eat(); // ESCOLHA
        if (this.current()?.type === "ABRE_PAREN") this.eat();
        let expr = this.parseExpression();
        if (this.current()?.type === "FECHA_PAREN") this.eat();
        this.eat(); // {

        let casos = [];
        let padraoBlock = null;

        while (this.current() && this.current().type !== "FECHA_CHAVE") {
            if (this.current().type === "CASO") {
                this.eat(); // CASO
                let valor = this.parseExpression();
                if (this.current()?.type === "DOIS_PONTOS") this.eat();
                let stmts = [];
                while (this.current() &&
                       this.current().type !== "CASO" &&
                       this.current().type !== "PADRAO" &&
                       this.current().type !== "FECHA_CHAVE") {
                    let s = this.parseStatement();
                    if (s) stmts.push(s);
                }
                casos.push({ valor, block: stmts });
            } else if (this.current().type === "PADRAO") {
                this.eat(); // PADRAO
                if (this.current()?.type === "DOIS_PONTOS") this.eat();
                let stmts = [];
                while (this.current() &&
                       this.current().type !== "CASO" &&
                       this.current().type !== "FECHA_CHAVE") {
                    let s = this.parseStatement();
                    if (s) stmts.push(s);
                }
                padraoBlock = stmts;
            } else {
                this.eat();
            }
        }

        if (this.current()?.type === "FECHA_CHAVE") this.eat();
        return { type: "ESCOLHA", expr, casos, padraoBlock };
    }

    // ========================
    // FUNÇÃO
    // ========================

    parseFuncao() {
        this.eat(); // FUNCAO
        let nome = this.current().value; this.eat();
        this.eat(); // ABRE_PAREN

        let params = [];
        while (this.current() && this.current().type !== "FECHA_PAREN") {
            if (this.current().type === "VIRGULA") { this.eat(); continue; }

            let paramTipo = null;
            if (this.isType(this.current().type)) {
                paramTipo = this.current().type;
                this.eat();
            }

            let paramNome = this.current().value; this.eat();
            params.push({ nome: paramNome, tipo: paramTipo });
        }

        if (this.current()?.type === "FECHA_PAREN") this.eat();
        let block = this.parseBlock();
        return { type: "FUNCAO", nome, params, block };
    }

    parseRetornar() {
        this.eat(); // RETORNAR
        let value = null;
        if (this.current() && this.current().type !== "PONTO_VIRGULA"
            && this.current().type !== "FECHA_CHAVE") {
            value = this.parseExpression();
        }
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "RETORNAR", value };
    }

    parseFuncCallStmt() {
        let node = this.parseFuncCall();
        if (this.current()?.type === "PONTO_VIRGULA") this.eat();
        return { type: "FUNC_CALL_STMT", call: node };
    }

    parseFuncCall() {
        let nome = this.current().value; this.eat();
        this.eat(); // ABRE_PAREN

        let args = [];
        while (this.current() && this.current().type !== "FECHA_PAREN") {
            if (this.current().type === "VIRGULA") { this.eat(); continue; }
            args.push(this.parseExpression());
        }

        if (this.current()?.type === "FECHA_PAREN") this.eat();
        return { type: "FUNC_CALL", nome, args };
    }

    // ========================
    // BLOCO { }
    // ========================

    parseBlock() {
        if (this.current()?.type === "ABRE_CHAVE") this.eat();
        let body = [];
        while (this.current() && this.current().type !== "FECHA_CHAVE") {
            let node = this.parseStatement();
            if (node) body.push(node);
        }
        if (this.current()?.type === "FECHA_CHAVE") this.eat();
        return body;
    }

    // ========================
    // EXPRESSÕES
    // ========================

    parseExpression()  { return this.parseTernario(); }

    // Operador ternário: condicao ? valorSe : valorSenao
    parseTernario() {
        let cond = this.parseLogical();
        if (this.current()?.type === "INTERROGACAO") {
            this.eat(); // ?
            let entao = this.parseLogical();
            if (this.current()?.type === "DOIS_PONTOS") this.eat(); // :
            let senao = this.parseTernario();
            return { type: "TERNARIO", cond, entao, senao };
        }
        return cond;
    }

    parseLogical() {
        let left = this.parseNot();
        while (this.current() && (this.current().type === "E" || this.current().type === "OU")) {
            let op = this.current().type; this.eat();
            left = { type: op, left, right: this.parseNot() };
        }
        return left;
    }

    parseNot() {
        if (this.current()?.type === "NAO") {
            this.eat();
            return { type: "NAO", value: this.parseComparison() };
        }
        return this.parseComparison();
    }

    parseComparison() {
        let left = this.parseBitwise();
        const ops = ["MAIOR", "MENOR", "IGUAL_IGUAL", "DIFERENTE", "MAIOR_IGUAL", "MENOR_IGUAL"];
        while (this.current() && ops.includes(this.current().type)) {
            let op = this.current().type; this.eat();
            left = { type: op, left, right: this.parseBitwise() };
        }
        return left;
    }

    // Operadores bit a bit: &, |, ^, <<, >>
    parseBitwise() {
        let left = this.parseTerm();
        const ops = ["BIT_E", "BIT_OU", "BIT_XOR", "SHIFT_ESQ", "SHIFT_DIR"];
        while (this.current() && ops.includes(this.current().type)) {
            let op = this.current().type; this.eat();
            left = { type: op, left, right: this.parseTerm() };
        }
        return left;
    }

    parseTerm() {
        let left = this.parseFactor();
        while (this.current() && (this.current().type === "MAIS" || this.current().type === "MENOS")) {
            let op = this.current().type; this.eat();
            left = { type: op, left, right: this.parseFactor() };
        }
        return left;
    }

    parseFactor() {
        let left = this.parseUnary();
        while (this.current() && ["VEZES", "DIVIDIR", "MODULO"].includes(this.current().type)) {
            let op = this.current().type; this.eat();
            left = { type: op, left, right: this.parseUnary() };
        }
        return left;
    }

    parseUnary() {
        if (this.current()?.type === "MENOS") {
            this.eat();
            return { type: "NEGATIVO", value: this.parsePrimary() };
        }
        if (this.current()?.type === "BIT_NAO") {
            this.eat();
            return { type: "BIT_NAO_UNARIO", value: this.parsePrimary() };
        }
        // Pré-incremento/decremento: ++x, --x
        if (this.current()?.type === "MAIS_MAIS") {
            this.eat();
            let nome = this.current().value; this.eat();
            return { type: "PRE_INC", nome };
        }
        if (this.current()?.type === "MENOS_MENOS") {
            this.eat();
            let nome = this.current().value; this.eat();
            return { type: "PRE_DEC", nome };
        }
        return this.parsePrimary();
    }

    parsePrimary() {
        let token = this.current();
        if (!token) return null;

        if (token.type === "ABRE_PAREN") {
            this.eat();
            let expr = this.parseExpression();
            if (this.current()?.type === "FECHA_PAREN") this.eat();
            return expr;
        }

        if (token.type === "INTEIRO" || token.type === "DECIMAL") {
            this.eat();
            return { type: "NUMBER", value: Number(token.value) };
        }

        if (token.type === "TEXTO") {
            this.eat();
            return { type: "STRING", value: token.value };
        }

        if (token.type === "NULO") { this.eat(); return { type: "NULO" }; }
        if (token.type === "VERDADE") { this.eat(); return { type: "BOOL", value: true }; }
        if (token.type === "FALSO")   { this.eat(); return { type: "BOOL", value: false }; }

        if (token.type === "CAPTURAR") return this.parseCapturarStmt();

        if (token.type === "IDENTIFICADOR") {
            // Chamada de função
            if (this.peek()?.type === "ABRE_PAREN") return this.parseFuncCall();

            // Acesso a elemento de array: v[i]
            if (this.peek()?.type === "ABRE_COLCHETE") {
                let nome = this.current().value; this.eat();
                this.eat(); // [
                let indice = this.parseExpression();
                this.eat(); // ]
                return { type: "ARRAY_ACCESS", nome, indice };
            }

            // Pós-incremento: x++
            if (this.peek()?.type === "MAIS_MAIS") {
                let nome = this.current().value; this.eat(); this.eat();
                return { type: "POS_INC", nome };
            }

            // Pós-decremento: x--
            if (this.peek()?.type === "MENOS_MENOS") {
                let nome = this.current().value; this.eat(); this.eat();
                return { type: "POS_DEC", nome };
            }

            this.eat();
            return { type: "VARIABLE", name: token.value };
        }

        this.eat();
        return null;
    }
}
