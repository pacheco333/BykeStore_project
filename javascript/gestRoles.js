// gestRoles.js - Funcionalidad para la gestión de roles con SuperAdmin

const API_BASE = 'http://localhost:3000/api';

// Cargar usuarios al inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
});

// Función para cargar todos los usuarios
async function cargarUsuarios() {
    try {
        console.log(' Cargando usuarios...');
        const response = await fetch(`${API_BASE}/clientes`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const usuarios = await response.json();
        console.log(' Usuarios obtenidos:', usuarios);
        
        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error(' Error al cargar usuarios:', error);
        mostrarError('Error al cargar la lista de usuarios');
    }
}

// Función para mostrar usuarios en la tabla
function mostrarUsuarios(usuarios) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ''; // Limpiar tabla
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px;">
                    No hay usuarios registrados
                </td>
            </tr>
        `;
        return;
    }
    
    // Verificar si hay un SuperAdmin activo
    const superAdminActual = usuarios.find(u => u.rol_id === 3);
    
    usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre} ${usuario.apellido}</td>
            <td>${usuario.correo}</td>
            <td>
                <span class="rol-badge ${getRolClass(usuario.rol_id)}">
                    ${getRolNombre(usuario.rol_id)}
                </span>
            </td>
            <td>
                ${generarBotonesAccion(usuario, superAdminActual)}
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// Función para generar botones de acción según el rol y contexto
function generarBotonesAccion(usuario, superAdminActual) {
    let botones = '';
    
    // Si es SuperAdmin, no mostrar botones de cambio de rol
    if (usuario.rol_id === 3) {
        return '<span class="sin-acciones">Sin acciones disponibles</span>';
    }
    
    // Si es Usuario (rol_id === 1)
    if (usuario.rol_id === 1) {
        botones += `
            <button class="asignar" onclick="cambiarRol(${usuario.id}, 2)">
                Asignar Admin
            </button>
        `;
    }
    
    // Si es Admin (rol_id === 2)
    if (usuario.rol_id === 2) {
        botones += `
            <button class="quitar" onclick="cambiarRol(${usuario.id}, 1)">
                Quitar Admin
            </button>
            <button class="asignar-super" onclick="asignarSuperAdmin(${usuario.id})">
                Asignar SuperAdmin
            </button>
        `;
    }
    
    return botones;
}

// Función para obtener el nombre del rol
function getRolNombre(rolId) {
    switch (rolId) {
        case 1:
            return 'Usuario';
        case 2:
            return 'Admin';
        case 3:
            return 'SuperAdmin';
        default:
            return 'Desconocido';
    }
}

// Función para obtener la clase CSS del rol
function getRolClass(rolId) {
    switch (rolId) {
        case 1:
            return 'rol-usuario';
        case 2:
            return 'rol-admin';
        case 3:
            return 'rol-superadmin';
        default:
            return 'rol-desconocido';
    }
}

// Función para cambiar el rol de un usuario (Admin/Usuario)
async function cambiarRol(userId, nuevoRolId) {
    try {
        // Confirmar la acción
        const accion = nuevoRolId === 2 ? 'asignar rol de Admin' : 'quitar rol de Admin';
        if (!confirm(`¿Estás seguro de que deseas ${accion} a este usuario?`)) {
            return;
        }
        
        console.log(` Cambiando rol del usuario ${userId} a rol ${nuevoRolId}...`);
        
        const response = await fetch(`${API_BASE}/clientes/${userId}/rol`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rol_id: nuevoRolId })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        console.log(' Rol actualizado:', resultado);
        
        // Mostrar mensaje de éxito
        const accionTexto = nuevoRolId === 2 ? 'asignado como Admin' : 'removido como Admin';
        mostrarExito(`Usuario ${accionTexto} correctamente`);
        
        // Recargar la lista de usuarios
        cargarUsuarios();
        
    } catch (error) {
        console.error('❌ Error al cambiar rol:', error);
        mostrarError(`Error al cambiar rol: ${error.message}`);
    }
}

// Función para asignar SuperAdmin (degradando el SuperAdmin anterior)
async function asignarSuperAdmin(userId) {
    try {
        // Confirmar la acción
        if (!confirm('¿Estás seguro de que deseas asignar este usuario como SuperAdmin? El SuperAdmin actual será degradado a Admin.')) {
            return;
        }
        
        console.log(` Asignando SuperAdmin al usuario ${userId}...`);
        
        // Primero, obtener la lista actual de usuarios para encontrar el SuperAdmin actual
        const responseUsuarios = await fetch(`${API_BASE}/clientes`);
        if (!responseUsuarios.ok) {
            throw new Error('Error al obtener lista de usuarios');
        }
        
        const usuarios = await responseUsuarios.json();
        const superAdminActual = usuarios.find(u => u.rol_id === 3);
        
        // Si hay un SuperAdmin actual, degradarlo a Admin
        if (superAdminActual) {
            console.log(` Degradando SuperAdmin actual (ID: ${superAdminActual.id}) a Admin...`);
            
            const responseDegradacion = await fetch(`${API_BASE}/clientes/${superAdminActual.id}/rol`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rol_id: 2 }) // Degradar a Admin
            });
            
            if (!responseDegradacion.ok) {
                throw new Error('Error al degradar SuperAdmin actual');
            }
        }
        
        // Ahora asignar el nuevo SuperAdmin
        const responseNuevoSuper = await fetch(`${API_BASE}/clientes/${userId}/rol`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rol_id: 3 })
        });
        
        if (!responseNuevoSuper.ok) {
            const errorData = await responseNuevoSuper.json();
            throw new Error(errorData.message || `Error HTTP: ${responseNuevoSuper.status}`);
        }
        
        const resultado = await responseNuevoSuper.json();
        console.log(' SuperAdmin asignado:', resultado);
        
        // Mostrar mensaje de éxito
        let mensaje = 'Usuario asignado como SuperAdmin correctamente';
        if (superAdminActual) {
            mensaje += '. El SuperAdmin anterior ha sido degradado a Admin';
        }
        mostrarExito(mensaje);
        
        // Recargar la lista de usuarios
        cargarUsuarios();
        
    } catch (error) {
        console.error('❌ Error al asignar SuperAdmin:', error);
        mostrarError(`Error al asignar SuperAdmin: ${error.message}`);
    }
}

// Función para mostrar mensajes de éxito
function mostrarExito(mensaje) {
    // Remover mensajes anteriores
    const mensajeAnterior = document.querySelector('.mensaje');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    
    const div = document.createElement('div');
    div.className = 'mensaje exito';
    div.textContent = mensaje;
    
    const container = document.querySelector('.container');
    container.insertBefore(div, container.children[1]);
    
    // Remover mensaje después de 4 segundos (más tiempo para leer el mensaje más largo)
    setTimeout(() => {
        div.remove();
    }, 4000);
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    // Remover mensajes anteriores
    const mensajeAnterior = document.querySelector('.mensaje');
    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }
    
    const div = document.createElement('div');
    div.className = 'mensaje error';
    div.textContent = mensaje;
    
    const container = document.querySelector('.container');
    container.insertBefore(div, container.children[1]);
    
    // Remover mensaje después de 5 segundos
    setTimeout(() => {
        div.remove();
    }, 5000);
}

// Función para refrescar la lista de usuarios
function refrescarUsuarios() {
    cargarUsuarios();
}