const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { notes: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

router.post('/', async (req, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '태그 이름을 입력하세요.' });

  try {
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || '#6366f1',
        userId: req.userId,
      },
      include: { _count: { select: { notes: true } } },
    });
    res.status(201).json(tag);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: '이미 존재하는 태그입니다.' });
    }
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.tag.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: '태그를 찾을 수 없습니다.' });

    await prisma.tag.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: '태그가 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
