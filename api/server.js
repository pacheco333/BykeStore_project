const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());
app.use(cors());

// Clave secreta para JWT (en producción, debe estar en una variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'clave-secreta-temporal-cambiar-en-produccion';

const conexion = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bike_store'
});

// Función para la conexión y la reconexión
function conectarBD() {
    conexion.connect((error) => {
        if (error) {
            console.log('[db error]', error);
            setTimeout(conectarBD, 200);    
        } else {
            console.log("¡Conexión exitosa a la base de datos!");
        }
    });

    conexion.on('error', error => {
        if (error.code == 'PROTOCOL_CONNECTION_LOST') {
            conectarBD();
        } else {
            throw error;
        }
    });
}

conectarBD();

// CRUD completo
// Función genérica para obtener todos los registros de una tabla específica
function obtenerTodos(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, resultados) => {
            if (error) reject(error);
            else resolve(resultados);
        });
    });
}

// Obtiene un registro de la tabla por su ID
function obtenerUno(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id], (error, resultado) => {
            if (error) reject(error);
            else resolve(resultado);
        });
    });
}

// Crea o inserta un registro en la tabla
function crear(tabla, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, resultado) => {
            if (error) reject(error);
            else {
                Object.assign(data, { id: resultado.insertId });
                resolve(data);
            }
        });
    });
}

// Actualiza un registro en la tabla por su ID
function actualizar(tabla, id, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [data, id], (error, resultado) => {
            if (error) reject(error);
            else resolve(resultado);
        });
    });
}

// Elimina un registro de una tabla por su ID
function eliminar(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, [id], (error, resultado) => {
            if (error) reject(error);
            else resolve(resultado);
        });
    });
}

// Rutas en Express
app.get('/', (req, res) => {
    res.send('Ruta INICIO');
});

// Ruta de login
app.post('/api/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        // Validar que se proporcionaron correo y contraseña
        if (!correo || !contrasena) {
            return res.status(400).json({ 
                error: 'Por favor proporcione correo y contraseña' 
            });
        }
        
        // Buscar el cliente por correo
        conexion.query(
            'SELECT * FROM clientes WHERE correo = ?', 
            [correo], 
            async (error, resultados) => {
                if (error) {
                    console.error('Error en la consulta:', error);
                    return res.status(500).json({ error: 'Error en el servidor' });
                }
                
                // Verificar si el usuario existe
                if (resultados.length === 0) {
                    return res.status(401).json({ 
                        error: 'Credenciales inválidas' 
                    });
                }
                
                const usuario = resultados[0];
                
                // Verificar la contraseña
                // Nota: Si las contraseñas están en texto plano en la BD, comparar directamente
                // Si están hasheadas, usar bcrypt.compare
                const contrasenaValida = contrasena === usuario.contraseña;
                
                if (!contrasenaValida) {
                    return res.status(401).json({ 
                        error: 'Credenciales inválidas' 
                    });
                }
                
                // Generar token JWT
                const token = jwt.sign(
                    { 
                        id: usuario.id, 
                        correo: usuario.correo,
                        nombre: usuario.nombre 
                    },
                    JWT_SECRET,
                    { expiresIn: '24h' } // Token válido por 24 horas
                );
                
                // Enviar respuesta exitosa con el token
                res.json({
                    mensaje: 'Login exitoso',
                    token: token,
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        correo: usuario.correo
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Esta ruta devuelve todos los registros
app.get('/api/:tabla', async (req, res) => {
    try {
        const resultados = await obtenerTodos(req.params.tabla);
        res.send(resultados);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Esta ruta devuelve un registro por su ID
app.get('/api/:tabla/:id', async (req, res) => {
    try {
        const resultado = await obtenerUno(req.params.tabla, req.params.id);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Esta ruta crea un registro en la tabla
app.post('/api/:tabla', async (req, res) => {
    try {
        const resultado = await crear(req.params.tabla, req.body);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Esta ruta actualiza un registro en la tabla por su ID
app.put('/api/:tabla/:id', async (req, res) => {
    try {
        const resultado = await actualizar(req.params.tabla, req.params.id, req.body);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Esta ruta elimina un registro en la tabla por su ID
app.delete('/api/:tabla/:id', async (req, res) => {
    try {
        const resultado = await eliminar(req.params.tabla, req.params.id);
        res.send(resultado);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Se realiza o no se realiza la conexión en el puerto configurado 
const puerto = process.env.PUERTO || 3000;
app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto", puerto);
});
