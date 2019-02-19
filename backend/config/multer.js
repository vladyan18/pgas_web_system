const multer = require('multer')
const randomstring = require('randomstring')
const path = require('path')

const uploadsPath = path.join(__dirname, '../../frontend/build/public/uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath)
  },
  filename: (req, file, cb) => {
    cb(null, 'doc-' + randomstring.generate(16) + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: storage,
  limits: { filesize: 15 * 1024 * 1024 }
}).array('files', 12)

module.exports = upload
