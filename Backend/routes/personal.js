import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> personal.js !");
const router = express.Router();

router.get('/personals/me/configuracoesServicos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const result = await sql`SELECT PSServicoID ServicoID FROM PersonalsServicos WHERE PSPersonalID=${personalid}`;
    res.json(result.map(r => r.servicoid));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar serviços');
  }    
});

router.post('/personals/me/configuracoesServicos', authenticateToken, async (req, res) => {
  try {
    const personalid = req.user.personalid;
    const servicosIds = req.body; // array de IDs

    await sql`DELETE FROM PersonalsServicos WHERE PSPersonalID = ${personalid}`;

    // Insere novos serviços (se houver)
    if (servicosIds && servicosIds.length > 0) {
      await Promise.all(
        servicosIds.map(id => 
          sql`INSERT INTO PersonalsServicos (pspersonalid, psservicoid) VALUES (${personalid}, ${id})`
        )
      );
    }
    //await Promise.all(inserts);
    //res.sendStatus(200);
    res.json({ success: true });
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao salvar serviços');
  }    
});

router.get('/personals', authenticateToken, async (req, res) => {
  try {
     const personalid = req.user.personalid;
    const compareQuery = `SELECT personal_id id, personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6,
                                 hora_inicio, hora_fim, intervalo_minutos, mostrarLocal, mostrarServico, mostrarEquipto,
                                 CASE WHEN (SELECT COUNT(*) FROM PersonalsServicos WHERE pspersonalid=Personal_ID) = 1 
                                      THEN (SELECT PSServicoID FROM PersonalsServicos WHERE pspersonalid=Personal_ID) 
                                      ELSE null
                                 END AS "servicoid"
       FROM Personals WHERE Personal_ID=$1`;
    const result = await pool.query(compareQuery, [personalid]);    

    //const result = await pool.query('SELECT personal_id id, personal nome FROM personals'); 
    res.json(result.rows);
    //console.log(res.json(result.rows));
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar personals');
  }    
});

router.get('/personal/me', authenticateToken, async (req, res) => {
  try {
     const personalid = req.user.personalid;

    //const compareQuery = `SELECT personal_id id, personal nome,  dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim, intervalo_minutos FROM Personals WHERE Personal_ID=$1`;
    //const result = await pool.query(compareQuery, [personalid]);    
    //res.json(result.rows);

    const result = await sql`SELECT personal_id AS "id", personal nome, dia0, dia1, dia2, dia3, dia4, dia5, dia6, hora_inicio, hora_fim,
                                    intervalo_minutos, mostrarLocal AS "mostrarLocal", mostrarServico AS "mostrarServico", mostrarEquipto AS "mostrarEquipto",
                                    CASE WHEN (SELECT COUNT(*) FROM PersonalsServicos WHERE pspersonalid=Personal_ID) = 1 
                                         THEN (SELECT PSServicoID FROM PersonalsServicos WHERE pspersonalid=Personal_ID) 
                                           ELSE null
                                    END AS "servicoid"
         FROM Personals WHERE Personal_ID = ${personalid}`;
    //console.log(personalid);
    //console.log(result[0]);
    res.json(result[0] ?? {}); 
    //console.log(personalid);
  } catch(err) {
      console.error(err);
    res.status(500).send('Erro ao buscar configurações do personal');
  }    
});


router.put('/personal/configuracoes', authenticateToken, async (req, res) => {
  const { diasAtendimento, horaInicio, horaFim, intervaloMinutos, mostrarLocal, mostrarServico, mostrarEquipto } = req.body;
  const personalid = req.user.personalid;
  //console.log("req.body", req.body);
  try {
    //const result = await pool.query(`
    //  UPDATE Personals SET
    //    dia0=$1, dia1=$2, dia2=$3, dia3=$4, dia4=$5, dia5=$6, dia6=$7, hora_inicio=$8, hora_fim=$9, intervalo_minutos=$10
    //  WHERE Personal_ID = $11`,
    //  [diasAtendimento.includes(0), diasAtendimento.includes(1), diasAtendimento.includes(2), diasAtendimento.includes(3),
    //   diasAtendimento.includes(4), diasAtendimento.includes(5), diasAtendimento.includes(6), horaInicio, horaFim, intervaloMinutos, personalid]);
    //res.status(201).json(result.rows[0]);
    const result = await sql`
      UPDATE Personals SET
       dia0=${diasAtendimento.includes(0)}, dia1=${diasAtendimento.includes(1)}, dia2=${diasAtendimento.includes(2)},
       dia3=${diasAtendimento.includes(3)}, dia4=${diasAtendimento.includes(4)}, dia5=${diasAtendimento.includes(5)},
       dia6=${diasAtendimento.includes(6)}, hora_inicio=${horaInicio}, hora_fim=${horaFim}, intervalo_minutos=${intervaloMinutos},
       mostrarLocal=${mostrarLocal},
       mostrarServico=${mostrarServico},
       mostrarEquipto=${mostrarEquipto}
      WHERE Personal_ID = ${personalid}
      RETURNING *
    `;    
    res.status(201).json(result[0]);
  } catch (erro) {
    console.error('Erro ao atualizar configurações:', erro);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});


router.get('/dadosPersonal', authenticateToken, async (req, res) => {
  try {
    console.log("carrega dados do personal");
    const personalid = req.user.personalid;

    const personal = await sql`
      SELECT personal_id AS id, personal AS nome, peremail AS email, percpf AS cpf,
             percep AS cep, perlogradouro AS logradouro, pernumero AS numero,
             percomple AS complemento, perfone AS telefone, percidade AS cidade, peruf AS uf,
             (SELECT Assinatura_ID FROM Assinaturas WHERE ASPersonalID=Personal_ID) AS assinaturaid
      FROM Personals
      WHERE personal_id = ${personalid}`;
    if (personal.length === 0) {
      return res.status(404).json({ mensagem: 'personal não encontrado' });
    }

    res.json(personal[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar dados do luno');
  }
});


router.put('/salvarDadosPersonal', authenticateToken, async (req, res) => {

  // Agora que os valores estão garantidos, você pode extrair:
  const { id, nome, cpf, email, telefone, cep, logradouro, numero, complemento, cidade, uf } = req.body;
  //console.log("id",id);
  //console.log("nome",nome);
  //console.log("telefone",telefone);
  //console.log("localid",localid);
  //console.log("servicoid",servicoid);
  //console.log("datainicio",datainicio);

  // UPDATE
  try {
    const personal = await sql`
      UPDATE personals SET
       Personal = ${nome}, PerCPF = ${cpf}, PerCep = ${cep}, PerEmail = ${email},
       perfone = ${telefone}, perlogradouro = ${logradouro}, pernumero = ${numero},
       percidade = ${cidade}, peruf = ${uf}, percomple = ${complemento}
       WHERE Personal_ID = ${id}
      RETURNING *
    `;    
    res.status(201).json(personal);
    } catch (err) {
      console.error('Erro ao atualizar personal:', err);
      res.status(500).json({ error: 'Erro ao atualizar personal' });
    }
});


export default router;