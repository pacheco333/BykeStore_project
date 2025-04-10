let modoEdicion = false;
let productoIdActual = null;

document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("product-form");

  cargarProductos();

  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("product-name").value;
    const precio = document.getElementById("product-price").value;
    const entrada = parseInt(document.getElementById("product-entrada").value);
    const salida = parseInt(document.getElementById("product-salida").value) || 0;
    const descripcion = document.getElementById("product-desc").value;
    const imageInput = document.getElementById("product-image").files[0];
    const saldo = entrada - salida;

    // ✅ Actualizar producto existente
    if (modoEdicion && productoIdActual) {
      const producto = {
        nombre,
        precio,
        entrada,
        salida,
        saldo,
        descripcion,
      };

      try {
        await fetch(`http://localhost:3000/productos/${productoIdActual}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(producto),
        });

        alert("Producto actualizado con éxito");
        resetFormulario();
        cargarProductos();
      } catch (error) {
        console.error("Error actualizando producto:", error);
      }

      return;
    }

    // ✅ Crear producto nuevo
    if (imageInput) {
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("precio", precio);
      formData.append("entrada", entrada);
      formData.append("salida", salida);
      formData.append("saldo", saldo);
      formData.append("descripcion", descripcion);
      formData.append("imagen", imageInput);

      try {
        await fetch("http://localhost:3000/productos", {
          method: "POST",
          body: formData,
        });

        alert("Producto agregado con imagen");
        resetFormulario();
        cargarProductos();
      } catch (error) {
        console.error("Error agregando producto:", error);
      }
    } else {
      const producto = {
        nombre,
        precio,
        entrada,
        salida,
        saldo,
        descripcion,
      };

      try {
        await fetch("http://localhost:3000/productos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(producto),
        });

        alert("Producto agregado sin imagen");
        resetFormulario();
        cargarProductos();
      } catch (error) {
        console.error("Error agregando producto:", error);
      }
    }
  });
});

function cargarProductos() {
  fetch("http://localhost:3000/productos")
    .then((res) => res.json())
    .then((productos) => {
      const contenedor = document.getElementById("lista-productos");
      contenedor.innerHTML = "";

      productos.forEach((p) => {
        const imageSrc = p.imagen
          ? `data:image/jpeg;base64,${p.imagen}`
          : "imagen_por_defecto.jpg";

        addProductCard(p.id, p.nombre, p.precio, imageSrc);
      });
    })
    .catch((error) => console.error("Error cargando productos:", error));
}

function addProductCard(id, nombre, precio, imagen) {
  const card = document.createElement("div");
  card.classList.add("product-card");

  card.innerHTML = `
    <div class="imagen-contenedor">
      <img src="${imagen}" alt="${nombre}" class="producto-imagen">
    </div>
    <h3 class="product-name">${nombre}</h3>
    <p class="product-price">$${precio}</p>
    <div class="botones-accion">
      <button onclick="verInformacionProducto(${id})">Ver información</button>
      <button class="delete-product" data-id="${id}">Eliminar</button>
    </div>
  `;

  card.querySelector(".delete-product").addEventListener("click", () => {
    deleteProduct(id, card);
  });

  document.getElementById("lista-productos").appendChild(card);
}

function resetFormulario() {
  document.getElementById("product-form").reset();
  document.getElementById("product-salida").value = "";
  document.getElementById("product-saldo").value = "";
  modoEdicion = false;
  productoIdActual = null;
  document.querySelector(".submit-button").textContent = "Agregar Producto";
}

async function deleteProduct(id, card) {
  try {
    const response = await fetch(`http://localhost:3000/productos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      card.remove();
      alert("Producto eliminado");
    }
  } catch (error) {
    console.error("Error eliminando producto:", error);
  }
}

function verInformacionProducto(id) {
  fetch(`http://localhost:3000/productos/${id}`)
    .then((res) => res.json())
    .then((producto) => {
      document.getElementById("product-name").value = producto.nombre;
      document.getElementById("product-price").value = producto.precio;
      document.getElementById("product-entrada").value = producto.entrada;
      document.getElementById("product-desc").value = producto.descripcion;

      const salida = parseInt(producto.salida) || 0;
      const entrada = parseInt(producto.entrada) || 0;
      const saldo = entrada - salida;

      document.getElementById("product-salida").value = salida;
      document.getElementById("product-saldo").value = saldo;

      modoEdicion = true;
      productoIdActual = id;
      document.querySelector(".submit-button").textContent = "Actualizar Producto";
    })
    .catch((error) => console.error("Error al obtener producto:", error));
}
// let modoEdicion = false;
// let productoIdActual = null;

// document.addEventListener("DOMContentLoaded", () => {
//   const productForm = document.getElementById("product-form");

//   // 🔄 Cargar productos al iniciar
//   cargarProductos();

//   // ✅ Evento del formulario: agregar o actualizar producto
//   productForm.addEventListener("submit", async (event) => {
//     event.preventDefault();

