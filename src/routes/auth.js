const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
const validarToken = require('../middlewares/validarToken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 

router.post('/registrar', validarToken, async (req, res) => {
    try {
        if (req.usuario.rol !== 'administrador') {
            return res.status(403).json({ error: 'Acceso denegado. Solo los administradores pueden registrar personal.' });
        }

        const { nombre_completo, username, correo, password, rol, direccion, rfc } = req.body;

        const userExists = await pool.query(
            'SELECT * FROM usuarios WHERE correo = $1 OR username = $2', 
            [correo, username]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El usuario o correo ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO usuarios (nombre_completo, username, correo, password_hash, rol, direccion, rfc) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre_completo, username, rol',
            [nombre_completo, username, correo, password_hash, rol, direccion, rfc]
        );

        res.json({ mensaje: 'Personal registrado exitosamente', usuario: newUser.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado o credenciales incorrectas' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Usuario no encontrado o credenciales incorrectas' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, rol: user.rows[0].rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } 
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token: token,
            usuario: {
                id: user.rows[0].id,
                nombre_completo: user.rows[0].nombre_completo,
                rol: user.rows[0].rol,
                username: user.rows[0].username
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
router.get('/personal', validarToken, async (req, res) => {
    try {
        if (req.usuario.rol !== 'administrador') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
        }
        
        const personal = await pool.query(
            'SELECT id, nombre_completo, username, correo, rol, direccion, rfc FROM usuarios ORDER BY rol, nombre_completo'
        );
        res.json(personal.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al obtener el personal' });
    }
});

router.delete('/personal/:id', validarToken, async (req, res) => {
    try {
        if (req.usuario.rol !== 'administrador') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }
        
        const { id } = req.params;
        const empleadoEliminado = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING *',
            [id]
        );

        if (empleadoEliminado.rows.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        res.json({ mensaje: 'Empleado eliminado del sistema' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error al eliminar el empleado' });
    }
});


router.post('/olvide-password', async (req, res) => {
    try {
        const { correo } = req.body;

        const user = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'No existe un empleado con ese correo electrónico' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + 1); 

        await pool.query(
            'UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE correo = $3',
            [resetToken, expireDate, correo]
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/restablecer-password/${resetToken}`;

        const mailOptions = {
            from: `"Soporte Chilacnet" <${process.env.EMAIL_USER}>`,
            to: correo,
            subject: 'Recuperación de Contraseña - Chilacnet',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                    <h2 style="color: #1f2937; text-align: center;">Recuperación de Acceso</h2>
                    <p style="color: #4b5563; font-size: 16px;">Hola <b>${user.rows[0].nombre_completo}</b>,</p>
                    <p style="color: #4b5563; font-size: 16px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en el sistema de Chilacnet.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Crear Nueva Contraseña</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">Por seguridad, este enlace caducará en exactamente 1 hora.</p>
                    <p style="color: #6b7280; font-size: 14px;">Si no fuiste tú quien solicitó este cambio, puedes ignorar este correo tranquilamente; tu contraseña actual seguirá funcionando.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">Este es un mensaje automático del sistema de administración de Chilacnet.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ mensaje: 'Las instrucciones han sido enviadas a tu correo electrónico.' });

    } catch (error) {
        console.error('Error al enviar correo:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al intentar enviar el correo. Verifica las credenciales.' });
    }
});

router.post('/restablecer-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { nuevaPassword } = req.body;

        const result = await pool.query(
            'SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expires > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'El enlace es inválido o ha caducado. Por favor, solicita uno nuevo.' });
        }

        const usuario = result.rows[0];

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(nuevaPassword, salt);

        await pool.query(
            'UPDATE usuarios SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
            [password_hash, usuario.id]
        );

        res.json({ mensaje: 'Tu contraseña ha sido actualizada exitosamente.' });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al actualizar la contraseña.' });
    }
});

module.exports = router;