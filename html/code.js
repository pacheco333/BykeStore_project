document.addEventListener('DOMContentLoaded', function() {
    const formCliente = document.getElementById('formCliente');
    
    formCliente.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // 
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;
        const contrasena = document.getElementById('contrasena').value;
        const repetirContrasena = document.getElementById('repetir-contrasena').value;
        
        // Validacion para que el cliente no deje ningun campo vacio
        if (!nombre || !apellido || !correo ||!telefono || !contrasena ) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }

       // Validacion para que el nombre y el apellido solo contengan letras. 
        const solo_texto = /^[a-zA-ZÀ-ÿ\s]+$/;
        if (!solo_texto.test(nombre)) {
            alert('El nombre solo debe contener letras');
            return;
        }
        if (!solo_texto.test(apellido)) {
            alert('El apellido solo debe contener letras');
            return;
        }
        
        // Validacion para que el campo telefono solo deje ingresar numeros.
        const phoneRegex = /[0-9]/;
        if (!phoneRegex.test(telefono)) {
            alert('El teléfono debe contener solo números.');
            return;
        }
        
        //  validar si las contraseñas coinciden
        if (contrasena !== repetirContrasena) { //si la contraseña es diferente mostrar mensaje.
            alert('Las contraseñas no coinciden');
            return;
        }
        
        
        // Prepare data for sending
        const data = {
            nombre,
            apellido,
            correo,
            telefono,
            contrasena
        };
        
        try {
            // Send registration request
            const response = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Error en el registro');
            }
            
            // Save token in localStorage
            localStorage.setItem('authToken', result.token);
            
            // Show success message and redirect
            alert('Registro exitoso! Redirigiendo al inicio de sesión...');
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });
});