document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener el formulario de login
    const formLogin = document.querySelector('form');
    
    // Event listener para manejar el evento de envío (submit)
    formLogin.addEventListener('submit', function(event) {
        event.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada
        
        // Obtener los valores ingresados en los campos del formulario
        const correo = document.getElementById('email').value.trim();
        const contrasena = document.getElementById('password').value;
        
        // Validar que se proporcionaron ambos campos
        if (!correo || !contrasena) {
            alert('Por favor ingrese correo y contraseña');
            return;
        }
        
        // Crear objeto con los datos de login
        const loginData = {
            correo,
            contrasena
        };
        
        // Obtener el botón de envío y guardar su texto original
        const submitButton = document.querySelector('.submit-btn');
        const originalButtonText = submitButton.textContent;
        
        // Cambiar el contenido del texto para mostrar que la solicitud está procesando
        submitButton.textContent = 'Procesando...';
        submitButton.disabled = true; // Deshabilitar el botón para evitar múltiples envíos
        
        // Llamar a la función que envía los datos de login a la API
        iniciarSesion(loginData, function() {
            // Restaurar el texto original del botón y habilitarlo después de la solicitud
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
    
    // Enviar los datos de login a la API
    function iniciarSesion(loginData, callback) {
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            // Verificar si la respuesta del servidor indica un error
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error en el servidor');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Login exitoso:', data);
            
            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Mostrar mensaje de éxito
            alert('¡Inicio de sesión exitoso!');
            
            // Redirigir a la página principal
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Error en login:', error);
            alert(error.message || 'Error al iniciar sesión. Verifique sus credenciales.');
        })
        .finally(() => {
            if (callback) callback();
        });
    }
});
