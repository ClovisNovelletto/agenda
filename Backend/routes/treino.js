import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> treino.js !");
const router = express.Router();

router.get('/treinoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega TreinoLista");
    const personalid = req.user.personalid;

    const treino = await sql`SELECT *
      FROM h2utreinoslista
      WHERE personalid = ${personalid} 
      ORDER BY treino`;
    res.json(treino);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar treinos');
  }
});

router.post('/treinoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega TreinoLista");
    const personalid = req.user.personalid;

    const treino = await sql`SELECT *
      FROM h2utreinoslista
      WHERE personalid = ${personalid} 
      ORDER BY treino`;
    res.json(treino);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar treinos');
  }
});

router.post('/treinoItemLista', authenticateToken, async (req, res) => {
  try { console.log("carrega TreinoItemLista");
    const personalid = req.user.personalid;
    // tratamento treino indefinido
    if (typeof req.body[`treinoid`] === 'undefined') {
      req.body[`treinoid`] = null;
    }
    const {treinoid} = req.body;

    console.log("treinoid: " + treinoid)

    const treinoItem = await sql`SELECT *
      FROM h2utreinositemslista
      WHERE treinoid =${treinoid}
      ORDER BY ordem`;

console.log("treinoItem: " + treinoItem)

    res.json(treinoItem);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar treinosItens');
  }
});


router.post('/treinoItemInsert', authenticateToken, async (req, res) => {
  
  const personalid = req.user.personalid;

    // tratamento exercicio indefinido
  if (typeof req.body[`exercicio`] === 'undefined') {
    req.body[`exercicio`] = null;
  }
  // tratamento serie indefinido
  if (typeof req.body[`serie`] === 'undefined') {
    req.body[`serie`] = null;
  }
  // tratamento repeticao indefinido
  if (typeof req.body[`repeticao`] === 'undefined') {
    req.body[`repeticao`] = null;
  }
  // tratamento tempo indefinido
  if (typeof req.body[`tempo`] === 'undefined') {
    req.body[`tempo`] = null;
  }
  // tratamento peso indefinido
  if (typeof req.body[`peso`] === 'undefined') {
    req.body[`peso`] = null;
  }
  // tratamento ordem indefinido
  if (typeof req.body[`ordem`] === 'undefined') {
    req.body[`ordem`] = null;
  }
  // Agora que os valores estão garantidos, você pode extrair:
  const {id, treinoid, exercicio, serie, repeticao, tempo, peso, ordem } = req.body;
  
  try {
    const treinoItem = await sql`
      INSERT INTO TreinosItems(trittreinoid, tritexercicio, tritserie, tritrepeticao, tritpeso, trittempo, tritordem)
      VALUES (${treinoid}, ${exercicio}, ${serie}, ${repeticao}, ${peso}, ${tempo}, ${ordem} )
      RETURNING *`; 
    res.json({
      id: treinoItem[0].treinoItem_id
    });
    console.log('Retornando novo item do treino:', {
      id: treinoItem[0].treinoItem_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar item do treino' });
  }
});

router.put('/treinoItemSave', authenticateToken, async (req, res) => {
  // tratamento exercicio indefinido
  if (typeof req.body[`exercicio`] === 'undefined') {
    req.body[`exercicio`] = null;
  }
  // tratamento serie indefinido
  if (typeof req.body[`serie`] === 'undefined') {
    req.body[`serie`] = null;
  }
  // tratamento repeticao indefinido
  if (typeof req.body[`repeticao`] === 'undefined') {
    req.body[`repeticao`] = null;
  }
  // tratamento tempo indefinido
  if (typeof req.body[`tempo`] === 'undefined') {
    req.body[`tempo`] = null;
  }
  // tratamento peso indefinido
  if (typeof req.body[`peso`] === 'undefined') {
    req.body[`peso`] = null;
  }
  // tratamento ordem indefinido
  if (typeof req.body[`ordem`] === 'undefined') {
    req.body[`ordem`] = null;
  }
  // Agora que os valores estão garantidos, você pode extrair:
  const {id, treinoid, exercicio, serie, repeticao, tempo, peso, ordem } = req.body;
  
  // UPDATE
  try {
    const treinoItem = await sql`
      UPDATE TreinosItems SET tritexercicio=${exercicio}, tritserie=${serie}, tritrepeticao=${repeticao},
                              tritpeso=${peso}, trittempo=${tempo}, tritordem=${ordem}
       WHERE treinosItem_ID = ${id}
      RETURNING *
    `;    
    res.status(201).json(treinoItem);
    } catch (err) {
      console.error('Erro ao atualizar item do treino:', err);
      res.status(500).json({ error: 'Erro ao atualizar item do treino' });
    }
});


router.post('/treinoInsert', authenticateToken, async (req, res) => {

  const personalid = req.user.personalid;

  // tratamento treino indefinido
  if (typeof req.body[`treino`] === 'undefined') {
    req.body[`treino`] = null;
  }
  // tratamento servicoid indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    req.body[`servicoid`] = null;
  }
  // tratamento ativo indefinido
  if (typeof req.body[`ativo`] === 'undefined') {
    req.body[`ativo`] = null;
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {id, servicoid, treino, ativo } = req.body;
  
  // INSERT
  try {
    const treino = await sql`
      INSERT INTO Treinos(treino, treativo, treservicoid, trepersonalid)
      VALUES(${treino}, ${ativo}, ${servicoid}, ${personalid})
      RETURNING *
    `;    
    res.status(201).json(treino);
    } catch (err) {
      console.error('Erro ao inserir treino:', err);
      res.status(500).json({ error: 'Erro ao inserir treino' });
    }
});

router.put('/treinoSave', authenticateToken, async (req, res) => {
  // tratamento treino indefinido
  if (typeof req.body[`treino`] === 'undefined') {
    req.body[`treino`] = null;
  }
  // tratamento servicoid indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    req.body[`servicoid`] = null;
  }
  // tratamento ativo indefinido
  if (typeof req.body[`ativo`] === 'undefined') {
    req.body[`ativo`] = null;
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {id, servicoid, treino, ativo } = req.body;
  
  // UPDATE
  try {
    const treino = await sql`
      UPDATE Treinos SET treino=${treino}, treativo=${ativo}, treservicoid=${servicoid}
       WHERE treino_ID = ${id}
      RETURNING *
    `;    
    res.status(201).json(treino);
    } catch (err) {
      console.error('Erro ao atualizar treino:', err);
      res.status(500).json({ error: 'Erro ao atualizar treino' });
    }
});

router.put('/treinoItemAtualizaOrdem', authenticateToken, async (req, res) => {
  const lista = req.body; // 👈 aqui!

  console.log('Lista recebida:', lista);

  try {
    await sql.begin(async (tx) => {
      for (const item of lista) {
        await tx`
          UPDATE TreinosItems
          SET TRITordem = ${item.ordem}
          WHERE TreinosItem_ID = ${item.id}
        `;
      }
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar ordem');
  }
});

export default router;