# CRM Chilacnet — API (Backend)

API REST en **Node.js** y **Express** para autenticación (JWT), gestión de clientes, personal, subida de evidencias a **Cloudinary** y recuperación de contraseña por correo.

## Tecnologías

- **Express** 5  
- **PostgreSQL** (`pg`)  
- **JWT** (`jsonwebtoken`)  
- **bcryptjs** (hash de contraseñas)  
- **Cloudinary** + **multer** (imágenes)  
- **Nodemailer** (correo para reset de contraseña)  
- **dotenv** (variables de entorno)

## Requisitos

- **Node.js** 18 o superior  
- Base de datos **PostgreSQL** accesible (por ejemplo **Neon** en la nube o PostgreSQL local)  
- Cuenta **Cloudinary** (subida de fotos) y, si se usa recuperación de correo, credenciales SMTP (p. ej. Gmail con contraseña de aplicación)

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo **`.env`** en la raíz de esta carpeta (`backend-chilacnet`). No subir `.env` al repositorio ni compartir valores reales en documentación pública.

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (por defecto `3000` si no se define) |
| `DATABASE_URL` | URL de conexión a PostgreSQL (recomendado en Neon) |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `FRONTEND_URL` | URL del frontend (enlaces en correos de recuperación de contraseña) |
| `EMAIL_USER` | Usuario del correo para Nodemailer |
| `EMAIL_PASS` | Contraseña de aplicación del correo |
| `CLOUDINARY_CLOUD_NAME` | Nombre de nube Cloudinary |
| `CLOUDINARY_API_KEY` | API Key |
| `CLOUDINARY_API_SECRET` | API Secret |

Si no usas `DATABASE_URL`, puedes configurar `DB_USER`, `DB_HOST`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` según `src/db.js`.

## Base de datos

Crear las tablas y datos iniciales ejecutando el script SQL incluido en la documentación del proyecto (tablas `usuarios`, `paquetes_internet`, `clientes` y registros de paquetes).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor con Node (`node src/index.js`) |
| `npm run dev` | Desarrollo con recarga automática (`nodemon`) |

## Ejecución

```bash
npm start
```

El servidor escucha en el puerto definido en `PORT` (por defecto **3000**).

### Comprobar que funciona

- Salud y conexión a BD: `GET http://localhost:3000/api/test`

## Rutas principales (prefijo `/api`)

- **`/api/auth`** — login, registro de personal (admin), listado/eliminación de personal, olvidé/restablecer contraseña  
- **`/api/clientes`** — CRUD de clientes (requiere JWT)  
- **`/api/upload`** — subida de imagen a Cloudinary (requiere JWT)  

La carpeta `uploads/` puede usarse para archivos estáticos locales; las evidencias en producción suelen guardarse como URL en Cloudinary.

## Despliegue (referencia)

El backend puede desplegarse en **Render** u otro servicio Node; configurar allí las mismas variables de entorno.

## Proyecto académico

Desarrollado en el marco de prácticas profesionales — CRM Chilacnet.
