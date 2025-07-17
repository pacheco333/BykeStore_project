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

//  Obtener todos los productos (solo activos por defecto)
router.get("/", (req, res) => {
  const mostrarInactivos = req.query.incluir_inactivos === 'true';
  const query = mostrarInactivos 
    ? "SELECT * FROM productos ORDER BY activo DESC, nombre ASC"
    : "SELECT * FROM productos WHERE activo = TRUE ORDER BY nombre ASC";

  conexion.query(query, (err, results) => {
    if (err) return res.status(500).send(err);

    // Convertir imagen BLOB a Base64
    const productos = results.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      stock: producto.stock,
      categoria: producto.categoria,  // ← Nombre correcto
      gama: producto.gama,
      activo: producto.activo,
      imagen: producto.imagen ? producto.imagen.toString("base64") : null,
    }));

    res.json(productos);
  });
});

//  Agregar un nuevo producto (imagen opcional)
router.post("/", upload.single("imagen"), (req, res) => {
  const { nombre, precio, descripcion, stock, categoria, gama } = req.body;
  const imagen = req.file ? req.file.buffer : null;

  if (!nombre || !precio || !descripcion || stock === undefined || !categoria || !gama) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  conexion.query(
    "INSERT INTO productos (imagen, nombre, precio, descripcion, stock, categoria, gama, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [imagen, nombre, precio, descripcion, stock, categoria, gama, true],
    (err, result) => {
      if (err) {
        console.error("Error al insertar producto:", err);
        return res.status(500).json({ message: "Error al agregar producto" });
      }
      res.json({ message: "Producto agregado con éxito", id: result.insertId });
    }
  );
});
// router.post("/", upload.single("imagen"), (req, res) => {
//   const { nombre, precio, descripcion, stock } = req.body;
//   const imagen = req.file ? req.file.buffer : null;

//   if (!nombre || !precio || !descripcion || stock === undefined) {
//     return res.status(400).json({ message: "Todos los campos son obligatorios" });
//   }

//   conexion.query(
//     "INSERT INTO productos (imagen, nombre, precio, descripcion, stock, activo) VALUES (?, ?, ?, ?, ?, ?)",
//     [imagen, nombre, precio, descripcion, stock, true],
//     (err, result) => {
//       if (err) {
//         console.error("Error al insertar producto:", err);
//         return res.status(500).json({ message: "Error al agregar producto" });
//       }
//       res.json({ message: "Producto agregado con éxito", id: result.insertId });
//     }
//   );
// });

//  Reducir stock del producto (marcar como inactivo si llega a 0)
router.patch("/stock/:id", (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  // Primero verificar el stock actual
  conexion.query("SELECT stock FROM productos WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).json({ message: "Producto no encontrado" });

    const stockActual = results[0].stock;
    const nuevoStock = stockActual - cantidad;

    if (stockActual < cantidad) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    // Si el nuevo stock es 0 o menor, marcar como inactivo
    if (nuevoStock <= 0) {
      conexion.query(
        "UPDATE productos SET stock = 0, activo = FALSE WHERE id = ?",
        [id],
        (err, result) => {
          if (err) return res.status(500).send(err);
          res.json({ 
            message: "Stock agotado - Producto marcado como inactivo", 
            stock: 0,
            activo: false
          });
        }
      );
    } else {
      // Actualizar stock normalmente
      conexion.query(
        "UPDATE productos SET stock = ? WHERE id = ?",
        [nuevoStock, id],
        (err, result) => {
          if (err) return res.status(500).send(err);
          res.json({ 
            message: "Stock actualizado correctamente", 
            stock: nuevoStock,
            activo: true
          });
        }
      );
    }
  });
});

//  Aumentar stock del producto (reactivar si estaba inactivo)
router.patch("/stock/increase/:id", (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;

  if (!cantidad || cantidad <= 0) {
    return res.status(400).json({ message: "La cantidad debe ser mayor a 0" });
  }

  conexion.query(
    "UPDATE productos SET stock = stock + ?, activo = TRUE WHERE id = ?",
    [cantidad, id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Producto no encontrado" });
      
      // Obtener el nuevo stock para la respuesta
      conexion.query("SELECT stock FROM productos WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json({ 
          message: "Stock aumentado correctamente", 
          stock: results[0].stock,
          activo: true
        });
      });
    }
  );
});

//  Actualizar precio del producto
router.patch("/precio/:id", (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;

  if (!precio || precio <= 0) {
    return res.status(400).json({ message: "El precio debe ser mayor a 0" });
  }

  conexion.query(
    "UPDATE productos SET precio = ? WHERE id = ?",
    [precio, id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Producto no encontrado" });
      res.json({ message: "Precio actualizado correctamente" });
    }
  );
});

//  Desactivar producto manualmente
router.patch("/deactivate/:id", (req, res) => {
  const { id } = req.params;

  conexion.query(
    "UPDATE productos SET activo = FALSE WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Producto no encontrado" });
      res.json({ message: "Producto desactivado correctamente" });
    }
  );
});

//  Eliminar un producto por ID (eliminación física - mantener por si acaso)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  conexion.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Producto eliminado permanentemente" });
  });
});

//  Buscar productos por nombre
router.get("/buscar", (req, res) => {
  const busqueda = req.query.q;
  const mostrarInactivos = req.query.incluir_inactivos === 'true';
  console.log("🔍 Buscando:", busqueda);

  const whereClause = mostrarInactivos 
    ? "(nombre COLLATE UTF8_GENERAL_CI LIKE ? OR descripcion COLLATE UTF8_GENERAL_CI LIKE ?)"
    : "(nombre COLLATE UTF8_GENERAL_CI LIKE ? OR descripcion COLLATE UTF8_GENERAL_CI LIKE ?) AND activo = TRUE";

  const query = `SELECT * FROM productos WHERE ${whereClause} ORDER BY activo DESC, nombre ASC`;

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
      activo: producto.activo,
      imagen: producto.imagen ? producto.imagen.toString("base64") : null,
    }));

    console.log("🔁 Resultados encontrados:", productos);
    res.json(productos);
  });
});

module.exports = router;