const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const notebooks = await prisma.notebook.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { notes: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(notebooks);
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '노트북 이름을 입력하세요.' });

  try {
    const notebook = await prisma.notebook.create({
      data: { name: name.trim(), userId: req.userId },
      include: { _count: { select: { notes: true } } },
    });
    res.status(201).json(notebook);
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

router.put('/:id', async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '노트북 이름을 입력하세요.' });

  try {
    const existing = await prisma.notebook.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: '노트북을 찾을 수 없습니다.' });

    const notebook = await prisma.notebook.update({
      where: { id: parseInt(req.params.id) },
      data: { name: name.trim() },
      include: { _count: { select: { notes: true } } },
    });
    res.json(notebook);
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.notebook.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: '노트북을 찾을 수 없습니다.' });

    await prisma.notebook.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '노트북이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
