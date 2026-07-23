import express from 'express';
import { authenticateToken } from "../middleware/authMiddleware.js";

import * as assinaturaController from '../controllers/assinaturaController.js';
import * as assinaturaService  from '../services/assinaturaService.js';

const router = express.Router();

console.log("ASSINATURA EXECUTANDO");
router.post(
    '/assinaturaCriarPgtoPix',
    authenticateToken,
    assinaturaController.renovarAssinatura
);

router.get('/assinatura',
    authenticateToken,
    assinaturaService.buscarAssinatura
)

export default router;