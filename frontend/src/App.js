import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [conteudo, setConteudo] = useState("");
  const [posts, setPosts] = useState([]);

  const carregarPosts = async () => {
    const res = await axios.get("/api/posts");
    setPosts(res.data);
  };

  const enviarPost = async () => {
    await axios.post("/api/posts", { conteudo });
    setConteudo("");
    carregarPosts();
  };

  useEffect(() => {
    carregarPosts();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Postagens</h1>
      <input
        type="text"
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Digite sua mensagem"
      />
      <button onClick={enviarPost}>Enviar</button>
      <div style={{ marginTop: 20 }}>
        {posts.map((post, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            {post.conteudo}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
