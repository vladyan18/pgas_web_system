const multer = require('multer');
const randomstring = require('randomstring');
const path = require('path');
const translitter = require('cyrillic-to-translit-js');
const sanitize = require('sanitize-filename');

const uploadsConfirmationsPath = path.join(__dirname, '../static/confirmations');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsConfirmationsPath);
  },
  filename: (req, file, cb) => {
    let filename = translitter().transform(file.originalname, '_').replace(/&/g, '_').replace(/\\/g, '_').replace(/%/g, '_')
        // eslint-disable-next-line no-control-regex,no-useless-escape
        .replace(/\?/g, '').replace(/[%№!;\[\]\\\/{}:()=[\%\№\!\;\[\]\\\/\{\}\:()\=\*+,<>$~`'"@|^\-#+,<>$~`'"@|^\-#]/g, '').replace(/[^\x00-\x7F]/g, '');
    filename = sanitize(filename);
    cb(null, 'conf-' + randomstring.generate(16) + '-' + filename);
  },
});

const upload = multer({storage: storage, limits: {fileSize: 1024*1024*15}}).single('file');

module.exports = upload;
