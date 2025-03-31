from fastapi import FastAPI, Request, Depends
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

app = FastAPI(root_path="/api")

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

@app.get("/posts")
def listar_posts(db: Session = Depends(get_db)):
    logger.info("Listando posts do banco de dados.")
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
        return result
    except Exception:
        logger.error("Erro ao listar posts")
        logger.error(traceback.format_exc())
        return []

@app.post("/posts")
async def criar_post(post: Post, request: Request, db: Session = Depends(get_db)):
    try:
        logger.info(f"Recebido post: {post}")
        novo_post = PostModel(conteudo=post.conteudo)
        db.add(novo_post)
        db.commit()
        db.refresh(novo_post)
        if r:
            posts = db.query(PostModel).all()
            result = [{"id": p.id, "conteudo": p.conteudo} for p in posts]
            r.set("posts", json.dumps(result))
        return {"mensagem": "Post criado com sucesso!"}
    except Exception:
        logger.error("Erro ao criar post")
        logger.error(traceback.format_exc())
        return {"erro": "Erro interno ao criar post"}