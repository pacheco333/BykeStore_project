const express = require("express");
const mysql = require("mysql2");

const router = express.Router();

// Conexión a la base de datos
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bike_store",
});

// ✅ Crear un nuevo detalle de venta
router.post("/", (req, res) => {
  const { id_compra, id_producto, cantidad, precio } = req.body;

  if (!id_compra || !id_producto || !cantidad || !precio) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  conexion.query(
    "INSERT INTO detalle_venta (id_compra, id_producto, cantidad, precio) VALUES (?, ?, ?, ?)",
    [id_compra, id_producto, cantidad, precio],
    (err, result) => {
      if (err) {
        console.error("Error al crear detalle de venta:", err);
        return res.status(500).json({ message: "Error al crear detalle de venta" });
      }
      res.json({ 
        message: "Detalle de venta creado con éxito", 
        id_detalle: result.insertId 
      });
    }
  );
});

// ✅ Obtener detalles de venta por ID de compra
router.get("/compra/:id", (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT 
      dv.*,
      p.nombre as producto_nombre,
      p.descripcion
    FROM detalle_venta dv
    INNER JOIN productos p ON dv.id_producto = p.id
    WHERE dv.id_compra = ?
  `;

  conexion.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al obtener detalles de venta:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// ✅ Obtener todos los detalles de venta
router.get("/", (req, res) => {
  const query = `
    SELECT 
      dv.*,
      p.nombre as producto_nombre,
      p.descripcion,
      c.fecha_compra
    FROM detalle_venta dv
    INNER JOIN productos p ON dv.id_producto = p.id
    INNER JOIN compras c ON dv.id_compra = c.id_compras
    ORDER BY c.fecha_compra DESC
  `;

  conexion.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener detalles de venta:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

module.exports = router;