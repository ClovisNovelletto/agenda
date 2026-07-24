import express from 'express';
import { webhookService } from '../services/webhookService';

const router = express.Router();

function logWebhook(titulo, dados) {
    console.log(`\n========== ${titulo} ==========`);

    if (typeof dados === 'object') {
        console.log(JSON.stringify(dados, null, 2));
    } else {
        console.log(dados);
    }

    console.log('===============================\n');
}

router.post('/', async (req, res) => {
    console.log('====================================');
    console.log('WEBHOOK RECEBIDO');
    console.log(new Date());
    console.log('====================================');

    logWebhook('HEADERS', req.headers);
    logWebhook('QUERY', req.query);
    logWebhook('BODY', req.body);

    // Sempre responder 200 rapidamente
    res.sendStatus(200);

    // Responde rapidamente ao Mercado Pago
    res.sendStatus(200);

    // Processa em segundo plano
    webhookService.processar(req.body)
        .catch(err => console.error(err));    
});

export default router;