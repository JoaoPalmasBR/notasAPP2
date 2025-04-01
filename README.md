# NotasAPP

Este é um projeto de gerenciamento de notas que utiliza uma arquitetura de frontend e backend separados, com suporte a Docker para facilitar o desenvolvimento e a implantação.

## 🙋‍♂️ Autores

Desenvolvido por João Antonio dos Santos Ilario e Fransueudes Alexandre Freitas.


## Estrutura do Projeto

- **backend/**: Contém a API do backend escrita em Python.
  - `auth.py`: Gerenciamento de autenticação.
  - `database.py`: Configuração e manipulação do banco de dados.
  - `main.py`: Ponto de entrada da aplicação backend.
  - `models.py`: Definição dos modelos de dados.
  - `requirements.txt`: Dependências do backend.
- **frontend/**: Contém a interface do usuário escrita em React.
  - `src/`: Código-fonte principal do frontend.
  - `public/`: Arquivos públicos do frontend.
  - `build/`: Arquivos gerados após o build do frontend.
- **nginx/**: Configuração do servidor Nginx para servir o frontend e o backend.

## Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.
- Node.js (para desenvolvimento do frontend).
- Python 3.11 (para desenvolvimento do backend).

## Funcionalidades

- Registro e login de usuários
- Autenticação JWT
- Criação de notas por usuários autenticados
- Listagem de todas as anotações
- Interface responsiva feita com React

## Tecnologias Utilizadas

- Backend: Python com FastAPI.
- Frontend: React.js.
- Banco de Dados: Postgres configurado em database.py.
- Servidor Web: Nginx.
- Containerização: Docker.

## Como Executar

### Usando Docker

1. Certifique-se de que o Docker e o Docker Compose estão instalados.
2. No diretório raiz do projeto, execute:
   ```bash
   docker-compose up --build
   ```
3. Acesse o frontend em http://localhost e a API em http://localhost/api/

#### Frontend

1. Navegue até o diretório frontend/
```js
    npm install
```

### Rodando a Imagem e os Conteiners

```bash
    docker-compose up --build
```