document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("form");
  
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const correo = document.getElementById("email").value;
      const contrasena = document.getElementById("password").value;
  
      try {
        const response = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo, contrasena }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert(data.message);
          localStorage.setItem("usuario", JSON.stringify(data.cliente));
          // Redirige a una página de bienvenida o dashboard
          window.location.href = "index.html";
        } else {
          alert(data.message || "Error en el inicio de sesión.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Ocurrió un error al intentar iniciar sesión.");
      }
    });
  });
  