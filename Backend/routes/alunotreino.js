import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> alunotreino.js !");
const router = express.Router();

router.post('/alunotreinoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega alunoTreinoLista");
    const personalid = req.user.personalid;


    // tratamento aluno indefinido
    if (typeof req.body[`alunoid`] === 'undefined') {
      req.body[`alunoid`] = null;
    }

    // tratamento ano indefinido
    if (typeof req.body[`ano`] === 'undefined') {
      req.body[`ano`] = null;
    }

    // tratamento mes indefinido
    if (typeof req.body[`mes`] === 'undefined') {
      req.body[`mes`] = null;
    }

    const {alunoid, ano, mes1a12} = req.body;
    console.log("alunoid: ", alunoid);
    console.log("ano: ", ano);
    console.log("mes1a12: ", mes1a12);
    const agendas = await sql`SELECT * FROM h2uagendaslista WHERE PersonalID = ${personalid} AND AlunoID = ${alunoid} AND EXTRACT(YEAR FROM Date)=${ano} AND EXTRACT(MONTH FROM Date) =${mes1a12} ORDER BY Date`;


    const treino = await sql`SELECT *
      FROM h2ualunostreinoslista
      WHERE personalid = ${personalid} 
        AND alunoid = ${alunoid}
        AND EXTRACT(YEAR FROM dataini)=${ano} 
        AND EXTRACT(MONTH FROM dataini) =${mes1a12} 
      ORDER BY ordem`;
    res.json(treino);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar alunotreinos');
  }
});

router.post('/alunotreinoInsert', authenticateToken, async (req, res) => {
  
  const personalid = req.user.personalid;

  // tratamento aluno indefinido
  if (typeof req.body[`alunoid`] === 'undefined') {
    req.body[`alunoid`] = null;
  }
  // tratamento treino indefinido
  if (typeof req.body[`treinoid`] === 'undefined') {
    req.body[`treinoid`] = null;
  }
  // tratamento dataini indefinido
  if (typeof req.body[`dataini`] === 'undefined') {
    req.body[`dataini`] = null;
  }
  // tratamento datafim indefinido
  if (typeof req.body[`datafim`] === 'undefined') {
    req.body[`datafim`] = null;
  }
  // tratamento ativo indefinido
  if (typeof req.body[`ativo`] === 'undefined') {
    req.body[`ativo`] = null;
  }
  // tratamento ordem indefinido
  if (typeof req.body[`ordem`] === 'undefined') {
    req.body[`ordem`] = null;
  }
  // Agora que os valores estão garantidos, você pode extrair:
  const {id, alunoid, treinoid, dataini, datafim, ativo, ordem } = req.body;
  
  try {
    const alunostreino = await sql`
      INSERT INTO AlunosTreinos(atpersonalid, atalunoid, attreinoid, atdataini, atdatafim, atativo, atordem)
      VALUES (${personalid}, ${alunoid}, ${treinoid}, ${dataini}, ${datafim}, ${ativo}, 
              (SELECT COALESCE(MAX(atordem), 0) + 10
                FROM AlunosTreinos
              WHERE atpersonalid = ${personalid}
                AND atalunoid = ${alunoid}
              )
      )
      RETURNING *`; 
    res.json({
      id: alunostreino[0].alunostreino_id
    });
    console.log('Retornando novo treino do aluno:', {
      id: alunostreino[0].alunostreino_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar treino do aluno' });
  }
});

router.put('/alunotreinoSave', authenticateToken, async (req, res) => {
  // tratamento aluno indefinido
  if (typeof req.body[`alunoid`] === 'undefined') {
    req.body[`alunoid`] = null;
  }
  // tratamento treino indefinido
  if (typeof req.body[`treinoid`] === 'undefined') {
    req.body[`treinoid`] = null;
  }
  // tratamento dataini indefinido
  if (typeof req.body[`dataini`] === 'undefined') {
    req.body[`dataini`] = null;
  }
  // tratamento datafim indefinido
  if (typeof req.body[`datafim`] === 'undefined') {
    req.body[`datafim`] = null;
  }
  // tratamento ativo indefinido
  if (typeof req.body[`ativo`] === 'undefined') {
    req.body[`ativo`] = null;
  }

  // Agora que os valores estão garantidos, você pode extrair:
  const {id, alunoid, treinoid, dataini, datafim, ativo, ordem } = req.body;
  // Agora que os valores estão garantidos, você pode extrair:

  
  // UPDATE
  try {
    const alunosTreino = await sql`
      UPDATE AlunosTreinos SET atalunoid=${alunoid}, attreinoid=${treinoid}, atdataini=${dataini},
                              atdatafim=${datafim}, atativo=${ativo}
       WHERE AlunosTreino_ID = ${id}
      RETURNING *
    `;    
    res.status(201).json(alunosTreino);
    } catch (err) {
      console.error('Erro ao atualizar treino do aluno:', err);
      res.status(500).json({ error: 'Erro ao atualizar treino do aluno' });
    }
});



router.put('/AtualizaOrdemTreinos', authenticateToken, async (req, res) => {
  const lista = req.body; // 👈 aqui!

  console.log('Lista recebida:', lista);

  try {
    await sql.begin(async (tx) => {
      for (const item of lista) {
        await tx`
          UPDATE AlunosTreinos
          SET ATordem = ${item.ordem}
          WHERE AlunosTreino_ID = ${item.id}
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