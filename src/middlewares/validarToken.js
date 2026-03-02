const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
    // El token de seguridad suele enviarse en una cabecera HTTP llamada "Authorization"
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        // El estándar es enviar el token con la palabra "Bearer " antes (ej. "Bearer eyJhbG...")
        const tokenLimpio = tokenHeader.replace('Bearer ', '');
        
        // Verificamos que el token sea genuino usando nuestro secreto
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
        // Guardamos los datos del usuario logueado en la petición por si los necesitamos después
        req.usuario = verificado; 
        
        // El token es válido, le damos luz verde para continuar a la ruta
        next(); 
    } catch (error) {
        res.status(400).json({ error: 'El token no es válido o ya expiró.' });
    }
};

module.exports = validarToken;