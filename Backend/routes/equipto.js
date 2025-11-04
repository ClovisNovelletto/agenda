import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> equipto.js !");
const router = express.Router();

router.get('/equiptoLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega equiptos");
    const personalid = req.user.personalid;
    const equipto = await sql`SELECT Equipto_ID id, Equipto nome, EqOrdem ordem, EqAtivo ativo FROM Equiptos WHERE EqPersonalID = ${personalid}`;
    res.json(equipto);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar equiptos');
  }
});

router.put('/equiptoSave', authenticateToken, async (req, res) => {
  const {id, nome, ordem, ativo} = req.body;

  try {
    const equipto = await sql`
      UPDATE Equiptos SET equipto = ${nome}, LocOrdem = ${ordem}, EqAtivo = ${ativo}
      WHERE equipto_id = ${id}
      RETURNING *`; 
    res.status(201).json(equipto);
  } catch (err) {
    console.error('Erro ao atualizar aluno:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar equipto' });
  }
});

router.post('/equiptoInsert', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;

  const {id, nome, ordem, ativo} = req.body;

  try {
    const equipto = await sql`
      INSERT INTO Equiptos (equipto, EqOrdem, EqAtivo, EqPersonalID)
      VALUES (${nome}, ${ordem}, ${ativo}, ${personalid})
      RETURNING *`; 
    res.json({
      id: equipto[0].equipto_id,                         
      nome: equipto[0].equipto,                          
      ordem: equipto[0].eqordem,                
      ativo: equipto[0].eqativo
    });
    console.log('Retornando novo equipto:', {
      id: equipto[0].equipto_id,
      nome: equipto[0].equipto,
      endereco: equipto[0].eqordem,
      ativo: equipto[0].eqativo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar equipto' });
  }
});


router.get('/equiptos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const equiptos = await sql`SELECT equipto_id id, equipto nome FROM equiptos WHERE eqativo = true`;
    res.json(equiptos);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar equiptos');
  }
});

export default router;