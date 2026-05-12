// ==============================
// PALAVRAS RESERVADAS
// ==============================

const PALAVRAS_RESERVADAS = {

    // TIPOS
    "inteiro":     "INTEIRO",
    "decimal":     "DECIMAL",
    "texto":       "TEXTO",
    "booleano":    "BOOLEANO",
    "caractere":   "CARACTERE",
    "nulo":        "NULO",

    // CONTROLE DE FLUXO
    "se":          "SE",
    "senão":       "SENAO",
    "senao":       "SENAO",
    "repetir":     "REPETIR",
    "fazer":       "FAZER",        // do...enquanto
    "enquanto":    "ENQUANTO",
    "para":        "PARA",
    "de":          "DE",
    "até":         "ATE",
    "ate":         "ATE",
    "passo":       "PASSO",
    "parar":       "PARAR",
    "continuar":   "CONTINUAR",

    // ESCOLHA (switch/case)
    "escolha":     "ESCOLHA",
    "caso":        "CASO",
    "padrão":      "PADRAO",
    "padrao":      "PADRAO",

    // FUNÇÕES
    "função":      "FUNCAO",
    "funcao":      "FUNCAO",
    "retornar":    "RETORNAR",

    // ENTRADA E SAÍDA
    "imprimir":    "IMPRIMIR",
    "capturar":    "CAPTURAR",

    // VALORES LÓGICOS
    "verdade":     "VERDADE",
    "verdadeiro":  "VERDADE",
    "falso":       "FALSO",

    // OPERADORES LÓGICOS
    "e":           "E",
    "ou":          "OU",
    "não":         "NAO",
    "nao":         "NAO",

    // MODIFICADORES
    "constante":   "CONSTANTE",
    "usar":        "USAR",
};


// ==============================
// OPERADORES E SÍMBOLOS
// ==============================

const OPERADORES = {

    // Atribuição composta (2 chars primeiro)
    "+=": "MAIS_IGUAL",
    "-=": "MENOS_IGUAL",
    "*=": "VEZES_IGUAL",
    "/=": "DIVIDIR_IGUAL",
    "%=": "MODULO_IGUAL",

    // Incremento/decremento
    "++": "MAIS_MAIS",
    "--": "MENOS_MENOS",

    // Comparação (2 chars)
    "==": "IGUAL_IGUAL",
    "!=": "DIFERENTE",
    ">=": "MAIOR_IGUAL",
    "<=": "MENOR_IGUAL",

    // Bit a bit (2 chars)
    "<<": "SHIFT_ESQ",
    ">>": "SHIFT_DIR",

    // Atribuição e aritmética (1 char)
    "=":  "IGUAL",
    "+":  "MAIS",
    "-":  "MENOS",
    "*":  "VEZES",
    "/":  "DIVIDIR",
    "%":  "MODULO",

    // Comparação (1 char)
    ">":  "MAIOR",
    "<":  "MENOR",

    // Bit a bit (1 char)
    "&":  "BIT_E",
    "|":  "BIT_OU",
    "^":  "BIT_XOR",
    "~":  "BIT_NAO",

    // Ternário
    "?":  "INTERROGACAO",
    ":":  "DOIS_PONTOS",

    // Agrupamento
    "(":  "ABRE_PAREN",
    ")":  "FECHA_PAREN",
    "{":  "ABRE_CHAVE",
    "}":  "FECHA_CHAVE",
    "[":  "ABRE_COLCHETE",
    "]":  "FECHA_COLCHETE",

    // Pontuação
    ";":  "PONTO_VIRGULA",
    ",":  "VIRGULA",
};
