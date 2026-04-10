import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> treino.js !");
const router = express.Router();

router.post('/treinoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega TreinoLista");
    const personalid = req.user.personalid;

    const treino = await sql`SELECT *
      FROM h2utreinoslista
      WHERE personalid = ${personalid} 
      ORDER BY descricao`;
    res.json(treino);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar treinos');
  }
});


router.post('/treinoItemLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega TreinoLista");
    const personalid = req.user.personalid;
    // tratamento treino indefinido
    if (typeof req.body[`treinoid`] === 'undefined') {
      req.body[`treinoid`] = null;
    }
    const {treinoid} = req.body;

    const treinoItem = await sql`SELECT *
      FROM h2utreinositemslista
      WHERE personalid = ${personalid} 
        AND treinoid =${treinoid}
      ORDER BY descricao`;
    res.json(treinoItem);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar treinosItens');
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

export default router;