import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> aluno.js !");
const router = express.Router();

function gerarCodigoConvite(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // evita confusões como 0/O e 1/I
  let codigo = '';
  for (let i = 0; i < length; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

router.get('/alunoLista', authenticateToken, async (req, res) => {
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


router.put('/alunoSave', authenticateToken, async (req, res) => {

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

  //console.log("id",id);
  //console.log("nome",nome);
  //console.log("telefone",telefone);
  //console.log("localid",localid);
  //console.log("servicoid",servicoid);
  //console.log("datainicio",datainicio);

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


router.post('/alunoInsert', authenticateToken, async (req, res) => {
  
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


router.get('/alunos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
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


router.post('/alunos', authenticateToken, async (req, res) => {

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


// Cadastro Aluno com código de convite
router.post('/cadastro-aluno', async (req, res) => {
  const { nome, email, password, codigoConvite } = req.body;

  const alunoPend = await db('alunosPendentes')
    .where({ codigo_convite: codigoConvite })
    .first();

  if (!alunoPend) {
    return res.status(400).send({ mensagem: 'Código de convite inválido' });
  }

  // Cadastrar aluno vinculado ao Personal
  await db('alunos').insert({
    nome,
    email,
    password_hash: await hash(password),
    personal_id: alunoPend.personal_id
  });

  // Opcional: remover código de convite usado
  await db('alunosPendentes').where({ id: alunoPend.id }).del();

  res.status(201).send({ ok: true });
});

export default router;