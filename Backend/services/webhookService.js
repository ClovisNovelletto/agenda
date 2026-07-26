import * as assinaturaService from '../services/assinaturaService.js';

export async function processar(body) {

    console.log("Tipo:", body.type);

    if (body.type !== "order") {
        return;
    }

    if (body.data.status !== "processed") {
        return;
    }

    if (body.data.status_detail !== "accredited") {
        return;
    }

    await assinaturaService.confirmarPagamento(body);

}


export async function processar_excluir(body) {

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