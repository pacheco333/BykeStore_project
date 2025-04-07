const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Add JWT
const bcrypt = require('bcrypt'); // Add bcrypt
const app = express();
const multer = require("multer");

const JWT_SECRET = 'your_jwt_secret_key'; // Change this to a secure random string in production
const SALT_ROUNDS = 10; // For bcrypt password hashing

app.use(express.json());
app.use(cors());

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





// New function to check if an email already exists
function obtenerClientePorCorreo(correo) {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM clientes WHERE correo = ?', [correo], (error, resultado) => {
            if (error) reject(error);
            else resolve(resultado);
        });
    });
}

// User registration endpoint
app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, apellido, correo, telefono, contrasena } = req.body;
        
        // Validate required fields
        if (!nombre || !apellido || !correo || !contrasena) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        
        // Check if email already exists
        const clienteExistente = await obtenerClientePorCorreo(correo);
        if (clienteExistente.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS);
        
        // Create client object
        const nuevoCliente = {
            nombre,
            apellido,
            correo,
            telefono: telefono || null, // Make phone optional
            contrasena: hashedPassword
        };
        
        // Insert into database
        const clienteCreado = await crear('clientes', nuevoCliente);
        
        // Generate JWT token
        const token = jwt.sign(
            { id: clienteCreado.id, correo: clienteCreado.correo },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        delete clienteCreado.contrasena;
        
        // Send response with token
        res.status(201).json({
            mensaje: 'Cliente registrado exitosamente',
            cliente: clienteCreado,
            token
        });
        
    } catch (error) {
        console.error('Error al registrar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        // Validate required fields
        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }
        
        // Check if user exists
        const clientes = await obtenerClientePorCorreo(correo);
        if (clientes.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const cliente = clientes[0];
        
        // Verify password
        const passwordValid = await bcrypt.compare(contrasena, cliente.contrasena);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Generate token
        const token = jwt.sign(
            { id: cliente.id, correo: cliente.correo },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        delete cliente.contrasena;
        
        // Send response with token
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            cliente,
            token
        });
        
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Middleware to verify JWT token
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }
    
    // Remove 'Bearer ' if present
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    jwt.verify(tokenValue, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }
        
        // Add user info to request
        req.usuario = decoded;
        next();
    });
}

// Example of a protected route
app.get('/api/perfil', verificarToken, async (req, res) => {
    try {
        const cliente = await obtenerUno('clientes', req.usuario.id);
        
        if (cliente.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        
        // Remove password from response
        delete cliente[0].contrasena;
        
        res.json(cliente[0]);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});




// Rutas en Express
app.get('/', (req, res) => {
    res.send('Ruta INICIO');
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

// Importar rutas de productos
const productosRoutes = require('./productos');
app.use('/productos', productosRoutes);

// Mantén el CRUD general para otras tablas
app.get('/api/:tabla', async (req, res) => {
    conexion.query(`SELECT * FROM ${req.params.tabla}`, (err, resultados) => {
        if (err) return res.status(500).send(err);
        res.json(resultados);
    });
});

// Se realiza o no se realiza la conexión en el puerto configurado 
const puerto = process.env.PUERTO || 3000;
app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto", puerto);
});

