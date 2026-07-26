import { MercadoPagoConfig, Payment, Order } from 'mercadopago';
import crypto from "crypto";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN_PROD
});

const orderClient = new Order(client);

export const gerarPix = async (dados) => {

    console.log("EXECUTNADO MercadoPagoService");
    console.log("dados.assinatura:", dados.assinatura);
    console.log("orderClient", orderClient);

    const body = {

        type: "online",
        external_reference: dados.assinatura.external_reference,
        processing_mode: "automatic",
        total_amount:  dados.assinatura.asvalor,
        description: dados.assinatura.description,
        payer: {
            email: dados.assinatura.peremail,
            first_name: dados.assinatura.first_name,
            last_name:  dados.assinatura.last_name,
            identification: {
                type:  "CPF",
                number:  dados.assinatura.percpf
            },

            address: {
                zip_code:  dados.assinatura.percep,
                street_name:  dados.assinatura.perlogradouro,
                street_number:  dados.assinatura.pernumero
            }

        },

        transactions: {
            payments: [
                {
                    amount: dados.assinatura.asvalor,
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