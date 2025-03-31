from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Chave secreta e algoritmo
SECRET_KEY = "minha_chave_ultra_secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def criar_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verificar_senha(senha_plana, senha_hash):
    return pwd_context.verify(senha_plana, senha_hash)

def gerar_hash_senha(senha):
    return pwd_context.hash(senha)

def decodificar_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
