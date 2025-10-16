
---

APÊNDICE A – Procedimento de Implementação das Métricas DORA com CI/CD e Apache DevLake

Este apêndice descreve o procedimento utilizado para configuração de um pipeline CI/CD utilizando GitHub Actions, e a extração das métricas DORA com a ferramenta Apache DevLake. Todos os passos foram executados em um ambiente Linux.

---

### **1. Estruturação Inicial do Projeto**

1.1 Criar diretório de trabalho:

`mkdir -p /app/cicd-lab cd /app/cicd-lab`

1.2 Criar e editar o arquivo `README.md`:

`vim README.md`

1.3 Inicializar repositório Git:

`git init git checkout -b main git add README.md git commit -am "First Commit"`

1.4 Adotar o fluxo Git Flow com criação do branch `develop`:

`git checkout -b develop`

1.5 Criar repositório remoto no GitHub e conectar:

`git remote add origin git@github.com:brncardoso/cicd-lab.git git push -u origin main`

---

### **2. Inicialização do Projeto Node.js**

2.1 Instalar Node.js:

`curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash - yum install nodejs npm -y`

2.2 Inicializar projeto Node.js:

`cd /app/cicd-lab npm init -y`

2.3 Copiar arquivos-fonte para o diretório:

`cp -r /vagrant/tmp/cicd-lab/* .`

2.4 Instalar dependências do projeto e iniciar a aplicação:

`npm install node app.js`

---

### **3. Escrita e Execução de Testes Automatizados**

3.1 Instalar dependências de testes:

`npm install jest -D npm install supertest -D`

3.2 Adicionar arquivos de teste e configuração:

`cp /vagrant/tmp/cicd-lab/app.spec.js . cp /vagrant/tmp/cicd-lab/jest.config.js .`

3.3 Executar testes:

`npm run test`

---

### **4. Configuração de CI/CD com GitHub Actions**

4.1 Criar estrutura de workflows:

`mkdir -p .github/workflows`

4.2 Adicionar arquivos de pipeline:

`cp /vagrant/tmp/cicd-lab/.github/workflows/test.yml . cp /vagrant/tmp/cicd-lab/.github/workflows/deployment.yml .`

> Os arquivos `test.yml` e `deployment.yml` definem os jobs de teste e deploy contínuo da aplicação Node.js a cada novo push para o repositório.

---

### **5. Coleta das Métricas DORA com Apache DevLake**

5.1 Clonar o repositório do Apache DevLake:

`git clone https://github.com/apache/incubator-devlake.git cd incubator-devlake`

5.2 Subir os serviços do DevLake via Docker Compose:

`docker-compose -f docker-compose.dev.yml up -d`

5.3 Acessar a interface web:

- URL: [http://localhost:4000](http://localhost:4000)
    

5.4 Configurar as integrações:

- Conectar com as fontes de dados utilizadas no projeto (ex.: GitHub)
    
- Criar uma pipeline de coleta de dados
    

5.5 Visualizar as **Métricas DORA** extraídas:

- **Lead Time for Changes** (tempo médio entre commit e deploy)
    
- **Deployment Frequency** (frequência de deploys)
    
- **Change Failure Rate** (percentual de falhas em produção)
    
- **Mean Time to Recovery** (tempo médio para recuperação)
    

---

### **Considerações Finais**

O procedimento descrito neste apêndice viabilizou a automação completa de testes e deploy com GitHub Actions, bem como a coleta precisa das métricas DORA utilizando o Apache DevLake. Essa integração permitiu avaliar a performance do processo de entrega contínua no projeto proposto, conforme os objetivos do trabalho.


# Comandos:

```bash
9  mkdir -p /app/cicd-lab
   10  >README.md
   11  vim README.md
   12  ll ~/.ssh/
   13  ssh -T git@github.com
   14  ##AQUI COMECA O PROCEDIMENTO
   15  cd /app/cicd-lab/
   16  ll
   17  cp ~/README.md .
   18  ll
   19  git init
   20  git -s
   21  git status
   22  git checkout -b main
   23  git add README.md
   24  git s
   25  git show
   26  git commit -am "First Commit"
   27  #AGORA CRIAREI OS BRANCHS DEVELOP (GITFLOW)
   28  git checkout -b develop
   29  #Criei o repositorio no github e irei subir os arquivos
   30  git branch -M main
   31  git remote add origin git@github.com:brncardoso/cicd-lab.git
   32  git push -u origin main
   33  #nesse momento, comeco o projeto node.js
   34  #tudo sera feito no branch develop.
   35  git checkout -b develop
   36  git status
   37  ls
   38  git branch
   39  cd
   40  curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash - yum install nodejs npm -y
   41  yum install nodejs npm
   42  openssl version
   43  cd /app/cicd-lab/
   44  ll
   45  npm init
   46  ll
   47  rm package.json -f
   48  cp /vagrant/tmp/cicd-lab/* .
   49  cp -r /vagrant/tmp/cicd-lab/* .
   50  ll
   51  pwd
   52  rm * -rf
   53  cp -r /vagrant/tmp/cicd-lab/* .
   54  ll
   55  #inicia a aplicacao
   56  node app.js
   57  npm install
   58  #precisou instalar as dependencias do projeto. agora inicia a aplicacao
   59  node app.js
   60  #AQUI COMEÇO A ESCREVER OS TESTES COM JEST
   61  npm install jest -D
   62  npm install supertest -D
   63  ll
   64  cp /vagrant/tmp/cicd-lab/app.spec.js .
   65  cp /vagrant/tmp/cicd-lab/jest.config.js .
   66  npm run test
   67  ll
   68  #Agora comeco a parametrizar o CICD com github actions
   69  mkdir .github
   70  ls -lah
   71  cd .github/
   72  mkdir workflows
   73  cp /vagrant/tmp/cicd-lab/.github/workflows/test.yml .
   74  cp /vagrant/tmp/cicd-lab/.github/workflows/deployment.yml .
   75  history
   
   # Clonar repositório do Apache DevLake 
   git clone https://github.com/apache/incubator-devlake.git 
   cd incubator-devlake  
   # Subir DevLake com Docker Compose 
   docker-compose -f docker-compose.dev.yml up -d  
   # Acessar a interface em: http://localhost:4000  
   # Conectar fontes de dados (GitHub, Jenkins, GitLab, etc.) 
   # Criar pipeline de coleta e extrair métricas DORA: 
   # - Lead Time for Changes # - Deployment Frequency 
   # - Change Failure Rate # - Mean Time to Recovery
   
```