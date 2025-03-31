import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // CSS extra para animações

function App() {
  const [conteudo, setConteudo] = useState('');
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [view, setView] = useState('login');
  const [mensagem, setMensagem] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [tema, setTema] = useState(localStorage.getItem('tema') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);
  
  const toggleTema = () => {
    const novo = tema === 'light' ? 'dark' : 'light';
    setTema(novo);
    localStorage.setItem('tema', novo);
  };
  
  const carregarPosts = async () => {
    try {
      const res = await axios.get('/api/posts', { headers });
      setPosts(res.data);
    } catch {
      setMensagem('Erro ao carregar posts');
    }
  };

  const buscarUsuario = async () => {
    try {
      const res = await axios.get('/api/me', { headers });
      setUsuarioLogado(res.data);
    } catch {
      setMensagem('Erro ao buscar usuário');
    }
  };

  const enviarPost = async () => {
    try {
      await axios.post('/api/posts', { conteudo }, { headers });
      setConteudo('');
      carregarPosts();
    } catch {
      setMensagem('Erro ao enviar post');
    }
  };

  const login = async () => {
    try {
      const res = await axios.post('/api/login', new URLSearchParams({ username, password }));
      const newToken = res.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      setMensagem('');
      await buscarUsuario();
      carregarPosts();
    } catch {
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
    setUsuarioLogado(null);
    setPosts([]);
    setUsername('');
    setPassword('');
    setMensagem('');
  };

  useEffect(() => {
    if (token) {
      buscarUsuario();
      carregarPosts();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="container mt-5 fade-in">
        <h2 className="mb-3 text-center">{view === 'login' ? 'Login' : 'Cadastro'}</h2>

        {mensagem && <div className="alert alert-info">{mensagem}</div>}

        <div className="mb-3">
          <input className="form-control" type="text" placeholder="Usuário" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="mb-3">
          <input className="form-control" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {view === 'login' ? (
          <>
            <button className="btn btn-primary w-100" onClick={login}>Entrar</button>
            <p className="mt-3 text-center">
              Ainda não tem conta?{' '}
              <span className="text-primary" style={{ cursor: 'pointer' }} onClick={() => { setView('register'); setMensagem(''); }}>
                Cadastre-se
              </span>
            </p>
          </>
        ) : (
          <>
            <button className="btn btn-success w-100" onClick={register}>Cadastrar</button>
            <p className="mt-3 text-center">
              Já tem conta?{' '}
              <span className="text-primary" style={{ cursor: 'pointer' }} onClick={() => { setView('login'); setMensagem(''); }}>
                Fazer login
              </span>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4 fade-in">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-2">
        <h4 className="m-0">
          <i className="bi bi-person-circle me-2"></i>
          Bem-vindo, <strong>{usuarioLogado?.username}</strong>
        </h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={toggleTema}>
            <i className={`bi ${tema === 'dark' ? 'bi-sun' : 'bi-moon'}`}></i>
          </button>
          <button className="btn btn-outline-danger" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i> Sair
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-10 col-sm-9">
          <input className="form-control" type="text" placeholder="Digite seu post" value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
        </div>
        <div className="col-md-2 col-sm-3">
          <button className="btn btn-primary w-100" onClick={enviarPost}>Enviar</button>
        </div>
      </div>

      <h5>Posts recentes</h5>
      <div className="row">
        {posts.map((post, idx) => (
          <div key={idx} className="col-md-4 mb-3 fade-in">
            <div className="card h-100 shadow-sm">
              <div className="card-body">{post.conteudo}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
