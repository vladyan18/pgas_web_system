const multer = require('multer');
const randomstring = require('randomstring');
const path = require('path');

const uploadsConfirmationsPath = path.join(__dirname, '../static/confirmations');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsConfirmationsPath)
    },
    filename: (req, file, cb) => {
        cb(null, 'conf-' + randomstring.generate(16) + '-' + path.extname(file.originalname))
    }
});

var upload = multer({storage: storage}).single('file');

module.exports = upload;
