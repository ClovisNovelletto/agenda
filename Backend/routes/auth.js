// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken } from "../middleware/authMiddleware.js";
import { sql } from '../db.js';
import crypto from 'crypto';
import { sendMail } from "../mailer.js";

console.log(">>> auth.js foi carregado!");

const SECRET_KEY =  process.env.JWT_SECRET;
const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL;

// 🔹 Login
// Endpoint para autenticar login
router.post('/login', async (req, res) => {
  console.log("entrou no login");
  const email = req.body.email?.trim().toUpperCase();
  const password = req.body.password;

  try {

    /*supabase*/
    const result = await sql`SELECT id, password, tipo_usuario, forcarlogin, email_verified FROM users WHERE UPPER(email) = ${email}`;
    // Garante compatibilidade: alguns drivers retornam array direto, outros objeto com "rows"
    const rows = result?.rows || result;
    if (!rows || rows.length === 0) { 
      console.log("E-mail não cadastrado.");
      return res.status(400).json({ mensagem: "E-mail não cadastrado." });
    }
    const user = rows[0];
    if (!user) return res.status(400).json({ mensagem: "E-mail não cadastrado." });
    if (!user.email_verified) {
      return res.status(403).json({ mensagem: "Confirme seu e-mail antes de fazer login." });    
    }

    const isMatch = await bcrypt.compare (password, user.password);
    if (isMatch){ //} === (resultSenhaValida[0].is_valid) {      
      console.log("result válido");
      const userid = user.id;
      const tipo = user.tipo_usuario;
      let personalid = null;
      let alunoid = null;

      if (tipo == 2) {
        const resPersonal = await sql`SELECT personal_id FROM personals WHERE peruserid = ${userid}`;
        personalid = resPersonal[0]?.personal_id ?? null;
      } else if (tipo ==3) {
        const resAluno = await sql`SELECT aluno_id FROM alunos WHERE aluuserid = ${userid}`;
        const alunoid = resAluno[0]?.aluno_id ?? null;
      }

      // Gera o token JWT com informações do usuário
      const token = jwt.sign({ email, tipo, personalid, alunoid, userid }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token, mensagem: 'Login bem-sucedido!' });

    } else {
      console.log("primeiro else");
      res.status(401).json({ error: 'Senha incorreta' });
    }
//      res.status(401).json({ sucesso: false, mensagem: 'Login inválido' });
//      res.status(404).json({ error: 'Usuário não encontrado' });
//    }
  } catch (error) {
    console.log("saiu pelo erro");
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

router.post('/refresh', async (req, res) => {
  console.log("entrou no refresh");
  const refreshToken = req.headers['authorization']?.split(' ')[1];
  if (!refreshToken) return res.sendStatus(401).json({ mensagem: 'Token ausente' });

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
      return res.status(401).json({ mensagem: 'Login obrigatório' });
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

router.get('/forcarlogin', authenticateToken, async (req, res) => {
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

// Cadastro Personal
router.post('/cadastro-personal', async (req, res) => {
  const { nome, email, senha } = req.body;
  const tipousuario = 2;
  try {

    /*supabase*/
    const result = await sql`SELECT id FROM users WHERE UPPER(email) = ${email?.trim().toUpperCase()}`;
    // Garante compatibilidade: alguns drivers retornam array direto, outros objeto com "rows"
    const rows = result?.rows || result;
    if (rows.length > 0) { 
      console.log("E-mail já cadastrado.");
      return res.status(400).json({ mensagem: "E-mail já cadastrado." });
    }

    const hashed = await bcrypt.hash(senha, 10);
    const verificationToken = crypto.randomUUID();

    const user = await sql`
      INSERT INTO users (username, email, password, tipo_usuario, email_verified, verification_token)
      VALUES (${nome}, ${email}, ${hashed}, ${tipousuario}, false, ${verificationToken})
      RETURNING *`; 
    const userid  = user[0].id;

    const personal = await sql`
      INSERT INTO Personals(Personal, PerEmail, PerUserID)
      VALUES (${nome}, ${email}, ${userid})
      RETURNING *`; 

    // link de verificação
    const verifyLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

    try {
      await sendMail(
        email,
        "Confirme seu e-mail",
        `<p>Olá ${nome},</p>
        <p>Confirme seu e-mail clicando no link abaixo:</p>
        <a href="${verifyLink}">${verifyLink}</a>`
      );
    } catch (err) {
      console.error('Erro ao enviar e-mail:', err);
      return res.status(500).json({ mensagem: 'Usuário criado, mas falha ao enviar e-mail de confirmação.' });
    }

    // ✅ resposta única
    return res.status(200).json({
      mensagem: "Usuário cadastrado com sucesso. Verifique seu e-mail para confirmar.",
      personalid: personal[0].personal_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar Personal' });
  }

});

// ✅ Verificação de e-mail
router.get('/verify-email', async (req, res) => {

  const { token } = req.query;
  if (!token) return res.status(400).json({ mensagem: 'Token inválido.' });

  const user = await sql`SELECT * FROM users WHERE verification_token = ${token}`;
  if (user.length === 0) return res.status(400).json({ mensagem: 'Token inválido ou expirado.' });

  await sql`UPDATE users SET email_verified = true, verification_token = null WHERE id = ${user[0].id}`;
  res.json({ mensagem: 'E-mail verificado com sucesso!' });
});

// 🔹 Esqueci minha senha (gera token e envia por e-mail)
router.post('/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await sql`SELECT id, username AS nome FROM users WHERE UPPER(email) = UPPER(${email})`;

    const rows = result?.rows || result;


    if (!rows || rows.length === 0) { 
      console.log("E-mail já cadastrado.");
      return res.status(400).json({ mensagem: "E-mail não encontrado." });
    }

    const user = rows[0];
    const token = crypto.randomBytes(20).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await sql`
      UPDATE users SET reset_token = ${token}, reset_token_expiration = ${expira}
      WHERE id = ${user.id}
    `;

    const resetLink = `${FRONTEND_URL}/resetar-senha?token=${token}`;
    await sendMail(
      email,
      "Redefinir senha",
      `<p>Olá ${user.nome},</p>
      <p>Para redefinir sua senha, clique abaixo:</p>
      <a href="${resetLink}">${resetLink}</a>`
    );    


    res.json({ mensagem: 'E-mail enviado para redefinir senha, verifique sua caixa de entrada.' });
  } catch (err) {
    console.error('Erro no esqueci minha senha:', err);
    res.status(500).json({ mensagem: 'Erro ao enviar e-mail de recuperação.' });
  }
});

// 🔹 Redefinir senha
router.post('/resetar-senha', async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    const user = await sql`
      SELECT * FROM users WHERE reset_token = ${token} AND reset_token_expiration > NOW()
    `;
    if (user.length === 0) return res.status(400).json({ mensagem: 'Token inválido ou expirado' });

    const hash = await bcrypt.hash(novaSenha, 10);
    await sql`
      UPDATE users SET password = ${hash}, reset_token = NULL, reset_token_expiration = NULL
      WHERE id = ${user[0].id}
    `;

    res.json({ mensagem: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('Erro no reset de senha:', err);
    res.status(500).json({ mensagem: 'Erro no resetar senha' });
  }
});

// 🔹 Registrar novo personal
router.post('/register_xxx', async (req, res) => {
  try {
    const { nome, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const existe = await sql`SELECT * FROM users WHERE UPPER(email) = UPPER(${email})`;
    if (existe.length > 0) {
      return res.status(400).json({ mensagem: 'E-mail já cadastrado' });
    }

    const novoUser = await sql`
      INSERT INTO users (nome, email, password, tipo_usuario)
      VALUES (${nome}, ${email}, ${hash}, 'personal')
      RETURNING id
    `;

    await sql`
      INSERT INTO personals (user_id, nome)
      VALUES (${novoUser[0].id}, ${nome})
    `;

    res.json({ mensagem: 'Conta criada com sucesso!' });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ mensagem: 'Erro interno' });
  }
});

// 🔹 Registrar novo aluno
router.post('/register-aluno', authenticateToken, async (req, res) => {
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


// Endpoint para registrar um usuário
router.post('/register_xxx', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = 'INSERT INTO users (username, password) VALUES ($1, $2)';
    await pool.query(query, [email, password]);
    res.status(201).json({ mensagem: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

export default router;
