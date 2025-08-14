import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from 'pg'; // Usar o export padrão do pg
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';


//const dayjs = require('dayjs');
//const utc = require('dayjs/plugin/utc');
//const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

process.env.TZ = 'UTC';
dotenv.config();

// Recriando `__dirname`
const __filename = fileURLToPath(import.meta.url); // Captura o caminho completo do arquivo atual
const __dirname = dirname(__filename); // Extrai o diretório base
const SECRET_KEY = 'o_segredo_do_pilate_e_o_rodizio'; // Substitua por um segredo mais robusto

//require('dotenv').config();
const { Pool } = pkg;
console.log('entrou no backend');

const app = express();
app.use(express.json()); // Middleware para JSON
app.use(cors());

const isProd = process.env.NODE_ENV === 'production'

console.log('NODE_ENV:', process.env.NODE_ENV);

/*SupaBase*/
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
  // Pool options (descomente se necessário):
  //max: 10,            // número máximo de conexões simultâneas
  //idle_timeout: 60,   // desconecta conexões ociosas após 60s
  //connect_timeout: 10 // falha após 10s tentando conectar
});

//const sql = postgres(process.env.DATABASE_URL, {
//  ssl: 'require',   // Supabase exige SSL
//  hostname: new URL(process.env.DATABASE_URL).hostname, // Força IPv4 resolvido
//});

export default sql;
/**/

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  host: new URL(process.env.DATABASE_URL).hostname, // força IPv4
  family: 4 // força uso de IPv4 (evita ENETUNREACH)
});
*/
/*
const pool = new Pool({
  user: isProd ? process.env.DB_USER : process.env.DB_USER_LOCAL,
  host: isProd ? process.env.DB_HOST : process.env.DB_HOST_LOCAL,
  database: isProd ? process.env.DB_NAME : process.env.DB_NAME_LOCAL,
  password: isProd ? process.env.DB_PASSWORD : process.env.DB_PASSWORD_LOCAL,
  port: isProd ? process.env.DB_PORT : process.env.DB_PORT_LOCAL,
  ssl: {
    rejectUnauthorized: false,
  },
   // 👇 força IPv4
  family: 4
});
*/
/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  family: 4 // Força IPv4
})
*/
/*
// Configuração da conexão com PostgreSQL
const pool = new Pool({
  user: 'postgres', // Substitua pelo seu usuário do banco
  host: 'localhost',
  database: 'h2uAgenda', // O nome do banco que você criou
  password: 'sabro123', // Substitua pela sua senha
  port: 5432, // Porta padrão do PostgreSQL
});*/



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


// Endpoint para autenticar login
app.post('/api/login', async (req, res) => {
  const email = req.body.email?.trim();;
  const password = req.body.password;
//console.log("email", email);
//console.log("password", password);
  try {
    const query = 'SELECT id, password, tipo_usuario FROM users WHERE username = $1';
    //    const result = await pool.query(query, [username]);

    /*supabase*/
     const result = await sql`SELECT id, password, tipo_usuario FROM users WHERE email = ${email}`;

    if (result.length > 0) {
      console.log("result ok");

      const storedHash = result[0].password;
      console.log("storedHash", storedHash);
      const resultSenhaValida = await sql`
        SELECT crypt(${password}, ${storedHash}) = ${storedHash} AS is_valid, crypt(${password}, ${storedHash}) teste
      `;
      console.log("resultSenhaValida[0].teste", resultSenhaValida[0].teste);
      if (resultSenhaValida[0].is_valid) {      
        console.log("result válido");
        // tratamento para pegar personal ou aluno
        const userId = result[0].id;
        const tipo = result[0].tipo_usuario;
        let personalId = null;
        let alunoId = null;

        if (tipo == 2) {
          //const resPersonal = await pool.query('SELECT personal_id id FROM personals WHERE peruserid = $1', [userId]);
          const resPersonal = await sql`SELECT personal_id FROM personals WHERE peruserid = ${userId}`;
          personalId = resPersonal[0]?.personal_id ?? null;
        } else if (tipo ==3) {
          const resAluno = await sql`SELECT aluno_id FROM alunos WHERE aluuserid = ${userId}`;
          const alunoId = resAluno[0]?.aluno_id ?? null;
        }

        // Gera o token JWT com informações do usuário
        const token = jwt.sign({ email, tipo, personalId, alunoId  }, SECRET_KEY, { expiresIn: '180d' });
        res.json({ token, message: 'Login bem-sucedido!' });

      } else {
        console.log("primeiro else");
        res.status(401).json({ error: 'Senha incorreta' });
      }
    } else {
      console.log("segundo else");
      res.status(401).json({ sucesso: false, mensagem: 'Login inválido' });
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    console.log("saiu pelo erro");
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

/*----------------------------------------------------------*/
app.get('/api/localLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega locais");
    const personalId = req.user.personalId;
    const local = await sql`SELECT Local_ID id, Local nome, LocEndereco endereco, LocAtivo ativo FROM Locals WHERE LocPersonalID = ${personalId}`;
    res.json(local);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar locais');
  }
});

app.get('/api/equiptoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega equiptos");
    const personalId = req.user.personalId;
    const equipto = await sql`SELECT Equipto_ID id, Equipto nome, EqOrdem ordem, EqAtivo ativo FROM Equiptos WHERE EqPersonalID = ${personalId}`;
    res.json(equipto);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar equiptos');
  }
});


