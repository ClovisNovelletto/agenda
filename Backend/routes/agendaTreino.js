import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> agendaTreino.js !");
const router = express.Router();

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


router.post('/agendatreinoaluno', authenticateToken, async (req, res) => {
  try { console.log("carrega agendatreinoaluno");
    const alunoid = req.user.alunoid;
    const {ano, mes1a12} = req.body;
    
    console.log('ano', ano);
    console.log('mes1a12', mes1a12);
    console.log('alunoid', alunoid);

    // tratamento treino indefinido
    if (typeof req.body[`alunoid`] === 'undefined') {
      req.body[`alunoid`] = null;
    }

    const agtreinoaluno = await sql`
      SELECT agendatreino_id AS id, agenda_id AS agendaid, date AS data, hour, 
            attreino AS treino, atordem AS ordem, atconcluido concluido, aluno
        FROM h2uagendaslista
          INNER JOIN AgendaTreinos ON ATAgendaID=Agenda_ID
      WHERE alunoID=${alunoid}
        AND EXTRACT(YEAR FROM date)=${ano} 
        AND EXTRACT(MONTH FROM date)=${mes1a12} 
      ORDER BY atordem`;

console.log('agtreinoaluno: ', agtreinoaluno)

    res.json(agtreinoaluno);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar AgendasTreinos do aluno');
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
  const { id, concluido } = req.body;
  const personalid = req.user.personalid;
  console.log("id", id);

  try {
  await sql`
    UPDATE AgendaTreinoItems
    SET atiConcluido = ${concluido}
    WHERE atiagendatreinoid = ${id}
  `;

  const agendaTreino = await sql`
    UPDATE AgendaTreinos
    SET atConcluido = ${concluido}
    WHERE AgendaTreino_ID = ${id}
    RETURNING *
  `;
    res.status(201).json(agendaTreino)
    } catch (err) {
      console.error('Erro ao atualizar descrição item do treino:', err);
      res.status(500).json({ error: 'Erro ao atualizar item do treino' });
    }
});


router.post('/gerarAgendaTreinos', authenticateToken, async (req, res) => {

  try {

    console.log('entrou no agenda treinos');

    const personalid = req.user.personalid;
    const { data_inicio, data_fim, alunoid } = req.body;

    const data_inicio3h = new Date(data_inicio);
    data_inicio3h.setHours(data_inicio3h.getHours() + 3);
    
    console.log({
      personalid,
      data_inicio,
      data_inicio3h,
      data_fim,
      alunoid
    });

    // pegar alunos
    const alunos = await sql`
      SELECT DISTINCT atalunoid AS alunoid
      FROM AlunosTreinos
      WHERE atalunoid = COALESCE(${alunoid}, atalunoid)
        AND atpersonalid = ${personalid}
        AND atdataini <= ${data_inicio3h}
        AND COALESCE(atdatafim, ${data_fim}) >= ${data_fim}
    `;

    console.log('alunos:', alunos.length);

    // loop alunos
    for (const aluno of alunos) {

      try {

        console.log('processando aluno', aluno.alunoid);

        // pegar treinos
        const treinos = await sql`
          SELECT
              alunostreino_id,
              (SELECT treino
                 FROM Treinos
                WHERE treino_id = attreinoid) treino,
              attreinoid treinoid,
              atordem
          FROM AlunosTreinos
          WHERE atalunoid = ${aluno.alunoid}
            AND atpersonalid = ${personalid}
            AND atdataini <= ${data_inicio3h}
            AND COALESCE(atdatafim, ${data_fim}) >= ${data_fim}
          ORDER BY atordem
        `;

        console.log('treinos:', treinos.length);

        // evitar divisão por zero
        if (treinos.length === 0) {
          console.log('Aluno sem treino:', aluno.alunoid);
          continue;
        }

        // pegar agendas
        const agendas = await sql`
          SELECT agenda_id, agdata
          FROM Agendas
          WHERE agalunoid = ${aluno.alunoid}
            AND agdata >= ${data_inicio3h}
            AND agdata <= ${data_fim}
            AND agstatus = 1 /*só pendentes*/
          ORDER BY agdata
        `;

        console.log('agendas:', agendas.length);

        // loop agendas
        for (let i = 0; i < agendas.length; i++) {

          const indiceTreino = i % treinos.length;

          const treino = treinos[indiceTreino];
          const agenda = agendas[i];

          console.log(
            'Agenda',
            agenda.agenda_id,
            'recebe treino',
            treino.treino
          );

          // inserir AgendaTreinos
          const [agendaTreinoIns] = await sql`
            INSERT INTO AgendaTreinos (
              atagendaid,
              atalunoid,
              attreino,
              atordem
            )
            VALUES (
              ${agenda.agenda_id},
              ${aluno.alunoid},
              ${treino.treino},
              ${treino.atordem}
            )
            ON CONFLICT (atagendaid) DO NOTHING
            RETURNING *
          `;

          //caso não insira treino, pula o insert de exercícios
          if (!agendaTreinoIns) continue;

          // inserir itens
          await sql`
            INSERT INTO AgendaTreinoItems(
              atiagendatreinoid,
              atiexercicio,
              atiserie,
              atirepeticao,
              atipeso,
              atitempo,
              atiordem
            )
            SELECT
              ${agendaTreinoIns.agendatreino_id},
              tritexercicio,
              tritserie,
              tritrepeticao,
              tritpeso,
              trittempo,
              tritordem
            FROM TreinosItems
            WHERE trittreinoid = ${treino.treinoid}
          `;

        }

      } catch (erroAluno) {

        console.error(
          'Erro ao processar aluno',
          aluno.alunoid,
          erroAluno
        );

      }

    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Agenda de treinos gerada com sucesso'
    });

  } catch (erro) {

    console.error('Erro geral gerarAgendaTreinos:', erro);

    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao gerar agenda de treinos',
      erro: erro.message
    });

  }

});


export default router;