function getUsuarioActivo() {
    return JSON.parse(localStorage.getItem("usuario"));
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const usuario = getUsuarioActivo();
  
    // Si hay sesión activa
    if (usuario) {
      // Ocultar ícono de login
      const loginLink = document.getElementById("login-link");
      if (loginLink) loginLink.style.display = "none";
  
      // Mostrar sección user
      const userInfo = document.getElementById("user-info");
      if (userInfo) userInfo.style.display = "block";
  
      // Mostrar nombre
      const nombreTexto = document.getElementById("nombre-texto");
      if (nombreTexto) nombreTexto.textContent = usuario.nombre;
  
      // Mostrar botón admin
      if (usuario.rol_id === 3) {
        const adminBtn = document.getElementById("admin-btn-container");
        if (adminBtn) adminBtn.style.display = "block";
      }
  
      // Cerrar sesión
      const cerrarSesion = document.getElementById("cerrar-sesion");
      if (cerrarSesion) {
        cerrarSesion.addEventListener("click", () => {
          localStorage.removeItem("usuario");
          window.location.href = "index.html";
        });
      }
    }
  });
  