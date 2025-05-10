function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const contador = document.getElementById("cart-count");

  if (contador) {
    contador.textContent = total;
  }
}

document.addEventListener("DOMContentLoaded", actualizarContadorCarrito);
