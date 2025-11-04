import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import path from 'path';
import { sql } from "./db.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

import authRoutes from "./routes/auth.js";
import alunoRoutes from "./routes/aluno.js";
import localRoutes from "./routes/local.js";
import agendaRoutes from "./routes/agenda.js";
import equiptoRoutes from "./routes/equipto.js";
import servicoRoutes from "./routes/servico.js";
import anamneseRoutes from "./routes/anamnese.js";
import personalRoutes from "./routes/personal.js";
import financeiroRoutes from "./routes/financeiro.js";
import tabelaPrecoRoutes from "./routes/tabelaPreco.js";
import configuracaoRoutes from "./routes/configuracao.js";

dayjs.extend(utc);
dayjs.extend(timezone);

process.env.TZ = 'UTC';
dotenv.config();

// Recriando `__dirname`
const __filename = fileURLToPath(import.meta.url); // Captura o caminho completo do arquivo atual
const __dirname = dirname(__filename); // Extrai o diretório base

console.log('entrou no backend');

const app = express();
app.use(express.json()); // Middleware para JSON
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/aluno", alunoRoutes);
app.use("/api/local", localRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/equipto", equiptoRoutes);
app.use("/api/servico", servicoRoutes);
app.use("/api/anamnese", anamneseRoutes);
app.use("/api/personal", personalRoutes);
app.use("/api/financeiro", financeiroRoutes);
app.use("/api/tabelaPreco", tabelaPrecoRoutes);
app.use("/api/configuracao", configuracaoRoutes);

//const isProd = process.env.NODE_ENV === 'production'

console.log('NODE_ENV:', process.env.NODE_ENV);

console.log(__dirname);
//__dirname = "../frontend/";
//const caminhoDist = "C:\\h2uAgenda\\frontend";
const caminhoDist = "C:/h2uAgenda/frontend";
const distPath = path.join(caminhoDist, 'dist/h2uAgenda');
const distPathIndex = path.join(caminhoDist, 'dist/h2uAgenda/browser/index.html');

console.log(caminhoDist);
console.log(distPath);
console.log(distPathIndex);

app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});


//const port = process.env.PORT || 3000;
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Sirva os arquivos estáticos da aplicação Angular
app.use(express.static(distPath));

// Redirecione todas as requisições para o `index.html`
app.get('/*', (req, res) => {
  res.sendFile(distPathIndex);
});


