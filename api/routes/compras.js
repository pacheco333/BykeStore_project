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

// ✅ Crear una nueva compra - Solución 1
router.post("/", (req, res) => {
  // Obtener el ID del usuario desde el body de la petición
  const { id_usuarios, total_compra } = req.body;

  if (!id_usuarios || !total_compra) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  conexion.query(
    "INSERT INTO compras (id_usuarios, total_compra) VALUES (?, ?)",
    [id_usuarios, total_compra],
    (err, result) => {
      if (err) {
        console.error("Error al crear compra:", err);
        return res.status(500).json({ message: "Error al crear compra" });
      }
      res.json({ 
        message: "Compra creada con éxito", 
        id_compra: result.insertId 
      });
    }
  );
});
// router.post("/", (req, res) => {
//   const { id_usuarios, total_compra } = req.body;

//   if (!id_usuarios || !total_compra) {
//     return res.status(400).json({ message: "Todos los campos son obligatorios" });
//   }

//   conexion.query(
//     "INSERT INTO compras (id_usuarios, total_compra) VALUES (?, ?)",
//     [id_usuarios, total_compra],
//     (err, result) => {
//       if (err) {
//         console.error("Error al crear compra:", err);
//         return res.status(500).json({ message: "Error al crear compra" });
//       }
//       res.json({ 
//         message: "Compra creada con éxito", 
//         id_compra: result.insertId 
//       });
//     }
//   );
// });

// ✅ Obtener todas las compras con detalles
router.get("/", (req, res) => {
  const query = `
    SELECT 
      c.id_compras,
      c.fecha_compra,
      c.total_compra,
      c.id_usuarios,
      cl.nombre as cliente_nombre,
      cl.apellido as cliente_apellido,
      dv.id_producto,
      dv.cantidad,
      dv.precio,
      p.nombre as producto_nombre
    FROM compras c
    LEFT JOIN clientes cl ON c.id_usuarios = cl.id
    LEFT JOIN detalle_venta dv ON c.id_compras = dv.id_compra
    LEFT JOIN productos p ON dv.id_producto = p.id
    ORDER BY c.fecha_compra DESC
  `;

  conexion.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener compras:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// ✅ Obtener compras por rango de fechas
router.get("/rango", (req, res) => {
  const { desde, hasta } = req.query;
  
  let query = `
    SELECT 
      c.id_compras,
      c.fecha_compra,
      c.total_compra,
      c.id_usuarios,
      cl.nombre as cliente_nombre,
      cl.apellido as cliente_apellido,
      dv.id_producto,
      dv.cantidad,
      dv.precio,
      p.nombre as producto_nombre
    FROM compras c
    LEFT JOIN clientes cl ON c.id_usuarios = cl.id
    LEFT JOIN detalle_venta dv ON c.id_compras = dv.id_compra
    LEFT JOIN productos p ON dv.id_producto = p.id
  `;
  
  const params = [];
  
  if (desde && hasta) {
    query += " WHERE DATE(c.fecha_compra) BETWEEN ? AND ?";
    params.push(desde, hasta);
  } else if (desde) {
    query += " WHERE DATE(c.fecha_compra) >= ?";
    params.push(desde);
  } else if (hasta) {
    query += " WHERE DATE(c.fecha_compra) <= ?";
    params.push(hasta);
  }
  
  query += " ORDER BY c.fecha_compra DESC";

  conexion.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener compras por rango:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// ✅ Obtener productos más vendidos
router.get("/productos-mas-vendidos", (req, res) => {
  const { desde, hasta } = req.query;
  
  let query = `
    SELECT 
      p.id,
      p.nombre,
      p.descripcion,
      SUM(dv.cantidad) as unidades_vendidas,
      SUM(dv.cantidad * dv.precio) as total_ventas
    FROM productos p
    INNER JOIN detalle_venta dv ON p.id = dv.id_producto
    INNER JOIN compras c ON dv.id_compra = c.id_compras
  `;
  
  const params = [];
  
  if (desde && hasta) {
    query += " WHERE DATE(c.fecha_compra) BETWEEN ? AND ?";
    params.push(desde, hasta);
  } else if (desde) {
    query += " WHERE DATE(c.fecha_compra) >= ?";
    params.push(desde);
  } else if (hasta) {
    query += " WHERE DATE(c.fecha_compra) <= ?";
    params.push(hasta);
  }
  
  query += `
    GROUP BY p.id, p.nombre, p.descripcion
    ORDER BY unidades_vendidas DESC
  `;

  conexion.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener productos más vendidos:", err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

module.exports = router;