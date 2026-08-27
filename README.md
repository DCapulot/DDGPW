# 🧠 DDGPW v3.0 — Linguagem de Programação e IDE

Uma **linguagem de programação experimental desenvolvida em JavaScript**, acompanhada de uma IDE web própria para escrever, analisar e executar códigos utilizando a sintaxe da **DDGPW v3.0**.

O projeto implementa as principais etapas de processamento de uma linguagem de programação: **Lexer, Parser, AST e Interpreter**, permitindo visualizar não apenas o resultado da execução, mas também como o código é processado internamente.

---

## 🚀 Sobre o Projeto

O **DDGPW v3.0** é um projeto desenvolvido para explorar, na prática, conceitos relacionados à criação de linguagens de programação e interpretadores.

A aplicação disponibiliza um editor de código onde o usuário pode escrever comandos utilizando a sintaxe da DDGPW e executar o programa diretamente no navegador.

Durante a execução, o sistema passa por diferentes etapas:

```text
Código DDGPW
     ↓
   Lexer
     ↓
  Tokens
     ↓
   Parser
     ↓
    AST
     ↓
 Interpreter
     ↓
 Resultado no Console
```

A IDE também possui abas independentes para visualizar o **Console**, os **Tokens**, a **AST** e uma **Referência da linguagem**.

---

## ✨ Funcionalidades

### 📝 Editor de Código

Editor integrado para escrever programas utilizando a sintaxe da DDGPW.

Também possui suporte para:

* Indentação utilizando `Tab`
* Execução através de `Ctrl + Enter`
* Botão para executar o código
* Botão para limpar os resultados

---

### 🔤 Analisador Léxico — Lexer

O Lexer é responsável por transformar o código-fonte em **tokens**.

Ele reconhece:

* Palavras reservadas
* Identificadores
* Números inteiros
* Números decimais
* Strings
* Operadores
* Símbolos
* Comentários de linha
* Comentários de bloco

O projeto também possui suporte para números em hexadecimal.

---

### 🌳 Parser e AST

Depois da análise léxica, os tokens são enviados para o **Parser**, que transforma a sequência de tokens em uma **Árvore de Sintaxe Abstrata (AST)**.

A AST pode ser visualizada diretamente pela interface da IDE.

O Parser possui suporte para elementos como:

* Declaração de variáveis
* Constantes
* Vetores
* Atribuições
* Condicionais
* Loops
* `escolha/caso`
* Funções
* Retorno
* Incremento e decremento
* Operadores
* Chamadas de funções

---

### ⚙️ Interpretador

O Interpreter é responsável por executar a AST gerada pelo Parser.

O sistema trabalha com:

* Variáveis
* Constantes
* Vetores
* Escopos
* Funções
* Condicionais
* Estruturas de repetição
* `parar`
* `continuar`
* `retornar`
* Operações matemáticas
* Comparações
* Operadores lógicos
* Operadores bit a bit

O interpretador também possui controle de escopo através de uma pilha de variáveis e constantes.

---

## 📚 Recursos da Linguagem

A DDGPW utiliza palavras-chave em português.

### Tipos

```text
inteiro
decimal
texto
booleano
caractere
nulo
```

### Condicionais

```text
se
senão
```

### Repetição

```text
repetir
fazer
enquanto
para
de
até
passo
```

### Controle

```text
parar
continuar
```

### Escolha

```text
escolha
caso
padrão
```

### Funções

```text
função
retornar
```

### Entrada e saída

```text
imprimir
capturar
```

### Valores lógicos

```text
verdade
verdadeiro
falso
```

Esses elementos são definidos no sistema de tokens da linguagem.

---

## 🔢 Operadores

A linguagem possui operadores aritméticos, relacionais, lógicos, de atribuição composta e operadores bit a bit.

Exemplos:

```text
+
-
*
/
%

==
!=
>
<
>=
<=

+=
-=
*=
/=
%=

++
--

&
|
^
~
<<
>>
```

Também existe suporte ao operador ternário:

```text
condição ? valor1 : valor2
```

---

## 📦 Vetores

A DDGPW possui suporte à criação e manipulação de vetores.

Exemplo:

```text
inteiro notas[] = {9, 7, 8, 10, 6};

imprimir(notas[2]);

notas[0] = 10;
```

A linguagem também possui recursos para ordenação, inserção e consulta de vetores.

---

## 🧮 Funções Matemáticas

Entre os recursos disponíveis estão funções matemáticas como:

```text
raiz()
potencia()
piso()
teto()
absoluto()
aleatorio()
aleatorio_entre()
logaritmo()
log10()
log2()
seno()
cosseno()
tangente()
```

