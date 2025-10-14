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

app.get('/api/forcarlogin', authenticateToken, async (req, res) => {
  try {
    const userid = req.user.userid;
    const result = await sql`SELECT forcarlogin as 'forcarLogin' FROM users WHERE id = ${userid}`;

    const forcarLogin = false

    if (result.length > 0) {
      forcarLogin = result[0].forcarLogin;
    }

    res.json(forcarLogin);

  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar personals');
  }    
});

app.post('/api/refresh', async (req, res) => {
  const refreshToken = req.headers['authorization']?.split(' ')[1];
  if (!refreshToken) return res.sendStatus(401).json({ error: 'Token ausente' });

  try {
    const decoded = jwt.verify(refreshToken, SECRET_KEY, { ignoreExpiration: true });

    const userid = decoded.userid;
    const email = decoded.email;
    const tipo = decoded.tipo;
    const personalid = decoded.personalid;
    const alunoid = decoded.alunoid;

    //console.log(userid);
    const user = await sql`SELECT forcarlogin as "forcarLogin" FROM users WHERE id = ${userid}`;
    //console.log("user:");
    //console.log(user);
    if (!user) return res.sendStatus(404);

    // Checa o campo forcarLogin
    if (user[0].forcarLogin) {
      // Zera o campo, se quiser que só force uma vez
      await sql`UPDATE Users SET forcarlogin = false WHERE id = ${userid}`; 
      return res.status(401).json({ error: 'Login obrigatório' });
    }

    const token = jwt.sign(
      { email: email, tipo: tipo, personalid: personalid, alunoid: alunoid, userid: userid },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.log("saiu pelo catch");
    return res.sendStatus(403);
  }
});


// Endpoint para autenticar login
app.post('/api/login', async (req, res) => {
  const email = req.body.email?.trim().toUpperCase();
  const password = req.body.password;
//console.log("email", email);
//console.log("password", password);
  try {
    const query = 'SELECT id, password, tipo_usuario, forcarlogin FROM users WHERE username = $1';
    //    const result = await pool.query(query, [username]);

    /*supabase*/
     const result = await sql`SELECT id, password, tipo_usuario, forcarlogin FROM users WHERE UPPER(email) = ${email}`;

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
        const userid = result[0].id;
        const tipo = result[0].tipo_usuario;
        let personalid = null;
        let alunoid = null;

        if (tipo == 2) {
          //const resPersonal = await pool.query('SELECT personal_id id FROM personals WHERE peruserid = $1', [userid]);
          const resPersonal = await sql`SELECT personal_id FROM personals WHERE peruserid = ${userid}`;
          personalid = resPersonal[0]?.personal_id ?? null;
        } else if (tipo ==3) {
          const resAluno = await sql`SELECT aluno_id FROM alunos WHERE aluuserid = ${userid}`;
          const alunoid = resAluno[0]?.aluno_id ?? null;
        }

        // Gera o token JWT com informações do usuário
        const token = jwt.sign({ email, tipo, personalid, alunoid, userid }, SECRET_KEY, { expiresIn: '1h' });
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

/*----------------------------------------------------------*/
app.get('/api/localLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega locais");
    const personalid = req.user.personalid;
    const local = await sql`SELECT Local_ID id, Local nome, LocEndereco endereco, LocAtivo ativo FROM Locals WHERE LocPersonalID = ${personalid}`;
    res.json(local);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar locais');
  }
});

app.get('/api/equiptoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega equiptos");
    const personalid = req.user.personalid;
    const equipto = await sql`SELECT Equipto_ID id, Equipto nome, EqOrdem ordem, EqAtivo ativo FROM Equiptos WHERE EqPersonalID = ${personalid}`;
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
  const personalid = req.user.personalid;

  const {id, nome, ordem, ativo} = req.body;

  try {
    const equipto = await sql`
      INSERT INTO Equiptos (equipto, EqOrdem, EqAtivo, EqPersonalID)
      VALUES (${nome}, ${ordem}, ${ativo}, ${personalid})
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

app.post('/api/recebimentoAlunoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega RecebimentoAlunoLista");
    const personalid = req.user.personalid;
    if (typeof req.body[`alunoid`] === 'undefined') {
      req.body[`alunoid`] = null;
    } 
    const {alunoid, ano} = req.body;
    console.log("alunoid: ", alunoid);
    console.log("ano: ", ano);

    const recebimento = await sql`SELECT *
      FROM h2urecebimentoslista
      WHERE personalid = ${personalid} AND EXTRACT(YEAR FROM datavcto)=${ano} AND alunoid=${alunoid} 
      ORDER BY aluno, datavcto`;
    res.json(recebimento);
    //console.log(result.rows); // apenas isso para logar
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar recebimento');
  }
});

app.post('/api/recebimentoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega RecebimentoLista");
    const personalid = req.user.personalid;
    const {ano, mes1a12} = req.body;

    console.log("ano: ", ano);
    console.log("mes1a12: ", mes1a12);


    const recebimento = await sql`SELECT *
      FROM h2urecebimentoslista
      WHERE personalid = ${personalid} AND EXTRACT(YEAR FROM datavcto)=${ano} AND EXTRACT(MONTH FROM datavcto) =${mes1a12} 
      ORDER BY aluno, datavcto`;
    res.json(recebimento);
    //console.log(result.rows); // apenas isso para logar
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar recebimento');
  }
});
/*
        id: this.data?.recebimento?.id ?? null,
        alunoid: this.alunoSelecionado?.id,
        datavcto: formValue.datavcto,
        datarcto: formValue.datarcto,
        valor: formValue.valor,
        formapagtoid: formValue.formapagtoid,
        statusid: formValue.statusid,*/


app.post('/api/recebimentoInsert', authenticateToken, async (req, res) => {
  
  const personalid = req.user.personalid;

  // tratamento local indefinido
  if (typeof req.body[`formapagtoid`] === 'undefined') {
    req.body[`formapagtoid`] = null;
  }
  // tratamento serviço indefinido
  if (typeof req.body[`statusid`] === 'undefined') {
    req.body[`statusid`] = null;
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {alunoid, datavcto, datarcto, valor, formapagtoid, statusid } = req.body;

  //console.error('req.body:', req.body);

  try {
    const recebimento = await sql`
      INSERT INTO recebimentos (recpersonalid, recalunoid, recvalor, recdatavcto, recdatareceb, recformapagtoid, recstatus)
      VALUES (${personalid}, ${alunoid}, ${valor}, ${datavcto}, ${datarcto}, ${formapagtoid}, ${statusid} )
      RETURNING *`; 
    res.json({
      id: recebimento[0].recebimento_id
    });
    console.log('Retornando novo recebimento:', {
      id: recebimento[0].recebimento_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar recebimento' });
  }
});


app.put('/api/recebimentoSave', authenticateToken, async (req, res) => {


  // tratamento local indefinido
  if (typeof req.body[`formapagtoid`] === 'undefined') {
    req.body[`formapagtoid`] = null;
  }
  // tratamento serviço indefinido
  if (typeof req.body[`statusid`] === 'undefined') {
    req.body[`statusid`] = null;
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {id, alunoid, datavcto, datarcto, valor, formapagtoid, statusid } = req.body;
  
  // UPDATE
  try {
    const recebimento = await sql`
      UPDATE recebimentos SET recalunoid=${alunoid}, recvalor=${valor}, recdatavcto=${datavcto}, 
                              recdatareceb=${datarcto}, recformapagtoid=${formapagtoid}, recstatus=${statusid}
       WHERE recebimento_ID = ${id}
      RETURNING *
    `;    
    res.status(201).json(recebimento);
    } catch (err) {
      console.error('Erro ao atualizar recebimento:', err);
      res.status(500).json({ error: 'Erro ao atualizar recebimento' });
    }
});

app.get('/api/alunoPlanoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega AlunoPlanoLista");
    const personalid = req.user.personalid;

    const tabPreco = await sql`SELECT *
      FROM h2ualunoplanolista
      WHERE personalid = ${personalid}
      ORDER BY aluno, dataini`;
    res.json(tabPreco);
    //console.log(result.rows); // apenas isso para logar
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar tabela preços');
  }
});


app.post('/api/alunoPlanoInsert', authenticateToken, async (req, res) => {
  
  const personalid = req.user.personalid;

  // tratamento local indefinido
  if (typeof req.body[`localid`] === 'undefined') {
    req.body[`localid`] = null;
  }
  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    req.body[`servicoid`] = null;
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {alunoid, dataini, datafim, planoid, frequenciaid, valortabela, valordesconto, valorreceber, diavcto, formapagtoid } = req.body;

  //console.error('req.body:', req.body);

  try {
    const alunoPlano = await sql`
      INSERT INTO alunosplanos (appersonalid, apalunoid, applanoid, apfrequenciaid, /*aptabprecoid,*/ apdataini, apdatafim,
	                           apvalortabela, apvalordesconto, apvalorreceber, apdiavcto, apformapagtoid, apstatus)
      VALUES (${personalid}, ${alunoid}, ${planoid}, ${frequenciaid}, ${dataini}, ${datafim}, ${valortabela},
              ${valordesconto}, ${valorreceber}, ${diavcto}, ${formapagtoid}, 1 /*ativo*/ )
      RETURNING *`; 
    res.json({
      id: alunoPlano[0].alunosplano_id
    });
    console.log('Retornando novo alunoPlano:', {
      id: alunoPlano[0].alunosplano_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar alunoPlano' });
  }
});

app.post('/api/precoTabela', authenticateToken, async (req, res) => {
  try {
    console.log("carrega tabelaPrecos");
    const personalid = req.user.personalid;
    const {alunoid, planoid, frequenciaid} = req.body;
console.log("personalid", personalid);
console.log("alunoid", alunoid);
console.log("planoid", planoid);
console.log("frequenciaid", frequenciaid);


    const tabPreco = await sql`SELECT h2ugetprecotabela(${personalid}, ${alunoid}, ${planoid}, ${frequenciaid}) AS "valorTabela"`;
    res.json(tabPreco);
    //console.log(result.rows); // apenas isso para logar
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar tabela preços');
  }
});

app.get('/api/tabelaPrecoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega tabelaPrecos");
    const personalid = req.user.personalid;

    const tabPreco = await sql`SELECT tabpreco_id AS "id", tppersonalid AS "personalid", 
                  tpservicoid AS "servicoid", (SELECT Servico FROM Servicos WHERE Servico_ID=tpservicoid) AS servico,
                  tplocalid AS "localid", (SELECT Local FROM Locals WHERE Local_ID=tplocalid) AS local,
                  tpplanoid AS "planoid", public.h2ugetplano(tpplanoid) AS "plano",
                  tpfrequenciaid AS "frequenciaid", public.h2ugetfrequencia(tpfrequenciaid) AS "frequencia",
                  tpvalor AS "valor", tpativo AS "ativo"
      FROM TabPrecos
      WHERE TPPersonalID = ${personalid}
      ORDER BY tabpreco_id`;
    res.json(tabPreco);
    //console.log(result.rows); // apenas isso para logar
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar tabela preços');
  }
});


app.post('/api/tabelaPrecoInsert', authenticateToken, async (req, res) => {
  
  const personalid = req.user.personalid;

  // tratamento local indefinido
  if (typeof req.body[`localid`] === 'undefined') {
    req.body[`localid`] = null;
  }
  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    req.body[`servicoid`] = null;
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {id, planoid, frequenciaid, valor, localid, servicoid, ativo } = req.body;

  //console.error('req.body:', req.body);

  try {
    const tabelaPreco = await sql`
      INSERT INTO TabPrecos (tpplanoid, tpfrequenciaid, tplocalid, tpservicoid, tpvalor, tpativo, tppersonalid)
      VALUES (${planoid}, ${frequenciaid}, ${localid}, ${servicoid}, ${valor}, ${ativo}, ${personalid})
      RETURNING *`; 
    res.json({
      id: tabelaPreco[0].tabPreco_id
    });
    console.log('Retornando novo tab preço:', {
      id: tabelaPreco[0].tabPreco_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar tabela preço' });
  }
});


app.put('/api/tabelaPrecoSave', authenticateToken, async (req, res) => {

  // tratamento local indefinido
  if (typeof req.body[`localid`] === 'undefined') {
    req.body[`localid`] = null;
  }

  const {id, planoid, frequenciaid, valor, localid, servicoid, ativo } = req.body;

  // UPDATE
  try {
    const tabelaPreco = await sql`
      UPDATE TabPrecos SET
       tpplanoid = ${planoid}, tpfrequenciaid = ${frequenciaid}, tplocalid = ${localid}, tpservicoid = ${servicoid}, tpvalor = ${valor},
       tpativo = ${ativo}
       WHERE tabPreco_ID = ${id}
      RETURNING *
    `;    
    res.status(201).json(tabelaPreco);
    } catch (err) {
      console.error('Erro ao atualizar tabelaPreco:', err);
      res.status(500).json({ error: 'Erro ao atualizar tabelaPreco' });
    }
});

app.get('/api/alunoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega alunos");
    const personalid = req.user.personalid;

    const aluno = await sql`SELECT * FROM h2ualunolista
      WHERE personalid = ${personalid}
      ORDER BY nome`;
    res.json(aluno);
    //console.log(result.rows); // apenas isso para logar
    // não usar res.json(result.rows);    // envia resposta corretamente uma única vez
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar alunos');
  }
});


app.put('/api/alunoSave', authenticateToken, async (req, res) => {

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
    id, nome, telefone, datanasc, datainicio, cpf, email, ativo,
    aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6,
    aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6,
    planoid, frequenciaid, localid, servicoid
  } = req.body;

  console.log("id",id);
  console.log("nome",nome);
  console.log("telefone",telefone);
  console.log("localid",localid);
  console.log("servicoid",servicoid);
  console.log("datainicio",datainicio);

  // UPDATE
  try {
    const aluno = await sql`
      UPDATE Alunos SET
       Aluno = ${nome}, AluCPF = ${cpf}, AluDataNasc = ${datanasc}, AluDataInicio = ${datainicio}, AluEmail = ${email},
       AluAtivo = ${ativo}, alufone = ${telefone}, alulocalid = ${localid}, aluservicoid = ${servicoid},
       aludia0 = ${aludia0}, aludia1 = ${aludia1}, aludia2 = ${aludia2}, aludia3 = ${aludia3}, aludia4 = ${aludia4}, aludia5 = ${aludia5}, aludia6 = ${aludia6},
       aluhora0 = ${aluhora0}, aluhora1 = ${aluhora1}, aluhora2 = ${aluhora2}, aluhora3 = ${aluhora3}, aluhora4 = ${aluhora4}, aluhora5 = ${aluhora5}, aluhora6 = ${aluhora6},
       aluplanoid = ${planoid}, alufrequenciaid = ${frequenciaid}
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
  
  const personalid = req.user.personalid;
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
  // tratamento local indefinido
  if (typeof req.body[`localid`] === 'undefined') {
    req.body[`localid`] = null;
  }
  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    req.body[`servicoid`] = null;
  }

  // tratamento data inicio indefinido
  if (typeof req.body[`datainicio`] === 'undefined') {
    req.body[`datainicio`] = new Date();
  }

  // tratamento data inicio sem preencer
  if (req.body[`datainicio`] == null) {
    req.body[`datainicio`] = new Date();
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {
    id, nome, telefone, datanasc, datainicio, cpf, email, ativo,
    aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6,
    aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6, localid, servicoid,
    planoid, frequenciaid
  } = req.body;

  //console.error('req.body:', req.body);

  try {
    const aluno = await sql`
      INSERT INTO Alunos (aluno, AluCPF, AluDataNasc, AluDataInicio, AluEmail, AluAtivo, alufone, alupersonalid, alucodconvite, alulocalid, aluservicoid,
      aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6, aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6, aluplanoid, alufrequenciaid)
      VALUES (${nome}, ${cpf}, ${datanasc}, ${datainicio}, ${email}, ${ativo}, ${telefone}, ${personalid}, ${codigoConvite}, ${localid}, ${servicoid},
      ${aludia0}, ${aludia1}, ${aludia2}, ${aludia3}, ${aludia4}, ${aludia5}, ${aludia6},
      ${aluhora0}, ${aluhora1}, ${aluhora2}, ${aluhora3}, ${aluhora4}, ${aluhora5}, ${aluhora6}, ${planoid}, ${frequenciaid})
      RETURNING *`; 
    res.json({
      id: aluno[0].aluno_id,                         // <- compatível com this.form.patchValue({ alunoid: novoAluno.id });
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
  const personalid = req.user.personalid;

  const {id, nome, endereco, ativo} = req.body;

  try {
    const local = await sql`
      INSERT INTO Locals (local, LocEndereco, LocAtivo, LocPersonalID)
      VALUES (${nome}, ${endereco}, ${ativo}, ${personalid})
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

app.get('/api/agendas', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda");
    const personalid = req.user.personalid;
    //const compareQuery = `SELECT * FROM agendaslista WHERE PersonalID=$1`;
    //const result = await pool.query(compareQuery, [personalid]);      
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalid}`;
    res.json(agendas);
    //console.log(result.rows); // apenas isso para logar
    // não usar res.json(result.rows);    // envia resposta corretamente uma única vez
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});

app.put('/api/anamneseSave', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  const {id, dataAnamnese, titulo, peso, altura, idade, objetivo, principalRecl, alimentacao, historicosaude, fatoresrisco, medicamentos, sono, descricao} = req.body;
console.log('id', id);
console.log('andata', dataAnamnese);
console.log('antitulo', titulo);
console.log('andescricao', descricao);
console.log('anidade', idade);
console.log('anpeso', peso);
console.log('anobjetivo', objetivo);
console.log('principalRecl', principalRecl);
  try {
    const anamnese = await sql`
      UPDATE Anamneses SET andata = ${dataAnamnese},
            antitulo = ${titulo},
            andescricao = ${descricao}, 
            anidade = ${idade} ,
            anpeso = ${peso}, 
            analtura = ${altura},
            anobjetivo = ${objetivo},
            anprincipalrecl = ${principalRecl},
            analimentacao = ${alimentacao},
            anhistoricosaude = ${historicosaude},
            anfatoresrisco = ${fatoresrisco},
            anmedicamentos = ${medicamentos},
            ansono = ${sono}
      WHERE Anamnese_ID = ${id}
       RETURNING *`; 
      res.status(201).json(anamnese);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao atualizar anamnese' });
   }
});

app.post('/api/anamneseInsert', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  const {alunoid, dataAnamnese, titulo, peso, altura, idade, objetivo, principalRecl,
          alimentacao, historicosaude, fatoresrisco, medicamentos, sono, descricao} = req.body;

  try {
    const anamnese = await sql`
      INSERT INTO Anamneses (andata, antitulo, andescricao, anidade, anpeso, analtura, anobjetivo, anprincipalrecl,
                  analimentacao, anhistoricosaude, anfatoresrisco, anmedicamentos, ansono, anPersonalID, anAlunoID)
      VALUES (${dataAnamnese}, ${titulo}, ${descricao}, ${idade}, ${peso}, ${altura}, ${objetivo}, ${principalRecl},
                  ${alimentacao}, ${historicosaude}, ${fatoresrisco}, ${medicamentos}, ${sono},  ${personalid}, ${alunoid})
      RETURNING *`; 
    res.json({
      id: anamnese[0].anamnese_id,
      dataAnamnese: anamnese[0].andata,
      titulo: anamnese[0].antitulo,
      descricao: anamnese[0].andescricao
    });
    console.log('Retornando nova anamnese:', {
      id: anamnese[0].anamnese_id,
      dataAnamnese: anamnese[0].andata,
      titulo: anamnese[0].antitulo,
      descricao: anamnese[0].andescricao
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar anamnese' });
  }
});

app.post('/api/anamnesesLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega anamneses");
    const personalid = req.user.personalid;
    const {alunoid} = req.body;
    const anamneses = await sql`SELECT * FROM anamneseslista WHERE AlunoID = ${alunoid}`;
    res.json(anamneses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar anamneses');
  }
});

app.get('/api/agendaStatus', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda status");
    //const personalid = req.user.personalid;
    //const compareQuery = `SELECT agendastatu_id ID, agendastatu Status, agcor Cor FROM AgendaStatus`;
    //const result = await pool.query(compareQuery, null /*[personalid]*/);      
    const agendaStatus = await sql`SELECT agendastatu_id ID, agendastatu Status, agcor Cor FROM AgendaStatus`;
    res.json(agendaStatus);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas status');
  }
});

app.get('/api/alunos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    //const compareQuery = `SELECT aluno_id id, aluno nome, alufone telefone, alucodconvite codigo_convite FROM alunos WHERE AluPersonalID=$1`;
    //const result = await pool.query(compareQuery, [personalid]);      
    const alunos = await sql`SELECT aluno_id id, aluno nome, alufone telefone, alucodconvite codigo_convite,
                                    aludia0, aludia1, aludia2, aludia3, aludia4, aludia5, aludia6, alulocalid,
                                    aluhora0, aluhora1, aluhora2, aluhora3, aluhora4, aluhora5, aluhora6, 
                                    CASE WHEN aluservicoid=2 THEN true ELSE false END AS "mostrarEquipto", 
                                    aluplanoid as planoid, alufrequenciaid as frequenciaid,
                                    AluServicoID AS "servicoid", (SELECT Servico FROM Servicos WHERE Servico_ID=AluServicoID) AS "servico"
      FROM alunos WHERE AluPersonalID=${personalid} AND AluAtivo = true
      ORDER BY aluno`;
    res.json(alunos);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar alunos');
  }
});

app.get('/api/locals', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    //const compareQuery = `SELECT local_id id, local nome, locendereco endereco FROM locals WHERE LocPersonalID=$1`;
    //const result = await pool.query(compareQuery, [personalid]);      
    const locals = await sql`SELECT local_id id, local nome, locendereco endereco FROM locals WHERE LocPersonalID=${personalid} AND LocAtivo = true`;
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
    const personalid = req.user.personalid;
    const equiptos = await sql`SELECT equipto_id id, equipto nome FROM equiptos WHERE eqativo = true`;
    res.json(equiptos);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar equiptos');
  }
});

