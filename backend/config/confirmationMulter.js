const multer = require('multer');
const randomstring = require('randomstring');
const path = require('path');
const translitter = require('cyrillic-to-translit-js');
const sanitize = require('sanitize-filename');
const fs = require('fs');
const crypto = require('crypto');

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

storage._handleFile = function _handleFile(req, file, cb) {
    const that = storage;
    const hash = crypto.createHash('md5');
    that.getDestination(req, file, function(err, destination) {
        if (err) return cb(err);
        that.getFilename(req, file, function(err, filename) {
            if (err) return cb(err);

            const finalPath = path.join(destination, filename);
            const outStream = fs.createWriteStream(finalPath);

            file.stream.pipe(outStream);
            outStream.on('error', cb);
            file.stream.on('data', function(chunk) {
                hash.update(chunk);
            });
            outStream.on('finish', function() {
                cb(null, {
                    destination: destination,
                    filename: filename,
                    path: finalPath,
                    size: outStream.bytesWritten,
                    hash: hash.digest('hex'),
                });
            });
        });
    });
};

const upload = multer({storage: storage, limits: {fileSize: 1024*1024*15}}).single('file');

module.exports = upload;
