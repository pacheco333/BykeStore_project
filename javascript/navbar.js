document.addEventListener("DOMContentLoaded", () => {
  const formBusqueda = document.getElementById("form-busqueda");
  const inputBusqueda = document.getElementById("buscar-input");

  if (formBusqueda && inputBusqueda) {
    formBusqueda.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = inputBusqueda.value.trim();
      if (query) {
        window.location.href = `bicicletas.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
});
