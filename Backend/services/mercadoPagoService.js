import { MercadoPagoConfig, Payment, Order } from 'mercadopago';
import crypto from "crypto";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN_PROD
});

const orderClient = new Order(client);

export async function pixPendente(orderId) {

    if (!orderId) {
        return false;
    }

    const order = await orderClient.get({
        id: orderId
    });

    console.log('MERCADO PAGO ORDER', order);

    //console.dir(order.transactions.payments, { depth: null });
    console.log(JSON.stringify(order.transactions.payments, null, 2));

    return order.status === 'action_required' &&
           order.status_detail === 'waiting_transfer'

    //return order.status === 'pending';
}
/*
        if (payment.status === 'pending') {

            // compara valor do PIX pendente com o novo plano

            if (Number(payment.transaction_amount) === Number(plano.valorativo)) {

                console.log('Existe PIX pendente para o mesmo valor');
                return assinatura;
                //return {
                //    reutilizar: true,
                //    qr_code: payment.point_of_interaction.transaction_data.qr_code,
                //    qr_base64: payment.point_of_interaction.transaction_data.qr_code_base64
                //};

            } else {

                console.log('PIX pendente é de outro plano');

                // opcional: cancelar o antigo no Mercado Pago
                // ou apenas ignorar e gerar outro

            }

        }
*/
export const gerarPix = async ({assinatura, plano}) => {

    console.log("EXECUTANDO MercadoPagoService GERA PIX");

    const body = {

        type: "online",
        external_reference: assinatura.external_reference,
        processing_mode: "automatic",
        total_amount:  plano.valorativo,
        description: plano.descperiodo,
        payer: {
            email: assinatura.peremail,
            first_name: assinatura.first_name,
            last_name:  assinatura.last_name,
            identification: {
                type:  "CPF",
                number:  assinatura.percpf
            },

            address: {
                zip_code:  assinatura.percep,
                street_name:  assinatura.perlogradouro,
                street_number:  assinatura.pernumero
            }

        },

        transactions: {
            payments: [
                {
                    amount: plano.valorativo,
                    payment_method: {
                        id: "pix",
                        type: "bank_transfer"
                    }
                }
            ]
        }

    };

    console.log("body", body);


//    const pagamentosLista = await orderClient.search();

//    console.log(pagamentosLista);

    
    try {

        const pagamento = await orderClient.create({
            body
        });

        console.log("Pagamento:", pagamento);
        const pix = pagamento.transactions.payments[0];
        return {
            sucesso:true,
            pagamento,
            orderId: pagamento.id,
            status: pagamento.status,
            qrCode: pix.payment_method.qr_code,
            qrCodeBase64: pix.payment_method.qr_code_base64,
            expiration: pix.date_of_expiration
        };

        return {
            sucesso:true,
            orderId: pagamento.id,
            status: pagamento.status,
            pagamento
        };


        //const pix = pagamento.transactions.payments[0];
        console.log("pix:", pix);

        const metodo = pix.payment_method;
        console.log("metodo:", metodo);

        return {
            sucesso: true,
            orderId: pagamento.id,
            paymentId: pix.id,
            referenceId: pix.reference_id,
            status: pagamento.status,
            statusDetail: pagamento.status_detail,
            qrCode: metodo.qr_code,
            qrCodeBase64: metodo.qr_code_base64,
            ticketUrl: metodo.ticket_url,
            expiration: pix.date_of_expiration
        };

    } catch (e) {

        console.log("ERRO COMPLETO");

        console.dir(e, { depth: null });

        throw e;

    }    

};