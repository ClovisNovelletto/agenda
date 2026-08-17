import express from 'express';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

import * as assinaturaController from '../controllers/assinaturaController.js';
import * as assinaturaService  from '../services/assinaturaService.js';

console.log(">>> assinatura.js !");
const router = express.Router();

router.post(
    '/assinaturaCriarPgtoPix',
    authenticateToken,
    assinaturaController.renovarAssinatura
);

router.get('/dadosPlano', authenticateToken, async (req, res) => {
  try { console.log("carrega Dados do Plano");
    const personalid = req.user.personalid;

    const assinatura = await sql`
        SELECT * FROM h2uassinaturas
        WHERE aspersonalid =${personalid}
        `;

    /*console.log("assinatura: ", {assinatura_id: assinatura[0].assinatura_id,
      aspersonalid: assinatura[0].aspersonalid,
      asplano: assinatura[0].asplano,
      asvalor: assinatura[0].asvalor,
      asdias_aviso: assinatura[0].asdias_aviso,
      asstatus: assinatura[0].asstatus,
      asdata_inicio: assinatura[0].asdata_inicio,
      asdata_fim: assinatura[0].asdata_fim,
      asgateway: assinatura[0].asgateway,
      diasrestantes: assinatura[0].diasrestantes,
      asplanostipoid: assinatura[0].asplanostipoid
    });*/

    res.json({assinatura_id: assinatura[0].assinatura_id,
      aspersonalid: assinatura[0].aspersonalid,
      asplano: assinatura[0].asplano,
      asvalor: assinatura[0].asvalor,
      asdias_aviso: assinatura[0].asdias_aviso,
      asstatus: assinatura[0].asstatus,
      asdata_inicio: assinatura[0].asdata_inicio,
      asdata_fim: assinatura[0].asdata_fim,
      asgateway: assinatura[0].asgateway,
      diasrestantes: assinatura[0].diasrestantes,
      asplanostipoid: assinatura[0].asplanostipoid
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar assinatura');
  }
});

router.post('/dadosPagtos', authenticateToken, async (req, res) => {
  try { console.log("carrega Dados do Plano");
    const personalid = req.user.personalid;

    const assinaturaPagto = await sql`select assinaturaspagto_id, aspvalor, aspstatus, aspdata_pagamento, 
                                        aspexternal_reference, aspgateway
        FROM h2uassinaturaspagtos
      WHERE personalid =${personalid}
      `;

    //console.log("assinaturaPagto: " + assinaturaPagto)

    res.json(assinaturaPagto);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar assinatura pagamentos');
  }
});

router.post('/carregaPlanos', authenticateToken, async (req, res) => {
  try { console.log("carrega Planos");

    const ass_planostipoid = req.user.ass_planostipoid;
    //console.log('req.user',req.user);
    //console.log('ass_planostipoid',ass_planostipoid);

    const planos = await sql`select * 
        FROM h2uplanos
      WHERE ativo=true
        AND planostipo_id = ${ass_planostipoid}
      `;

    //console.log("planos: ", planos)

    res.json(planos);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar planos');
  }
});

router.get('/assinatura',
    authenticateToken,
    assinaturaService.buscarAssinatura
)

router.post('/buscarDadosAtualizAss', authenticateToken, async (req, res) => {

  if (typeof req.body[`assinaturaid`] === 'undefined') {
    req.body[`assinaturaid`] = null;
  } 

  if (typeof req.body[`planoid`] === 'undefined') {
    req.body[`planoid`] = null;
  } 

  const {assinaturaid} = req.body;
  const {planoid} = req.body;
    try {
        const retorno = await sql`
            SELECT *
              FROM h2uDadosAtualizAss
            WHERE assinatura_id=${assinaturaid}
              AND plano_id=${planoid}
            ORDER BY AssinaturasPagto_ID
            DESC LIMIT 1  
     `;

     console.log('buscarDadosAtualizAss', retorno);
     console.log('buscarDadosAtualizAss', retorno[0]);
        return res.json(retorno[0]);
        
    } catch (err) {
        console.error('Erro ao buscar dados atul ass:', err);
        throw err;
    }

/*  try { 
    console.log("carrega Planos");

    const {assinaturaid} = req.body;
    const dadosAtualizAss = assinaturaService.buscarDadosAtualizAss(assinaturaid)

    res.json(dadosAtualizAss);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar dados atualização assinatura');
  }
*/
})

export default router;