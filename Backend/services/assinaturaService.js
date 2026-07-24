import * as mercadoPagoService from '../services/mercadoPagoService.js';
import { sql } from '../db.js';

export const buscarAssinatura = async (personalid) => {

    try {
        const retorno = await sql`

            SELECT  *
            FROM h2uassinaturaspagtos
            WHERE personalid=${personalid}

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
        personalid
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

export async function confirmarPagamento(payment) {

    console.log('ENTROU ASSINATURA SERVICE CONFIRMAR PAGAMENTO');

    // atualiza assinatura
    // grava pagamento
    // altera status
}



export const buscarAssinatura_excluir = async (req, res) => {

    const personalid = req.user.personalid;

    // Busca assinatura
    router.get('/treinoLista', authenticateToken, async (req, res) => {
    try {
        console.log("carrega Assinatura");
        const personalid = req.user.personalid;

        const assinatura = await sql`SELECT *
            FROM h2uassinaturaspagtos
            WHERE personalid = ${personalid}`;
        res.json(assinatura);
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar Assinatura');
    }
    });

    res.json(retorno);

}