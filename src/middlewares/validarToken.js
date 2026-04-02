const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const tokenLimpio = tokenHeader.replace('Bearer ', '');
        
        const verificado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        
        req.usuario = verificado; 
        
        next();     
    } catch (error) {
        res.status(400).json({ error: 'El token no es válido o ya expiró.' });
    }
};

module.exports = validarToken;