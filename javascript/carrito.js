document.addEventListener("DOMContentLoaded", () => {
  const carritoContainer = document.querySelector(".cart");
  const subtotalElement = document.querySelector(".summary p span");
  const totalElement = document.querySelector(".summary h3 span");
  const btnPagar = document.querySelector(".pagar");
  const ENVIO = 15000;

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  function renderizarCarrito() {
    carritoContainer.innerHTML = "";

    carrito.forEach((producto, index) => {
      const item = document.createElement("div");
      item.classList.add("item");

      item.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen_bicicleta" />
        <div class="details">
          <h2>${producto.nombre}</h2>
          <p>${producto.descripcion}</p>
          <p class="price">$${formatearPrecio(producto.precio)}</p>
        </div>
        <div class="quantity">
          <button class="boton restar">-</button>
          <span class="contador">${producto.cantidad}</span>
          <button class="boton sumar">+</button>
        </div>
        <button class="delete"><img src="/img/Eliminar.png" alt="Eliminar" /></button>
      `;

      // Botón +
      item.querySelector(".sumar").addEventListener("click", () => {
        producto.cantidad++;
        guardarCarrito();
        renderizarCarrito();
      });

      // Botón -
      item.querySelector(".restar").addEventListener("click", () => {
        if (producto.cantidad > 1) {
          producto.cantidad--;
        } else {
          carrito.splice(index, 1);
        }
        guardarCarrito();
        renderizarCarrito();
      });

      // Botón eliminar
      item.querySelector(".delete").addEventListener("click", () => {
        carrito.splice(index, 1);
        guardarCarrito();
        renderizarCarrito();
      });

      carritoContainer.appendChild(item);
    });

    actualizarResumen();
    actualizarContadorCarrito(); // Asegura actualización del contador al renderizar
  }

  function actualizarResumen() {
    let subtotal = carrito.reduce((acc, prod) => acc + prod.cantidad * parseFloat(prod.precio), 0);
    let total = subtotal + ENVIO;

    subtotalElement.textContent = `$${formatearPrecio(subtotal)}`;
    totalElement.textContent = `$${formatearPrecio(total)}`;
  }

  function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito(); // 🔄 Asegura actualización del contador al guardar
  }

  function formatearPrecio(valor) {
    return Number(valor).toLocaleString("es-CO");
  }

  // Función para verificar stock disponible
  async function verificarStock() {
    try {
      const response = await fetch('http://localhost:3000/api/productos');
      const productosDB = await response.json();

      const stockMap = {};
      productosDB.forEach(producto => {
        stockMap[producto.id] = producto.stock;
      });

      for (const item of carrito) {
        const stockDisponible = stockMap[item.id];
        
        if (stockDisponible === undefined) {
          alert(`El producto "${item.nombre}" ya no está disponible.`);
          return false;
        }
        
        if (item.cantidad > stockDisponible) {
          alert(`Stock insuficiente para "${item.nombre}". Cantidad disponible: ${stockDisponible} unidades.`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error al verificar stock:', error);
      alert('Error al verificar el stock. Por favor, inténtalo de nuevo.');
      return false;
    }
  }

  btnPagar.addEventListener("click", async () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const stockValido = await verificarStock();
    
    if (stockValido) {
      window.location.href = "direccion.html";
    }
  });

  renderizarCarrito();

  // Función para actualizar el contador del carrito ()
  function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const contador = document.getElementById("cart-count");

    if (contador) {
      contador.textContent = total;
    }
  }
});
