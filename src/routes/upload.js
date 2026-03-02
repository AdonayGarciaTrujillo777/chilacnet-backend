const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const validarToken = require('../middlewares/validarToken');
require('dotenv').config();

// 1. Configuración de Cloudinary (Credenciales)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configurar el almacenamiento en la nube
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chilacnet_evidencias', // Nombre de la carpeta en Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // transformation: [{ width: 800, height: 600, crop: 'limit' }] // Opcional: redimensionar
  },
});

const upload = multer({ storage: storage });

// 3. RUTA POST: Recibe la imagen y devuelve el enlace de Cloudinary
router.post('/', validarToken, upload.single('foto'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    
    // Cloudinary nos devuelve la URL directa en req.file.path
    res.json({ 
        url: req.file.path, 
        mensaje: 'Imagen guardada en la nube exitosamente' 
    });
    
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error interno al procesar la imagen' });
  }
});

module.exports = router;