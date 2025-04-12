document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  const url = query
    ? `http://localhost:3000/api/productos/buscar?q=${query}`
    : `http://localhost:3000/api/productos`;

  fetch(url)
    .then((res) => res.json())
    .then((productos) => {
      console.log("Productos recibidos:", productos); // ← DEBUG
      mostrarProductos(productos);
    })
    .catch((err) => {
      console.error("Error al cargar productos:", err);
    });
});

function mostrarProductos(productos) {
  const contenedor = document.querySelector(".contenedor_productos");
  contenedor.innerHTML = "";

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron productos.</p>";
    return;
  }

  productos.forEach((producto) => {
    const tieneImagen = typeof producto.imagen === "string" && producto.imagen.trim() !== "";

    const tarjeta = document.createElement("div");
    tarjeta.classList.add("tarjeta");
    
    tarjeta.innerHTML = `
      <a href="detalle.html?id=${producto.id}">
        ${tieneImagen ? `<img src="data:image/png;base64,${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">` : ""}
        <div class="info_producto">
          <h3 class="titulo_producto">${producto.nombre}</h3>
          <p class="precio_producto">$${producto.precio}</p>
          <p class="descripcion_producto">${producto.descripcion}</p>
        </div>
      </a>
    `;
    

    contenedor.appendChild(tarjeta);
  });
}
