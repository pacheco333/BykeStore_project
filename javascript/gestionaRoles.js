document.addEventListener("DOMContentLoaded", async () => {
    const tablaBody = document.querySelector("#tabla-usuarios tbody");
  
    try {
      const res = await fetch("http://localhost:3000/api/clientes");
      const usuarios = await res.json();
  
      usuarios.forEach((user) => {
        const fila = document.createElement("tr");
  
        fila.innerHTML = `
          <td>${user.id}</td>
          <td>${user.nombre}</td>
          <td>${user.correo}</td>
          <td>${user.rol_id == 1 ? "Usuario" : user.rol_id == 2 ? "Administrador" : "Superadmin"}</td>
          <td>
            ${user.rol_id != 2 ? `<button onclick="asignarAdmin(${user.id})">Asignar admin</button>` : "✔️"}
          </td>
        `;
  
        tablaBody.appendChild(fila);
      });
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  });
  
  async function asignarAdmin(idCliente) {
    try {
      const res = await fetch(`http://localhost:3000/api/clientes/${idCliente}/rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rol_id: 2 }), // 2 = administrador
      });
  
      const data = await res.json();
      alert(data.message);
      location.reload(); // refresca para actualizar la tabla
    } catch (error) {
      console.error("Error al actualizar rol:", error);
    }
  }
  