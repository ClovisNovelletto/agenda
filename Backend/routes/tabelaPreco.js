import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> tabelaPreco.js !");
const router = express.Router();

router.post('/precoTabela', authenticateToken, async (req, res) => {
  try {
    console.log("carrega tabelaPrecos");
    const personalid = req.user.personalid;
    const {alunoid, planoid, frequenciaid} = req.body;

    const tabPreco = await sql`SELECT h2ugetprecotabela(${personalid}, ${alunoid}, ${planoid}, ${frequenciaid}) AS "valorTabela"`;
    res.json(tabPreco);
    //console.log(result.rows); // apenas isso para logar
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar tabela preços');
  }
});

router.get('/tabelaPrecoLista', authenticateToken, async (req, res) => {
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


router.post('/tabelaPrecoInsert', authenticateToken, async (req, res) => {
  
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


router.put('/tabelaPrecoSave', authenticateToken, async (req, res) => {

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


export default router;