import * as mercadoPagoService from '../services/mercadoPagoService.js';
import * as assinaturaService  from '../services/assinaturaService.js';

export const buscarAssinatura = async (req, res) => {

    try {

        const retorno = await assinaturaService.buscarAssinatura(
            req.user.personalid
        );

        res.json(retorno);

    } catch (e) {

        console.error(e);

        res.status(500).json({
            sucesso:false,
            erro:e.message
        });

    }

};

export const renovarAssinatura = async (req, res) => {

    const { planoId } = req.body;

    try {

        const retorno = await assinaturaService.renovarAssinatura(
            req.user.personalid,
            planoId
        );

        res.json(retorno);

    } catch (e) {

        console.error(e);

        res.status(500).json({
            sucesso:false,
            erro:e.message
        });

    }

};

export const renovarAssinatura_excluir = async (req, res) => {

    try {

        const personalid = req.user.personalid;

        const retorno = await assinaturaService.renovarAssinatura(personalid);

        return res.json(retorno);

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            erro: erro.message
        });

    }

};


export const gerarPix_Excluir = async (req, res) => {

    try {

        const personalid = req.user.personalid;

        console.log("CONTROLER EXECUTANDO - personalid: ", personalid);
        const retorno = await mercadoPagoService.gerarPix({
            personalid
        });

         console.log("CONTROLER EXECUTANDO - retorno: ", retorno);

        return res.json(retorno);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            sucesso: false,
            erro: error.message
        });

    }

};
