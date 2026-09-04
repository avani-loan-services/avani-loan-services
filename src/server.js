// src/server.js
const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Register API routes
const eligibilityRouter = require('./routes/eligibility');
app.use('/api/eligibility', eligibilityRouter);

// Serve frontend (assuming Vite build)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Cleanup job – delete uploaded files older than retention period
const cron = require('node-cron');
const fs = require('fs');
const uploadDir = process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, 'uploads', 'eligibility');
const retentionDays = parseInt(process.env.ELIGIBILITY_RETENTION_DAYS || '30', 10);
cron.schedule('0 2 * * *', () => { // run daily at 02:00
  if (!fs.existsSync(uploadDir)) return;
  const now = Date.now();
  fs.readdirSync(uploadDir).forEach(file => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    const ageDays = (now - stats.birthtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays > retentionDays) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old file: ${file}`);
    }
  });
});
