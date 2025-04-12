document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".form-group").addEventListener("submit", async function (e) {
    e.preventDefault();

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const usuario = JSON.parse(localStorage.getItem("usuario")); // Se guarda al hacer login

    if (!usuario || carrito.length === 0) {
      alert("Debes iniciar sesión primero y tener productos en el carrito.");
      return;
    }

    const subtotal = carrito.reduce((total, producto) => {
      return total + parseFloat(producto.precio.replace(/\./g, "")) * producto.cantidad;
    }, 0);

    const totalCompra = subtotal + 15000; // Costo fijo de entrega

    const compraData = {
      id_usuarios: usuario.id,
      total_compra: totalCompra,
      carrito: carrito,
    };

    try {
      const res = await fetch("http://localhost:3000/finalizar-compra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(compraData),
      });

      const result = await res.json();

      if (res.ok) {
        // Guardar el detalle para mostrarlo en resumen.html
        localStorage.setItem("detalle_venta", JSON.stringify(result.detalle));
        localStorage.removeItem("carrito");
        localStorage.setItem("productos_compra", JSON.stringify(carrito)); // 👈 nuevo
        window.location.href = "resumen.html"; // Redirigir con detalle
      } else {
        alert(result.message || "Error al registrar la compra.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error en el servidor.");
    }
  });
});
