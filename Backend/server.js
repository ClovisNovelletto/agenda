import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pkg from 'pg'; // Usar o export padrão do pg
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

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

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

/*
// Configuração da conexão com PostgreSQL
const pool = new Pool({
  user: 'postgres', // Substitua pelo seu usuário do banco
  host: 'localhost',
  database: 'Pilates', // O nome do banco que você criou
  password: 'sabro123', // Substitua pela sua senha
  port: 5432, // Porta padrão do PostgreSQL
});*/



console.log(__dirname);
//__dirname = "../frontend/";
//const caminhoDist = "C:\\Users\\clovi\\OneDrive\\Documentos\\Meus\\PUC\\pilates\\frontend";
const caminhoDist = "C:/Users/clovi/OneDrive/Documentos/Meus/PUC/pilates/frontend";
const distPath = path.join(caminhoDist, 'dist/pilates');
const distPathIndex = path.join(caminhoDist, 'dist/pilates/browser/index.html');

console.log(caminhoDist);
console.log(distPath);
console.log(distPathIndex);

app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});



// Endpoint para registrar um usuário
app.post('/api/register', async (req, res) => {
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
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT id, password, tipo_usuario FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    console.log(query);
    console.log(result);
    if (result.rows.length > 0) {
      const storedHash = result.rows[0].password;
      console.log(password);
      console.log(storedHash);
      const compareQuery = `SELECT crypt($1, $2) = $2 AS is_valid`;
      const compareResult = await pool.query(compareQuery, [password, storedHash]);
console.log(compareResult)
      if (compareResult.rows[0].is_valid) {
        // tratamento para pegar personal ou aluno
        const userId = result.rows[0].id;
        const tipo = result.rows[0].tipo_usuario;
console.log(result);
console.log(userId);
console.log(tipo);
        let personalId = null;
        let alunoId = null;

        if (tipo == 2) {
          const resPersonal = await pool.query('SELECT personal_id id FROM personals WHERE peruserid = $1', [userId]);
          personalId = resPersonal.rows[0]?.id ?? null;
        } else if (tipo ==3) {
          const resAluno = await pool.query('SELECT aluno_id id FROM alunos WHERE aluuserid = $1', [userId]);
          alunoId = resAluno.rows[0]?.id ?? null;
        }

        // Gera o token JWT com informações do usuário
        const token = jwt.sign({ username, tipo, personalId, alunoId  }, SECRET_KEY, { expiresIn: '1h' });
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

/*----------------------------------------------------------*/
app.get('/api/agendas', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda");
    const personalId = req.user.personalId;
    const compareQuery = `SELECT * FROM agendaslista WHERE PersonalID=$1`;
    const result = await pool.query(compareQuery, [personalId]);      
    //const result = await pool.query(`SELECT * FROM agendaslista`); 
    res.json(result.rows);
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
    const personalId = req.user.personalId;
    const compareQuery = `SELECT agendastatu_id ID, agendastatu Status, agcor Cor FROM AgendaStatus`;
    const result = await pool.query(compareQuery, null /*[personalId]*/);      
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas status');
  }
});

app.get('/api/alunos', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    const compareQuery = `SELECT aluno_id id, aluno nome, alufone telefone, alucodconvite codigo_convite FROM alunos WHERE AluPersonalID=$1`;
    const result = await pool.query(compareQuery, [personalId]);      
    res.json(result.rows);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar alunos');
  }
});

app.get('/api/locals', authenticateToken, async (req, res) => {
  try {
    const personalId = req.user.personalId;
    const compareQuery = `SELECT local_id id, local nome, locendereco endereco FROM locals WHERE LocPersonalID=$1`;
    const result = await pool.query(compareQuery, [personalId]);      
    //const result = await pool.query('SELECT local_id id, local nome, locendereco endereco FROM locals');
    res.json(result.rows);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar locals');
  }
});

app.get('/api/configuracoes', authenticateToken, async (req, res) => {
  try {
     const personalId = req.user.personalId;
    const compareQuery = `SELECT personal_id id, personal nome,
                                 dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos
       FROM Personals WHERE Personal_ID=$1`;
    const result = await pool.query(compareQuery, [personalId]);    

    //const result = await pool.query('SELECT personal_id id, personal nome FROM personals'); 
    res.json(result.rows[0]);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar personals');
  }    
});

app.get('/api/personals', authenticateToken, async (req, res) => {
  try {
     const personalId = req.user.personalId;
    const compareQuery = `SELECT personal_id id, personal nome,
                                 dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos
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
    const compareQuery = `SELECT personal_id id, personal nome,
                                 dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos
       FROM Personals WHERE Personal_ID=$1`;
    const result = await pool.query(compareQuery, [personalId]);    

    //const result = await pool.query('SELECT personal_id id, personal nome FROM personals'); 
    //res.json(result.rows);
    res.json(result.rows[0]);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar personals');
  }    
});

app.get('/api/home', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo home, ${req.user.username}!` });
});

app.get('/api/agenda', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo agenda, ${req.user.username}!` });
});

app.get('/api/financeiro', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo financeiro, ${req.user.username}!` });
});

