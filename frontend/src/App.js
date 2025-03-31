import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [conteudo, setConteudo] = useState('');
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [view, setView] = useState('login');
  const [mensagem, setMensagem] = useState('');

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const carregarPosts = async () => {
    try {
      const res = await axios.get('/api/posts', { headers });
      setPosts(res.data);
    } catch (err) {
      setMensagem('Erro ao carregar posts');
    }
  };

  const enviarPost = async () => {
    try {
      await axios.post('/api/posts', { conteudo }, { headers });
      setConteudo('');
      carregarPosts();
    } catch (err) {
      setMensagem('Erro ao enviar post');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post('/api/login', new URLSearchParams({
        username,
        password,
      }));
      const newToken = res.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setMensagem('');
      carregarPosts();
    } catch (err) {
      setMensagem('Usuário ou senha inválidos');
    }
  };

  const register = async () => {
    try {
      await axios.post('/api/register', { username, password });
      setMensagem('Cadastro realizado com sucesso! Faça login.');
      setView('login');
    } catch (err) {
      setMensagem(err.response?.data?.detail || 'Erro ao registrar');
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setPosts([]);
    setUsername('');
    setPassword('');
    setMensagem('');
  };

  useEffect(() => {
    if (token) {
      carregarPosts();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="container mt-5">
        <h2 className="mb-3 text-center">
          {view === 'login' ? 'Login' : 'Cadastro'}
        </h2>

        {mensagem && <div className="alert alert-info">{mensagem}</div>}

        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {view === 'login' ? (
          <>
            <button className="btn btn-primary w-100" onClick={login}>
              Entrar
            </button>
            <p className="mt-3 text-center">
              Ainda não tem conta?{' '}
              <span
                className="text-primary"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setView('register');
                  setMensagem('');
                }}
              >
                Cadastre-se
              </span>
            </p>
          </>
        ) : (
          <>
            <button className="btn btn-success w-100" onClick={register}>
              Cadastrar
            </button>
            <p className="mt-3 text-center">
              Já tem conta?{' '}
              <span
                className="text-primary"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setView('login');
                  setMensagem('');
                }}
              >
                Fazer login
              </span>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Bem-vindo!</h2>
      <button className="btn btn-outline-danger mb-4" onClick={logout}>
        Sair
      </button>

      <div className="input-group mb-3">
        <input
          className="form-control"
          type="text"
          placeholder="Digite seu post"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
        <button className="btn btn-primary" onClick={enviarPost}>
          Enviar
        </button>
      </div>

      <h4 className="mb-3">Posts</h4>
      {posts.map((post, idx) => (
        <div key={idx} className="card mb-2">
          <div className="card-body">{post.conteudo}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
