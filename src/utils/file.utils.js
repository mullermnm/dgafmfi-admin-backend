const fs = require('fs').promises;
const path = require('path');

/**
 * Delete a file from the filesystem
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<void>}
 */
exports.deleteFile = async (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    await fs.unlink(absolutePath);
  } catch (error) {
    // If file doesn't exist, just ignore the error
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

/**
 * Ensure a directory exists, create it if it doesn't
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<void>}
 */
exports.ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
};
