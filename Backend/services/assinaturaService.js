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

export const buscarDadosAtualizAss = async (assinaturaid, planoid) => {

    try {
        const retorno = await sql`
            SELECT *
              FROM h2uDadosAtualizAss
            WHERE assinatura_id=${assinaturaid}
              AND ASPStatus='PAGO'
              AND aspdata_pagamento >  NOW() - interval '3 day'
              AND plano_id=planoid
            ORDER BY AssinaturasPagto_ID
            DESC LIMIT 1
     `;

     console.log('buscarDadosAtualizAss', retorno);
     console.log('buscarDadosAtualizAss', retorno[0]);
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

    console.log('assinatura?.aspvalor', assinatura?.aspvalor);
    console.log('plano?.valorativo', plano?.valorativo);
    console.log('assinatura?.asporder_id', assinatura?.asporder_id);

    if (assinatura?.asporder_id && assinatura?.aspvalor == plano?.valorativo) {
            console.log('VAI VERIFICAR PIX PENDENTE');
        const pendente = await mercadoPagoService.pixPendente(
            assinatura.asporder_id
        );

        if (pendente) {
            // Retorna o QRCode gravado no banco
            return assinatura;
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

    console.log('pagamento', pagamento);

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
            ${plano.valorativo},
            'PENDENTE',
            ${pix.status},
            ${pagamento.pagamento.id},
            ${pix.id},
            ${pix.payment_method.qr_code},
            ${pagamento.pagamento},
            ${pix.date_of_expiration},
            ${gateway},
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

    const planoid = resultado.asplanoid;
    console.log('lanoid', planoid);
    const dadAtAss = await buscarDadosAtualizAss(assinaturaId, planoid);

    console.log("Resultado UPDATE:", resultado);
    console.log("Depois do UPDATE");

     console.log("Antes do UPDATE");

    const resultAssina = await sql`
        UPDATE assinaturas
        SET asplano = ${dadAtAss.descricao},
            asvalor = ${dadAtAss.aspvalor},
            asdata_inicio = ${dadAtAss.aspdata_pagamento} ,
	        asdata_fim = ${dadAtAss.validade},
            asdata_pripgto = COALESCE(asdata_pripgto,${dadAtAss.aspdata_pagamento})
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

console.log("payment:", payment);
mostrou isso

payment: {
  amount: '19.90',
  id: 'PAY01KYW54WCK20GAK8S28H9QCT1B',
  paid_amount: '19.90',
  payment_method: {
    e2e_id: 'PIXE003603052026073116540e3d7492db5',
    id: 'pix',
    installments: 0,
    type: 'bank_transfer'
  },
  reference: { id: '000e4bz70k' },
  status: 'processed',
  status_detail: 'accredited'
}
Antes do UPDATE
Resultado UPDATE: Result(1) [
  {
    assinaturaspagto_id: 11,
    aspassinaturaid: 5,
    aspvalor: '19.90',
    aspstatus: 'PAGO',
    aspstatusgateway: 'processed',
    asporder_id: 'ORD01KYW54WC9FPDY5N3ZJ2KZ6C9N',
    asppayment_id: 'PAY01KYW54WCK20GAK8S28H9QCT1B',
    asppix_copia_cola: '00020126580014br.gov.bcb.pix01363732778e-6344-4fdb-9e3a-4f52ed16f32d520400005303986540519.905802BR5923CLOVISROBERTONOVELLETTO6009Sao Paulo62250521mpqrinter171364168140630400EA',
    asppayload: {
      id: 'ORD01KYW54WC9FPDY5N3ZJ2KZ6C9N',
      type: 'online',
      status: 'action_required',
      user_id: '227121296',
      currency: 'BRL',
      description: 'Mensal  - Período 31/07/2026 a 31/08/2026',
      api_response: [Object],
      capture_mode: 'automatic_async',
      country_code: 'BRA',
      created_date: '2026-07-31T13:17:18.611Z',
      total_amount: '19.90',
      transactions: [Object],
      status_detail: 'waiting_transfer',
      processing_mode: 'automatic',
      integration_data: [Object],
      last_updated_date: '2026-07-31T13:17:19.611Z',
      total_paid_amount: '19.90',
      external_reference: 'H2u_Ass_5_Renov'
    },
    aspgateway: 'Mercado Pago',
    aspexternal_reference: 'H2u_Ass_5_Renov',
    aspdata_pagamento: 2026-07-31T16:55:13.127Z,
    criacao: 2026-07-31T13:17:19.741Z,
    atualizacao: 2026-07-31T13:17:19.741Z,
    aspexpiracao: 2026-08-01T13:17:18.928Z,
    aspticket_url: null,
    asplanoid: 1
  }
]
*/

