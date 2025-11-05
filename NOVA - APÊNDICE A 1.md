## **APÊNDICE A – Procedimento para Implementação das Métricas DORA com CI/CD e Apache DevLake**

Este apêndice descreve, de forma detalhada, o procedimento adotado para o **projeto, configuração e execução do ambiente experimental** utilizado na validação prática da proposta apresentada neste trabalho.

Conforme mencionado no corpo principal do estudo, o ambiente foi planejado para **simular um cenário realista de uma equipe de desenvolvimento sem infraestrutura prévia de CI/CD**. Assim, foi criado um repositório privado no **GitHub**, contendo uma aplicação web simples, utilizada como base para a implementação dos pipelines de automação e para a integração com a plataforma **Apache DevLake**.

A automação das etapas de integração e entrega contínua foi realizada por meio do **GitHub Actions**, responsável por executar automaticamente as seguintes tarefas:

- Validação do código-fonte com ferramentas de análise estática;
    
- Execução de testes automatizados;
    
- Construção e publicação da imagem Docker no repositório do Docker Hub;
    
- Registro de eventos relevantes para posterior análise (commits, execuções e status dos jobs).
    

Esses eventos constituem as **principais fontes de dados para o cálculo das métricas DORA**, permitindo mensurar aspectos como eficiência, estabilidade e velocidade do ciclo de entrega.

Na sequência, foi instalado e configurado o **Apache DevLake**, atuando como plataforma de **coleta, processamento e análise dos dados** gerados pelo pipeline. O DevLake foi integrado ao repositório GitHub por meio de conectores e plugins específicos, responsáveis por extrair informações referentes a _pull requests_, _deployments_, execuções de _workflows_ e falhas em testes.

Toda a infraestrutura foi provisionada em ambiente local, utilizando **contêineres Docker** para facilitar a replicação do experimento. As métricas DORA foram visualizadas em **dashboards nativos do DevLake**, abrangendo os quatro indicadores principais:  
**(i)** frequência de deploys (_Deployment Frequency_),  
**(ii)** tempo de lead para mudanças (_Lead Time for Changes_),  
**(iii)** tempo médio de recuperação (_Mean Time to Recovery – MTTR_), e  
**(iv)** taxa de falha em mudanças (_Change Failure Rate_).

---

### **Pré-requisitos**

- Servidor **Oracle Linux 7** devidamente configurado;
    
- **Docker** instalado e em execução;
    
- **Node.js** e **npm** instalados;
    