app.put('/api/equiptoSave', authenticateToken, async (req, res) => {
  const {id, nome, ordem, ativo} = req.body;

  try {
    const equipto = await sql`
      UPDATE Equiptos SET equipto = ${nome}, LocOrdem = ${ordem}, EqAtivo = ${ativo}
      WHERE equipto_id = ${id}
      RETURNING *`; 
    res.status(201).json(equipto);
  } catch (err) {
    console.error('Erro ao atualizar aluno:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar equipto' });
  }
});

app.post('/api/equiptoInsert', authenticateToken, async (req, res) => {
  const personalId = req.user.personalId;

  const {id, nome, ordem, ativo} = req.body;

  try {
    const equipto = await sql`
      INSERT INTO Equiptos (equipto, EqOrdem, EqAtivo, EqPersonalID)
      VALUES (${nome}, ${ordem}, ${ativo}, ${personalId})
      RETURNING *`; 
    res.json({
      id: equipto[0].equipto_id,                         
      nome: equipto[0].equipto,                          
      ordem: equipto[0].eqordem,                
      ativo: equipto[0].eqativo
    });
    console.log('Retornando novo equipto:', {
      id: equipto[0].equipto_id,
      nome: equipto[0].equipto,
      endereco: equipto[0].eqordem,
      ativo: equipto[0].eqativo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar equipto' });
  }
});

/*----------------------------------------------------------*/
app.get('/api/alunoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega alunos");
    const personalId = req.user.personalId;
    //const compareQuery = `SELECT aluno_id id, aluno nome, alufone telefone, aludatanasc datanasc, aluemail email, alucpf cpf, aluativo ativo, alucodconvite codigo_convite FROM Alunos WHERE AluPersonalID=$1`;
    //const result = await pool.query(compareQuery, [personalId]);      
    const aluno = await sql`SELECT aluno_id id, aluno nome, alufone telefone, aludatanasc datanasc, aluemail email, alucpf cpf, aluativo ativo, alucodconvite codigo_convite,
        AluLocalID AS "localId", (SELECT Local FROM Locals WHERE Local_ID=AluLocalID) Local,
        AluServicoID AS "servicoId", (SELECT Servico FROM Servicos WHERE Servico_ID=AluServicoID) Servico,
        aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6, aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6,
	      CASE WHEN aludia0 = true THEN 'Dom: ' || aluhora0 || CASE WHEN aludia1=true OR aludia2=true OR aludia3=true OR aludia4=true OR aludia5=true OR aludia6=true THEN ' / ' ELSE '' END ELSE '' END ||
        CASE WHEN aludia1 = true THEN 'Seg: ' || aluhora1 || CASE WHEN aludia2=true OR aludia3=true OR aludia4=true OR aludia5=true OR aludia6=true THEN ' / ' ELSE '' END ELSE '' END ||
        CASE WHEN aludia2 = true THEN 'Ter: ' || aluhora2 || CASE WHEN aludia3=true OR aludia4=true OR aludia5=true OR aludia6=true THEN ' / ' ELSE '' END ELSE '' END ||
        CASE WHEN aludia3 = true THEN 'Qua: ' || aluhora3 || CASE WHEN aludia4=true OR aludia5=true OR aludia6=true THEN ' / ' ELSE '' END ELSE '' END ||
        CASE WHEN aludia4 = true THEN 'Qui: ' || aluhora4 || CASE WHEN aludia5=true OR aludia6=true THEN ' / ' ELSE '' END ELSE '' END ||
        CASE WHEN aludia5 = true THEN 'Sex: ' || aluhora5 || CASE WHEN aludia6=true THEN ' / ' ELSE '' END ELSE '' END ||
        CASE WHEN aludia6 = true THEN 'Sab: ' || aluhora6 ELSE '' END aludias
      FROM Alunos WHERE AluPersonalID = ${personalId}`;
    res.json(aluno);
    //console.log(result.rows); // apenas isso para logar
    // não usar res.json(result.rows);    // envia resposta corretamente uma única vez
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar alunos');
  }
});


