import { ListSchema } from "@/validators/common-validators";
import express from "express";
import { z } from 'zod';

const router = express.Router();

// 
router.get('/my-snippets', (req, res) => {
    const body = ListSchema.extend({
        userId: z.string()
    }).parse(req.body);

})

router.post('/', (req, res) => {})

export default router;