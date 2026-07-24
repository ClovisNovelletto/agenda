import * as assinaturaService from '../services/assinaturaService.js';

export async function processar(body) {

    console.log('ENTROU WEBHOOK SERVICE PROCESSAR');

    if (body.type !== 'payment') {
        return;
    }

    const payment = await paymentClient.get({
        id: body.data.id
    });

    console.log(payment);

    await assinaturaService.confirmarPagamento(payment);
    
}