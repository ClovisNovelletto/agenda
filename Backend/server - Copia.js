import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from 'pg'; // Usar o export padrão do pg
import path from 'path';

const SECRET_KEY = 'o_segredo_do_pilate_e_o_rodizio'; // Substitua por um segredo mais robusto

const { Pool } = pkg;
const express = require('express');
const path = require('path');
//const app = express();
//const port = 3000;

// Configuração da conexão com PostgreSQL
const pool = new Pool({
  user: 'postgres', // Substitua pelo seu usuário do banco
  host: 'localhost',
  database: 'Pilates', // O nome do banco que você criou
  password: 'sabro123', // Substitua pela sua senha
  port: 5432, // Porta padrão do PostgreSQL
});

/* //// */
//const express = require('express');
//const path = require('path');

const app = express();

// Sirva os arquivos estáticos da aplicação Angular
app.use(express.static(path.join(__dirname, 'dist/seu-projeto-angular')));

// Redirecione todas as requisições para o `index.html`
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/seu-projeto-angular/index.html'));
});
/* //// */

//app.use(cors());
app.use(express.json()); // Middleware para JSON

// Endpoint para registrar um usuário
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
    await pool.query(query, [username, password]);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Endpoint para autenticar login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT password FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      const storedHash = result.rows[0].password;
      console.log(password);
      console.log(storedHash);
      const compareQuery = `SELECT crypt($1, $2) = $2 AS is_valid`;
      const compareResult = await pool.query(compareQuery, [password, storedHash]);

      if (compareResult.rows[0].is_valid) {
        // Gera o token JWT com informações do usuário
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token, message: 'Login bem-sucedido!' });
      } else {
        res.status(401).json({ error: 'Senha incorreta' });
      }
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do header "Authorization"

  if (!token) return res.status(401).json({ error: 'Token ausente' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user; // Armazena os dados do usuário no req
    next(); // Continua para a próxima função
  });
};

app.get('/home', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo, ${req.user.username}!` });
});

/*app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Busca o hash da senha no banco de dados
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Usa crypt para comparar a senha fornecida com o hash no banco
      const compareQuery = `SELECT crypt($1, $2) = $2 AS is_valid`;
      console.log(password);
      console.log(user.password);
      const compareResult = await pool.query(compareQuery, [password, user.password]);

      if (compareResult.rows[0].is_valid) {
        res.json({ token: 'fake-jwt-token', user });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } else {
      res.status(401).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
});*/

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});



/*------------------------------------------*/

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Busca o hash da senha no banco de dados
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Usa crypt para comparar a senha fornecida com o hash no banco
      const compareQuery = `SELECT crypt($1, $2) = $2 AS is_valid`;
      const compareResult = await pool.query(compareQuery, [password, user.password]);

      if (compareResult.rows[0].is_valid) {
        res.json({ token: 'fake-jwt-token', user });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } else {
      res.status(401).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

/*--------------------------------------------*/
//const express = require('express');
//const path = require('path');

//const app = express();

// Sirva os arquivos estáticos da aplicação Angular
//app.use(express.static(path.join(__dirname, 'dist/seu-projeto-angular')));

// Redirecione todas as requisições para o `index.html`
//app.get('/*', (req, res) => {
//  res.sendFile(path.join(__dirname, 'dist/seu-projeto-angular/index.html'));
//});

// Inicialize o servidor
//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => {
//  console.log(`Servidor rodando na porta ${PORT}`);
//});