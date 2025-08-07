const multer = require('multer');
const path = require('path');

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
  // Desteklenen dosya türleri
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|wmv|flv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece resim ve video dosyaları yüklenebilir!'));
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload; 