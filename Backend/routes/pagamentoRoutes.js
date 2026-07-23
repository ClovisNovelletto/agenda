import express from 'express';
import { renovarAssinatura } from '../controllers/assinaturaController.js';
import { sql } from '../db.js';
import { authenticateToken } from "../middleware/authMiddleware.js";

console.log(">>> pagamento MP.js !");
const router = express.Router();


router.post('/pix', renovarAssinatura);

export default router;