const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
  credentials: true
}));

// Conexión a la base de datos
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bike_store",
});

// Función para manejar conexión/reconexión
function conectarBD() {
  conexion.connect((error) => {
    if (error) {
      console.log("[db error]", error);
      setTimeout(conectarBD, 200);
    } else {
      console.log("¡Conexión exitosa a la base de datos!");
    }
  });

  conexion.on("error", (error) => {
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      conectarBD();
    } else {
      throw error;
    }
  });
}

conectarBD();

// Funciones CRUD genéricas
function obtenerTodos(tabla) {
  return new Promise((resolve, reject) => {
    conexion.query(`SELECT * FROM ${tabla}`, (error, resultados) => {
      if (error) reject(error);
      else resolve(resultados);
    });
  });
}

function obtenerUno(tabla, id) {
  return new Promise((resolve, reject) => {
    conexion.query(
      `SELECT * FROM ${tabla} WHERE id = ?`,
      [id],
      (error, resultado) => {
        if (error) reject(error);
        else resolve(resultado);
      }
    );
  });
}

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

function actualizar(tabla, id, data) {
  return new Promise((resolve, reject) => {
    conexion.query(
      `UPDATE ${tabla} SET ? WHERE id = ?`,
      [data, id],
      (error, resultado) => {
        if (error) reject(error);
        else resolve(resultado);
      }
    );
  });
}

function eliminar(tabla, id) {
  return new Promise((resolve, reject) => {
    conexion.query(
      `DELETE FROM ${tabla} WHERE id = ?`,
      [id],
      (error, resultado) => {
        if (error) reject(error);
        else resolve(resultado);
      }
    );
  });
}

// Rutas genéricas
app.get("/", (req, res) => {
  res.send("Ruta INICIO");
});

app.get("/api/:tabla", async (req, res) => {
  try {
    const resultados = await obtenerTodos(req.params.tabla);
    res.send(resultados);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/:tabla/:id", async (req, res) => {
  try {
    const resultado = await obtenerUno(req.params.tabla, req.params.id);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/api/:tabla", async (req, res) => {
  try {
    const resultado = await crear(req.params.tabla, req.body);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.put("/api/:tabla/:id", async (req, res) => {
  try {
    const resultado = await actualizar(req.params.tabla, req.params.id, req.body);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/api/:tabla/:id", async (req, res) => {
  try {
    const resultado = await eliminar(req.params.tabla, req.params.id);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/api/clientes", async (req, res) => {
  const { nombre, apellido, correo, telefono, contrasena } = req.body;

  try {
      const [existe] = await db.query("SELECT * FROM clientes WHERE correo = ?", [correo]);

      if (existe.length > 0) {
        return res.status(400).json({ message: "El correo ya está registrado." });
    }

      await db.query("INSERT INTO clientes (nombre, apellido, correo, telefono, contrasena) VALUES (?, ?, ?, ?, ?)", 
          [nombre, apellido, correo, telefono, contrasena]);

      res.status(201).json({ message: "Cliente registrado exitosamente." });
  } catch (error) {
      console.error("Error en el servidor:", error);
      res.status(500).json({ message: "Error en el servidor." });
  }
});


// Login de clientes (sin bcrypt)
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ message: "Faltan campos." });
  }

  const query = "SELECT * FROM clientes WHERE correo = ? AND contrasena = ?";
  conexion.query(query, [correo, contrasena], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ message: "Error del servidor." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos." });
    }

    const cliente = results[0];
    res.status(200).json({
      message: "Inicio de sesión exitoso.",
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        correo: cliente.correo,
      },
    });
  });
});

app.post("/finalizar-compra", async (req, res) => {
  const { id_usuarios, carrito, total_compra } = req.body;

  if (!id_usuarios || !carrito || carrito.length === 0) {
    return res.status(400).json({ message: "Datos incompletos." });
  }

  const compraQuery = "INSERT INTO compras (id_usuarios, total_compra) VALUES (?, ?)";
  conexion.query(compraQuery, [id_usuarios, total_compra], (err, result) => {
    if (err) {
      console.error("Error al registrar compra:", err);
      return res.status(500).json({ message: "Error al registrar la compra." });
    }

    const id_compra = result.insertId;

    const detalleQuery = "INSERT INTO detalle_venta (id_compra, id_producto, cantidad, precio) VALUES ?";
    const valores = carrito.map((item) => [
      id_compra,
      item.id,
      item.cantidad,
      parseFloat(item.precio.replace(/\./g, "")),
    ]);

    conexion.query(detalleQuery, [valores], (error) => {
      if (error) {
        console.error("Error al insertar detalle:", error);
        return res.status(500).json({ message: "Error al registrar el detalle de compra." });
      }

      // Guardar en localStorage el detalle para mostrarlo en resumen.html
      res.status(200).json({ message: "Compra finalizada exitosamente", detalle: valores });
    });
  });
});




// Ruta de productos (ejemplo modular)
const productosRoutes = require("./productos");
app.use("/productos", productosRoutes);

// Iniciar servidor
const puerto = process.env.PUERTO || 3000;
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto", puerto);
});
