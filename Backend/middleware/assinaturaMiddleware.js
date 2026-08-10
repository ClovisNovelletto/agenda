export function verificaAssinatura(req, res, next) {

    // alunos não possuem assinatura
    if (!req.user.personalid) {
        return next();
    }

    // sem informação no token
    if (!req.user.ass_validade) {
        return next();
    }

    const validade = new Date(req.user.ass_validade);
    const hoje = new Date();

    // ignora hora, compara apenas a data
    validade.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    if (validade < hoje) {
        return res.status(402).json({
            codigo: 'ASSINATURA_VENCIDA',
            mensagem: 'Sua assinatura venceu.'
        });
    }

    next();
}

function verificaAssinatura_OLD(req, res, next) {

    if (!req.user.personalid) {
        return next();
    }

    if (!req.user.ass_validade) {
        return next();
    }

    const hoje = new Date();
    const validade = new Date(req.user.ass_validade);

    if (validade < hoje) {
        return res.status(402).json({
            erro: 'ASSINATURA_VENCIDA',
            mensagem: 'Sua assinatura venceu.'
        });
    }

    next();
}
