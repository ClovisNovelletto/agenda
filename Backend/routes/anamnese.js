import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> anamese.js !");
const router = express.Router();

router.put('/anamneseSave', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  const {id, dataAnamnese, titulo, peso, altura, idade, objetivo, principalRecl, alimentacao, historicosaude, fatoresrisco, medicamentos, sono, descricao} = req.body;
//console.log('id', id);
//console.log('andata', dataAnamnese);
//console.log('antitulo', titulo);
//console.log('andescricao', descricao);
//console.log('anidade', idade);
//console.log('anpeso', peso);
//console.log('anobjetivo', objetivo);
//console.log('principalRecl', principalRecl);
  try {
    const anamnese = await sql`
      UPDATE Anamneses SET andata = ${dataAnamnese},
            antitulo = ${titulo},
            andescricao = ${descricao}, 
            anidade = ${idade} ,
            anpeso = ${peso}, 
            analtura = ${altura},
            anobjetivo = ${objetivo},
            anprincipalrecl = ${principalRecl},
            analimentacao = ${alimentacao},
            anhistoricosaude = ${historicosaude},
            anfatoresrisco = ${fatoresrisco},
            anmedicamentos = ${medicamentos},
            ansono = ${sono}
      WHERE Anamnese_ID = ${id}
       RETURNING *`; 
      res.status(201).json(anamnese);
    } catch (err) {
      console.error(err);
      res.status(500).json({ erro: 'Erro ao atualizar anamnese' });
   }
});

router.post('/anamneseInsert', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  const {alunoid, dataAnamnese, titulo, peso, altura, idade, objetivo, principalRecl,
          alimentacao, historicosaude, fatoresrisco, medicamentos, sono, descricao} = req.body;

  try {
    const anamnese = await sql`
      INSERT INTO Anamneses (andata, antitulo, andescricao, anidade, anpeso, analtura, anobjetivo, anprincipalrecl,
                  analimentacao, anhistoricosaude, anfatoresrisco, anmedicamentos, ansono, anPersonalID, anAlunoID)
      VALUES (${dataAnamnese}, ${titulo}, ${descricao}, ${idade}, ${peso}, ${altura}, ${objetivo}, ${principalRecl},
                  ${alimentacao}, ${historicosaude}, ${fatoresrisco}, ${medicamentos}, ${sono},  ${personalid}, ${alunoid})
      RETURNING *`; 
    res.json({
      id: anamnese[0].anamnese_id,
      dataAnamnese: anamnese[0].andata,
      titulo: anamnese[0].antitulo,
      descricao: anamnese[0].andescricao
    });
    console.log('Retornando nova anamnese:', {
      id: anamnese[0].anamnese_id,
      dataAnamnese: anamnese[0].andata,
      titulo: anamnese[0].antitulo,
      descricao: anamnese[0].andescricao
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar anamnese' });
  }
});

router.post('/anamnesesLista', authenticateToken, async (req, res) => {
  try {
    console.log("carrega anamneses");
    const personalid = req.user.personalid;
    const {alunoid} = req.body;
    const anamneses = await sql`SELECT * FROM anamneseslista WHERE AlunoID = ${alunoid}`;
    res.json(anamneses);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar anamneses');
  }
});

export default router;