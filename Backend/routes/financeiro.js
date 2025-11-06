import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> financeiro.js !");
const router = express.Router();

router.get('/alunoPlanoLista', authenticateToken, async (req, res) => {
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


router.post('/alunoPlanoInsert', authenticateToken, async (req, res) => {
  
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


router.put('/alunoPlanoSave', authenticateToken, async (req, res) => {
  
  const personalid = req.user.personalid;

  // tratamento local indefinido
  if (typeof req.body[`localid`] === 'undefined') {
    req.body[`localid`] = null;
  }
  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    req.body[`servicoid`] = null;
  }
console.log(req.body);
  // Agora que os valores estão garantidos, você pode extrair:
  const {id, alunoid, dataini, datafim, planoid, frequenciaid, valortabela, valordesconto, valorreceber, diavcto, formapagtoid, statusid } = req.body;

  //console.error('req.body:', req.body);

  try {
    const alunoPlano = await sql`
      UPDATE alunosplanos SET apalunoid=${alunoid}, applanoid=${planoid}, apfrequenciaid=${frequenciaid}, /*aptabprecoid,*/
           apdataini=${dataini}, apdatafim=${datafim}, apvalortabela=${valortabela}, apvalordesconto=${valortabela},
           apvalorreceber=${valorreceber}, apdiavcto=${diavcto}, apformapagtoid=${formapagtoid}, apstatus=${statusid}
      WHERE alunosplano_ID=${id}
      RETURNING *`; 
    res.json({
      id: alunoPlano[0].alunosplano_id
    });
    console.log('Retornando alunoPlano alterado:', {
      id: alunoPlano[0].alunosplano_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao alterar alunoPlano' });
  }
});


router.post('/recebimentoAlunoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega RecebimentoAlunoLista");
    const personalid = req.user.personalid;
    if (typeof req.body[`alunoid`] === 'undefined') {
      req.body[`alunoid`] = null;
    } 
    const {alunoid, ano} = req.body;
    //console.log("alunoid: ", alunoid);
    //console.log("ano: ", ano);

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

router.post('/recebimentoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega RecebimentoLista");
    const personalid = req.user.personalid;
    const {ano, mes1a12} = req.body;

    //console.log("ano: ", ano);
    //console.log("mes1a12: ", mes1a12);


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

router.post('/recebimentoInsert', authenticateToken, async (req, res) => {
  
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

router.put('/recebimentoSave', authenticateToken, async (req, res) => {


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


router.post('/recebimentosGerar', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  const {data_inicio, data_fim} = req.body;

  //console.error('personalid:', personalid);
  //console.error('data_inicio:', data_inicio);
  //console.error('data_fim:', data_fim);

  try {
    const recebimentos = await sql`
    CALL public.h2uGerarRecebimentos(${data_inicio}, ${data_fim}, ${personalid})`;
    res.status(201).json(recebimentos);
  } catch (err) {
    console.error('Erro ao gerar recebimentos do mês:', err);
    res.status(500).json({ error: 'Erro ao inserir recebimentos' });
  }

});

export default router;