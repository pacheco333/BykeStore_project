document.addEventListener('DOMContentLoaded', function() {

    // Obtenemos el formulario de registro del cliente por su ID
    const formCliente = document.getElementById('formCliente');

    //event listener para manejar el evento de envío (submit)
    formCliente.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita que el formulario se envíe de forma predeterminada y recargue la página
        
        // Obtiene los valores ingresados en los campos del formulario y elimina espacios en blanco innecesarios
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const contrasena = document.getElementById('contrasena').value;
        const repetirContrasena = document.getElementById('repetir-contrasena').value;

        // validacion para verificar que las contraseñas sean iguales
        if (contrasena !== repetirContrasena) {  
            alert('Las contraseñas no coinciden'); // Muestra un mensaje de error
            return; // detenemos la ejecucucion si no coinciden 
        }

        // creamos un objeto con los datos del cliente que se enviara a la Api.
        const clienteData = {
            nombre,
            apellido,
            correo,
            telefono,
            contrasena
        };

        // obtener el boton de envio y guardar su texto original
        const submitButton = document.querySelector('.btn-register');
        const originalButtonText = submitButton.textContent;

        // cambiar el contenido del texto para ver que la solicitud esta procesando
        submitButton.textContent = 'Procesando...';
        submitButton.disabled = true; // desabilitamos el boton para evitar multiples envios

        // llamar a la funcion que envia los datos del cliente a la api
        registrarCliente(clienteData, function() {
            // restaurar el texto original del boton y habilitarlo despues de la solicitud
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });

    // enviar los datos del cliente a la api
    function registrarCliente(clienteData, callback) {
        fetch('http://localhost:3000/api/clientes', { // URL de la API a la que se envían los datos
            method: 'POST', // Método HTTP para enviar los datos
            headers: {
                'Content-Type': 'application/json' // Indicar que se envian los datos en formato json
            },
            body: JSON.stringify(clienteData) // convertir el objeto clienteData a una cadena JSON para enviarlo
        })
        .then(response => {
            // Verifica si la respuesta del servidor indica un error
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Error del servidor: ${response.status} - ${text || response.statusText}`);
                });
            }
            return response.json(); // convierte la respuesta del servidor a formato JSON
        })
        .then(data => {
            console.log('Registro exitoso:', data); // mostrar en la consola que el registro fue exitoso
            alert('¡Registro exitoso!'); // mostrar un mensaje de éxito al usuario
            window.location.href = 'login.html'; // redirigir a la página de inicio de sesión
        })
        .catch(error => {
            console.error('Error detallado:', error); // mostrar error en consola
            alert('Ocurrió un error al registrar. Intente nuevamente.'); // mostrarle un mensaje de error al usuario
        })
        .finally(() => {
            if (callback) callback(); // llamar la funcion callback para restaurar el boton
        });
    }
});