- Conta ativa no **Docker Hub** ([guia de criação](https://docs.docker.com/docker-hub/));
    
- Conta ativa no **GitHub** ([guia de criação](https://docs.github.com/pt/get-started/start-your-journey/creating-an-account-on-github));
    
- Acesso autenticado por **chave SSH** à conta do GitHub ([instruções aqui](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account?platform=linux)).

---
### **Estruturação do Projeto e Preparação do repositório**

Para a construção do ambiente experimental, foi desenvolvida uma **aplicação web estática**, utilizando o **framework Express.js** em conjunto com o **Bootstrap**, com o objetivo de representar um cenário funcional simplificado de entrega de software.  
A aplicação serviu como base para os testes de automação e para a configuração da pipeline de CI/CD, permitindo a criação e publicação de uma **imagem Docker** destinada ao **Docker Hub**, a fim de possibilitar sua reutilização em execuções futuras.

#### **1. Criação do diretório de trabalho**

Inicialmente, foi criado o diretório destinado a armazenar os arquivos do projeto, conforme os comandos a seguir:

```bash
mkdir -p ~/cicd-lab
cd cicd-lab
```
#### **2. Inicialização do repositório Git**

Em seguida, foi criado o arquivo `README.md`, contendo as informações iniciais do projeto, e o repositório Git foi inicializado localmente.  
Abaixo estão os comandos executados:
```bash
vim README.md                    # Cria (ou adiciona) um README.md com esse título
git init                         # Inicializa um repositório Git local
git checkout -b main             # Cria a branch main e vai pra ela
git add README.md                # Adiciona o arquivo ao staging
git commit -m "First Commit"     # Faz o primeiro commit
```
#### **3. Criação e vinculação do repositório remoto**

Posteriormente, foi criado um repositório remoto no **GitHub**, seguindo o procedimento descrito na [documentação oficial](https://docs.github.com/pt/repositories/creating-and-managing-repositories/creating-a-new-repository).  
A conexão entre o repositório local e o remoto foi estabelecida com os seguintes comandos:
```bash
git remote add origin git@github.com:brncardoso/cicd-lab.git 
git push -u origin main
```
#### **4. Definição do fluxo de desenvolvimento**

Para o gerenciamento das versões e controle do ciclo de desenvolvimento, adotou-se o modelo de ramificação [Git Flow](https://medium.com/trainingcenter/utilizando-o-fluxo-git-flow-e63d5e0d5e04), amplamente utilizado em ambientes colaborativos.  
Com base nesse modelo, foi criada a branch `develop`, responsável por concentrar as alterações em desenvolvimento:
```bash
git checkout -b develop
```
#### **5. Configuração do arquivo `.gitignore`**

Por fim, foi criado o arquivo `.gitignore` para evitar o versionamento de diretórios e arquivos desnecessários, como dependências e artefatos temporários.  
O arquivo foi criado com o seguinte comando:

```bash
vi .gitignore
```

Em seguida, adicionou-se o conteúdo abaixo:

```
node_modules/
```

---
### **Instalando as dependências da aplicação**

No diretório raiz da aplicação, foi criado o arquivo `package.json`, responsável por armazenar as **informações descritivas e técnicas do projeto**, como nome, versão, autor, licença e dependências necessárias para a execução.

O arquivo foi criado com o comando:
```bash
vi package.json
```

Em seguida, adicionou-se o conteúdo abaixo:
```json
{
  "name": "nodejs-image-demo",
  "version": "1.0.0",
  "description": "nodejs image demo",
  "author": "Sammy the Shark <sammy@example.com>",
  "license": "MIT",
  "main": "app.js",
  "keywords": [
    "nodejs",
    "bootstrap",
    "express"
  ],
  "dependencies": {
    "express": "^4.16.4"
  }
}
```

Após a criação do arquivo, foram instaladas as dependências listadas com o comando:
```bash
npm install
```

Esse procedimento gerou automaticamente o diretório `node_modules/` e o arquivo `package-lock.json`, assegurando o controle de versões das bibliotecas utilizadas na aplicação.

---
### Criação dos arquivos da aplicação

A aplicação desenvolvida consiste em um **site estático implementado com Node.js e Express**, que apresenta aos usuários informações sobre tubarões.  
O projeto foi estruturado de forma modular, separando as responsabilidades de inicialização do servidor (`app.js`), definição das rotas (`server.js`) e renderização das páginas estáticas (`views`).

---
#### 1. Criação do arquivo `app.js`
O arquivo principal `app.js` é responsável por inicializar o servidor e importar as configurações definidas no módulo `server.js`.

Para criá-lo, foi utilizado o comando:

```bash
vi ~/cicd-lab/app.js
```

O conteúdo do arquivo é apresentado abaixo:
```javascript
const app = require ('./server')
app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})
```

---
#### 2. Criação do arquivo `server.js`

O arquivo `server.js` contém a lógica central da aplicação, incluindo a definição das rotas e o gerenciamento das requisições.

Ele foi criado com o comando:
```bash
vi ~/cicd-lab/server.js
```

Foram configuradas duas rotas principais:

- **`/`** — página inicial, que retorna o arquivo `index.html`;
    
- **`/sharks`** — página complementar, que exibe informações adicionais sobre tubarões.

O código implementado é o seguinte:
```javascript
var express = require("express");
var app = express();
var router = express.Router();

var path = __dirname + '/views/';
const PORT = 8080;
const HOST = '0.0.0.0';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/sharks",function(req,res){
  res.sendFile(path + "sharks.html");
});

app.use(express.static(path));
app.use("/", router);

module.exports = app
```

Assim, o `server.js` é responsável por **gerenciar as rotas, servir os arquivos estáticos e registrar as requisições**, enquanto o `app.js` apenas executa a aplicação, mantendo o projeto simples e modular.

---
#### **3. Criação do Conteúdo Estático**

Com a estrutura base pronta, foram criados os arquivos que compõem a interface visual da aplicação. Primeiramente, criou-se o diretório `views`, destinado a armazenar as páginas HTML e os recursos visuais do site. Dentro dela, foi adicionado o arquivo `index.html`, que representa a página inicial da aplicação.
```bash
mkdir views
```

Dentro dela, com o seguinte comando, foi adicionado o arquivo `index.html`, que representa a página inicial da aplicação.
```bash
vi views/index.html
```

Em seguida, foi adicionado o seguinte conteúdo:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <title>About Sharks</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link href="css/styles.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Merriweather:400,700" rel="stylesheet" type="text/css">
</head>

<body>
    <nav class="navbar navbar-dark navbar-static-top navbar-expand-md">
        <div class="container">
            <button type="button" class="navbar-toggler collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"> <span class="sr-only">Toggle navigation</span>
            </button> <a class="navbar-brand" href="#">Everything Sharks</a>
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav mr-auto">
                    <li class="active nav-item"><a href="/" class="nav-link">Home</a>
                    </li>
                    <li class="nav-item"><a href="/sharks" class="nav-link">Sharks</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <div class="jumbotron">
        <div class="container">
            <h1>Want to Learn About Sharks?</h1>
            <p>Are you ready to learn about sharks?</p>
            <br>
            <p><a class="btn btn-primary btn-lg" href="/sharks" role="button">Get Shark Info</a>
            </p>
        </div>
    </div>
    <div class="container">
        <div class="row">
            <div class="col-lg-6">
                <h3>Not all sharks are alike</h3>
                <p>Though some are dangerous, sharks generally do not attack humans. Out of the 500 species known to researchers, only 30 have been known to attack humans.
                </p>
            </div>
            <div class="col-lg-6">
                <h3>Sharks are ancient</h3>
                <p>There is evidence to suggest that sharks lived up to 400 million years ago.
                </p>
            </div>
        </div>
    </div>
</body>

</html>
```

A página inicial foi construída utilizando o **framework Bootstrap**, garantindo responsividade e um layout limpo.

Em seguida, foi criada a página complementar `sharks.html`, que fornece informações adicionais sobre tubarões:

```bash
#Comando para criar o arquivo sharks.html
touch  views/sharks.html
```

Em seguida, foi adicionado o seguinte conteúdo:
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <title>About Sharks</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    <link href="css/styles.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Merriweather:400,700" rel="stylesheet" type="text/css">
</head>
<nav class="navbar navbar-dark navbar-static-top navbar-expand-md">
    <div class="container">
        <button type="button" class="navbar-toggler collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false"> <span class="sr-only">Toggle navigation</span>
        </button> <a class="navbar-brand" href="/">Everything Sharks</a>
        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul class="nav navbar-nav mr-auto">
                <li class="nav-item"><a href="/" class="nav-link">Home</a>
                </li>
                <li class="active nav-item"><a href="/sharks" class="nav-link">Sharks</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
<div class="jumbotron text-center">
    <h1>Shark Info</h1>
</div>
<div class="container">
    <div class="row">
        <div class="col-lg-6">
            <p>
                <div class="caption">Some sharks are known to be dangerous to humans, though many more are not. The sawshark, for example, is not considered a threat to humans.
                </div>
                <img src="https://assets.digitalocean.com/articles/docker_node_image/sawshark.jpg" alt="Sawshark">
            </p>
        </div>
        <div class="col-lg-6">
            <p>
                <div class="caption">Other sharks are known to be friendly and welcoming!</div>
                <img src="https://assets.digitalocean.com/articles/docker_node_image/sammy.png" alt="Sammy the Shark">
            </p>
        </div>
    </div>
</div>

</html>
```

---

#### 4. Criação da Folha de Estilo

or fim, foi criada a folha de estilos CSS, responsável pela formatação visual do site.  
Para isso, adicionou-se o diretório `views/css` e o arquivo `styles.css`:

```bash
#Comando para criar o diretorio e arquivo css
mkdir views/css
touch views/css/styles.css
```

Em seguida foi adicionado o seguinte conteudo:
```css
.navbar {
    margin-bottom: 0;
    background: #000000;
}

body {
    background: #000000;
    color: #ffffff;
    font-family: 'Merriweather', sans-serif;
}

h1,
h2 {
    font-weight: bold;
}

p {
    font-size: 16px;
    color: #ffffff;
}

.jumbotron {
    background: #0048CD;
    color: white;
    text-align: center;
}

.jumbotron p {
    color: white;
    font-size: 26px;
}

.btn-primary {
    color: #fff;
    text-color: #000000;
    border-color: white;
    margin-bottom: 5px;
}

img,
video,
audio {
    margin-top: 20px;
    max-width: 80%;
}

div.caption: {
    float: left;
    clear: both;
}
```
---
#### 5. Execução e Versionamento

Com todos os arquivos criados e as dependências instaladas, a aplicação pôde ser executada a partir do diretório raiz:
```bash
cd ~/cicd-lab 
node app.js #Comando para iniciar a aplicacao
```

Após a inicialização, o site tornou-se acessível via navegador no endereço:
```
http://ip_do_servidor:8080
``` 

Com o funcionamento validado, todos os arquivos foram versionados e enviados para o repositório GitHub, na branch `develop`:
```bash
git add .
git status
git commit -am "Enviando arquivos da aplicacao"
git push -u origin develop
```
---
### Criação do Dockerfile e Construção da Imagem Docker

#### 1. Criação do Dockerfile

Para executar a aplicação em um ambiente **isolado e portátil**, foi criado um **Dockerfile** no diretório raiz do projeto.  
Esse arquivo define as etapas necessárias para construir a **imagem Docker** da aplicação Node.js, garantindo que todas as dependências sejam instaladas de forma padronizada e reproduzível.

O arquivo foi criado com o comando:
```bash
#Comando para criar o Dockerfile
vi Dockerfile
```

Em seguida, adicionou-se o seguinte conteúdo:
```Dockerfile
# Etapa de build usando Node 16-slim
FROM node:16-slim as BUILDER 
LABEL maintainer="Bruno"

WORKDIR /home/node/app

# Instala dependências da aplicacao
COPY package*.json ./
RUN npm install

COPY . ./

# Etapa final usando Node 10-alpine
FROM node:10-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

COPY --from=BUILDER /home/node/app/ ./

WORKDIR /home/node/app

USER node

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "node", "app.js" ]
```

Esse **Dockerfile** foi estruturado em duas etapas (multistage build):

1. **Etapa de build** — responsável por instalar dependências e preparar a aplicação;
    
2. **Etapa final** — cria uma imagem leve e segura, reduzindo o tamanho e as vulnerabilidades do container.
Antes de construir a imagem, foi criado o arquivo `.dockerignore` para especificar quais arquivos e diretórios não devem ser copiados para o container, evitando incluir arquivos desnecessários como `node_modules` ou logs de depuração.
---
#### 2. Criação do arquivo `.dockerignore`

Antes da construção da imagem, foi criado o arquivo `.dockerignore`, que especifica quais arquivos e diretórios devem ser ignorados durante o processo de build.  
Essa prática evita que arquivos desnecessários, como módulos de dependências ou logs de depuração, sejam copiados para o container, otimizando o tamanho e o desempenho da imagem.

O arquivo foi criado com o comando:
```bash
#Comando para criar o arquivo .dockerignore
vi ~/cicd/.dockerignore
```

O conteúdo definido foi o seguinte:
```
node_modules
npm-debug.log
Dockerfile
.dockerignore
```
---
#### 3. Construção e Validação da Imagem Docker

Com o `Dockerfile` e o `.dockerignore` configurados, a imagem da aplicação foi construída com o comando:
```bash
#Comando para construir a imagem
docker build -t <usuario-dockerhub>/sharks .
```

Nesse comando:

- `-t nobrn/sharks` define o nome e a tag da imagem;
    
- o ponto final (`.`) indica que o contexto de build é o diretório atual.
    

Após a construção, a execução local da imagem foi validada por meio da criação de um container:
```bash
docker run --name nodejs-demo -p 8080:8080 -d <usuario-dockerhub>/sharks
```

Esse comando cria e executa um container denominado **nodejs-demo**, mapeando a porta **8080** do container para a porta **8080** do host, permitindo acessar a aplicação via navegador.
___
#### 4. Publicação da Imagem no Docker Hub

Com o funcionamento validado, a imagem foi publicada no **Docker Hub**, possibilitando seu uso em pipelines automatizadas e em diferentes ambientes.

Primeiro, realizou-se o login na conta do Docker Hub:
```bash
docker login -u usuário_dockerhub -p senha_usuário_dockerhub
```

Após a autenticação bem-sucedida, a imagem foi enviada para o repositório remoto:
```bash
docker push <usuario-dockerhub>/sharks
```

Com isso, a aplicação passou a estar **disponível como imagem pública ou privada** (dependendo da configuração da conta), podendo ser utilizada em ambientes de integração e entrega contínua.

Por fim, todos os arquivos criados, incluindo o `Dockerfile` e o `.dockerignore` foram versionados e enviados para o repositório GitHub na branch `develop`, garantindo rastreabilidade e integração com o pipeline CI/CD criado nas etapas seguintes.

```bash
git add .
git status
git commit -am "app executando em container Docker"
git push -u origin develop
```
---
### 3. Implementação e Execução de Testes Automatizados

Com a aplicação devidamente estruturada e containerizada, a etapa seguinte consistiu na **implementação de testes automatizados** para validar o comportamento das rotas e o conteúdo retornado pelo servidor.  
O objetivo foi garantir que a aplicação permanecesse funcional a cada alteração de código, assegurando confiabilidade e qualidade contínua — princípios essenciais para ambientes DevOps.

Para isso, foram utilizadas as bibliotecas:

- **Jest** — framework de testes em JavaScript amplamente utilizado pela comunidade Node.js;
    
- **Supertest** — biblioteca que permite testar endpoints HTTP de aplicações Express de forma simples e direta.
___
#### 1. Instalação das Dependências de Teste

As dependências foram adicionadas como **dependências de desenvolvimento** (devDependencies), pois são utilizadas apenas durante a execução dos testes:
```bash
npm install jest -D
npm install supertest -D
```
___
#### 2. Criação do Arquivo de Testes

Em seguida, foi criado o arquivo `app.spec.js` no diretório raiz do projeto.  
A extensão `.spec.js` segue a convenção do Jest para identificar arquivos de teste automaticamente.

O arquivo foi criado com o comando:

```bash
vi app.spec.js
```

O conteúdo implementado foi o seguinte:
```javascript
const request = require('supertest')
const app = require('./server')

describe('Test my app server', () => {
  it('Deve retornar minha rota pricipal', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200);
  });

  it('Deve retornar status 200 para a rota /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('Deve retornar status 200 para a rota /sharks', async () => {
    const response = await request(app).get('/sharks');
    expect(response.status).toBe(200);
  });

  it('Deve retornar o conteúdo correto para a rota /', async () => {
    const response = await request(app).get('/');
    expect(response.text).toContain('<title>About Sharks</title>'); // Verifique se o conteúdo da resposta contém 'index.html'
  });

  it('Deve retornar o conteúdo correto para a rota /sharks', async () => {
    const response = await request(app).get('/sharks');
    expect(response.text).toContain('<h1>Shark Info</h1>'); // Verifique se o conteúdo da resposta contém 'sharks.html'
  });
});
```

O arquivo testa o status HTTP de cada rota e valida o conteúdo HTML retornado.  
Caso algum endpoint deixe de responder corretamente, o Jest sinaliza a falha automaticamente durante a execução da pipeline.
___
#### 3. Configuração do Jest

Após criar os testes, o Jest foi configurado para gerar o arquivo de configuração padrão (`jest.config.js`).  
Esse arquivo permite ajustar parâmetros como ambiente de execução, formato de relatórios e padrões de nome para os arquivos de teste.

A configuração inicial foi feita com o comando:

```bash
#Comando para configurar Jest
npx jest --init
```

Durante o processo interativo, o Jest solicita algumas informações, como:

- Ambiente de execução (Node.js);
    
- Inclusão de cobertura de código;
    
- Padrão de reconhecimento de testes (`.spec.js` ou `.test.js`).
___
#### 4. Ajuste no `package.json`

Para facilitar a execução dos testes, o script `"test"` foi adicionado à seção `"scripts"` do arquivo `package.json`.  
O arquivo atualizado ficou da seguinte forma:
```javascript
{
  "name": "nodejs-image-demo",
  "version": "1.0.0",
  "description": "nodejs image demo",
  "author": "Sammy the Shark <sammy@example.com>",
  "license": "MIT",
  "main": "app.js",
  "keywords": [
    "nodejs",
    "bootstrap",
    "express"
  ],
  "dependencies": {
    "express": "^4.16.4"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "scripts": {
    "start": "node app.js",
    "test": "jest "
  }
}
```
Esse ajuste permite que os testes sejam executados diretamente com o comando `npm run test`, facilitando sua integração em pipelines de CI/CD.
___
#### 5. Execução dos Testes

Com todas as configurações concluídas, os testes foram executados para validar o funcionamento da aplicação:
```bash
#Comando para executar os testes
npm run test
```

A execução retornou o status de sucesso (`PASS`) para todos os casos, indicando que:

- As rotas principais (`/` e `/sharks`) responderam corretamente;
    
- O conteúdo HTML esperado foi entregue conforme definido nas páginas estáticas.
___
#### 6. Versionamento dos Arquivos de Teste

Após a validação, todos os arquivos criados e modificados foram versionados e enviados para o repositório remoto, mantendo a rastreabilidade das mudanças:
```bash
git add .
git status
git commit -am "add testes unitarios"
git push -u origin develop
```

---
### **4. Configuração do Pipeline CI/CD com GitHub Actions**

O próximo passo foi **automatizar o fluxo de desenvolvimento e deploy** da aplicação utilizando CI/CD. Para isso, foram configurados pipelines com **GitHub Actions**, permitindo que testes automatizados fossem executados e novas imagens Docker fossem criadas e publicadas automaticamente a cada alteração no repositório.

O GitHub Actions integra-se diretamente ao **Docker Hub**, possibilitando que alterações no código acionem a criação de novas imagens e seu envio para o registro, garantindo que a versão mais recente da aplicação esteja sempre disponível para testes e produção.
___
#### 1. Configuração de Credenciais

Para habilitar essa automação, é necessário:

1. Gerar um **Personal Access Token (PAT)** na conta do Docker Hub, com permissões de **leitura e escrita** (Read/Write).
    
2. Armazenar o PAT e o nome de usuário do Docker Hub como **segredos (secrets)** no repositório do GitHub, por exemplo: `DOCKER_HUB_USERNAME` e `DOCKER_HUB_ACCESS_TOKEN`. Isso garante que credenciais não fiquem expostas no código.
___
#### 2. Estrutura de diretórios para os workflows

Para isolar o desenvolvimento da automação, foi criada a branch `feature/github-actions`:
```bash
git checkout -b feature/github-actions
```

Em seguida, criou-se o diretório destinado aos workflows do GitHub Actions:
```bash
mkdir -p .github/workflows
```

Dentro desse diretório, foram adicionados dois arquivos principais de workflow:
- `test.yml`: responsável pela execução dos testes automatizados em cada push ou pull request.
- `deployment.yml`: responsável pelo build da imagem Docker e deploy automático, condicionando o deploy a branches específicas (`develop` para teste e `main` para produção).
____
#### 3. Workflow de Testes Automatizados

O workflow de testes garante que a aplicação funcione corretamente antes de qualquer deploy. Ele instala o Node.js, instala dependências e executa os testes automatizados.

```yml
name: Testes de integracao continua

on:
  push:
  pull_request:

jobs:
  test-ci:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x]
        
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm run test
```
___
#### 4. Workflow de Deploy Contínuo

O workflow de CI/CD realiza deploy seguro da aplicação. Ele segue a lógica:

- `test-ci`: executa testes automatizados;
- `deploy-test`: cria e envia imagem Docker quando há alterações na branch `develop`;
- `deploy-production`: cria e envia imagem Docker quando há alterações na branch `main`.

O recurso **concurrency** evita que múltiplos deploys ocorram simultaneamente, prevenindo sobrescritas indevidas da imagem.
```yaml
name: Deploy

on:
  workflow_dispatch:
  push:
    branches: [main, develop]

jobs:
  test-ci:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x]
        
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm run test
  deploy-test:
    needs: test-ci
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    concurrency: deploy-to-test
    environment: test
    steps:
      - uses: actions/checkout@v2
      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ secrets.DOCKER_HUB_USERNAME }}/sharks:test
  
  deploy-production:
    needs: test-ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    concurrency: deploy-to-production
    environment: production
    steps:
      - uses: actions/checkout@v2
      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ secrets.DOCKER_HUB_USERNAME }}/sharks:latest
```
___
#### 5. Versionamento dos Workflows

Após a criação dos arquivos, todos os arquivos foram adicionados ao Git e enviados para o repositório remoto na branch `feature/github-actions`:

```bash
git add .
git status
git commit -am "add workflows"
git push -u origin feature/github-actions
```

Essa etapa garantiu que as configurações do **GitHub Actions** ficassem devidamente registradas no controle de versão, permitindo a colaboração entre desenvolvedores e o acompanhamento das alterações no pipeline de **CI/CD**.

Nesse momento, no GitHub, foi feito o pull request e merge da feature/github-actions para a develop
___
#### 6. Validação e execução do pipeline no GitHub

1. Criou-se uma nova versão da aplicação à partir da branch develop:

```bash
##
git checkout develop
git fetch origin

# Cria uma nova versao
git checkout -b release/v1.0.1
vim package.json
vi CHANGELOG.md
npm install
git add .
git status
git commit -am "bump version"
git push -u origin release/v1.0.1
```

2. Foi realizado **pull request e merge** da branch `release/v1.0.1` para `main` e `develop`.
3. O GitHub Actions identificou automaticamente os workflows e iniciou a execução.
4. A validação foi feita acessando a aba **Actions** no repositório GitHub, verificando:
    - Status das execuções (em andamento, concluídas ou falhas);
    - Logs de cada etapa do workflow (instalação, testes, build e push da imagem);
    - Presença da nova imagem no Docker Hub, confirmando o deploy completo.

Com isso, o fluxo de CI/CD foi validado de ponta a ponta, garantindo que cada alteração de código acionasse testes automatizados e deploy seguro em ambientes de teste e produção.


---

### 5. Integração com Apache DevLake

Com a aplicação rodando em containers e o pipeline de CI/CD funcionando corretamente, o próximo passo foi integrar o projeto ao **Apache DevLake**, uma plataforma de **análise de métricas de software** e **engenharia de dados**, que permite extrair insights sobre produtividade, qualidade de código e ciclos de desenvolvimento.

A integração permite monitorar **commits, pull requests, issues e deployments**, possibilitando análises detalhadas sobre o desempenho da equipe e o ciclo de vida da aplicação.
___
#### 1. Instalação do Apache DevLake

O DevLake pode ser instalado localmente utilizando Docker Compose disponibilizado no site do DevLake. Foi necessário adicionar  a seguinte entrada ` --sql-mode="STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION"`: no campo `commands` do serviço mysql

```yaml
version: "3"
services:
  mysql:
    image: mysql:8
    volumes:
      - mysql-storage:/var/lib/mysql
    restart: always
    ports:
      - 3306:3306
    environment:
      MYSQL_ROOT_PASSWORD: admin
      MYSQL_DATABASE: lake
      MYSQL_USER: merico
      MYSQL_PASSWORD: merico
      TZ: UTC
    command: --character-set-server=utf8mb4
      --collation-server=utf8mb4_bin
      --skip-log-bin
      --sql-mode="STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION"

  grafana:
    image: devlake.docker.scarf.sh/apache/devlake-dashboard:v1.0.0   
    ports:
      - 3002:3000
    volumes:
      - grafana-storage:/var/lib/grafana
    environment:
      GF_SERVER_ROOT_URL: "http://localhost:4000/grafana"
      GF_USERS_DEFAULT_THEME: "light"
      MYSQL_URL: mysql:3306
      MYSQL_DATABASE: lake
      MYSQL_USER: merico
      MYSQL_PASSWORD: merico
      TZ: UTC
    restart: always
    depends_on:
      - mysql

  devlake:
    image: devlake.docker.scarf.sh/apache/devlake:v1.0.0   
    ports:
      - 8080:8080
    restart: always
    volumes:
      - devlake-log:/app/logs
    env_file:
      - ./.env
    environment:
      LOGGING_DIR: /app/logs
      TZ: UTC
    depends_on:
      - mysql

  config-ui:
    image: devlake.docker.scarf.sh/apache/devlake-config-ui:v1.0.0   
    ports:
      - 4000:4000
    env_file:
      - ./.env
    environment:
      DEVLAKE_ENDPOINT: devlake:8080
      GRAFANA_ENDPOINT: grafana:3000
      TZ: UTC
      #ADMIN_USER: devlake
      #ADMIN_PASS: merico
    depends_on:
      - devlake

volumes:
  mysql-storage:
  grafana-storage:
  devlake-log:
```

Em seguida, o DevLake foi iniciado com o comando:
```bash
docker-compose -f docker-compose.devlake.yml up -d
```

Isso inicia o DevLake, disponibilizando a interface web em `http://<ip_servidor>:4000` .

#### 2. Configuração da Conexão e Projeto no Devlake

Para coletar dados do repositório, foi necessário configurar um **conector GitHub** no DevLake:

1. Acesse a interface web do DevLake em `http://localhost:4000`.
2. Clique em **Connections** → **GitHub** → **Add Connection**. 
3. Insira as credenciais do GitHub (token pessoal com permissões de leitura) e selecione o repositório do projeto.

Em seguida, foi criado um novo projeto na seção \textit{Projects}, utilizando a opção \textit{Create New Project}, onde foi atribuído o nome \texttt{LAB} ao projeto. A Figura~\ref{fig:project_settings} apresenta a tela de configuração do projeto.
#### 4. Associação de Escopo, Coleta e Visualização dos Dados

Com a conexão e o projeto configurados, o próximo passo foi definir o escopo de dados a ser coletado. Na seção do projeto, foi utilizada a opção \textit{Add a Connection} para vincular a conexão previamente criada. Em seguida, o escopo desejado foi selecionado e salvo.

Após a configuração do escopo, a coleta de dados foi iniciada por meio da opção \textit{Collect Data}. Esse processo acionou um pipeline interno que extraiu e processou as informações do repositório, tornando-as disponíveis para análise. Os dados coletados puderam ser visualizados no menu \textit{Advanced}, que fornece uma visão detalhada das tabelas e registros extraídos.

#### 5. Dashboards com Métricas DORA

Para a análise visual das métricas, foi utilizado o dashboard do Grafana integrado ao DevLake. O painel específico das métricas DORA apresentou visualizações consolidadas de indicadores como \textit{lead time}, \textit{deployment frequency}, \textit{change failure rate} e \textit{mean time to recovery}, facilitando a compreensão do desempenho da equipe de desenvolvimento. 
#### 5. Versionamento da Configuração

Para manter rastreabilidade e replicabilidade, todos os arquivos de configuração do DevLake (`docker-compose.devlake.yml`, scripts de coleta e documentação) foram versionados no Git:

```bash
git add . 
git commit -am "add DevLake" 
git push -u origin develop
```
### Considerações Finais

A implementação do pipeline CI/CD com GitHub Actions e a integração com o Apache DevLake permitiram automatizar a construção, teste e deploy da aplicação, além de coletar e analisar métricas DORA de forma contínua. Os workflows configurados garantem que apenas código validado e testado seja publicado em ambientes de teste e produção, promovendo maior confiabilidade no processo de desenvolvimento.

A integração com o DevLake demonstrou-se funcional, permitindo extrair dados do GitHub e gerar dashboards interativos no Grafana. As métricas coletadas, mesmo em ambiente de teste, evidenciam a capacidade da ferramenta de consolidar indicadores essenciais de performance e confiabilidade da equipe de desenvolvimento.

___

### **Historico de comandos

```bash
[root@localhost cicd-lab]# history
    1  yum install texlive-*
    2  latex --version
    3  ll
    4  mkdir -p ~/cicd-lab
    5  ll
    6  cd cicd-lab/
    7  ssh -T git@github.com
    8  ls -lah
    9  cd ..
   10  ls -lah
   11  cd .ssh/
   12  ll
   13  cp /vagrant/provision/ssh_keys/id_ed25519 ~/.ssh/ && chmod 600 ~/.ssh/id_ed25519
   14  ssh -T git@github.com
   15  poweroff
   16  mkdir -p ~/cicd-lab
   17  cd cicd-lab
   18  vim README.md
   19  git init
   20  git checkout -b main
   21  git add README.md
   22  git commit -m "First Commit"
   23  git checkout -b develop
   24  git remote add origin git@github.com:brncardoso/cicd-lab.git
   25  git push -u origin main
   26  ll
   27  vim package.json
   28  vim app.js
   29  vim server.js
   30  mkdir views
   31  vim views/index.html
   32  vim views/sharks.html
   33  mkdir views/css
   34  vim views/css/styles.css
   35  ll
   36  node app.js
   37  npm
   38  yum install nodejs npm
   39  npm install
   40  node app.js
   41  ip a
   42  node app.js
   43  systemctl status firewalld
   44  vim views/css/styles.css
   45  node app.js
   46  git add .
   47  git status
   48  vim .gitignore
   49  git reset
   50  git status
   51  git rm -r --cached .
   52  ll
   53  git add .
   54  git status
   55  git reset
   56  git status
   57  ll
   58  git add .
   59  git status
   60  vim README.md
   61  git status
   62  git add .
   63  git status
   64  git commit -am "Enviando arquivos da aplicacao"
   65  git push -u origin develop
   66  vim Dockerfile
   67  vim .dockerignore
   68  docker build -t nobrn/sharks .
   69  yum install container-selinux.noarch -y
   70  rpm -ivh /vagrant/provision/opt/containerd.io-*.rpm /vagrant/provision/opt/docker-ce-cli*.rpm /vagrant/provision/opt/docker-ce-*.rpm
   71* systemctlsta tus docker
   72  systemctl start docker
   73  docker build -t nobrn/sharks .
   74  docker run --name nodejs-demo -p 8080:8080 -d nobrn/sharks
   75  vim docker-compose.yml
   76  docker ps -a
   77  vim docker-compose.yml
   78  docker stop 808
   79  docker-compose up -d
   80  docker login -u nobrn -p
   81  docker login -u nobrn
   82  docker push nobrn/sharks
   83  git add .
   84  git status
   85  git commit -am "app executando em container Docker"
   86  git push -u origin develop
   87  npm install jest -D
   88  npm install supertest -D
   89  vi app.spec.js
   90  npx jest --init
   91  npx create-jest
   92  vim package.json
   93  npm run test
   94  vim package.json
   95  npm run test
   96  ll
   97  vim package.json
   98  git add .
   99  git status
  100  git commit -am "add testes unitarios"
  101  git push -u origin develop
  102  git checkout -b feature/github-actions
  103  mkdir -p .github/workflows
  104  vim .github/workflows/test.yml
  105  vim .github/workflows/deployment.yml`
  106  vim .github/workflows/deployment.yml
  107  ll .github/workflows/
  108  git add .
  109  git status
  110  git commit -am "add workflows"
  111  git push -u origin feature/github-actions
  112  git checkout -b develop
  113  git checkout develop
  114  git status
  115  ll
  116  git branch
  117  git fetch --all
  118  git branch
  119  ll
  120  git pull
  121  ll
  122  git pull origin develop
  123  ll
  124  git checkout develop
  125  git fetch origin
  126  git pull origin develop
  127  ls -lah
  128  ll
  129  vim package.json
  130  git add .
  131  git status
  132  git commit -am "ajuste testes unitarios"
  133  git pull origin develop
  134  git status
  135  git push -u origin develop
  136  vim package.json
  137  git add .
  138  git commit -am "ajuste testes unitarios 1"
  139  git push -u origin develop
  140  node -v
  141*
  142  vim jest.config.js
  143  git add .
  144  git status
  145  git commit -am "ajuste testes unitarios 2"
  146  git push -u origin develop
  147  ll
  148  vim jest.config.js
  149  vim package.json
  150  git add .
  151  git commit -am "ajuste testes unitarios 2"
  152  git push -u origin develop
  153* cat package.json a
  154  vim package.json
  155  git add .
  156  git commit -am "ajuste testes unitarios 3"
  157  git push -u origin develop
  158  ll
  159  rm package-lock.json
  160  npm install
  161  ll
  162  git commit -am "ajuste testes unitarios 4"
  163  git add .
  164  git commit -am "ajuste testes unitarios 4"
  165  git push -u origin develop
  166  vim package.json
  167  git checkout -b release/v1.0.1
  168  vim package.json
  169  vi CHANGELOG.md
  170  npm install
  171  git add .
  172  git status
  173  git commit -am "bump version"
  174  git push -u origin release/v1.0.1
  175  cat CHANGELOG.md
  176  history
[root@localhost cicd-lab]#
```