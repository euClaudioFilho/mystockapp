
# StockApp - Sistema de Controle de Carteira de Ações e Fundos Imobiliários

Este é um sistema de controle de carteira de ações e fundos imobiliários desenvolvido em React Native (front-end) e Node.js (back-end), com o objetivo de facilitar o gerenciamento de ativos financeiros. O projeto permite que os usuários registrem compras, vendas e recebimentos de dividendos de ativos, além de oferecer funcionalidades para monitorar saldos, históricos de operações e rentabilidade.


## Funcionalidades

### Funcionalidades Principais

- **Autenticação segura com JWT**: Login e registro de usuários com armazenamento local de token para persistência de sessão.
- **Gestão de Ativos**:
  - Registro de compras e vendas de ações e fundos imobiliários.
  - Registro de dividendos recebidos com base nos ativos em carteira.
- **Monitoramento de Investimentos**:
  - Exibição do preço médio, cotação atual e quantidade dos ativos na carteira.
  - Histórico detalhado de operações realizadas.
  - Visualização de rentabilidade.
  - Dashboard contendo as principais movimentações do usuário.
- **Integração com APIs externas**:
  - Obtenção de cotações atualizadas para os ativos registrados.

## Tecnologias Utilizadas

### Front-End
![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)

### Back-End
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

## Instalação e Configuração

### Requisitos
- Node.js instalado no sistema.
- Expo CLI para rodar o projeto no ambiente mobile caso queira.
- Um emulador Android/iOS ou dispositivo físico com o Expo Go caso queira utilizar o ambiente android. É mais recomendado para usufruir da experiência completa das ferramentas e tecnologias utilizadas!

### Passos para Rodar o Projeto
#### Front-End
**Clone o projeto**
```bash
git clone https://github.com/euClaudioFilho/mystockapp
```

**Navegue até a pasta do front-end:**
```bash
cd carteiraAcoes
```

**Instale as dependências:**
```bash
npm install
```

**Inicie o projeto:**
```bash
npm run start
```
**ou** 
```bash
expo start
```
O aplicativo será iniciado no dispositivo físico, emulador, ou navegador dependendo de sua preferência!

#### Back-End

**Navegue até a pasta do back-end:**
```bash
cd carteiraAcoes/backend/api
```

**Instale as dependências:**
```bash
npm install
```

**Inicie o servidor:**
```bash
node server.js
```

O servidor será iniciado na porta 3000.

## Como Usar

1. **Cadastro/Login**: Faça o cadastro ou login no sistema.
2. **Gestão de Ativos**:
   - **Comprar Ativos**: Navegue até a tela de compra e insira os dados do ativo.
   - **Vender Ativos**: Selecione um ativo da sua carteira e insira a quantidade para venda.
3. **Registro de Dividendos**:
   - Registre os dividendos recebidos com base na quantidade de ativos que possui.
4. **Histórico**: Consulte o histórico detalhado das suas operações.
5. **Rentabilidade**: Acompanhe o desempenho da sua carteira.
6. **Dashboard**: Acompanhe as principais movimentações da sua carteira com informações sumarizadas e em gráficos.

## Contribuições

Este projeto está aberto a contribuições! Se você deseja colaborar, abra um pull request ou envie uma issue no repositório do GitHub.

## Licença

Este projeto é distribuído sob a licença MIT. Sinta-se à vontade para usá-lo e adaptá-lo conforme suas necessidades.

## Contato

Se tiver dúvidas ou sugestões, entre em contato:

- **Email**: claudiosrfilho@gmail.com
