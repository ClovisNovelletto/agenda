import * as mercadoPagoService from '../services/mercadoPagoService.js';
import { sql } from '../db.js';

export const buscarAssinatura = async (personalid) => {

    try {
        const retorno = await sql`

            SELECT  *
            FROM h2uassinaturaspagtos
            WHERE personalid=${personalid}
            LIMIT 1
        `;

        return retorno[0];
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar Assinatura');
    }
};

export const renovarAssinatura = async (personalid) => {

    // Buscar assinatura
    
    const assinatura = await buscarAssinatura(personalid);

    // Verificar PIX pendente
    if (assinatura.assinaturaspagto_id) {
        const retorno = assinatura;
        return retorno;
    }
    // Se existir, retornar

    // Se não existir:
    const pagamento = await mercadoPagoService.gerarPix({
        assinatura
    });

    // Gravar no banco

    const pix = pagamento.pagamento.transactions.payments[0];

    console.log('ASSINATURA', assinatura);

    await sql`

        INSERT INTO assinaturaspagtos
        (   aspassinaturaid,
            aspvalor,
            aspstatus,
            aspstatusgateway,
            asporder_id,
            asppayment_id,
            asppix_copia_cola,
            asppayload,
            aspexpiracao
        )

        VALUES
        (   ${assinatura.assinatura_id},
            ${assinatura.asvalor},
            'PENDENTE',
            ${pix.status},
            ${pagamento.pagamento.id},
            ${pix.id},
            ${pix.payment_method.qr_code},
            ${pagamento.pagamento},
            ${pix.date_of_expiration}
        )

    `;

    return await buscarAssinatura(personalid);

}

export async function confirmarPagamento(body) {

    console.log('ENTROU ASSINATURA SERVICE CONFIRMAR PAGAMENTO');

    const referencia = body.data.external_reference;

    const partes = referencia.split("_");

    const assinaturaId = Number(partes[2]);
    //const assinaturaspagto_id = Number(partes[3]);
    const payment = body.data.transactions.payments[0];

    console.log("assinaturaId:", assinaturaId);
    //console.log("assinaturaspagto_id:", assinaturaspagto_id);
    console.log("payment:", payment);

    // UPDATE assinatura
     await sql`

        UUPDATE assinaturaspagtos SET aspstatus = 'PAGO'
        WHERE aspassinaturaid = ${assinaturaId}
          AND data.id
          AND aspstatus='PENDENTE'
        `

    // INSERT histórico
    await sql`

        INSERT INTO historicopagamentos
        (   order_id,
            payment_id,
            external_reference,
            valor,
            status,
            status_detail,
            e2e_id,
            data_pagamento,
            live,
            user_id
        )

        VALUES
        (
            ${body.data.id},
            ${payment.id},
            ${body.data.external_reference},
            ${payment.paid_amount},
            ${payment.status},
            ${payment.status_detail},
            ${payment.payment_method.e2e_id},
            ${body.date_created},
            ${body.live_mode},
            ${body.user_id}
        )
    `;
}

/*
{
  "action": "order.processed",
  "api_version": "v1",
  "application_id": "5539186215915513",
  "data": {
    "currency_id": "BRL",
    "external_reference": "ASS_1_RENOVACAO",
    "id": "ORD01KYE10S4QXZSDHWCKGKEFR2NF",
    "status": "processed",
    "status_detail": "accredited",
    "total_amount": "0.10",
    "total_paid_amount": "0.10",
    "transactions": {
      "payments": [
        {
          "amount": "0.10",
          "id": "PAY01KYE10S527BBYXX6KXPE8QAQ2",
          "paid_amount": "0.10",
          "payment_method": {
            "e2e_id": "PIXE00360305202607260140c5589350187",
            "id": "pix",
            "installments": 0,
            "type": "bank_transfer"
          },
          "reference": {
            "id": "000dz0uv3a"
          },
          "status": "processed",
          "status_detail": "accredited"
        }
      ]
    },
    "type": "online",
    "version": 2
  },
  "date_created": "2026-07-26T01:40:30.173608393Z",
  "live_mode": true,
  "type": "order",
  "user_id": "227121296"
}
*/