app.get('/api/servicos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const servicos = await sql`SELECT servico_id id, servico nome, sevalor valor, COALESCE(setemequipto,false) as temequipto, seativo ativo
                                 FROM servicos WHERE Servico_ID IN(SELECT PSServicoID FROM PersonalsServicos
                               WHERE PSPersonalID=${personalid}) AND SeAtivo = true`;
    res.json(servicos);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar locals');
  }
});

app.get('/api/configuracoes', authenticateToken, async (req, res) => {
  try {
     const personalid = req.user.personalid;
    //const compareQuery = `SELECT personal_id id, personal nome,
    //                             dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos
    //   FROM Personals WHERE Personal_ID=$1`;
    //const result = await pool.query(compareQuery, [personalid]);    
    const result = await sql`SELECT personal_id id, personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim,
       intervalo_minutos, mostrarLocal, mostrarServico, mostrarEquipto FROM Personals WHERE Personal_ID = ${personalid}`;

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
    const result = await sql`SELECT id, nome FROM (SELECT DISTINCT Servico_id id, Servico nome, CAST(CASE WHEN PSServicoID IS NOT NULL THEN ' ' ELSE '' END AS VARCHAR) || Servico AS "ordem"
    FROM Servicos 
      LEFT JOIN PersonalsServicos ON PSServicoID=Servico_ID
    WHERE seativo = true) X
    ORDER BY X.ordem  `;
    res.json(result);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar serviços');
  }    
});

