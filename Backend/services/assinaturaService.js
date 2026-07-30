import * as mercadoPagoService from '../services/mercadoPagoService.js';
import { sql } from '../db.js';

export const buscarPlano = async (planoId) => {

    try {
        const retorno = await sql`
            SELECT Descricao, ValorAtivo, Validade, DescPeriodo
            FROM h2uplanos
            WHERE plano_id=${planoId}
        `;

        return retorno[0];
        
    } catch (err) {
        console.error('Erro ao buscar plano:', err);
        throw err;
    }
};        

export const buscarAssinatura = async (personalid) => {

    try {
        const retorno = await sql`

            SELECT  *
            FROM h2uassinaturaspagtos
            WHERE personalid=${personalid}
              AND COALESCE(ASPStatus,'PENDENTE')='PENDENTE'
              AND COALESCE(ASPExpiracao, NOW() + interval '1 day') > NOW()
            LIMIT 1
        `;

        return retorno[0];
        
    } catch (err) {
        console.error('Erro ao buscar assinatura:', err);
        throw err;
    }
};

export const buscarDadosAtualizAss = async (assinaturaid) => {

    try {
        const retorno = await sql`
            SELECT Descricao,
                aspvalor,
                aspdata_pagamento,
                aspdata_pagamento + (meses * INTERVAL '1 month') AS validade
            FROM AssinaturasPagtos
                LEFT JOIN Planos ON Plano_ID=ASPlanoID
            WHERE AspAssinaturaID=1
            AND ASPStatus='PAGO'
            ORDER BY AssinaturasPagto_ID
            DESC LIMIT 1
     `;

        return retorno[0];
        
    } catch (err) {
        console.error('Erro ao buscar dados atul ass:', err);
        throw err;
    }
};

export const renovarAssinatura = async (personalid, planoId) => {

    console.log('personalid', personalid);
    console.log('planoId', planoId);

    const gateway = 'Mercado Pago';

    // Buscar assinatura atual
    const assinatura = await buscarAssinatura(personalid);

        console.log('assinatura', assinatura);

    // Plano que ele acabou de escolher
    const plano = await buscarPlano(planoId);
console.log('plano', plano);

    if (assinatura?.asporder_id) {

        const payment = await paymentClient.get({
            id: assinatura.asporder_id
        });

        console.log("payment", payment)

        if (payment.status === 'pending') {

            // compara valor do PIX pendente com o novo plano

            if (Number(payment.transaction_amount) === Number(plano.valorvalido)) {

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

    }


    // Verificar PIX pendente
    //if (assinatura.assinaturaspagto_id) {
    //    const retorno = assinatura;
    //    return retorno;
    // }
    // Se existir, retornar

    // Se não existir:
    const pagamento = await mercadoPagoService.gerarPix({
        assinatura, plano
    });

    // Gravar no banco

    const pix = pagamento.pagamento.transactions.payments[0];

    console.log('ASSINATURA', assinatura);
    console.log('pagamento', pagamento);

    console.log(pix.status);
console.log(pagamento.pagamento.id);
console.log(pix.id);
console.log(pix.payment_method.qr_code);
console.log(pagamento.pagamento);
console.log(pix.date_of_expiration);
console.log(gateway);
console.log(planoId);

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
            aspexpiracao,
            aspgateway,
            asplanoid
        )

        VALUES
        (   ${assinatura.assinatura_id},
            ${plano.valorvalido},
            'PENDENTE',
            ${pix.status},
            ${pagamento.pagamento.id},
            ${pix.id},
            ${pix.payment_method.qr_code},
            ${pagamento.pagamento},
            ${pix.date_of_expiration},
            gateway,
            ${planoId}
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

    const dadAtAss = buscarDadosAtualizAss(assinaturaId);

    console.log("assinaturaId:", assinaturaId);
    //console.log("assinaturaspagto_id:", assinaturaspagto_id);
    console.log("payment.id:", payment.id);
    console.log("payment:", payment);

    // UPDATE assinatura

    console.log("Antes do UPDATE");

    const resultado = await sql`
        UPDATE assinaturaspagtos
        SET aspstatus = 'PAGO',
            aspstatusgateway = ${payment.status},
            aspexternal_reference =${body.data.external_reference},
            aspdata_pagamento = ${body.date_created}
        WHERE aspassinaturaid = ${assinaturaId}
        AND asppayment_id = ${payment.id}
        AND aspstatus = 'PENDENTE'
        RETURNING *;
    `;

    console.log("Resultado UPDATE:", resultado);
    console.log("Depois do UPDATE");

     console.log("Antes do UPDATE");

    const resultAssina = await sql`
        UPDATE assinaturas
        SET asplano = ${dadAtAss.descricao},
            asvalor = ${dadAtAss.aspvalor},
            asdata_inicio = ${dadAtAss.aspdata_pagamento} ,
	        asdata_fim = ${dadAtAss.validade}
        WHERE assinatura_id = ${assinaturaId}
        RETURNING *;
    `;

    console.log("Resultado UPDATE:", resultAssina);
    console.log("Depois do UPDATE");

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