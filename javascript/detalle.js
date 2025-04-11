document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productoId = params.get("id");
  console.log("ID del producto:", productoId);

  fetch(`http://localhost:3000/api/productos/${productoId}`)
    .then((response) => response.json()) // ✅ Primero convertimos la respuesta a JSON
    .then((productoArray) => {
      const producto = productoArray[0]; // ✅ Accedemos al primer objeto del array
      console.log("Producto recibido:", producto);

      let imagenBase64 = "";
      if (producto.imagen && producto.imagen.data) {
        const byteArray = new Uint8Array(producto.imagen.data);
        imagenBase64 = btoa(
          byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
      }
      const imagenSrc = `data:image/png;base64,${imagenBase64}`;

      document.getElementById("imagenPrincipal").src = imagenSrc;
      document.getElementById("vista1").src = imagenSrc;
      document.getElementById("vista2").src = imagenSrc;
      document.getElementById("vista3").src = imagenSrc;

      document.getElementById("nombreProducto").textContent = producto.nombre;
      document.getElementById(
        "precioProducto"
      ).textContent = `$${producto.precio}`;
      document.getElementById("descripcionProducto").textContent =
        producto.descripcion;
      document.getElementById(
        "stockProducto"
      ).textContent = `Stock: ${producto.stock}`;
      cargarProductosSugeridos(producto.id);
    })
    .catch((err) => {
      console.error("Error al obtener el producto:", err);
    });
});

//     .then(response => response.json())
//     .then(producto => {
//       let imagenBase64 = producto.imagen || "";
//       const imagenSrc = `data:image/png;base64,${imagenBase64}`;

//       document.getElementById('imagenPrincipal').src = imagenSrc;
//       document.getElementById('vista1').src = imagenSrc;
//       document.getElementById('vista2').src = imagenSrc;
//       document.getElementById('vista3').src = imagenSrc;

//       document.getElementById('nombreProducto').textContent = producto.nombre;
//       document.getElementById('precioProducto').textContent = `$${producto.precio}`;
//       document.getElementById('descripcionProducto').textContent = producto.descripcion;

//       console.log('Producto recibido:', producto);

//     })
//     .catch(err => {
//       console.error('Error al obtener el producto:', err);
//     });
// });

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const nombre = document.getElementById("nombreProducto").textContent;
    const precio = document
      .getElementById("precioProducto")
      .textContent.replace("$", "")
      .trim();
    const descripcion = document.getElementById(
      "descripcionProducto"
    ).textContent;
    const imagen = document.getElementById("imagenPrincipal").src;
    const id = new URLSearchParams(window.location.search).get("id");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const existente = carrito.find((p) => p.id === id);
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ id, nombre, precio, descripcion, imagen, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
  }
});

function cargarProductosSugeridos(productoActualId) {
  fetch("http://localhost:3000/api/productos")
    .then((res) => res.json())
    .then((productos) => {
      const contenedor = document.querySelector(".tarjetas");
      contenedor.innerHTML = "";

      const sugerencias = productos
        .filter((p) => p.id != productoActualId)
        .slice(0, 4);

      sugerencias.forEach((producto) => {
        let imagenBase64 = "";

        // ✅ Convertir el buffer en base64 si existe
        if (producto.imagen && producto.imagen.data) {
          const byteArray = new Uint8Array(producto.imagen.data);
          imagenBase64 = btoa(
            byteArray.reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
        }

        const imagenSrc = imagenBase64
          ? `data:image/png;base64,${imagenBase64}`
          : "/img/placeholder.png"; // fallback

        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");

        tarjeta.innerHTML = `
          <a href="detalle.html?id=${producto.id}">
            <img src="${imagenSrc}" alt="${producto.nombre}" class="producto-imagen">
            <div class="info_producto">
              <h3 class="titulo_producto">${producto.nombre}</h3>
              <p class="precio_producto">$ ${producto.precio}</p>
              <p class="descripcion_producto">${producto.descripcion}</p>
            </div>
          </a>
        `;

        contenedor.appendChild(tarjeta);
      });
    });
}
