from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import traceback
import redis
import json

app = FastAPI(root_path="/api")  # Com root_path correto

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

# Dados em memória
posts = []

# Modelo de entrada
class Post(BaseModel):
    conteudo: str

@app.get("/posts")
def listar_posts():
    logger.info("Listando posts.")
    if r:
        try:
            cached = r.get("posts")
            if cached:
                logger.info("Posts encontrados no cache.")
                return json.loads(cached)
            r.set("posts", json.dumps(posts))
            logger.info("Posts armazenados no cache.")
        except Exception:
            logger.error("Erro ao acessar o cache Redis:")
            logger.error(traceback.format_exc())
    return posts

@app.post("/posts")
async def criar_post(post: Post, request: Request):
    try:
        logger.info(f"Recebido post: {post}")
        posts.append(post)
        if r:
            r.set("posts", json.dumps([p.dict() for p in posts]))
            logger.info("Cache atualizado com novo post.")
        return {"mensagem": "Post criado com sucesso!"}
    except Exception:
        logger.error("Erro ao criar post")
        logger.error(traceback.format_exc())
        return {"erro": "Erro interno ao criar post"}
