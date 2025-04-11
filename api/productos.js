const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");

const router = express.Router();

// Conexión a la base de datos
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bike_store",
});

// Configurar Multer para manejar imágenes
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Obtener todos los productos
router.get("/", (req, res) => {
  conexion.query("SELECT * FROM productos", (err, results) => {
    if (err) return res.status(500).send(err);

    // Convertir imagen BLOB a Base64
    const productos = results.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      imagen: producto.imagen ? producto.imagen.toString("base64") : null, // Convertir imagen
    }));

    res.json(productos);
  });
});

// ✅ Agregar un nuevo producto (imagen opcional)
router.post("/", upload.single("imagen"), (req, res) => {
  const { nombre, precio, descripcion } = req.body;
  const imagen = req.file ? req.file.buffer : null;

  if (!nombre || !precio || !descripcion) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  conexion.query(
    "INSERT INTO productos (imagen, nombre, precio, descripcion) VALUES (?, ?, ?, ?)",
    [imagen, nombre, precio, descripcion],
    (err, result) => {
      if (err) {
        console.error("Error al insertar producto:", err);
        return res.status(500).json({ message: "Error al agregar producto" });
      }
      res.json({ message: "Producto agregado con éxito", id: result.insertId });
    }
  );
});

// ✅ Eliminar un producto por ID
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  conexion.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Producto eliminado con éxito" });
  });
});

module.exports = router;

// 🔍 Buscar productos por nombre
router.get("/buscar", (req, res) => {
  const busqueda = req.query.q;
  console.log("🔍 Buscando:", busqueda);

  const query = `
    SELECT * FROM productos
    WHERE nombre COLLATE UTF8_GENERAL_CI LIKE ?
       OR descripcion COLLATE UTF8_GENERAL_CI LIKE ?
  `;

  conexion.query(query, [`%${busqueda}%`, `%${busqueda}%`], (err, results) => {
    if (err) {
      console.error("Error en búsqueda:", err);
      return res.status(500).send(err);
    }

    const productos = results.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      stock: producto.stock,
      imagen: producto.imagen ? producto.imagen.toString("base64") : null,
    }));

    console.log("🔁 Resultados encontrados:", productos);
    res.json(productos);
  });
});
