from fastapi import FastAPI, Request, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import traceback
import redis
import json
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Post as PostModel
import models
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from auth import criar_token, verificar_senha, decodificar_token
from models import User
from jose import JWTError


app = FastAPI(root_path="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Criar tabelas no banco
models.Base.metadata.create_all(bind=engine)

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão com Redis
try:
    r = redis.Redis(host="redis", port=6379, decode_responses=True)
    r.ping()
    logger.info("Conectado ao Redis com sucesso.")
except redis.RedisError as e:
    logger.error("Erro ao conectar ao Redis:")
    logger.error(traceback.format_exc())
    r = None

# Modelo de entrada
class Post(BaseModel):
    conteudo: str

# Dependência de sessão com o banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verificar_senha(form_data.password, user.senha):
        raise HTTPException(status_code=400, detail="Usuário ou senha inválidos")
    
    token = criar_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

def get_usuario_logado(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decodificar_token(token)
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

@app.get("/me")
def me(usuario: User = Depends(get_usuario_logado)):
    return {"id": usuario.id, "username": usuario.username}

@app.get("/posts")
def listar_posts(
    db: Session = Depends(get_db),
    usuario: User = Depends(get_usuario_logado)
):
    logger.info(f"Usuário {usuario.username} acessou a lista de posts.")
    try:
        if r:
            cached = r.get("posts")
            if cached:
                logger.info("Posts carregados do cache.")
                return json.loads(cached)

        posts = db.query(PostModel).all()
        result = [{"id": p.id, "conteudo": p.conteudo} for p in posts]

        if r:
            r.set("posts", json.dumps(result))
            logger.info("Posts armazenados no cache.")

        return result
    except Exception:
        logger.error("Erro ao listar posts")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erro ao buscar posts")


@app.post("/posts")
async def criar_post(
    post: Post,
    request: Request,
    db: Session = Depends(get_db),
    usuario: User = Depends(get_usuario_logado)
):
    try:
        logger.info(f"Usuário {usuario.username} está criando um post.")
        novo_post = PostModel(conteudo=post.conteudo)
        db.add(novo_post)
        db.commit()
        db.refresh(novo_post)

        # Atualiza cache
        if r:
            posts = db.query(PostModel).all()
            result = [{"id": p.id, "conteudo": p.conteudo} for p in posts]
            r.set("posts", json.dumps(result))
            logger.info("Cache atualizado após novo post.")

        return {"mensagem": "Post criado com sucesso!"}
    except Exception:
        logger.error("Erro ao criar post")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Erro ao criar post")

@app.post("/register")
def registrar_usuario(
    username: str = Body(...),
    password: str = Body(...),
    db: Session = Depends(get_db)
):
    from models import User
    from auth import gerar_hash_senha

    logger.info(f"Tentando registrar usuário: {username}")
    
    usuario_existente = db.query(User).filter(User.username == username).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="Usuário já existe")

    novo_usuario = User(
        username=username,
        senha=gerar_hash_senha(password)
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    logger.info(f"Usuário {username} registrado com sucesso.")
    return {"mensagem": "Usuário registrado com sucesso!"}