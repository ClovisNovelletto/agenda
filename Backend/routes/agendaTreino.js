import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> agendaTreino.js !");
const router = express.Router();

//app.get('/agendaTreino/treino/:agendaId', (req, res) => {
//  const { agendaId } = req.params;
//});

router.get('/treino/:agendaId', authenticateToken, async (req, res) => {
  try {
    console.log("carrega TreinoAgenda");
    const personalid = req.user.personalid;
    const { agendaId } = req.params;

    console.log("agendaId: ", agendaId );

    const agendaTreino = await sql`
     SELECT agendatreino_id, agendatreino_id AS id, atagendaid AS agendaid, atalunoid AS alunoid, attreino AS treino, atconcluido concluido FROM AgendaTreinos
      WHERE atagendaid = ${agendaId}`;

    if (!agendaTreino || agendaTreino.length === 0) {

      console.log("Nenhum treino encontrado para agenda:", agendaId);

      return res.json([]);
      //return res.status(404).json({
      //    erro: true,
      //    mensagem: "Treino não encontrado"
      //});

    }      
    console.log("agendaTreino: ", agendaTreino[0] );

    const agendaTreinoid = agendaTreino[0].agendatreino_id;
    console.log("agendaTreinoid: ", agendaTreinoid );

    const items = await sql`
      SELECT AgendaTreinoItem_ID AS id, atiexercicio AS exercicio, atiserie AS serie, atirepeticao AS repeticao, atipeso AS peso,  atitempo AS tempo, aticoncluido concluido, atiordem ordem
        FROM AgendaTreinoItems
      WHERE atiagendatreinoid = ${agendaTreinoid}
      ORDER BY atiordem`;

    console.log("items: ", items );    
    res.json({
      ...agendaTreino[0],
      items: items
    });

    return;    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agenda treino');
  }
});

router.put('/concluirItem', authenticateToken, async (req, res) => {
  const { id, concluido  } = req.body;
  const personalid = req.user.personalid;
  console.log("id", id);

  try {
    const agendaTreino = await sql`
      UPDATE AgendaTreinoItems SET
        atiConcluido = ${concluido}
      WHERE AgendaTreinoItem_ID = ${id}
      RETURNING *`;
    res.status(201).json(agendaTreino)
    } catch (err) {
      console.error('Erro ao atualizar descrição item do treino:', err);
      res.status(500).json({ error: 'Erro ao atualizar item do treino' });
    }
});

router.put('/concluirTreino', authenticateToken, async (req, res) => {
  const { id } = req.body;
  const personalid = req.user.personalid;
  console.log("id", id);

  try {
  await sql`
    UPDATE AgendaTreinoItems
    SET atiConcluido = true
    WHERE atiagendatreinoid = ${id}
  `;

  const agendaTreino = await sql`
    UPDATE AgendaTreinos
    SET atConcluido = true
    WHERE AgendaTreino_ID = ${id}
    RETURNING *
  `;
    res.status(201).json(agendaTreino)
    } catch (err) {
      console.error('Erro ao atualizar descrição item do treino:', err);
      res.status(500).json({ error: 'Erro ao atualizar item do treino' });
    }
});

export default router;