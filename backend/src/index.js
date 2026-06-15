require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const notebooksRoutes = require('./routes/notebooks');
const tagsRoutes = require('./routes/tags');

const app = express();
const PORT = process.env.PORT || 4000;

const getAllowedOrigins = () => {
  if (process.env.FRONTEND_URL) {
    const url = process.env.FRONTEND_URL;
    // Render의 host 속성은 프로토콜 없이 hostname만 줄 수 있어서 양쪽 모두 허용
    return url.includes('://') ? [url] : [`https://${url}`, `http://${url}`];
  }
  return ['http://localhost:5173', 'http://localhost:3000'];
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || getAllowedOrigins().some(o => origin === o)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}, allowed: ${getAllowedOrigins()}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/notebooks', notebooksRoutes);
app.use('/api/tags', tagsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