app.put('/api/alunoSave', authenticateToken, async (req, res) => {
  //const camposDia = [aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6];
  //const camposHora = [aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6];
  //const { id, nome, telefone, datanasc, cpf, email, ativo, aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6, aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6 } = req.body;

  // Preenche valores padrão se não vieram do frontend
  for (let i = 0; i < 7; i++) {
    if (typeof req.body[`aludia${i}`] === 'undefined') {
      req.body[`aludia${i}`] = false;
      req.body[`aluhora${i}`] = null;
    }
    if (typeof req.body[`aluhora${i}`] === 'undefined' || req.body[`aludia${i}`] == false) {
      req.body[`aluhora${i}`] = null;
    }
    //console.error(req.body[`aludia${i}`]);
    //console.error(req.body[`aluhora${i}`]);
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {
    id, nome, telefone, datanasc, cpf, email, ativo,
    aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6,
    aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6, localId, servicoId
  } = req.body;

  // UPDATE
  try {
    const aluno = await sql`
      UPDATE Alunos SET
       Aluno = ${nome}, AluCPF = ${cpf}, AluDataNasc = ${datanasc}, AluEmail = ${email}, AluAtivo = ${ativo}, alufone = ${telefone}, alulocalid = ${localId}, aluservicoid = ${servicoId},
       aludia0 = ${aludia0}, aludia1 = ${aludia1}, aludia2 = ${aludia2}, aludia3 = ${aludia3}, aludia4 = ${aludia4}, aludia5 = ${aludia5}, aludia6 = ${aludia6},
       aluhora0 = ${aluhora0}, aluhora1 = ${aluhora1}, aluhora2 = ${aluhora2}, aluhora3 = ${aluhora3}, aluhora4 = ${aluhora4}, aluhora5 = ${aluhora5}, aluhora6 = ${aluhora6}
       WHERE Aluno_ID = ${id}
      RETURNING *
    `;    
    res.status(201).json(aluno);
    } catch (err) {
      console.error('Erro ao atualizar aluno:', err);
      res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
});


app.post('/api/alunoInsert', authenticateToken, async (req, res) => {
  //const { nome, telefone, datanasc, cpf, email, ativo } = req.body;
  const personalId = req.user.personalId;
  const codigoConvite = gerarCodigoConvite();

    // Preenche valores padrão se não vieram do frontend
  for (let i = 0; i < 7; i++) {
    if (typeof req.body[`aludia${i}`] === 'undefined') {
      req.body[`aludia${i}`] = false;
      req.body[`aluhora${i}`] = null;
    }
    if (typeof req.body[`aluhora${i}`] === 'undefined' || req.body[`aludia${i}`] == false) {
      req.body[`aluhora${i}`] = null;
    }
    //console.error(req.body[`aludia${i}`]);
    //console.error(req.body[`aluhora${i}`]);
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {
    id, nome, telefone, datanasc, cpf, email, ativo,
    aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6,
    aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6, localId, servicoId
  } = req.body;


  try {
    //const result = await pool.query(`
    //  INSERT INTO Alunos (aluno, AluCPF, AluDataNasc, AluEmail, AluAtivo, alufone, alupersonalid, alucodconvite)
    //  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    //  RETURNING aluno_id, aluno, alufone, alucodconvite
    //`, [nome, cpf, datanasc, email, ativo, telefone, personalId, codigoConvite]);
    const aluno = await sql`
      INSERT INTO Alunos (aluno, AluCPF, AluDataNasc, AluEmail, AluAtivo, alufone, alupersonalid, alucodconvite, alulocalid, aluservicoid,
      aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6, aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6)
      VALUES (${nome}, ${cpf}, ${datanasc}, ${email}, ${ativo}, ${telefone}, ${personalId}, ${codigoConvite}, ${localId}, , ${servicoId},
      ${aludia0}, ${aludia1}, ${aludia2}, ${aludia3}, ${aludia4}, ${aludia5}, ${aludia6},
      ${aluhora0}, ${aluhora1}, ${aluhora2}, ${aluhora3}, ${aluhora4}, ${aluhora5}, ${aluhora6})
      RETURNING *`; 
    res.json({
      id: aluno[0].aluno_id,                         // <- compatível com this.form.patchValue({ alunoId: novoAluno.id });
      nome: aluno[0].aluno,                          // <- compatível com this.alunoCtrl.setValue(novoAluno.nome);
      telefone: aluno[0].alufone,                    // <- opcional, se quiser manter
      codigo_convite: aluno[0].alucodconvite
    });
    console.log('Retornando novo aluno:', {
      id: aluno[0].aluno_id,
      nome: aluno[0].aluno,
      telefone: aluno[0].alufone,
      codigo_convite: aluno[0].alucodconvite
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar aluno' });
  }
});


app.put('/api/localSave', authenticateToken, async (req, res) => {
  const {id, nome, endereco, ativo} = req.body;

  try {
    const local = await sql`
      UPDATE Locals SET local = ${nome}, LocEndereco = ${endereco}, LocAtivo = ${ativo}
      WHERE local_id = ${id}
      RETURNING *`; 
    res.status(201).json(local);
  } catch (err) {
    console.error('Erro ao atualizar aluno:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar local' });
  }
});

app.post('/api/localInsert', authenticateToken, async (req, res) => {
  const personalId = req.user.personalId;

  const {id, nome, endereco, ativo} = req.body;

  try {
    const local = await sql`
      INSERT INTO Locals (local, LocEndereco, LocAtivo, LocPersonalID)
      VALUES (${nome}, ${endereco}, ${ativo}, ${personalId})
      RETURNING *`; 
    res.json({
      id: local[0].local_id,                         
      nome: local[0].local,                          
      endereco: local[0].locendereco,                
      ativo: local[0].locativo
    });
    console.log('Retornando novo local:', {
      id: local[0].local_id,
      nome: local[0].local,
      endereco: local[0].locendereco,
      ativo: local[0].locativo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar local' });
  }
});

/*
app.post('/api/alunoInsert', authenticateToken, async (req, res) => {
  const { id, nome, telefone, datanasc, cpf, email, ativo } = req.body;
  const personalId = req.user.personalId;
  console.log("req",req);
  console.log("req.body", req.body);
  console.log("datanasc",datanasc);
  // INSERT
  try {
    const result = await pool.query(`
      INSERT INTO Alunos(Aluno, AluCPF, AluDataNasc, AluEmail, AluAtivo, AluFone, AluPersonalID)
        Aluno = $1, AluCPF = $2, AluDataNasc = $3, AluEmail = $4, AluAtivo = $5, alufone = $6
      WHERE Aluno_ID = $7`,
      [nome, cpf, datanasc, email, ativo, telefone, personalId]);
    res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao atualizar agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar agenda' });
    }
});
*/
app.get('/api/agendas', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda");
    const personalId = req.user.personalId;
    //const compareQuery = `SELECT * FROM agendaslista WHERE PersonalID=$1`;
    //const result = await pool.query(compareQuery, [personalId]);      
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalId}`;
    res.json(agendas);
    //console.log(result.rows); // apenas isso para logar
    // não usar res.json(result.rows);    // envia resposta corretamente uma única vez
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});


app.get('/api/agendaStatus', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda status");
    //const personalId = req.user.personalId;
    //const compareQuery = `SELECT agendastatu_id ID, agendastatu Status, agcor Cor FROM AgendaStatus`;
    //const result = await pool.query(compareQuery, null /*[personalId]*/);      
    const agendaStatus = await sql`SELECT agendastatu_id ID, agendastatu Status, agcor Cor FROM AgendaStatus`;
    res.json(agendaStatus);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas status');
  }
});

app.get('/api/alunos', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    //const compareQuery = `SELECT aluno_id id, aluno nome, alufone telefone, alucodconvite codigo_convite FROM alunos WHERE AluPersonalID=$1`;
    //const result = await pool.query(compareQuery, [personalId]);      
    const alunos = await sql`SELECT aluno_id id, aluno nome, alufone telefone, alucodconvite codigo_convite,
                                    aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6, alulocalid,
                                    aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6, CASE WHEN aluservicoid=2 THEN true ELSE false END AS "mostrarEquipto"
      FROM alunos WHERE AluPersonalID=${personalId} AND AluAtivo = true`;
    res.json(alunos);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar alunos');
  }
});

app.get('/api/locals', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    //const compareQuery = `SELECT local_id id, local nome, locendereco endereco FROM locals WHERE LocPersonalID=$1`;
    //const result = await pool.query(compareQuery, [personalId]);      
    const locals = await sql`SELECT local_id id, local nome, locendereco endereco FROM locals WHERE LocPersonalID=${personalId} AND LocAtivo = true`;
    //const result = await pool.query('SELECT local_id id, local nome, locendereco endereco FROM locals');
    res.json(locals);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar locals');
  }
});


app.get('/api/equiptos', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    const equiptos = await sql`SELECT equipto_id id, equipto nome FROM equiptos WHERE eqativo = true`;
    res.json(equiptos);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar equiptos');
  }
});

app.get('/api/servicos', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    const servicos = await sql`SELECT servico_id id, servico nome FROM servicos WHERE Servico_ID IN(SELECT PSServicoID FROM PersonalsServicos WHERE PSPersonalID=${personalId}) AND SeAtivo = true`;
    res.json(servicos);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar locals');
  }
});

app.get('/api/configuracoes', authenticateToken, async (req, res) => {
  try {
     const personalId = req.user.personalId;
    //const compareQuery = `SELECT personal_id id, personal nome,
    //                             dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos
    //   FROM Personals WHERE Personal_ID=$1`;
    //const result = await pool.query(compareQuery, [personalId]);    
    const result = await sql`SELECT personal_id id, personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim,
       intervalo_minutos, mostrarLocal, mostrarServico, mostrarEquipto FROM Personals WHERE Personal_ID = ${personalId}`;

    //const result = await pool.query('SELECT personal_id id, personal nome FROM personals'); 
    res.json(result[0]);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar personals');
  }    
});

app.get('/api/configuracoesServicos', authenticateToken, async (req, res) => {
  try {
    const result = await sql`SELECT Servico_id id, Servico nome FROM Servicos WHERE seativo = true`;
    res.json(result);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar serviços');
  }    
});

app.get('/api/personals/me/configuracoesServicos', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    const result = await sql`SELECT PSServicoID ServicoID FROM PersonalsServicos WHERE PSPersonalID=${personalId}`;
    res.json(result.map(r => r.servicoid));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar serviços');
  }    
});

app.post('/api/personals/me/configuracoesServicos', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    const servicosIds = req.body; // array de IDs

    await sql`DELETE FROM PersonalsServicos WHERE PSPersonalID = ${personalId}`;

    // Insere novos serviços (se houver)
    if (servicosIds && servicosIds.length > 0) {
      await Promise.all(
        servicosIds.map(id => 
          sql`INSERT INTO PersonalsServicos (pspersonalid, psservicoid) VALUES (${personalId}, ${id})`
        )
      );
    }
    //await Promise.all(inserts);
    //res.sendStatus(200);
    res.json({ success: true });
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao salvar serviços');
  }    
});

