import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [conteudo, setConteudo] = useState('');
  const [posts, setPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const carregarPosts = async () => {
    try {
      const res = await axios.get('/api/posts', { headers });
      setPosts(res.data);
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
    }
  };

  const enviarPost = async () => {
    try {
      await axios.post('/api/posts', { conteudo }, { headers });
      setConteudo('');
      carregarPosts();
    } catch (err) {
      console.error('Erro ao enviar post:', err);
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
      carregarPosts();
    } catch (err) {
      console.error('Erro no login:', err);
      alert('Usuário ou senha inválidos');
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setPosts([]);
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    if (token) {
      carregarPosts();
    }
  }, [token]);

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Bem-vindo!</h2>
      <button onClick={logout}>Sair</button>

      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Digite seu post"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
        />
        <button onClick={enviarPost}>Enviar</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Posts</h3>
        {posts.map((post, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
            {post.conteudo}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
