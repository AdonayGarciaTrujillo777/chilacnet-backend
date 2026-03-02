const express = require('express');
const pool = require('../db');
const validarToken = require('../middlewares/validarToken');
const router = express.Router();

// GET: Obtener todos los clientes (Solo pasa si el token es válido)
router.get('/', validarToken, async (req, res) => {
    try {
        // Traemos a los clientes ordenados por los más recientes primero
        const clientes = await pool.query('SELECT * FROM clientes ORDER BY fecha_creacion DESC');
        res.json(clientes.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener los clientes' });
    }
});

// POST: Registrar un nuevo cliente en el sistema
router.post('/', validarToken, async (req, res) => {
    try {
        const { nombre_completo, telefono, direccion, paquete_id } = req.body;

        const nuevoCliente = await pool.query(
            'INSERT INTO clientes (nombre_completo, telefono, direccion, paquete_id, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            // Por defecto, todo cliente nuevo entra "en espera" de instalación
            [nombre_completo, telefono, direccion, paquete_id, 'en espera'] 
        );

        res.json({ mensaje: 'Cliente registrado exitosamente', cliente: nuevoCliente.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al registrar el cliente en la base de datos' });
    }
});
// PUT: Actualizar los datos de un cliente (Sobrescribir información)
router.put('/:id', validarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre_completo, telefono, direccion, paquete_id, 
            mac_modem, nombre_red_modem, password_modem, 
            fecha_instalacion, foto_domicilio_url, estado 
        } = req.body;

        const clienteActualizado = await pool.query(
            `UPDATE clientes 
             SET nombre_completo = $1, telefono = $2, direccion = $3, paquete_id = $4, 
                 mac_modem = $5, nombre_red_modem = $6, password_modem = $7, 
                 fecha_instalacion = $8, foto_domicilio_url = $9, estado = $10
             WHERE id = $11 RETURNING *`,
            [
                nombre_completo, telefono, direccion, paquete_id, 
                mac_modem, nombre_red_modem, password_modem, 
                fecha_instalacion, foto_domicilio_url, estado, id
            ]
        );

        if (clienteActualizado.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado en el sistema' });
        }

        res.json({ mensaje: 'Datos del cliente actualizados', cliente: clienteActualizado.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
});

// DELETE: Eliminar un cliente por completo
router.delete('/:id', validarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const clienteEliminado = await pool.query(
            'DELETE FROM clientes WHERE id = $1 RETURNING *',
            [id]
        );

        if (clienteEliminado.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado en el sistema' });
        }

        res.json({ mensaje: 'Cliente eliminado correctamente', cliente: clienteEliminado.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
});

module.exports = router;