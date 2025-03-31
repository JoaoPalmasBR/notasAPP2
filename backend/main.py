from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = ["*"]  # Em produção, defina a origem corretamente

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

posts = []

class Post(BaseModel):
    conteudo: str

@app.get("/posts")
def listar_posts():
    return posts

@app.post("/posts")
def criar_post(post: Post):
    posts.append(post)
    return {"mensagem": "Post criado com sucesso!"}
