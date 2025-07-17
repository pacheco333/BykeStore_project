document.getElementById("formCliente").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const correo = document.getElementById("correo").value;
    const telefono = document.getElementById("telefono").value;
    const contrasena = document.getElementById("contrasena").value;
    const repetirContrasena = document.getElementById("repetir-contrasena").value;
    //Validar que no dejen campos vacios
    if (!nombre || !apellido || !correo || !telefono || !contrasena || !repetirContrasena) {
        alert("Todos los campos son obligatorios.");
        return;
    }

     // Validar nombre y apellido (solo letras)
     const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
     if (!soloLetras.test(nombre)) {
         alert("El nombre solo debe contener letras.");
         return;
     }
 
     if (!soloLetras.test(apellido)) {
         alert("El apellido solo debe contener letras.");
         return;
     }
 
     // Validar teléfono (solo números)
     const soloNumeros = /^[0-9]+$/;
     if (!soloNumeros.test(telefono)) {
         alert("El teléfono solo debe contener números.");
         return;
     }
 
     // Validar longitud de la contraseña
     if (contrasena.length < 6) {
         alert("La contraseña debe tener al menos 6 caracteres.");
         return;
     }
 
     // Validar coincidencia de contraseñas
     if (contrasena !== repetirContrasena) {
         alert("Las contraseñas no coinciden.");
         return;
     }
     //Formato de correo valido
     const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!formatoCorreo.test(correo)) {
         alert("El correo no tiene un formato válido.");
         return;
     }
     

     

    const cliente = {
        nombre,
        apellido,
        correo,
        telefono,
        contrasena
    };
    

    try {
        const response = await fetch("http://localhost:3000/api/clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cliente),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
            // Si el servidor responde con error, mostramos el mensaje
            const errorMessage = data.message || "Correo ya registrado. Ingresa otro";
            alert( errorMessage);
            return;
        }
    
        alert("Registro exitoso.");
        window.location.href = "login.html";
    
    } catch (error) {
        console.error("Error al registrar:", error);
        alert("Hubo un error al conectar con el servidor.");
    }
});
