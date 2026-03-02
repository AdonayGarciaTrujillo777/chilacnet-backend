const express = require('express'); // Asegúrate de tener esta línea
const cors = require('cors');
const pool = require('./db');
const path = require('path'); // <-- NUEVO: Necesario para leer la carpeta de fotos
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON

// <-- NUEVO: Habilitar la carpeta "uploads" para que sea pública
// Así el frontend podrá mostrar las imágenes directamente desde el servidor
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/upload', require('./routes/upload')); // <-- NUEVO: Conectamos la ruta de subida de fotos

// Ruta de prueba para verificar la conexión a la base de datos
app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            mensaje: '¡Conexión exitosa a la base de datos de Chilacnet!',
            hora_servidor: result.rows[0].now
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al conectar con la base de datos' });
    }
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de Chilacnet corriendo en el puerto ${PORT}`);
});