app.get('/api/personals', authenticateToken, async (req, res) => {
  try {
     const personalId = req.user.personalId;
    const compareQuery = `SELECT personal_id id, personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6,
                                 hora_inicio, hora_fim, intervalo_minutos, mostrarLocal, mostrarServico, mostrarEquipto
       FROM Personals WHERE Personal_ID=$1`;
    const result = await pool.query(compareQuery, [personalId]);    

    //const result = await pool.query('SELECT personal_id id, personal nome FROM personals'); 
    res.json(result.rows);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar personals');
  }    
});

app.get('/api/personal/me', authenticateToken, async (req, res) => {
  try {
     const personalId = req.user.personalId;

    //const compareQuery = `SELECT personal_id id, personal nome,  dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos FROM Personals WHERE Personal_ID=$1`;
    //const result = await pool.query(compareQuery, [personalId]);    
    //res.json(result.rows);

    const result = await sql`SELECT personal_id AS "id", personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim,
         intervalo_minutos, mostrarLocal AS "mostrarLocal", mostrarServico AS "mostrarServico", mostrarEquipto AS "mostrarEquipto" FROM Personals WHERE Personal_ID = ${personalId}`;
    console.log(personalId);
    console.log(result[0]);
    res.json(result[0] ?? {}); 
    console.log(personalId);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar configurações do personal');
  }    
});

