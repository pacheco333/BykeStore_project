function mostrarFormularioPago() {
    var metodoPago = document.getElementById("pago").value;
    var formularioTarjeta = document.getElementById("formularioTarjeta");

    if (metodoPago === "tarjeta") {
      formularioTarjeta.classList.remove("hidden");
    } else {
      formularioTarjeta.classList.add("hidden");
    }
  }