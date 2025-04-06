document.getElementById('formCliente').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const contrasena = document.getElementById('contrasena').value;
    const repetirContrasena = document.getElementById('repetir-contrasena').value;

    if (contrasena !== repetirContrasena) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    const userData = {
        nombre,
        apellido,
        correo,
        telefono,
        contrasena
    };

    try {
        // Hacer la solicitud POST para registrar al usuario
        const response = await fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Usuario registrado exitosamente", data);
            alert("¡Registro exitoso!");
            window.location.href = 'login.html';  // Redirige al login después de registrar
        } else {
            const error = await response.json();
            console.log("Error al registrar usuario", error);
            alert("Error al registrar usuario, intente nuevamente.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Hubo un problema con el registro. Intente más tarde.");
    }
});
