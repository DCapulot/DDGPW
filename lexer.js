class Lexer {
    constructor(code) {
        this.code = code;
        this.pos = 0;
        this.tokens = [];
    }

    tokenize() {
        while (this.pos < this.code.length) {
            let char = this.code[this.pos];

            // Ignorar espaços e quebras de linha
            if (this.isSpace(char)) {
                this.pos++;
                continue;
            }

            // Comentário de linha (//)
            if (char === '/' && this.code[this.pos + 1] === '/') {
                while (this.pos < this.code.length && this.code[this.pos] !== '\n') {
                    this.pos++;
                }
                continue;
            }

            // Comentário de bloco (/* ... */)
            if (char === '/' && this.code[this.pos + 1] === '*') {
                this.pos += 2;
                while (this.pos < this.code.length - 1) {
                    if (this.code[this.pos] === '*' && this.code[this.pos + 1] === '/') {
                        this.pos += 2;
                        break;
                    }
                    this.pos++;
                }
                continue;
            }

            // Palavras e identificadores
            if (this.isLetter(char)) {
                this.tokens.push(this.readWord());
                continue;
            }

            // Números
            if (this.isNumber(char)) {
                this.tokens.push(this.readNumber());
                continue;
            }

            // Strings "texto"
            if (char === '"') {
                this.tokens.push(this.readString());
                continue;
            }

            // Operadores e símbolos (tenta 2 chars antes de 1)
            let op = this.readOperator();
            if (op) {
                this.tokens.push(op);
                continue;
            }

            this.pos++; // caractere desconhecido, ignora
        }

        return this.tokens;
    }

    // ========================
    // UTILITÁRIOS
    // ========================

    isSpace(c) {
        return /\s/.test(c);
    }

    isLetter(c) {
        return /[a-zA-ZçãõáéíóúÇÃÕÁÉÍÓÚâêîôûÂÊÎÔÛàÀ_]/.test(c);
    }

    isNumber(c) {
        return /[0-9]/.test(c);
    }

    // ========================
    // LEITURA
    // ========================

    readWord() {
        let word = "";
        while (this.pos < this.code.length &&
               (this.isLetter(this.code[this.pos]) || this.isNumber(this.code[this.pos]))) {
            word += this.code[this.pos++];
        }

        const wordLower = word.toLowerCase();
        if (PALAVRAS_RESERVADAS[wordLower]) {
            return { type: PALAVRAS_RESERVADAS[wordLower], value: wordLower };
        }

        return { type: "IDENTIFICADOR", value: word };
    }

    readNumber() {
        let num = "";
        let hasDot = false;

        // Suporte a hexadecimal: 0x1F
        if (this.code[this.pos] === '0' && (this.code[this.pos+1] === 'x' || this.code[this.pos+1] === 'X')) {
            num = "0x";
            this.pos += 2;
            while (this.pos < this.code.length && /[0-9a-fA-F]/.test(this.code[this.pos])) {
                num += this.code[this.pos++];
            }
            return { type: "INTEIRO", value: String(parseInt(num, 16)) };
        }

        while (this.pos < this.code.length &&
               (this.isNumber(this.code[this.pos]) || this.code[this.pos] === ".")) {
            if (this.code[this.pos] === ".") {
                if (hasDot) break;
                hasDot = true;
            }
            num += this.code[this.pos++];
        }

        return { type: hasDot ? "DECIMAL" : "INTEIRO", value: num };
    }

    readString() {
        let str = "";
        this.pos++; // pula aspas inicial

        while (this.pos < this.code.length && this.code[this.pos] !== '"') {
            if (this.code[this.pos] === '\\' && this.pos + 1 < this.code.length) {
                this.pos++;
                const escapes = { 'n': '\n', 't': '\t', '"': '"', '\\': '\\', 'r': '\r' };
                str += escapes[this.code[this.pos]] ?? ('\\' + this.code[this.pos]);
            } else {
                str += this.code[this.pos];
            }
            this.pos++;
        }

        this.pos++; // pula aspas final
        return { type: "TEXTO", value: str };
    }

    readOperator() {
        // Tenta operador de 2 caracteres primeiro (==, !=, >=, <=, +=, -=, *=, /=, ++, --, <<, >>)
        let two = this.code.substr(this.pos, 2);
        if (OPERADORES[two]) {
            this.pos += 2;
            return { type: OPERADORES[two], value: two };
        }

        // Tenta operador de 1 caractere
        let one = this.code[this.pos];
        if (OPERADORES[one]) {
            this.pos++;
            return { type: OPERADORES[one], value: one };
        }

        return null;
    }
}
