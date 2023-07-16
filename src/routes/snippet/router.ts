import { ListSchema } from "@/schemas/common-schemas";
import express from "express";
import { z } from 'zod';
import { SnippetController } from "./controller";
import { CommentsSchema, snippetSchema } from "./schema";
import { appConfigs } from "@/utils/configs";
import { appErrorJson } from "@/utils/helper-functions";

const router = express.Router();

router.get('/my-snippets', async (req, res) => {
    const body = ListSchema.extend({
        userId: z.string()
    }).parse(req.body);
    const userSnippets = await SnippetController.getByUserId(body.userId, body);
    res.json(userSnippets);
})

router.get('/:id/likes', async (req, res) => {
    const snippet = await SnippetController.getLikes(req.params.id);
    res.json(snippet);
})

router.get('/:id/comments', async (req, res) => {
    const snippet = await SnippetController.getComments(req.params.id);
    res.json(snippet);
})

router.get('/trending', async (req, res) => {
    const body = ListSchema.parse(req.params);
    const trendingSnippets = await SnippetController.getTrending(body);
    res.json(trendingSnippets);
})

router.get('/:id', async (req, res) => {
    const snippet = await SnippetController.getById(req.params.id);
    res.json(snippet);
})

router.post('/', async (req, res) => {
    const body = snippetSchema.parse(req.body);
    const snippet = await SnippetController.createOne(body);
    res.json(snippet);
})

router.put('/:id/comment', async (req, res) => {
    const body = CommentsSchema.parse(req.body);
    const snippet = await SnippetController.addComment(req.params.id, body);
    res.json(snippet);
})

router.put('/:id/like', async (req, res) => {
    if (!req.body.userId) {
        return res.status(400).json(appErrorJson('userId is required'));
    }
    if (!appConfigs.mongoDBIdRegexp.test(req.body.userId)) {
        return res.status(400).json(appErrorJson('userId is invalid'));
    }
    const snippet = await SnippetController.addLike(req.params.id, req.body.userId);
    res.json(snippet);
})

router.patch('/:id/views', async (req, res) => {
    const snippet = await SnippetController.incrementViewCopy(req.params.id, false);
    res.json(snippet);
})

router.patch('/:id/copies', async (req, res) => {
    const snippet = await SnippetController.incrementViewCopy(req.params.id, true);
    res.json(snippet);
})

router.delete('/:id', async (req, res) => {
    if (!appConfigs.mongoDBIdRegexp.test(req.params.id)) {
        return res.status(400).json(appErrorJson('id is invalid'));
    }
    const snippet = await SnippetController.softDeleteById(req.params.id);
    res.json(snippet);
})

router.delete('/:id/force', async (req, res) => {
    if (!appConfigs.mongoDBIdRegexp.test(req.params.id)) {
        return res.status(400).json(appErrorJson('id is invalid'));
    }
    const snippet = await SnippetController.hardDeleteById(req.params.id);
    res.json(snippet);
})

router.delete('/:id/like/:userId', async (req, res) => {
    if (!req.params.userId) {
        return res.status(400).json(appErrorJson('userId is required'));
    }
    if (!appConfigs.mongoDBIdRegexp.test(req.params.userId)) {
        return res.status(400).json(appErrorJson('userId is invalid'));
    }
    const snippet = await SnippetController.removeLike(req.params.id, req.params.userId);
    res.json(snippet);
})

router.delete('/:id/comment/:commentId', async (req, res) => {
    if (!req.params.commentId) {
        return res.status(400).json(appErrorJson('commentId is required'));
    }
    if (!appConfigs.mongoDBIdRegexp.test(req.params.commentId)) {
        return res.status(400).json(appErrorJson('commentId is invalid'));
    }
    const snippet = await SnippetController.removeComment(req.params.id, req.params.commentId);
    res.json(snippet);
})


export const snippetRouter = router;