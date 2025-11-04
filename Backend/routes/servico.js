import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> servico.js !");
const router = express.Router();

router.get('/servicos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const servicos = await sql`SELECT servico_id id, servico nome, sevalor valor, COALESCE(setemequipto,false) as temequipto, seativo ativo
                                 FROM servicos WHERE Servico_ID IN(SELECT PSServicoID FROM PersonalsServicos
                               WHERE PSPersonalID=${personalid}) AND SeAtivo = true`;
    res.json(servicos);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar locals');
  }
});

export default router;