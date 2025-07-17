// debug.js - Script para diagnosticar problemas con la eliminación
const mysql = require("mysql2");

// Conexión a la base de datos (usar los mismos datos que en productos.js)
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bike_store",
});

async function diagnosticar() {
  console.log("🔍 INICIANDO DIAGNÓSTICO DE BASE DE DATOS");
  console.log("=" .repeat(50));

  try {
    // 1. Verificar conexión
    await new Promise((resolve, reject) => {
      conexion.connect((err) => {
        if (err) {
          console.error("❌ Error de conexión:", err);
          reject(err);
        } else {
          console.log("✅ Conexión exitosa a la base de datos");
          resolve();
        }
      });
    });

    // 2. Verificar estructura de la tabla
    await new Promise((resolve, reject) => {
      conexion.query("DESCRIBE productos", (err, results) => {
        if (err) {
          console.error(" Error al describir tabla:", err);
          reject(err);
        } else {
          console.log("\n ESTRUCTURA DE LA TABLA 'productos':");
          console.table(results);
          resolve();
        }
      });
    });

    // 3. Mostrar todos los productos actuales
    await new Promise((resolve, reject) => {
      conexion.query("SELECT id, nombre, stock FROM productos", (err, results) => {
        if (err) {
          console.error("❌ Error al consultar productos:", err);
          reject(err);
        } else {
          console.log("\n📦 PRODUCTOS ACTUALES:");
          console.table(results);
          resolve();
        }
      });
    });

    // 4. Verificar permisos del usuario
    await new Promise((resolve, reject) => {
      conexion.query("SHOW GRANTS FOR CURRENT_USER()", (err, results) => {
        if (err) {
          console.error(" Error al consultar permisos:", err);
          reject(err);
        } else {
          console.log("\n PERMISOS DEL USUARIO:");
          results.forEach(row => {
            console.log("  ", Object.values(row)[0]);
          });
          resolve();
        }
      });
    });

    // 5. Probar eliminación directa
    console.log("\n PROBANDO ELIMINACIÓN DIRECTA:");
    
    // Insertar producto de prueba
    await new Promise((resolve, reject) => {
      conexion.query(
        "INSERT INTO productos (nombre, precio, descripcion, stock) VALUES (?, ?, ?, ?)",
        ["PRODUCTO_PRUEBA", 1000, "Producto para prueba de eliminación", 1],
        (err, result) => {
          if (err) {
            console.error(" Error al insertar producto de prueba:", err);
            reject(err);
          } else {
            console.log(` Producto de prueba insertado con ID: ${result.insertId}`);
            resolve(result.insertId);
          }
        }
      );
    }).then(async (testId) => {
      // Intentar eliminar el producto de prueba
      await new Promise((resolve, reject) => {
        conexion.query("DELETE FROM productos WHERE id = ?", [testId], (err, result) => {
          if (err) {
            console.error(" Error al eliminar producto de prueba:", err);
            reject(err);
          } else {
            console.log(" Resultado de eliminación:");
            console.log("  - Filas afectadas:", result.affectedRows);
            console.log("  - ID insertado:", result.insertId);
            console.log("  - Advertencias:", result.warningCount);
            
            if (result.affectedRows > 0) {
              console.log("✅ Eliminación exitosa");
            } else {
              console.log("⚠️ No se eliminaron filas");
            }
            resolve();
          }
        });
      });
    });

    // 6. Verificar si hay triggers o restricciones
    await new Promise((resolve, reject) => {
      conexion.query("SHOW TRIGGERS LIKE 'productos'", (err, results) => {
        if (err) {
          console.error(" Error al consultar triggers:", err);
          reject(err);
        } else {
          console.log("\n TRIGGERS EN LA TABLA 'productos':");
          if (results.length === 0) {
            console.log("  No hay triggers configurados");
          } else {
            console.table(results);
          }
          resolve();
        }
      });
    });

    // 7. Verificar restricciones de clave foránea
    await new Promise((resolve, reject) => {
      conexion.query(`
        SELECT 
          CONSTRAINT_NAME,
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_NAME = 'productos' 
        AND TABLE_SCHEMA = 'bike_store'
      `, (err, results) => {
        if (err) {
          console.error(" Error al consultar restricciones:", err);
          reject(err);
        } else {
          console.log("\n RESTRICCIONES DE CLAVE FORÁNEA:");
          if (results.length === 0) {
            console.log("  No hay restricciones de clave foránea que referencien 'productos'");
          } else {
            console.table(results);
            console.log("⚠️ ATENCIÓN: Hay tablas que referencian 'productos'");
            console.log("   Esto puede impedir la eliminación de productos");
          }
          resolve();
        }
      });
    });

    console.log("\n" + "=".repeat(50));
    console.log(" DIAGNÓSTICO COMPLETADO");

  } catch (error) {
    console.error(" Error durante el diagnóstico:", error);
  } finally {
    conexion.end();
  }
}

// Ejecutar diagnóstico
diagnosticar();