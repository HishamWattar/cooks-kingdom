const multer = require('multer');
const path = require('path');

// multer accepts many things
// Storage is an obj contain everything related to storage, in this case we are using memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // no file larger than 5mb
  // eslint-disable-next-line consistent-return
  fileFilter: (req, file, cb) => {
    // The uploaded file extension should one of these /jpeg|png|jpg|gif/
    const filetypes = /jpeg|png|jpg|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only multer files (jpg, jpeg, png, gif) are allowed'));
  },
});

module.exports = upload;
