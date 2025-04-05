const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'html')));

// ✅ Conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',     
  password: 'root', 
  database: 'bike_store'
});

// ✅ Ruta para obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM productos WHERE id = ?';

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      return res.status(500).json({ error: 'Error del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = results[0];

    // Convertir imagen a base64 si existe
    if (producto.imagen) {
      producto.imagen = Buffer.from(producto.imagen).toString('base64');
    }

    res.json(producto);
  });
});


// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');

// const app = express();
// const port = 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Conexión a MySQL
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'bike_store'
// });

// db.connect((err) => {
//     if (err) {
//         console.error('Error conectando a la base de datos:', err);
//     } else {
//         console.log('Conexión a la base de datos MySQL exitosa');
//     }
// });

// // Ruta para obtener bicicleta por ID
// app.get('/producto/:id', (req, res) => {
//     const id = req.params.id;
//     const query = 'SELECT * FROM productos WHERE id = ?';

//     db.query(query, [id], (err, result) => {
//         if (err) {
//             return res.status(500).json({ error: 'Error en la consulta' });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({ error: 'Producto no encontrado' });
//         }

//         res.json(result[0]);
//     });
// });

// // Iniciar servidor
// app.listen(port, () => {
//     console.log(`Servidor corriendo en http://localhost:3000`);
// });