//     const name = document.getElementById("product-name").value;
//     const price = document.getElementById("product-price").value;
//     const description = document.getElementById("product-desc").value;
//     const entrada = document.getElementById("product-entrada").value;
//     const imageInput = document.getElementById("product-image").files[0];

//     // Modo edición
//     if (modoEdicion && productoIdActual) {
//       const producto = { nombre: name, precio: price, entrada, descripcion,salida: document.getElementById("product-salida").value };

//       await fetch(`http://localhost:3000/productos/${productoIdActual}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(producto)
//       });

//       alert("Producto actualizado");
//       resetFormulario();
//       cargarProductos();
//       return;
//     }

//     // Agregar nuevo producto
//     if (imageInput) {
//       // Con imagen
//       const formData = new FormData();
//       formData.append("nombre", name);
//       formData.append("precio", price);
//       formData.append("descripcion", description);
//       formData.append("entrada", entrada);
//       formData.append("imagen", imageInput);

//       try {
//         const response = await fetch("http://localhost:3000/productos", {
//           method: "POST",
//           body: formData,
//         });

//         const data = await response.json();
//         const imageBase64 = await fileToBase64(imageInput);
//         addProductCard(data.id, name, price, imageBase64);
//         resetFormulario();
//       } catch (error) {
//         console.error("Error agregando producto:", error);
//       }
//     } else {
//       // Sin imagen
//       const producto = { nombre: name, precio: price, entrada, descripcion };

//       await fetch('http://localhost:3000/productos', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(producto)
//       });

//       alert("Producto agregado");
//       resetFormulario();
//       cargarProductos();
//     }
//   });
// });

// // 🔁 Cargar todos los productos desde la API
// function cargarProductos() {
//   fetch("http://localhost:3000/productos")
//     .then((res) => res.json())
//     .then((productos) => {
//       const contenedor = document.getElementById("lista-productos");
//       contenedor.innerHTML = "";

//       productos.forEach((p) => {
//         const imageSrc = p.imagen
//           ? `data:image/jpeg;base64,${p.imagen}`
//           : "imagen_por_defecto.jpg";

//         addProductCard(p.id, p.nombre, p.precio, imageSrc);
//       });
//     })
//     .catch((error) => console.error("Error cargando productos:", error));
// }

// // 🧱 Agregar tarjeta de producto al DOM
// function addProductCard(id, name, price, image) {
//   const card = document.createElement("div");
//   card.classList.add("product-card");

//   card.innerHTML = `
//     <div class="imagen-contenedor">
//       <img src="${image}" alt="${name}" class="producto-imagen">
//     </div>
//     <h3 class="product-name">${name}</h3>
//     <p class="product-price">$${price}</p>
//     <div class="botones-accion">
//       <button onclick="verInformacionProducto(${id})">Ver información</button>
//       <button class="delete-product" data-id="${id}">Eliminar</button>
//     </div>
//   `;

//   // Evento eliminar producto
//   card.querySelector(".delete-product").addEventListener("click", () => {
//     deleteProduct(id, card);
//   });

//   document.getElementById("lista-productos").appendChild(card);
// }

// // 🧹 Reiniciar formulario y estados
// function resetFormulario() {
//   document.getElementById("product-form").reset();
//   modoEdicion = false;
//   productoIdActual = null;
//   document.querySelector(".submit-button").textContent = "Agregar Producto";
// }

// // 🗑️ Eliminar producto
// async function deleteProduct(id, card) {
//   try {
//     const response = await fetch(`http://localhost:3000/productos/${id}`, {
//       method: "DELETE",
//     });

//     if (response.ok) {
//       card.remove();
//       alert("Producto eliminado con éxito");
//     }
//   } catch (error) {
//     console.error("Error eliminando producto:", error);
//   }
// }

// // 🔍 Ver información de un producto para editar
// function verInformacionProducto(id) {
//   fetch(`http://localhost:3000/productos/${id}`)
//     .then((response) => response.json())
//     .then((producto) => {
//       document.getElementById("product-name").value = producto.nombre;
//       document.getElementById("product-price").value = producto.precio;
//       document.getElementById("product-entrada").value = producto.entrada;
//       document.getElementById("product-desc").value = producto.descripcion;

//       // 🔢 Calcular saldo automáticamente
//       const entrada = parseInt(producto.entrada) || 0;
//       const salida = parseInt(producto.salida) || 0;
//       const saldo = entrada - salida;

//       document.getElementById("product-salida").value = salida;
//       document.getElementById("product-saldo").value = saldo;

//       modoEdicion = true;
//       productoIdActual = id;

//       document.querySelector(".submit-button").textContent = "Actualizar Producto";
//     })
//     .catch((error) => console.error("Error al obtener información:", error));
// }

// // 🔄 Convertir archivo a Base64
// function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = (error) => reject(error);
//   });
// }
