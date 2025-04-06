document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form values
        const correo = document.getElementById('email').value;
        const contrasena = document.getElementById('password').value;
        
        // Basic validation
        if (!correo || !contrasena) {
            alert('Por favor, ingrese correo y contraseña');
            return;
        }
        
        // Prepare data for sending
        const data = {
            correo,
            contrasena
        };
        
        try {
            // Send login request
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Error al iniciar sesión');
            }
            
            // Save token and user info in localStorage
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('usuario', JSON.stringify({
                id: result.cliente.id,
                nombre: result.cliente.nombre,
                apellido: result.cliente.apellido,
                correo: result.cliente.correo
            }));
            
            // Show success message and redirect
            alert('¡Inicio de sesión exitoso!');
            
            // Redirect to home page or dashboard
            window.location.href = 'index.html'; // Change this to your home page
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });
});