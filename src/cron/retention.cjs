// src/cron/retention.js
const fs = require('fs');
const path = require('path');

// Clean up old eligibility files (older than 30 days)
function cleanupOldFiles() {
  const uploadDir = process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility');
  const retentionDays = parseInt(process.env.FILE_RETENTION_DAYS) || 30;
  const now = Date.now();

  if (fs.existsSync(uploadDir)) {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error('[cron] Error reading upload dir:', err);
        return;
      }

      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error('[cron] Error getting file stats:', err);
            return;
          }
          
          const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
          if (ageInDays > retentionDays) {
            fs.unlink(filePath, err => {
              if (err) console.error(`[cron] Error deleting old file ${file}:`, err);
              else console.log(`[cron] Deleted old file: ${file}`);
            });
          }
        });
      });
    });
  }
}

// Run cleanup every day at midnight (using simple interval for simplicity here, or use node-cron)
// 86400000 ms = 24 hours
setInterval(cleanupOldFiles, 86400000);

// Run once on startup
cleanupOldFiles();

module.exports = { cleanupOldFiles };