app.get('/', authenticateToken, (req, res) => {
  res.json({ message: `Bem-vindo ???, ${req.user.username}!` });
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



/*
  try {
    const result = await pool.query(
      `INSERT INTO agendas (AgPersonalID, AgAlunoid, AgLocalID, AgData, Agenda, AgStatus)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [personalId, alunoId, localId, dataCorrigida, titulo, status ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao inserir agenda:', err);
    res.status(500).json({ error: 'Erro ao inserir agenda' });
  }
*/
app.post('/api/alunos', authenticateToken, async (req, res) => {
  const { nome, telefone/* personal_id*/ } = req.body;
  const personalId = req.user.personalId;
  const codigoConvite = gerarCodigoConvite();

  try {
    const result = await pool.query(`
      INSERT INTO Alunos (aluno, alufone, alupersonalid, alucodconvite)
      VALUES ($1, $2, $3, $4)
      RETURNING aluno_id, aluno, alufone, alucodconvite
    `, [nome, telefone, personalId, codigoConvite]);
    res.json({
      id: result.rows[0].aluno_id,                         // <- compatível com this.form.patchValue({ alunoId: novoAluno.id });
      nome: result.rows[0].aluno,                          // <- compatível com this.alunoCtrl.setValue(novoAluno.nome);
      telefone: result.rows[0].alufone,                    // <- opcional, se quiser manter
      codigo_convite: result.rows[0].alucodconvite
    });
    console.log('Retornando novo aluno:', {
      id: result.rows[0].aluno_id,
      nome: result.rows[0].aluno,
      telefone: result.rows[0].alufone,
      codigo_convite: result.rows[0].alucodconvite
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
    const result = await pool.query(`
      INSERT INTO locals (local, locendereco, locpersonalid)
      VALUES ($1, $2, $3)
      RETURNING local_id, local, locendereco
    `, [nome, endereco, personalId]);
    res.json({
      id: result.rows[0].local_id,                         // <- compatível com this.form.patchValue({ alunoId: novoAluno.id });
      nome: result.rows[0].local,                          // <- compatível com this.alunoCtrl.setValue(novoAluno.nome);
      endereco: result.rows[0].locendereco                    // <- opcional, se quiser manter
    });
    console.log('Retornando novo local:', {
      id: result.rows[0].local_id,
      nome: result.rows[0].local,
      endereco: result.rows[0].locendereco
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
  const { diasAtendimento, horaInicio, horaFim, intervaloMinutos } = req.body;
  const personalId = req.user.personalId;
  try {
    const result = await pool.query(`
      UPDATE Personals SET
        dia0=$1, dia1=$2, dia2=$3, dia3=$4, dia4=$5, dia5=$6, dia6=$7, hora_inicio=$8, hora_fim=$9, intervalo_minutos=$10
      WHERE Personal_ID = $11`,
      [diasAtendimento.includes(0), diasAtendimento.includes(1), diasAtendimento.includes(2), diasAtendimento.includes(3),
       diasAtendimento.includes(4), diasAtendimento.includes(5), diasAtendimento.includes(6), horaInicio, horaFim, intervaloMinutos, personalId]);
    res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
});

app.put('/api/agendas', authenticateToken, async (req, res) => {
  const { agenda_id, alunoId, localId, data, /*hora,*/ titulo, /*descricao,*/ status } = req.body;
  const personalId = req.user.personalId;

  console.log("req",req);
  console.log(req.user.username);
  console.log(req.user.personalId);
  console.log("agenda_id", agenda_id);
  console.log("alunoId", alunoId);
  console.log("localId", localId);
  console.log("data", data);

  console.log("req.body.data",req.body.data);

  const dataHora = new Date(req.body.data);

  // Adiciona 3 horas (10800000 ms)
  const dataCorrigida = new Date(dataHora.getTime() - 0 * 60 * 60 * 1000);

  // UPDATE
  try {
    const result = await pool.query(`
      UPDATE Agendas SET
        AgPersonalID = $1, AgAlunoid = $2, AgLocalID = $3, AgData = $4, Agenda = $5, AgStatus = $6
      WHERE Agenda_ID = $7`,
      [personalId, alunoId, localId, dataCorrigida, titulo, status, agenda_id]);
    res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao atualizar agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar agenda' });
    }
});

app.put('/api/agendaStatus', authenticateToken, async (req, res) => {
  const { agenda_id, alunoId, localId, data, /*hora,*/ titulo, /*descricao,*/ statusId } = req.body;

  console.log("req",req);
  console.log("agenda_id",agenda_id);
  console.log("status", statusId);

  // UPDATE
  try {
    const result = await pool.query(`
      UPDATE Agendas SET AgStatus = $1
      WHERE Agenda_ID = $2`,
      [statusId, agenda_id]);
    res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Erro ao atualizar status da agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar status da agenda' });
    }
});

app.post('/api/agendas', authenticateToken, async (req, res) => {
  const { alunoId, localId, data, /*hora,*/ titulo, /*descricao,*/ status } = req.body;
  const personalId = req.user.personalId;

  console.log(req);
  console.log(req.user.username);
  console.log(req.user.personalId);

  const dataHora = new Date(req.body.data);

  // Adiciona 3 horas (10800000 ms)
  const dataCorrigida = new Date(dataHora.getTime() - 0 * 60 * 60 * 1000);

  try {
    const result = await pool.query(
      `INSERT INTO agendas (AgPersonalID, AgAlunoid, AgLocalID, AgData, Agenda, AgStatus)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [personalId, alunoId, localId, dataCorrigida, titulo, status ]
    );
    res.status(201).json(result.rows[0]);
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

