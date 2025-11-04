import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> local.js !");
const router = express.Router();

router.get('/localLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega locais");
    const personalid = req.user.personalid;
    const local = await sql`SELECT Local_ID id, Local nome, LocEndereco endereco, LocAtivo ativo FROM Locals WHERE LocPersonalID = ${personalid}`;
    res.json(local);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar locais');
  }
});

router.put('/localSave', authenticateToken, async (req, res) => {
  const {id, nome, endereco, ativo} = req.body;

  try {
    const local = await sql`
      UPDATE Locals SET local = ${nome}, LocEndereco = ${endereco}, LocAtivo = ${ativo}
      WHERE local_id = ${id}
      RETURNING *`; 
    res.status(201).json(local);
  } catch (err) {
    console.error('Erro ao atualizar aluno:', err);
    res.status(500).json({ erro: 'Erro ao cadastrar local' });
  }
});

router.post('/localInsert', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;

  const {id, nome, endereco, ativo} = req.body;

  try {
    const local = await sql`
      INSERT INTO Locals (local, LocEndereco, LocAtivo, LocPersonalID)
      VALUES (${nome}, ${endereco}, ${ativo}, ${personalid})
      RETURNING *`; 
    res.json({
      id: local[0].local_id,                         
      nome: local[0].local,                          
      endereco: local[0].locendereco,                
      ativo: local[0].locativo
    });
    console.log('Retornando novo local:', {
      id: local[0].local_id,
      nome: local[0].local,
      endereco: local[0].locendereco,
      ativo: local[0].locativo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar local' });
  }
});

router.get('/locals', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const locals = await sql`SELECT local_id id, local nome, locendereco endereco FROM locals WHERE LocPersonalID=${personalid} AND LocAtivo = true`;
    res.json(locals);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar locals');
  }
});


router.post('/locals', authenticateToken, async (req, res) => {
  const {nome, endereco/* personal_id*/ } = req.body;
  const personalid = req.user.personalid;

  try {

    const local = await sql`
      INSERT INTO locals (local, locendereco, locpersonalid, locativo)
      VALUES (${nome}, ${endereco}, ${personalid}, true)
      RETURNING *`; 
    res.json({
      id: local[0].local_id,                         // <- compatível com this.form.patchValue({ alunoid: novoAluno.id });
      nome: local[0].local,                          // <- compatível com this.alunoCtrl.setValue(novoAluno.nome);
      endereco: local[0].locendereco                    // <- opcional, se quiser manter
    });
    console.log('Retornando novo local:', {
      id: local[0].local_id,
      nome: local[0].local,
      endereco: local[0].locendereco
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar endereco' });
  }
});

export default router;