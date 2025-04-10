const express = require('express');
const mysql = require('mysql2');
const multer = require("multer");

const router = express.Router();

// Conexión a la base de datos
const conexion = mysql.createConnection({ 
    host: 'localhost',
    user: 'root',
    password: 'julian28257',
    database: 'bike_store'
});

// Configurar Multer para manejar imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Obtener todos los productos
router.get("/", (req, res) => {
    conexion.query("SELECT * FROM productos", (err, results) => {
        if (err) return res.status(500).send(err);

        const productos = results.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            descripcion: producto.descripcion,
            entrada: producto.entrada,
            salida: producto.salida,
            saldo: producto.saldo,
            imagen: producto.imagen ? producto.imagen.toString("base64") : null
        }));

        res.json(productos);
    });
});

// ✅ Agregar un nuevo producto
router.post("/", upload.single("imagen"), (req, res) => {
    const { nombre, precio, descripcion, entrada } = req.body;
    const imagen = req.file ? req.file.buffer : null;

    if (!nombre || !precio || !descripcion || entrada === undefined) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    const entradaNum = parseInt(entrada);
    const salidaNum = 0;

    conexion.query(
        `INSERT INTO productos (imagen, nombre, precio, descripcion, entrada, salida) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [imagen, nombre, precio, descripcion, entradaNum, salidaNum],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error al agregar producto" });
            res.json({ message: "Producto agregado con éxito", id: result.insertId });
        }
    );
});

// ✅ Obtener producto por ID
router.get("/:id", (req, res) => {
    const { id } = req.params;

    conexion.query("SELECT * FROM productos WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: "Error al obtener el producto" });

        if (results.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const producto = results[0];
        res.json({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            descripcion: producto.descripcion,
            entrada: producto.entrada,
            salida: producto.salida,
            saldo: producto.saldo,
            imagen: producto.imagen ? producto.imagen.toString("base64") : null
        });
    });
});

// ✅ Eliminar un producto
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    conexion.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: "Producto eliminado con éxito" });
    });
});

// ✅ Actualizar un producto
router.put("/:id", upload.none(), (req, res) => {
    const { id } = req.params;
    const { nombre, precio, descripcion, entrada } = req.body;

    if (!nombre || !precio || !descripcion || entrada === undefined) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    conexion.query(
        `UPDATE productos SET nombre = ?, precio = ?, descripcion = ?, entrada = ? WHERE id = ?`,
        [nombre, precio, descripcion, parseInt(entrada), id],
        (err) => {
            if (err) return res.status(500).json({ message: "Error al actualizar producto" });
            res.json({ message: "Producto actualizado correctamente" });
        }
    );
});

module.exports = router;
