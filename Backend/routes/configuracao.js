import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> configuracao.js !");
const router = express.Router();

router.get('/configuracoes', authenticateToken, async (req, res) => {
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

router.get('/configuracoesServicos', authenticateToken, async (req, res) => {
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

export default router;