const multer = require('multer');
const randomstring = require('randomstring');
const path = require('path');
const translitter = require('cyrillic-to-translit-js');

const uploadsConfirmationsPath = path.join(__dirname, '../static/confirmations');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsConfirmationsPath)
    },
    filename: (req, file, cb) => {
        let filename = translitter().transform(file.originalname, '_').replace(/&/g, '_').replace(/\\/g, '_').replace(/%/g, '_')
            .replace(/\?/g, '').replace(/[\%\№\!\;\[\]\\\/\{\}\:()\=\*+\,\<\>\$\~\`\'\"\@\|\^\-\#]/g, '').replace(/[^\x00-\x7F]/g, '');
        cb(null, 'conf-' + randomstring.generate(16) + '-' +  filename)
    }
});

var upload = multer({storage: storage}).single('file');

module.exports = upload;
