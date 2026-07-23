import express from 'express';

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

router.post('/webhook', async (req, res) => {
    console.log('====================================');
    console.log('WEBHOOK RECEBIDO');
    console.log(new Date());
    console.log('====================================');

    logWebhook('HEADERS', req.headers);
    logWebhook('QUERY', req.query);
    logWebhook('BODY', req.body);

    // Sempre responder 200 rapidamente
    res.sendStatus(200);
});

export default router;