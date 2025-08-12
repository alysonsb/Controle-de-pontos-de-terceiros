# Controle de Pontos de Terceiros PAB/PAE

Este é um sistema web para gerenciar e monitorar pontos de atendimento PAB/PAE (Postos de Atendimento Bancário / Postos de Atendimento Eletrônico) de terceiros. A aplicação permite o cadastro de novos pontos, a inclusão de técnicos integrados e o acompanhamento do status de documentos importantes como ASO e Ficha EPI, com alertas de vencimento.

A aplicação é construída com tecnologias web modernas e utiliza o Firebase para autenticação e armazenamento de dados em tempo real.

## Funcionalidades

* **Login e Autenticação:** Sistema seguro de login de usuário usando Firebase Auth.
* **Gestão de Pontos:** Cadastro, visualização, edição e exclusão de pontos de atendimento, com informações como agência, nome, endereço, e-mail de contato, etc.
* **Gestão de Técnicos:** Adicione múltiplos técnicos a cada ponto, com detalhes de CPF, RG, ASO (Atestado de Saúde Ocupacional) e Ficha EPI.
* **Monitoramento de Documentos:** Acompanhamento automático das datas de vencimento de ASO e Ficha EPI.
* **Notificações Visuais:** Um ícone de sino exibe um contador de avisos para documentos com vencimento próximo (30 dias) ou já vencidos, com a opção de exibir um pop-up com os detalhes.
* **Envio de E-mail:** Um botão de ação para gerar e-mails de liberação de acesso com dados dos técnicos já preenchidos.
* **Interface Responsiva:** O design da interface se adapta a diferentes tamanhos de tela (desktop e mobile), usando Tailwind CSS.
* **Busca Rápida:** Filtre pontos de atendimento por agência ou nome para facilitar a localização.

## Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript ES6+
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Backend como Serviço (BaaS):** [Firebase](https://firebase.google.com/)
    * **Firebase Authentication:** Para o sistema de login.
    * **Firestore:** Banco de dados em tempo real para armazenar os dados dos pontos e técnicos.
    * **Firebase Hosting:** Para hospedagem e publicação do site.

## Como Usar

### Pré-requisitos

1.  Ter uma conta no [Firebase](https://firebase.google.com/).
2.  Ter o [Node.js e o npm](https://nodejs.org/) instalados.
3.  Ter o [Firebase CLI](https://firebase.google.com/docs/cli) instalado globalmente.

### Configuração do Projeto

1.  **Clone o repositório:**
    ```sh
    git clone [https://github.com/alysonsb/Controle-de-pontos-de-terceiros.git](https://github.com/alysonsb/Controle-de-pontos-de-terceiros.git)
    cd Controle-de-pontos-de-terceiros
    ```

2.  **Configurar o Firebase:**
    * Crie um projeto no console do Firebase.
    * Adicione um aplicativo Web ao seu projeto e copie as configurações do Firebase (`firebaseConfig`).
    * Abra o arquivo `js/firebase-init.js` e substitua as configurações existentes pelas suas.

    ```javascript
    const firebaseConfig = {
      apiKey: "SEU_API_KEY",
      authDomain: "SEU_AUTH_DOMAIN",
      // ... outras configurações
    };
    ```

3.  **Inicializar o Firebase no projeto:**
    ```sh
    firebase init
    ```
    Siga as instruções, selecionando `Hosting` e vinculando ao seu projeto Firebase.

### Publicando (Deploy)

Para fazer o deploy das suas alterações, use o comando:
```sh
firebase deploy --only hosting
