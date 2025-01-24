const path = require('path');
const fs = require('fs');

const setupUploads = () => {
  const uploadDir = path.join(__dirname, '../..', process.env.UPLOAD_PATH || 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

module.exports = {
  setupUploads
};
