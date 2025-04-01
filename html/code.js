document.addEventListener('DOMContentLoaded', function() {

    //Obtener el formulario y almacenarlo en una variable
    const formCliente = document.getElementById('formCliente');
    //
    formCliente.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const repetirContrasena = document.getElementById('repetir-contrasena').value;
        
        // Validar que las contraseñas coincidan
        if (contrasena !== repetirContrasena) { //
            alert('Las contraseñas no coinciden');
            return;
        }
        
        // Preparar datos para la API
        const clienteData = {
            nombre,
            apellido,
            correo,
            telefono,
            contrasena
        };
        
        // Mostrar indicador de carga
        const submitButton = document.querySelector('.btn-register');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Procesando...';
        submitButton.disabled = true;
        
        // Enviar datos a la API
        registrarCliente(clienteData, function() {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
    
    function registrarCliente(clienteData, callback) {
        fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Error del servidor: ${response.status} - ${text || response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Registro exitoso:', data);
            alert('¡Registro exitoso!');
            window.location.href = 'login.html';
        })
        .catch(error => {
            console.error('Error detallado:', error);
            alert('Ocurrió un error al registrar. Intente nuevamente.');
        })
        .finally(() => {
            if (callback) callback();
        });
    }
});
