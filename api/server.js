const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

const comprasRoutes = require('./routes/compras'); // Ajusta la ruta según tu estructura
const detalleVentaRoutes = require('./routes/detalle-venta')


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

// CODIGO MODIFICADO CON LA FUNCION DE AÑADIR ROL USUARIO
app.post("/api/clientes", (req, res) => {
  const { nombre, apellido, correo, telefono, contrasena } = req.body;

  // Verificación extra por si llega algo vacío
  if (!nombre || !apellido || !correo || !telefono || !contrasena) {
    console.warn(" Campos faltantes en el registro:", req.body);
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  console.log("📩 Datos recibidos para registro:", req.body);

//   // Verificar si el correo ya está registrado
  conexion.query("SELECT * FROM clientes WHERE correo = ?", [correo], (err, resultado) => {
    if (err) {
      console.error("❌ Error al verificar correo:", err);
      return res.status(500).json({ message: "Error al verificar correo." });
    }

    if (resultado.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

//     // Inserción del nuevo cliente
    const query = `
      INSERT INTO clientes (nombre, apellido, correo, telefono, contrasena, rol_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valores = [nombre, apellido, correo, telefono, contrasena, 1]; // rol_id = 1 (usuario)

    conexion.query(query, valores, (error, resultado) => {
      if (error) {
        console.error(" Error al registrar cliente:", error);
        return res.status(500).json({ message: "Error al registrar el cliente." });
      }

      console.log(" Cliente registrado correctamente con ID:", resultado.insertId);
      res.status(201).json({ message: "Cliente registrado exitosamente." });
    });
  });
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
        apellido: cliente.apellido,
        correo: cliente.correo,
        rol_id: cliente.rol_id
      },
    });
  });
});






// Ruta de productos (ejemplo modular)
const productosRoutes = require("./productos");
app.use("/productos", productosRoutes);

app.use('/compras', comprasRoutes);
app.use('/detalle-venta', detalleVentaRoutes);


// Iniciar servidor
const puerto = process.env.PUERTO || 3000;
app.listen(puerto, () => {
  console.log("Servidor corriendo en el puerto", puerto);
  
});

// Cambiar el rol de un cliente (solo accesible para superadmin desde frontend)
app.put("/api/clientes/:id/rol", (req, res) => {
  const { id } = req.params;
  const { rol_id } = req.body;

  if (!rol_id) {
    return res.status(400).json({ message: "El nuevo rol es requerido." });
  }

  const query = "UPDATE clientes SET rol_id = ? WHERE id = ?";
  conexion.query(query, [rol_id, id], (error, resultado) => {
    if (error) {
      console.error("Error al cambiar rol:", error);
      return res.status(500).json({ message: "Error del servidor." });
    }

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente no encontrado." });
    }

    res.status(200).json({ message: "Rol actualizado correctamente." });
  });
});