app.get('/api/personals/me/configuracoesServicos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const result = await sql`SELECT PSServicoID ServicoID FROM PersonalsServicos WHERE PSPersonalID=${personalid}`;
    res.json(result.map(r => r.servicoid));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar serviços');
  }    
});

app.post('/api/personals/me/configuracoesServicos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const servicosIds = req.body; // array de IDs

    await sql`DELETE FROM PersonalsServicos WHERE PSPersonalID = ${personalid}`;

    // Insere novos serviços (se houver)
    if (servicosIds && servicosIds.length > 0) {
      await Promise.all(
        servicosIds.map(id => 
          sql`INSERT INTO PersonalsServicos (pspersonalid, psservicoid) VALUES (${personalid}, ${id})`
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
     const personalid = req.user.personalid;
    const compareQuery = `SELECT personal_id id, personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6,
                                 hora_inicio, hora_fim, intervalo_minutos, mostrarLocal, mostrarServico, mostrarEquipto,
                                 CASE WHEN (SELECT COUNT(*) FROM PersonalsServicos WHERE pspersonalid=Personal_ID) = 1 
                                      THEN (SELECT PSServicoID FROM PersonalsServicos WHERE pspersonalid=Personal_ID) 
                                      ELSE null
                                 END AS "servicoid"
       FROM Personals WHERE Personal_ID=$1`;
    const result = await pool.query(compareQuery, [personalid]);    

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
     const personalid = req.user.personalid;

    //const compareQuery = `SELECT personal_id id, personal nome,  dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos FROM Personals WHERE Personal_ID=$1`;
    //const result = await pool.query(compareQuery, [personalid]);    
    //res.json(result.rows);

    const result = await sql`SELECT personal_id AS "id", personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim,
                                    intervalo_minutos, mostrarLocal AS "mostrarLocal", mostrarServico AS "mostrarServico", mostrarEquipto AS "mostrarEquipto",
                                    CASE WHEN (SELECT COUNT(*) FROM PersonalsServicos WHERE pspersonalid=Personal_ID) = 1 
                                         THEN (SELECT PSServicoID FROM PersonalsServicos WHERE pspersonalid=Personal_ID) 
                            	           ELSE null
                                    END AS "servicoid"
         FROM Personals WHERE Personal_ID = ${personalid}`;
    console.log(personalid);
    console.log(result[0]);
    res.json(result[0] ?? {}); 
    console.log(personalid);
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

  // tratamento data inicio indefinido
  if (typeof req.body[`datainicio`] === 'undefined') {
    req.body[`datainicio`] = new Date();
  }

  // tratamento data inicio sem preencer
  if (req.body[`datainicio`] == null) {
    req.body[`datainicio`] = new Date();
  }
  
  const { nome, telefone, datainicio /* personal_id*/ } = req.body;
  const personalid = req.user.personalid;
  const codigoConvite = gerarCodigoConvite();
  //const datainicio = req.user.datainicio;;

  try {

    const aluno = await sql`
      INSERT INTO Alunos (aluno, alufone, aludatainicio, alupersonalid, alucodconvite, AluAtivo)
      VALUES (${nome}, ${telefone}, ${datainicio}, ${personalid}, ${codigoConvite}, true)
      RETURNING *`; 
    res.json({
      id: aluno[0].aluno_id,                         // <- compatível com this.form.patchValue({ alunoid: novoAluno.id });
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
  const personalid = req.user.personalid;

  try {
    //const result = await pool.query(`
    //  INSERT INTO locals (local, locendereco, locpersonalid)
    //  VALUES ($1, $2, $3)
    //  RETURNING local_id, local, locendereco
    //`, [nome, endereco, personalid]);

    const local = await sql`
      INSERT INTO locals (local, locendereco, locpersonalid, locativo)
      VALUES (${nome}, ${endereco}, ${personalid}, true)
      RETURNING *`; 
    res.json({
      id: local[0].local_id,                         // <- compatível com this.form.patchValue({ alunoid: novoAluno.id });
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

    const usuarioid = userResult.rows[0].id;

    // 3. Busca aluno com o código informado
    const alunoResult = await db.query(`
      SELECT aluno_id id FROM Alunos WHERE alucodconvite = $1`, [codigoConvite]);

    if (alunoResult.rows.length === 0) {
      return res.status(400).json({ erro: 'Código de convite inválido' });
    }

    const alunoid = alunoResult.rows[0].id;

    // 4. Faz a associação do usuario_id ao aluno
    await db.query(`
      UPDATE Alunos SET aluuserid = $1 WHERE aluno_id = $2
    `, [usuarioid, alunoid]);

    return res.status(201).json({ sucesso: true, usuario_id: usuarioid });

  } catch (erro) {
    console.error('Erro no registro do aluno:', erro);
    return res.status(500).json({ erro: 'Erro ao registrar o aluno' });
  }
});



app.put('/api/personal/configuracoes', authenticateToken, async (req, res) => {
  const { diasAtendimento, horaInicio, horaFim, intervaloMinutos, mostrarLocal, mostrarServico, mostrarEquipto } = req.body;
  const personalid = req.user.personalid;
  console.log("req.body", req.body);
  try {
    //const result = await pool.query(`
    //  UPDATE Personals SET
    //    dia0=$1, dia1=$2, dia2=$3, dia3=$4, dia4=$5, dia5=$6, dia6=$7, hora_inicio=$8, hora_fim=$9, intervalo_minutos=$10
    //  WHERE Personal_ID = $11`,
    //  [diasAtendimento.includes(0), diasAtendimento.includes(1), diasAtendimento.includes(2), diasAtendimento.includes(3),
    //   diasAtendimento.includes(4), diasAtendimento.includes(5), diasAtendimento.includes(6), horaInicio, horaFim, intervaloMinutos, personalid]);
    //res.status(201).json(result.rows[0]);
    const result = await sql`
      UPDATE Personals SET
       dia0=${diasAtendimento.includes(0)}, dia1=${diasAtendimento.includes(1)}, dia2=${diasAtendimento.includes(2)},
       dia3=${diasAtendimento.includes(3)}, dia4=${diasAtendimento.includes(4)}, dia5=${diasAtendimento.includes(5)},
       dia6=${diasAtendimento.includes(6)}, hora_inicio=${horaInicio}, hora_fim=${horaFim}, intervalo_minutos=${intervaloMinutos},
       mostrarLocal=${mostrarLocal},
       mostrarServico=${mostrarServico},
       mostrarEquipto=${mostrarEquipto}
      WHERE Personal_ID = ${personalid}
      RETURNING *
    `;    
    res.status(201).json(result[0]);
  } catch (erro) {
    console.error('Erro ao atualizar configurações:', erro);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});


app.put('/api/agendasDescricao', authenticateToken, async (req, res) => {
  const { agenda_id, descricao } = req.body;
  const personalid = req.user.personalid;
  console.log("agenda_id", agenda_id);

  try {
    const agenda = await sql`
      UPDATE Agendas SET
        AgDescricao = ${descricao}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agenda)
    } catch (err) {
      console.error('Erro ao atualizar descrição agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar descrição agenda' });
    }
});

app.put('/api/agendas', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  // tratamento equipto indefinido
  if (typeof req.body[`equiptoid`] === 'undefined') {
    req.body[`equiptoid`] = null;
  } 

  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    const resServico = await sql`SELECT COALESCE((SELECT psservicoid FROM PersonalsServicos WHERE pspersonalid= ${personalid} LIMIT 1),23) AS "servicoid"`;
    const servicolid = resServico[0]?.servicoid ?? null;
    req.body[`servicoid`] = servicolid;
  } 

  const { agenda_id, alunoid, localid, servicoid, equiptoid, data, /*hora,*/ /*titulo,*/ /*descricao,*/ statusid } = req.body;
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

    const agenda = await sql`
      UPDATE Agendas SET
        AgPersonalID = ${personalid}, AgAlunoid = ${alunoid}, AgLocalID = ${localid}, AgServicoID = ${servicoid},
        AgEquiptoID = ${equiptoid}, AgData = ${dataCorrigida}, AgStatus = ${statusid}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agenda)
    } catch (err) {
      console.error('Erro ao atualizar agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar agenda' });
    }
});

app.put('/api/agendaStatus', authenticateToken, async (req, res) => {
  const { agenda_id, alunoid, localid, data, /*hora,*/ /*titulo,*/ /*descricao,*/ statusid } = req.body;

  //console.log("req",req);
  //console.log("agenda_id",agenda_id);
  //console.log("status", statusid);

  // UPDATE
  try {
    //const result = await pool.query(`
    //  UPDATE Agendas SET AgStatus = $1
    //  WHERE Agenda_ID = $2`,
    //  [statusid, agenda_id]);
    //res.status(201).json(result.rows[0]);
    const agendaStatus = await sql`
          UPDATE Agendas SET AgStatus = ${statusid}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agendaStatus[0]);
    } catch (err) {
      console.error('Erro ao atualizar status da agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar status da agenda' });
    }
});

app.post('/api/agendaGerar', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  const {data_inicio, data_fim} = req.body;

  console.error('personalid:', personalid);
  console.error('data_inicio:', data_inicio);
  console.error('data_fim:', data_fim);
  try {
    await sql`DELETE FROM Agendas WHERE AgPersonalID=${personalid} AND AgData>=${data_inicio} AND AgData<=${data_fim} AND AgStatus IN(1,3); /*Pedente ou Cancelado*/`;
  } catch (err) {
    console.error('Erro ao apagar agenda do mês:', err);
    res.status(500).json({ error: 'Erro ao apagar agenda' });
  }

  try {
    const agenda = await sql`
    INSERT INTO Agendas(Agenda, AgPersonalID, AgAlunoID, AgLocalID, AgServicoID, AgEquiptoID, AgData, AgStatus) --ON CONFLICT DO NOTHING
    SELECT 'Teste', ${personalid}, AlunoID, LocalID, ServicoID, EquiptoID, datahora + interval '3 hour', 1 FROM h2ugetagendaEquipto(${data_inicio}, ${data_fim}, ${personalid})
    ON CONFLICT DO NOTHING
    RETURNING *`;
    res.status(201).json(agenda);
  } catch (err) {
    console.error('Erro ao gerar agenda do mês:', err);
    res.status(500).json({ error: 'Erro ao inserir agenda' });
  }

});

app.post('/api/agendaAluno', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda do aluno");
    const personalid = req.user.personalid;
    const {alunoid, ano, mes1a12} = req.body;
    console.log("alunoid: ", alunoid);
    console.log("ano: ", ano);
    console.log("mes1a12: ", mes1a12);
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalid} AND AlunoID = ${alunoid} AND EXTRACT(YEAR FROM Date)=${ano} AND EXTRACT(MONTH FROM Date) =${mes1a12} ORDER BY Date`;
    res.json(agendas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});

app.post('/api/agendaPorPeriodo', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda");
    const personalid = req.user.personalid;
    const {data_inicio, data_fim} = req.body;
    console.log("data_inicio: ", data_inicio);
    console.log("data_fim: ", data_fim);
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalid} AND Date>=${data_inicio} AND Date <=${data_fim}`;
    res.json(agendas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});

app.post('/api/agendas', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;

  // tratamento equipto indefinido
  if (typeof req.body[`equiptoid`] === 'undefined') {
    req.body[`equiptoid`] = null;
  } 

  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    const resServico = await sql`SELECT COALESCE((SELECT psservicoid FROM PersonalsServicos WHERE pspersonalid= ${personalid} LIMIT 1),23) AS "servicoid"`;
    const servicolid = resServico[0]?.servicoid ?? null;
    req.body[`servicoid`] = servicolid;
  }    

  const { alunoid, localid, servicoid, equiptoid, data, statusid } = req.body;
  
  console.log("alunoid", alunoid);
  console.log("localid",localid );
  console.log("servicoid", servicoid);
  console.log("equiptoid", equiptoid);
  console.log("data", data);
  console.log("statusid", statusid);
  console.log("personalid", personalid);


  //console.log(req);
  console.log(req.user.email);
  console.log(req.user.personalid);


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
console.log("req.body.data", req.body);
  try {

    const agenda = await sql`
      INSERT INTO agendas (AgPersonalID, AgAlunoid, AgLocalID, AgServicoID, AgEquiptoID, AgData, AgStatus)
      VALUES (${personalid}, ${alunoid}, ${localid}, ${servicoid}, ${equiptoid}, ${dataCorrigida}, ${statusid}) RETURNING *`;
    //  res.status(201).json(agenda[0]);

    // pega o id recém-inserido
    const insertedId = agenda[0].agenda_id;

    // agora busca na view agendaslista o mesmo registro
    const agendaCompleta = await sql`
      SELECT * FROM agendaslista WHERE agenda_id = ${insertedId}`;

    res.status(201).json(agendaCompleta[0]); // retorna já no formato certo da view
        
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