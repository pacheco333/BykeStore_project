document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-group");
  const resumen = document.getElementById("detalle-compra");
  const lista = document.getElementById("detalle-lista");
  const modal = document.getElementById("compra-modal");
  const tablaBody = document.querySelector("#tabla-detalle tbody");
  const totalCompraEl = document.getElementById("total-compra");
  const confirmarBtn = document.getElementById("confirmar-compra");

  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Función para obtener el ID del usuario logueado
  function obtenerIdUsuarioLogueado() {
    try {
      // Obtener el usuario desde localStorage (como se guarda en login.js)
      const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
      
      if (usuarioLogueado && usuarioLogueado.id) {
        return usuarioLogueado.id;
      }
      
      // Si no se encuentra el usuario, redirigir al login
      alert("Debes iniciar sesión para realizar una compra.");
      window.location.href = "login.html";
      return null;
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
      alert("Error en la sesión. Por favor, inicia sesión nuevamente.");
      window.location.href = "login.html";
      return null;
    }
  }

  if (carrito.length === 0) {
    lista.innerHTML = "<li>No hay productos en el carrito.</li>";
  } else {
    resumen.classList.remove("hidden");
    carrito.forEach((producto) => {
      const li = document.createElement("li");
      li.textContent = `${producto.nombre} x ${producto.cantidad} - $${Number(producto.precio).toLocaleString("es-CO")}`;
      lista.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const ciudad = document.getElementById("ciudad").value;
    const carrera = document.getElementById("carrera").value;
    const calle = document.getElementById("calle").value;
    const pago = document.getElementById("pago").value;

    if (!ciudad || !carrera || !calle || !pago) {
      alert("Por favor completa todos los campos.");
      return;
    }

    // Mostrar modal con detalle
    tablaBody.innerHTML = "";
    let totalFinal = 0;

    carrito.forEach((producto) => {
      const total = producto.cantidad * parseFloat(producto.precio);
      totalFinal += total;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${producto.nombre}</td>
        <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>
        <td>${producto.cantidad}</td>
        <td>$${Number(total).toLocaleString("es-CO")}</td>
      `;
      tablaBody.appendChild(fila);
    });

    const ENVIO = 15000;
    const totalConEnvio = totalFinal + ENVIO;

    totalCompraEl.innerHTML = `
      Subtotal: $${totalFinal.toLocaleString("es-CO")}<br>
      Envío: $${ENVIO.toLocaleString("es-CO")}<br>
      <strong>Total con envío: $${totalConEnvio.toLocaleString("es-CO")}</strong>
    `;
    modal.classList.remove("hidden");
  });

  confirmarBtn.addEventListener("click", async () => {
    try {
      // Obtener el ID del usuario logueado
      const idUsuarioLogueado = obtenerIdUsuarioLogueado();
      if (!idUsuarioLogueado) {
        return; // La función ya maneja el error y redirección
      }

      // Calcular total de la compra
      let totalFinal = 0;
      carrito.forEach((producto) => {
        totalFinal += producto.cantidad * parseFloat(producto.precio);
      });
      const ENVIO = 15000;
      const totalConEnvio = totalFinal + ENVIO;

      // 1. Crear la compra principal
      const compraResponse = await fetch("http://localhost:3000/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuarios: idUsuarioLogueado, // Ahora usa el ID del usuario logueado
          total_compra: totalConEnvio
        }),
      });

      if (!compraResponse.ok) {
        throw new Error("Error al crear la compra");
      }

      const compraData = await compraResponse.json();
      const idCompra = compraData.id_compra;

      // 2. Crear los detalles de venta para cada producto
      for (let producto of carrito) {
        await fetch("http://localhost:3000/detalle-venta", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_compra: idCompra,
            id_producto: producto.id,
            cantidad: producto.cantidad,
            precio: parseFloat(producto.precio)
          }),
        });

        // 3. Actualizar el stock de cada producto
        await fetch(`http://localhost:3000/productos/stock/${producto.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cantidad: producto.cantidad }),
        });
      }

      localStorage.removeItem("carrito");
      modal.classList.add("hidden");
      alert("Compra finalizada con éxito.");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Error al finalizar compra:", error);
      alert("Ocurrió un error procesando tu compra.");
    }
  });
});