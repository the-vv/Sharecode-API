import { ListSchema } from "@/schemas/common-schemas";
import express from "express";
import { z } from 'zod';
import { SnippetController } from "./controller";
import { snippetSchema } from "./schema";

const router = express.Router();

router.post('/', async (req, res) => {
    const body = snippetSchema.parse(req.body);
    const snippet = await SnippetController.createOne(body);
    res.json(snippet);
})

router.get('/my-snippets', async (req, res) => {
    const body = ListSchema.extend({
        userId: z.string()
    }).parse(req.body);
    const userSnippets = await SnippetController.getByUserId(body.userId, body);
    res.json(userSnippets);
})

router.post('/trending', async (req, res) => {
    const body = ListSchema.extend({
        userId: z.string()
    }).parse(req.body);
    const trendingSnippets = await SnippetController.getTrending(body);
    res.json(trendingSnippets);
})

export const snippetRouter = router;