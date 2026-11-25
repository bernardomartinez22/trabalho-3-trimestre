# Aprenda+

Site demonstrativo de apoio à alfabetização de jovens e adultos, desenvolvido com HTML, CSS e JavaScript.

## Funcionalidades

- Apresentação da proposta Aprenda+ e de como ela pode apoiar a aprendizagem.
- Cadastro com nome de usuário, senha, cidade de nascimento e telefone opcional.
- Login local por nome de usuário e senha.
- Quatro jogos de alfabetização em três níveis: completar sílabas, formar palavras, ligar letras a figuras e identificar sons.
- Pontuação local e ranking dos participantes que concluíram jogos.
- Resumo de cadastros por cidade de nascimento.

## Estrutura do projeto

```text
AprendaMais-GitHub/
├── index.html
├── cadastro.html
├── login.html
├── jogos.html
├── ranking.html
└── assets/
    ├── css/
    ├── images/
    └── js/
```

## Como abrir

Mantenha a estrutura de pastas e abra o projeto por um servidor local. Com Python instalado, entre na pasta do projeto e execute:

```bash
python -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador. O servidor local permite que as páginas compartilhem o armazenamento do navegador.

## Dados e limitações

Este protótipo guarda cadastros, sessões e pontuações no armazenamento local do navegador. Eles ficam apenas naquele navegador e dispositivo; não são enviados a um servidor nem compartilhados entre pessoas em dispositivos diferentes. A senha é armazenada localmente como hash PBKDF2 com salt, mas isso não substitui autenticação e armazenamento em um backend seguro.

O resumo por cidade conta os cadastros pela cidade de nascimento informada. Ele não mede alfabetização e não estima quantas pessoas analfabetas vivem em cada cidade. Os cartazes do projeto não estão incluídos porque são materiais separados do site.

## Equipe

Bernardo Martinez, Pietro Martins, Gustavo Patrese e Lenon Becker.
