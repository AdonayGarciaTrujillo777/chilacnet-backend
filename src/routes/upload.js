const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const validarToken = require('../middlewares/validarToken');

// 1. Configuramos dónde y con qué nombre se guardarán las fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Se guardarán en la carpeta que creaste
  },
  filename: function (req, file, cb) {
    // Le ponemos un nombre único (ej. 167890123-foto.jpg) para que no se sobreescriban
    const prefijoUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, prefijoUnico + path.extname(file.originalname));
  }
});

// 2. Filtro de seguridad: Solo aceptar imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('El archivo no es una imagen válida'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// 3. RUTA POST: Recibe la imagen y devuelve el enlace público
router.post('/', validarToken, upload.single('foto'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    
    // Generamos el enlace público que guardaremos en la base de datos
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ url: imageUrl, mensaje: 'Imagen subida con éxito' });
    
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error interno al procesar la imagen' });
  }
});

module.exports = router;