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
                        <div class = "boton">
                        <button type="submit" class="boton_enviar">Agregar al carrito</button>
                            </div>
                            </a>
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
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

cargarProductos();