Também existem funções para trabalhar com números, como `truncar()` e `sinal()`.

---

## 🔤 Manipulação de Texto

A linguagem disponibiliza funções para trabalhar com strings:

```text
tamanho()
maiusculo()
minusculo()
fatiar()
substituir()
contem()
comeca_com()
termina_com()
aparar()
dividir_texto()
inverter_texto()
```

---

## 🧪 Verificação de Tipos

Também existem funções para identificar o tipo de determinado valor:

```text
tipo_de()
eh_numero()
eh_texto()
eh_booleano()
eh_nulo()
eh_vetor()
```

Exemplo:

```text
imprimir(tipo_de(42));
imprimir(tipo_de("Olá"));
imprimir(tipo_de(verdade));
```

---

## 🖥️ Interface da IDE

A interface é dividida em duas áreas principais:

```text
┌──────────────────────┬─────────────────────────┐
│                      │ Console                 │
│                      ├─────────────────────────┤
│      EDITOR          │ Tokens                  │
│                      ├─────────────────────────┤
│                      │ AST                     │
│                      ├─────────────────────────┤
│                      │ Referência              │
└──────────────────────┴─────────────────────────┘
```

A aplicação apresenta abas específicas para **Console, Tokens, AST e Referência**, facilitando o estudo do funcionamento interno da linguagem.

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* Python
* HTTP Server
* AST
* Lexer
* Parser
* Interpreter

O servidor local é implementado em Python utilizando `http.server` e `socketserver`, executando a aplicação na porta `3000` e abrindo a IDE automaticamente no navegador.

---

## 📂 Estrutura do Projeto

```text
📦 DDGPW
 ┣ 📄 index.html
 ┣ 📄 tokens.js
 ┣ 📄 lexer.js
 ┣ 📄 parser.js
 ┣ 📄 interpreter.js
 ┣ 📄 servidor.py
 ┗ 📄 README.md
```

### Principais arquivos

| Arquivo          | Função                             |
| ---------------- | ---------------------------------- |
| `index.html`     | Interface da IDE                   |
| `tokens.js`      | Palavras reservadas e operadores   |
| `lexer.js`       | Análise léxica                     |
| `parser.js`      | Análise sintática e geração da AST |
| `interpreter.js` | Execução dos programas             |
| `servidor.py`    | Servidor local da aplicação        |

---

## ▶️ Como Executar

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entre na pasta

```bash
cd DDGPW
```

### 3. Execute o servidor

```bash
python servidor.py
```

O servidor será iniciado na porta:

```text
http://localhost:3000
```

O próprio servidor abre o `index.html` no navegador.

---

## 💡 Exemplo

Um exemplo de código DDGPW:

```text
constante inteiro MAX = 100;

imprimir("Máximo =", MAX);

inteiro notas[] = {9, 7, 8, 10, 6};

imprimir("Nota =", notas[2]);

inteiro idade = 20;

se (idade >= 18) {
    imprimir("Maior de idade");
} senão {
    imprimir("Menor de idade");
}
```

A IDE processa esse código através do Lexer, Parser e Interpreter, apresentando o resultado no Console e permitindo visualizar os Tokens e a AST.

---

## 🎯 Objetivos do Projeto

Este projeto tem como principais objetivos:

* Estudar o funcionamento de linguagens de programação.
* Praticar JavaScript.
* Compreender análise léxica.
* Compreender análise sintática.
* Trabalhar com AST.
* Desenvolver um interpretador.
* Criar uma sintaxe própria.
* Desenvolver uma IDE simples para a linguagem.
* Explorar conceitos de compiladores e interpretadores.

---

## 📈 Possíveis Melhorias Futuras

* [ ] Sistema de arquivos para salvar códigos
* [ ] Autocomplete
* [ ] Syntax Highlighting mais avançado
* [ ] Numeração das linhas
* [ ] Mensagens de erro com linha e coluna
* [ ] Debugger
* [ ] Mais funções nativas
* [ ] Sistema de módulos
* [ ] Melhorias na análise sintática
* [ ] Documentação completa da linguagem
* [ ] Novos tipos de dados
* [ ] Mais recursos para vetores
* [ ] Sistema de projetos

---

## 🔗 Link do Projeto

🔗 **Link do Projeto:** [Adicione aqui o link do projeto]

---

## 👨‍💻 Autor

**David**

📧 **E-mail:** [davidcapulot2025@gmail.com](mailto:davidcapulot2025@gmail.com)
📱 **Telefone:** (21) 96520-1025

---

⭐ Se este projeto foi útil ou interessante para você, considere deixar uma estrela no repositório.

> 🧠 **DDGPW v3.0 — transformando código em uma linguagem própria.**
