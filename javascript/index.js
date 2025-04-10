// async function cargarProductos() {
//     try {
//         let response = await fetch("http://localhost:3000/productos");
//         let productos = await response.json();

//         let nuevosProductosHTML = "";
//         let topVentasHTML = "";

//         productos.forEach((producto, index) => {
//             let imagenSrc = producto.imagen
//                 ? `data:image/jpeg;base64,${producto.imagen}`
//                 : "imagen-placeholder.jpg"; // Imagen por defecto si no hay imagen

//             let tarjeta = `
//                 <div class="tarjeta">
//                     <img src="${imagenSrc}" alt="${producto.nombre}" class="producto-imagen">
//                     <h3>${producto.nombre}</h3>
//                     <p>Precio: ${producto.precio}</p>
//                     <p>${producto.descripcion}</p>
//                 </div>
//             `;

//             if (index % 2 === 0) {
//                 nuevosProductosHTML += tarjeta;
//             } else {
//                 topVentasHTML += tarjeta;
//             }
//         });

//         document.getElementById("nuevos-productos").innerHTML = nuevosProductosHTML;
//         document.getElementById("top-ventas").innerHTML = topVentasHTML;
//     } catch (error) {
//         console.error("Error cargando productos:", error);
//     }
// }

// cargarProductos();
async function cargarProductos() {
  try {
    let response = await fetch("http://localhost:3000/productos");
    let productos = await response.json();

    let nuevosProductosHTML = "";
    let topVentasHTML = "";

    productos.forEach((producto, index) => {
      let tarjeta = `
                    <div class="tarjeta">
                    <a href="detalle.html?id=${producto.id}">
                    <img src="data:image/jpeg;base64,${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
                        <div class="info_producto">
                        <h3 class="titulo_producto">${producto.nombre}</h3>
                        <p class="precio_producto">$ ${producto.precio}</p>
                        <p class="descripcion_producto">${producto.descripcion}</p>
                        </div>
                        </a>
                        <div class = "boton">
                        <button class="add-to-cart-btn" data-id="${producto.id}">Añadir al carrito</button>
                            </div>   
                    </div>
                    `;

      // Los primeros productos se colocan en "Nuevos Productos", los otros en "Top Ventas"
      if (index % 2 === 0) {
        nuevosProductosHTML += tarjeta;
      } else {
        topVentasHTML += tarjeta;
      }
    });

    document.getElementById("nuevos-productos").innerHTML = nuevosProductosHTML;
    document.getElementById("top-ventas").innerHTML = topVentasHTML;
    window.productosCargados = productos;
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

cargarProductos();

// Contador visual (si lo tenés)
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let totalCantidad = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);

  let contador = document.getElementById("contador-carrito");
  if (!contador) {
    // Crear el contador si no existe aún
    const logoCarrito = document.querySelector(".logo_carrito");
    contador = document.createElement("span");
    contador.id = "contador-carrito";
    logoCarrito.appendChild(contador);
  }

  contador.textContent = totalCantidad;
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-to-cart-btn")) {
    const tarjeta = e.target.closest(".tarjeta");
    const nombre = tarjeta.querySelector(".titulo_producto").textContent;
    const precio = tarjeta
      .querySelector(".precio_producto")
      .textContent.replace("$", "")
      .trim();
    const descripcion = tarjeta.querySelector(
      ".descripcion_producto"
    ).textContent;
    const imagen = tarjeta.querySelector(".producto-imagen").src;

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Verificamos si el producto ya está en el carrito
    const productoExistente = carrito.find((p) => p.nombre === nombre);

    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      carrito.push({
        nombre,
        precio,
        descripcion,
        imagen,
        cantidad: 1,
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
  }
});
