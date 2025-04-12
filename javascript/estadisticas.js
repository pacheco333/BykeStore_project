// Función para cargar la tabla de "Todos los Productos Vendidos"
async function filtrarPorFechas() {
    const fechaInicio = document.getElementById("fecha-inicio").value;
    const fechaFin = document.getElementById("fecha-fin").value;
  
    const url = new URL("http://localhost:3000/productos-vendidos");
    if (fechaInicio && fechaFin) {
      url.searchParams.append("desde", fechaInicio);
      url.searchParams.append("hasta", fechaFin);
    }
  
    try {
      const response = await fetch(url);
      const productos = await response.json();
  
      console.log("🔍 Respuesta del servidor (productos vendidos):", productos);
  
      if (!Array.isArray(productos)) {
        console.error("❗Respuesta inesperada del servidor:", productos);
        alert("Error al obtener los datos. Revisa la consola.");
        return;
      }
  
      const tbody = document.querySelector("#top-products tbody");
      tbody.innerHTML = "";
  
      let total = 0;
  
      productos.forEach(producto => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${producto.id}</td>
          <td>${producto.nombre}</td>
          <td>${producto.fecha_compra.split("T")[0]}</td>
          <td>$${parseFloat(producto.precio).toFixed(2)}</td>
        `;
        total += parseFloat(producto.precio);
        tbody.appendChild(fila);
      });
  
      const totalFila = document.createElement("tr");
      totalFila.innerHTML = `
        <td colspan="3"><strong>Total</strong></td>
        <td><strong>$${total.toFixed(2)}</strong></td>
      `;
      tbody.appendChild(totalFila);
    } catch (err) {
      console.error("Error al filtrar:", err);
    }
  }
  
  // Función para cargar la tabla de "Productos Más Vendidos"
  async function cargarProductosMasVendidos() {
    const fechaInicio = document.getElementById("fecha-inicio").value;
    const fechaFin = document.getElementById("fecha-fin").value;
  
    const url = new URL("http://localhost:3000/productos-mas-vendidos");
    if (fechaInicio && fechaFin) {
      url.searchParams.append("desde", fechaInicio);
      url.searchParams.append("hasta", fechaFin);
    }
  
    try {
      const response = await fetch(url);
      const productos = await response.json();
  
      console.log("📊 Productos más vendidos:", productos);
  
      if (!Array.isArray(productos)) {
        console.error("❗Respuesta inesperada:", productos);
        alert("Error al obtener productos más vendidos.");
        return;
      }
  
      const tabla = document.querySelector(".mas .ventas-table tbody");
      tabla.innerHTML = "";
  
      let totalGeneral = 0;
  
      productos.forEach(prod => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${prod.id}</td>
          <td>${prod.nombre}</td>
          <td>$${parseFloat(prod.precio_unitario).toFixed(2)}</td>
          <td>${prod.unidades_vendidas}</td>
          <td>$${parseFloat(prod.total).toFixed(2)}</td>
        `;
        totalGeneral += parseFloat(prod.total);
        tabla.appendChild(fila);
      });
  
      const totalFila = document.createElement("tr");
      totalFila.innerHTML = `
        <td colspan="4"><strong>Total</strong></td>
        <td><strong>$${totalGeneral.toFixed(2)}</strong></td>
      `;
      tabla.appendChild(totalFila);
    } catch (err) {
      console.error("Error al cargar más vendidos:", err);
    }
  }
  
  // Función para ejecutar ambas
  function filtrarTablas() {
    filtrarPorFechas();
    cargarProductosMasVendidos();
  }
  
  // Opcional: cargar automáticamente al entrar
  window.addEventListener("DOMContentLoaded", () => {
    filtrarTablas();
  });
  