app.get('/api/home', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo home, ${req.user.email}!` });
});

app.get('/api/agenda', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo agenda, ${req.user.email}!` });
});

app.get('/api/financeiro', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo financeiro, ${req.user.email}!` });
});

app.get('/', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo ???, ${req.user.email}!` });
});

//const port = process.env.PORT || 3000;
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

''
// Sirva os arquivos estáticos da aplicação Angular
app.use(express.static(distPath));

// Redirecione todas as requisições para o `index.html`
app.get('/*', (req, res) => {
  res.sendFile(distPathIndex);
});

function gerarCodigoConvite(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // evita confusões como 0/O e 1/I
  let codigo = '';
  for (let i = 0; i < length; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

app.post('/api/alunos', authenticateToken, async (req, res) => {
  const { nome, telefone/* personal_id*/ } = req.body;
  const personalId = req.user.personalId;
  const codigoConvite = gerarCodigoConvite();

  try {
    //const result = await pool.query(`
    //  INSERT INTO Alunos (aluno, alufone, alupersonalid, alucodconvite)
    //  VALUES ($1, $2, $3, $4)
    //  RETURNING aluno_id, aluno, alufone, alucodconvite
    //`, [nome, telefone, personalId, codigoConvite]);
    const aluno = await sql`
      INSERT INTO Alunos (aluno, alufone, alupersonalid, alucodconvite, AluAtivo)
      VALUES (${nome}, ${telefone}, ${personalId}, ${codigoConvite}, true)
      RETURNING *`; 
    res.json({
      id: aluno[0].aluno_id,                         // <- compatível com this.form.patchValue({ alunoId: novoAluno.id });
      nome: aluno[0].aluno,                          // <- compatível com this.alunoCtrl.setValue(novoAluno.nome);
      telefone: aluno[0].alufone,                    // <- opcional, se quiser manter
      codigo_convite: aluno[0].alucodconvite
    });
    console.log('Retornando novo aluno:', {
      id: aluno[0].aluno_id,
      nome: aluno[0].aluno,
      telefone: aluno[0].alufone,
      codigo_convite: aluno[0].alucodconvite
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar aluno' });
  }
});


app.post('/api/locals', authenticateToken, async (req, res) => {
  const {nome, endereco/* personal_id*/ } = req.body;
  const personalId = req.user.personalId;

  try {
    //const result = await pool.query(`
    //  INSERT INTO locals (local, locendereco, locpersonalid)
    //  VALUES ($1, $2, $3)
    //  RETURNING local_id, local, locendereco
    //`, [nome, endereco, personalId]);

    const local = await sql`
      INSERT INTO locals (local, locendereco, locpersonalid, locativo)
      VALUES (${nome}, ${endereco}, ${personalId}, true)
      RETURNING *`; 
    res.json({
      id: local[0].local_id,                         // <- compatível com this.form.patchValue({ alunoId: novoAluno.id });
      nome: local[0].local,                          // <- compatível com this.alunoCtrl.setValue(novoAluno.nome);
      endereco: local[0].locendereco                    // <- opcional, se quiser manter
    });
    console.log('Retornando novo local:', {
      id: local[0].local_id,
      nome: local[0].local,
      endereco: local[0].locendereco
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar endereco' });
  }
});

app.post('/api/register-aluno', authenticateToken, async (req, res) => {
  const { email, senha, codigoConvite } = req.body;

  if (!email || !senha || !codigoConvite) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }

  try {
    // 1. Criptografa a senha
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash(senha, 10);

    // 2. Cria o usuário do tipo 'aluno'
    const userResult = await db.query(`
      INSERT INTO Users (email, password, tipo_usuario)
      VALUES ($1, $2, 3) RETURNING id
    `, [email, senhaHash]);

    const usuarioId = userResult.rows[0].id;

    // 3. Busca aluno com o código informado
    const alunoResult = await db.query(`
      SELECT aluno_id id FROM Alunos WHERE alucodconvite = $1`, [codigoConvite]);

    if (alunoResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Código de convite inválido' });
    }

    const alunoId = alunoResult.rows[0].id;

    // 4. Faz a associação do usuario_id ao aluno
    await db.query(`
      UPDATE Alunos SET aluuserid = $1 WHERE aluno_id = $2
    `, [usuarioId, alunoId]);

    return res.status(201).json({ sucesso: true, usuario_id: usuarioId });

  } catch (erro) {
    console.error('Erro no registro do aluno:', erro);
    return res.status(500).json({ erro: 'Erro ao registrar o aluno' });
  }
});



app.put('/api/personal/configuracoes', authenticateToken, async (req, res) => {
  const { diasAtendimento, horaInicio, horaFim, intervaloMinutos, mostrarLocal, mostrarServico, mostrarEquipto } = req.body;
  const personalId = req.user.personalId;
  console.log("req.body", req.body);
  try {
    //const result = await pool.query(`
    //  UPDATE Personals SET
    //    dia0=$1, dia1=$2, dia2=$3, dia3=$4, dia4=$5, dia5=$6, dia6=$7, hora_inicio=$8, hora_fim=$9, intervalo_minutos=$10
    //  WHERE Personal_ID = $11`,
    //  [diasAtendimento.includes(0), diasAtendimento.includes(1), diasAtendimento.includes(2), diasAtendimento.includes(3),
    //   diasAtendimento.includes(4), diasAtendimento.includes(5), diasAtendimento.includes(6), horaInicio, horaFim, intervaloMinutos, personalId]);
    //res.status(201).json(result.rows[0]);
    const result = await sql`
      UPDATE Personals SET
       dia0=${diasAtendimento.includes(0)}, dia1=${diasAtendimento.includes(1)}, dia2=${diasAtendimento.includes(2)},
       dia3=${diasAtendimento.includes(3)}, dia4=${diasAtendimento.includes(4)}, dia5=${diasAtendimento.includes(5)},
       dia6=${diasAtendimento.includes(6)}, hora_inicio=${horaInicio}, hora_fim=${horaFim}, intervalo_minutos=${intervaloMinutos},
       mostrarLocal=${mostrarLocal},
       mostrarServico=${mostrarServico},
       mostrarEquipto=${mostrarEquipto}
      WHERE Personal_ID = ${personalId}
      RETURNING *
    `;    
    res.status(201).json(result[0]);
  } catch (erro) {
    console.error('Erro ao atualizar configurações:', erro);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

app.put('/api/agendas', authenticateToken, async (req, res) => {
  const { agenda_id, alunoId, localId, servicoId, equiptoId, data, /*hora,*/ titulo, /*descricao,*/ statusId } = req.body;
  const personalId = req.user.personalId;
  console.log("agenda_id", agenda_id);
  console.log("data", data);

  const dataHora = new Date(req.body.data);

  // Adiciona 3 horas (10800000 ms)
  const dataCorrigida = new Date(dataHora.getTime() - 0 * 60 * 60 * 1000);
  console.log("dataCorrigida", dataCorrigida);
  //const isProd = process.env.NODE_ENV === 'production'
  //const dataCorrigida = isProd
  //? new Date(dataHora.getTime() - 3 * 60 * 60 * 1000)
  //: new Date(dataHora.getTime());



  // UPDATE
  try {
    //const result = await pool.query(`
    //  UPDATE Agendas SET
    //    AgPersonalID = $1, AgAlunoid = $2, AgLocalID = $3, AgData = $4, Agenda = $5, AgStatus = $6
    //  WHERE Agenda_ID = $7`,
    //  [personalId, alunoId, localId, dataCorrigida, titulo, statusId, agenda_id]);
    //res.status(201).json(result.rows[0]);
    const agenda = await sql`
      UPDATE Agendas SET
        AgPersonalID = ${personalId}, AgAlunoid = ${alunoId}, AgLocalID = ${localId}, AgServicoID = ${servicoId},
        AgEquiptoID = ${equiptoId}, AgData = ${dataCorrigida}, Agenda = ${titulo}, AgStatus = ${statusId}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agenda)
    } catch (err) {
      console.error('Erro ao atualizar agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar agenda' });
    }
});

app.put('/api/agendaStatus', authenticateToken, async (req, res) => {
  const { agenda_id, alunoId, localId, data, /*hora,*/ titulo, /*descricao,*/ statusId } = req.body;

  //console.log("req",req);
  //console.log("agenda_id",agenda_id);
  //console.log("status", statusId);

  // UPDATE
  try {
    //const result = await pool.query(`
    //  UPDATE Agendas SET AgStatus = $1
    //  WHERE Agenda_ID = $2`,
    //  [statusId, agenda_id]);
    //res.status(201).json(result.rows[0]);
    const agendaStatus = await sql`
          UPDATE Agendas SET AgStatus = ${statusId}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agendaStatus[0]);
    } catch (err) {
      console.error('Erro ao atualizar status da agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar status da agenda' });
    }
});

app.post('/api/agendaGerar', authenticateToken, async (req, res) => {
  const personalId = req.user.personalId;
  const {data_inicio, data_fim} = req.body;

  console.error('personalId:', personalId);
  console.error('data_inicio:', data_inicio);
  console.error('data_fim:', data_fim);
  try {
    await sql`DELETE FROM Agendas WHERE AgPersonalID=${personalId} AND AgData>=${data_inicio} AND AgData<=${data_fim} AND AgStatus IN(1,3); /*Pedente ou Cancelado*/`;
  } catch (err) {
    console.error('Erro ao apagar agenda do mês:', err);
    res.status(500).json({ error: 'Erro ao apagar agenda' });
  }

  try {
    const agenda = await sql`
    INSERT INTO Agendas(Agenda, AgPersonalID, AgAlunoID, AgLocalID, AgServicoID, AgEquiptoID, AgData, AgStatus) --ON CONFLICT DO NOTHING
    SELECT 'Teste', ${personalId}, AlunoID, LocalID, ServicoID, EquiptoID, datahora + interval '3 hour', 1 FROM h2ugetagendaEquipto(${data_inicio}, ${data_fim}, ${personalId})
    ON CONFLICT DO NOTHING
    RETURNING *`;
    res.status(201).json(agenda);
  } catch (err) {
    console.error('Erro ao gerar agenda do mês:', err);
    res.status(500).json({ error: 'Erro ao inserir agenda' });
  }

});

app.post('/api/agendaPorPeriodo', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda");
    const personalId = req.user.personalId;
    const {data_inicio, data_fim} = req.body;
    console.log("data_inicio: ", data_inicio);
    console.log("data_fim: ", data_fim);
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalId} AND Date>=${data_inicio} AND Date <=${data_fim}`;
    res.json(agendas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});

app.post('/api/agendas', authenticateToken, async (req, res) => {
  const { alunoId, localId, servicoId, equiptoId, data, /*hora,*/ titulo, /*descricao,*/ statusId } = req.body;
  const personalId = req.user.personalId;

  //console.log(req);
  console.log(req.user.email);
  console.log(req.user.personalId);
    

  const dataHora = new Date(req.body.data);

  // Adiciona 3 horas (10800000 ms)
//  const dataCorrigida = new Date(dataHora.getTime() - 0 * 60 * 60 * 1000);
  
  // Exemplo: dataHora é '2025-06-02T08:30' vinda do frontend
//const dataHoraLocal = dayjs.tz(dataHora, 'America/Sao_Paulo');

// Transforma para UTC antes de salvar no banco
//const dataCorrigida = dataHoraLocal.utc().toDate();

const dataCorrigida = dayjs(req.body.data).tz('America/Sao_Paulo').utc().toDate();
console.log("req.body.data", req.body.data);
console.log("dataCorrigida", dataCorrigida);
  try {
    //const result = await pool.query(
    //  `INSERT INTO agendas (AgPersonalID, AgAlunoid, AgLocalID, AgData, Agenda, AgStatus)
    //  VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    //  [personalId, alunoId, localId, dataCorrigida, titulo, statusId ]
    //);
    //res.status(201).json(result.rows[0]);
    const agenda = await sql`
      INSERT INTO agendas (AgPersonalID, AgAlunoid, AgLocalID, AgServicoID, AgEquiptoID, AgData, Agenda, AgStatus)
      VALUES (${personalId}, ${alunoId}, ${localId}, ${servicoId}, ${equiptoId}, ${dataCorrigida}, ${titulo}, ${statusId}) RETURNING *`;
    res.status(201).json(agenda);
  } catch (err) {
    console.error('Erro ao inserir agenda:', err);
    res.status(500).json({ error: 'Erro ao inserir agenda' });
  }

  });

/*
Rota: POST /api/register-aluno

Espera no body:

{
  "email": "aluno@email.com",
  "senha": "123456",
  "codigoConvite": "G7X2L9AB"
}

*/

// Endpoint para registrar um usuário
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
    await pool.query(query, [email, password]);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Cadastro Personal
app.post('/api/cadastro-personal', async (req, res) => {
const { nome, email, usuario, senha } = req.body;
const tipousuario = 2;
console.log("req.body", req.body);
console.log("nome", nome);
console.log("email", email);
console.log("usuario", usuario);
console.log("senha", senha);

  try {
    const user = await sql`
      INSERT INTO users (username, email, password, tipo_usuario)
      VALUES (${usuario}, ${email}, crypt(${senha}, gen_salt('bf', 8)), ${tipousuario})
      RETURNING *`; 
    const userid  = user[0].id;
    //res.json("userid:", userid);

    console.log("userid", userid);

    const personal = await sql`
      INSERT INTO Personals(Personal, PerEmail, PerUserID)
      VALUES (${nome}, ${email}, ${userid})
      RETURNING *`; 
    res.json({personalid: personal[0].personal_id});

    /*
    console.log('Retornando novo user:', {
      id: aluno[0].aluno_id,
      nome: aluno[0].aluno,
      telefone: aluno[0].alufone,
      codigo_convite: aluno[0].alucodconvite
    });*/
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar Personal' });
  }

});

// Cadastro Aluno com código de convite
app.post('/cadastro-aluno', async (req, res) => {
  const { nome, email, username, password, codigoConvite } = req.body;

  const alunoPend = await db('alunosPendentes')
    .where({ codigo_convite: codigoConvite })
    .first();

  if (!alunoPend) {
    return res.status(400).send({ message: 'Código de convite inválido' });
  }

  // Cadastrar aluno vinculado ao Personal
  await db('alunos').insert({
    nome,
    email,
    username,
    password_hash: await hash(password),
    personal_id: alunoPend.personal_id
  });

  // Opcional: remover código de convite usado
  await db('alunosPendentes').where({ id: alunoPend.id }).del();

  res.status(201).send({ ok: true });
});