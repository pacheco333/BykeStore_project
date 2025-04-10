document.addEventListener("DOMContentLoaded", () => {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const cartContainer = document.querySelector(".cart");
  const resumen = document.querySelector(".summary");

  function renderCarrito() {
    cartContainer.innerHTML = "";

    if (carrito.length === 0) {
      cartContainer.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío</p>`;
      resumen.innerHTML = `
          <h2>Resumen del pedido</h2>
          <p>Subtotal <span>$0</span></p>
          <p class="linea">Entrega <span>$0</span></p>
          <h3>Total <span>$0</span></h3>
          <button class="pagar" disabled>Pagar</button>
        `;
      return;
    }

    let subtotal = 0;

    carrito.forEach((producto, index) => {
      subtotal +=
        parseFloat(producto.precio.replace(/\./g, "")) * producto.cantidad;

      const item = document.createElement("div");
      item.classList.add("item", "fade-in");

      item.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen_bicicleta"/>
          <div class="details">
            <h2>${producto.nombre}</h2>
            <p>${producto.descripcion}</p>
            <p class="price">$${producto.precio}</p>
          </div>
          <div class="quantity">
            <button class="boton restar" data-index="${index}">-</button>
            <span class="contador">${producto.cantidad}</span>
            <button class="boton sumar" data-index="${index}">+</button>
          </div>
          <button class="delete" data-index="${index}"><img src="/img/Eliminar.png"/></button>
        `;

      cartContainer.appendChild(item);
    });

    resumen.innerHTML = `
        <h2>Resumen del pedido</h2>
        <p>Subtotal <span>$${subtotal.toLocaleString()}</span></p>
        <p class="linea">Entrega <span>$15.000</span></p>
        <h3>Total <span>$${(subtotal + 15000).toLocaleString()}</span></h3>
        <button class="pagar">Pagar</button>
      `;
  }

  renderCarrito();

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("sumar")) {
      const index = e.target.dataset.index;
      carrito[index].cantidad++;
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderCarrito();
    }

    if (e.target.classList.contains("restar")) {
      const index = e.target.dataset.index;
      if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
        localStorage.setItem("carrito", JSON.stringify(carrito));
        renderCarrito();
      }
    }

    if (e.target.classList.contains("delete") || e.target.closest(".delete")) {
      const index =
        e.target.dataset.index || e.target.closest(".delete").dataset.index;
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderCarrito();
    }

    if (e.target.classList.contains("vaciar-carrito")) {
      carrito = [];
      localStorage.removeItem("carrito");
      renderCarrito();
    }
  });
});
