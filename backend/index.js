require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// מסלולי auth
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const authMiddleware = require('./middleware/auth');

// מסלול משוב
const { router: feedbackRoutes } = require('./routes/feedback');
app.use('/api/feedback', authMiddleware, feedbackRoutes);

// מסלול vision (מוגן)
const visionRoutes = require('./routes/vision');
app.use('/api/vision', authMiddleware, visionRoutes);

// מסלול העלאת תמונה (מוגן)
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', authMiddleware, uploadRoutes);

// הגשת קבצים סטטיים
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('PhotoMentor API is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
