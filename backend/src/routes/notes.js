const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

// Get all notes (with optional filters)
router.get('/', async (req, res) => {
  const { notebookId, tagId, search, pinned } = req.query;

  try {
    const where = { userId: req.userId };

    if (notebookId) where.notebookId = parseInt(notebookId);
    if (pinned === 'true') where.isPinned = true;
    if (tagId) {
      where.tags = { some: { tagId: parseInt(tagId) } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        notebook: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Get single note
router.get('/:id', async (req, res) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
      include: {
        notebook: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!note) return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Create note
router.post('/', async (req, res) => {
  const { title, content, notebookId, tagIds } = req.body;

  try {
    const note = await prisma.note.create({
      data: {
        title: title || '제목 없음',
        content: content || '',
        userId: req.userId,
        notebookId: notebookId ? parseInt(notebookId) : null,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId) => ({ tagId: parseInt(tagId) })) }
          : undefined,
      },
      include: {
        notebook: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  const { title, content, notebookId, tagIds, isPinned } = req.body;

  try {
    const existing = await prisma.note.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });

    // Update tags if provided
    if (tagIds !== undefined) {
      await prisma.noteTag.deleteMany({ where: { noteId: parseInt(req.params.id) } });
      if (tagIds.length > 0) {
        await prisma.noteTag.createMany({
          data: tagIds.map((tagId) => ({
            noteId: parseInt(req.params.id),
            tagId: parseInt(tagId),
          })),
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (notebookId !== undefined) updateData.notebookId = notebookId ? parseInt(notebookId) : null;

    const note = await prisma.note.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        notebook: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });

    await prisma.note.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '노트가 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
