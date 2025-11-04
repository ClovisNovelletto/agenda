import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> agenda.js !");
const router = express.Router();

router.get('/agendas', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda");
    const personalid = req.user.personalid;
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalid}`;
    res.json(agendas);
    //console.log(result.rows); // apenas isso para logar
    // não usar res.json(result.rows);    // envia resposta corretamente uma única vez
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});

router.get('/agendaStatus', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda status");

    const agendaStatus = await sql`SELECT agendastatu_id ID, agendastatu Status, agcor Cor FROM AgendaStatus`;
    res.json(agendaStatus);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas status');
  }
});

router.put('/agendasDescricao', authenticateToken, async (req, res) => {
  const { agenda_id, descricao } = req.body;
  const personalid = req.user.personalid;
  //console.log("agenda_id", agenda_id);

  try {
    const agenda = await sql`
      UPDATE Agendas SET
        AgDescricao = ${descricao}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agenda)
    } catch (err) {
      console.error('Erro ao atualizar descrição agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar descrição agenda' });
    }
});

router.put('/agendas', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  // tratamento equipto indefinido
  if (typeof req.body[`equiptoid`] === 'undefined') {
    req.body[`equiptoid`] = null;
  } 

  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    const resServico = await sql`SELECT COALESCE((SELECT psservicoid FROM PersonalsServicos WHERE pspersonalid= ${personalid} LIMIT 1),23) AS "servicoid"`;
    const servicolid = resServico[0]?.servicoid ?? null;
    req.body[`servicoid`] = servicolid;
  } 

  const { agenda_id, alunoid, localid, servicoid, equiptoid, data, /*hora,*/ /*titulo,*/ /*descricao,*/ statusid } = req.body;
  const dataHora = new Date(req.body.data);

  // Adiciona 3 horas (10800000 ms)
  const dataCorrigida = new Date(dataHora.getTime() - 0 * 60 * 60 * 1000);

  // UPDATE
  try {

    const agenda = await sql`
      UPDATE Agendas SET
        AgPersonalID = ${personalid}, AgAlunoid = ${alunoid}, AgLocalID = ${localid}, AgServicoID = ${servicoid},
        AgEquiptoID = ${equiptoid}, AgData = ${dataCorrigida}, AgStatus = ${statusid}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agenda)
    } catch (err) {
      console.error('Erro ao atualizar agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar agenda' });
    }
});

router.put('/agendaStatus', authenticateToken, async (req, res) => {
  const { agenda_id, alunoid, localid, data, /*hora,*/ /*titulo,*/ /*descricao,*/ statusid } = req.body;

  // UPDATE
  try {
    const agendaStatus = await sql`
          UPDATE Agendas SET AgStatus = ${statusid}
      WHERE Agenda_ID = ${agenda_id}
      RETURNING *`;
    res.status(201).json(agendaStatus[0]);
    } catch (err) {
      console.error('Erro ao atualizar status da agenda:', err);
      res.status(500).json({ error: 'Erro ao atualizar status da agenda' });
    }
});


router.post('/agendaGerar', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;
  const {data_inicio, data_fim} = req.body;

  //console.error('personalid:', personalid);
  //console.error('data_inicio:', data_inicio);
  //console.error('data_fim:', data_fim);
  try {
    await sql`DELETE FROM Agendas WHERE AgPersonalID=${personalid} AND AgData>=${data_inicio} AND AgData<=${data_fim} AND AgStatus IN(1,3); /*Pedente ou Cancelado*/`;
  } catch (err) {
    console.error('Erro ao apagar agenda do mês:', err);
    res.status(500).json({ error: 'Erro ao apagar agenda' });
  }

  try {
    const agenda = await sql`
    INSERT INTO Agendas(Agenda, AgPersonalID, AgAlunoID, AgLocalID, AgServicoID, AgEquiptoID, AgData, AgStatus) --ON CONFLICT DO NOTHING
    SELECT 'Teste', ${personalid}, AlunoID, LocalID, ServicoID, EquiptoID, datahora + interval '3 hour', 1
      FROM h2ugetagendaEquipto(${data_inicio}, ${data_fim}, ${personalid})
    ON CONFLICT DO NOTHING
    RETURNING *`;
    res.status(201).json(agenda);
  } catch (err) {
    console.error('Erro ao gerar agenda do mês:', err);
    res.status(500).json({ error: 'Erro ao inserir agenda' });
  }

});

router.post('/agendaAluno', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda do aluno");
    const personalid = req.user.personalid;
    const {alunoid, ano, mes1a12} = req.body;
    //console.log("alunoid: ", alunoid);
    //console.log("ano: ", ano);
    //console.log("mes1a12: ", mes1a12);
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalid} AND AlunoID = ${alunoid} AND EXTRACT(YEAR FROM Date)=${ano} AND EXTRACT(MONTH FROM Date) =${mes1a12} ORDER BY Date`;
    res.json(agendas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});

router.post('/agendaPorPeriodo', authenticateToken, async (req, res) => {
  try {
    console.log("carrega agenda");
    const personalid = req.user.personalid;
    const {data_inicio, data_fim} = req.body;
    //console.log("data_inicio: ", data_inicio);
    //console.log("data_fim: ", data_fim);
    const agendas = await sql`SELECT * FROM agendaslista WHERE PersonalID = ${personalid} AND Date>=${data_inicio} AND Date <=${data_fim}`;
    res.json(agendas);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar agendas');
  }
});

router.post('/agendas', authenticateToken, async (req, res) => {
  const personalid = req.user.personalid;

  // tratamento equipto indefinido
  if (typeof req.body[`equiptoid`] === 'undefined') {
    req.body[`equiptoid`] = null;
  } 

  // tratamento serviço indefinido
  if (typeof req.body[`servicoid`] === 'undefined') {
    const resServico = await sql`SELECT COALESCE((SELECT psservicoid FROM PersonalsServicos WHERE pspersonalid= ${personalid} LIMIT 1),23) AS "servicoid"`;
    const servicolid = resServico[0]?.servicoid ?? null;
    req.body[`servicoid`] = servicolid;
  }    

  const { alunoid, localid, servicoid, equiptoid, data, statusid } = req.body;
  
  const dataHora = new Date(req.body.data);
  const dataCorrigida = dayjs(req.body.data).tz('America/Sao_Paulo').utc().toDate();

  try {

    const agenda = await sql`
      INSERT INTO agendas (AgPersonalID, AgAlunoid, AgLocalID, AgServicoID, AgEquiptoID, AgData, AgStatus)
      VALUES (${personalid}, ${alunoid}, ${localid}, ${servicoid}, ${equiptoid}, ${dataCorrigida}, ${statusid}) RETURNING *`;

    // pega o id recém-inserido
    const insertedId = agenda[0].agenda_id;

    // agora busca na view agendaslista o mesmo registro
    const agendaCompleta = await sql`
      SELECT * FROM agendaslista WHERE agenda_id = ${insertedId}`;

    res.status(201).json(agendaCompleta[0]); // retorna já no formato certo da view
        
  } catch (err) {
    console.error('Erro ao inserir agenda:', err);
    res.status(500).json({ error: 'Erro ao inserir agenda' });
  }

});

export default router;