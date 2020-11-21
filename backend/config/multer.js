'use strict';

const multer = require('multer');
const randomstring = require('randomstring');
const path = require('path');

const uploadsPath = path.join(__dirname, '../docs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    cb(null, 'crits-' + randomstring.generate(16) + path.extname(file.originalname));
  },
});

const upload = multer({storage: storage}).single('file');

module.exports = upload;
