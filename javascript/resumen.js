document.addEventListener("DOMContentLoaded", () => {
    const detalle = JSON.parse(localStorage.getItem("detalle_venta")) || [];
    const productos = JSON.parse(localStorage.getItem("productos_compra")) || [];
    const lista = document.getElementById("detalle-lista");
    const totalGeneral = document.getElementById("total-general");
  
    if (detalle.length === 0 || productos.length === 0) {
      lista.innerHTML = "<tr><td colspan='4'>No hay detalles de compra disponibles.</td></tr>";
      return;
    }
  
    let totalCompra = 0;
  
    detalle.forEach(([_, id_producto, cantidad, precio]) => {
      const producto = productos.find(p => p.id == id_producto);
      const nombre = producto ? producto.nombre : `#${id_producto}`;
      const totalProducto = precio * cantidad;
      totalCompra += totalProducto;
  
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${nombre}</td>
        <td>$${precio.toLocaleString()}</td>
        <td>${cantidad}</td>
        <td>$${totalProducto.toLocaleString()}</td>
      `;
      lista.appendChild(fila);
    });
  
    totalGeneral.textContent = `Total a pagar: $${totalCompra.toLocaleString()}`;
  
    localStorage.removeItem("detalle_venta");
    localStorage.removeItem("productos_compra");
  });
  