// Modificación para realizar búsquedas en index.html
document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("form-busqueda");
    const inputBusqueda = document.getElementById("buscar-input");
  
    // Verificar si hay un parámetro de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    // Si hay un parámetro de búsqueda, realizar la búsqueda
    if (searchQuery) {
      // Mostrar el término de búsqueda en el input
      if (inputBusqueda) {
        inputBusqueda.value = searchQuery;
      }
      
      // Llamar a la función que filtra productos
      buscarProductos(searchQuery);
    }
  
    // Configurar el formulario de búsqueda
    if (formBusqueda && inputBusqueda) {
      formBusqueda.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = inputBusqueda.value.trim();
        if (query) {
          // En lugar de redirigir, actualizar la URL y realizar la búsqueda directamente
          const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
          buscarProductos(query);
        }
      });
    }
  });
  
  // Función para buscar productos
  async function buscarProductos(query) {
    try {
      // Normalizar la búsqueda (minúsculas, sin acentos)
      query = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Cargar productos desde el servidor
      const response = await fetch("http://localhost:3000/productos");
      const productos = await response.json();
      
      // Filtrar productos por coincidencia en nombre o descripción
      const resultados = productos.filter(producto => {
        const nombre = producto.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const descripcion = producto.descripcion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        return nombre.includes(query) || descripcion.includes(query);
      });
      
      // Mostrar resultados
      mostrarResultadosBusqueda(resultados, query);
    } catch (error) {
      console.error("Error al buscar productos:", error);
    }
  }
  
  // Función para mostrar los resultados de búsqueda
  function mostrarResultadosBusqueda(productos, query) {
    // Ocultar secciones principales de la página de inicio
    const secciones = document.querySelectorAll('.nuevos_productos, .top_ventas, .collage, .hero, .stats');
    secciones.forEach(seccion => {
      seccion.style.display = 'none';
    });
    
    // Crear o recuperar la sección de resultados
    let seccionResultados = document.getElementById('resultados-busqueda');
    if (!seccionResultados) {
      seccionResultados = document.createElement('section');
      seccionResultados.id = 'resultados-busqueda';
      seccionResultados.className = 'resultados_busqueda';
      
      // Insertar después del navbar
      const navbar = document.querySelector('.navbar');
      if (navbar && navbar.nextElementSibling) {
        navbar.parentNode.insertBefore(seccionResultados, navbar.nextElementSibling);
      } else {
        document.body.appendChild(seccionResultados);
      }
    } else {
      // Limpiar contenido previo
      seccionResultados.innerHTML = '';
    }
    
    // Crear encabezado y contenedor de resultados
    seccionResultados.innerHTML = `
      <div class="resultados-header">
        <h2>Resultados de búsqueda para: "${query}"</h2>
        <p>Se encontraron ${productos.length} productos</p>
        <button id="volver-inicio" class="volver-btn">Volver al inicio</button>
      </div>
      <div class="contenedor_productos">
        <div class="tarjetas" id="resultados-productos"></div>
      </div>
    `;
    
    // Mostrar el contenedor de resultados
    seccionResultados.style.display = 'block';
    
    // Obtener el contenedor donde se mostrarán los productos
    const contenedorProductos = document.getElementById('resultados-productos');
    
    // Si no hay resultados
    if (productos.length === 0) {
      contenedorProductos.innerHTML = `
        <div class="no-resultados">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          <p>Intenta con otras palabras o navega por nuestras categorías.</p>
        </div>
      `;
    } else {
      // Generar HTML para cada producto encontrado
      let productosHTML = "";
      
      productos.forEach(producto => {
        productosHTML += `
          <div class="tarjeta">
            <a href="detalle.html?id=${producto.id}">
              <img src="data:image/jpeg;base64,${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
              <div class="info_producto">
                <h3 class="titulo_producto">${producto.nombre}</h3>
                <p class="precio_producto">$ ${producto.precio}</p>
                <p class="descripcion_producto">${producto.descripcion}</p>
              </div>
            </a>
            <div class="boton">
              <button class="add-to-cart-btn" data-id="${producto.id}">Añadir al carrito</button>
            </div>   
          </div>
        `;
      });
      
      // Mostrar los productos
      contenedorProductos.innerHTML = productosHTML;
    }
    
    // Aplicar estilos
    aplicarEstilos();
    
    // Configurar el botón de volver
    document.getElementById('volver-inicio').addEventListener('click', () => {
      // Ocultar resultados y mostrar secciones originales
      seccionResultados.style.display = 'none';
      secciones.forEach(seccion => {
        seccion.style.display = '';
      });
      
      // Limpiar la búsqueda y actualizar URL
      const inputBusqueda = document.getElementById("buscar-input");
      if (inputBusqueda) {
        inputBusqueda.value = '';
      }
      
      window.history.pushState({}, '', window.location.pathname);
    });
    
    // Configurar los botones de "Añadir al carrito"
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        const tarjeta = this.closest('.tarjeta');
        const nombre = tarjeta.querySelector('.titulo_producto').textContent;
        const precio = tarjeta.querySelector('.precio_producto').textContent.replace('$', '').trim();
        const descripcion = tarjeta.querySelector('.descripcion_producto').textContent;
        const imagen = tarjeta.querySelector('.producto-imagen').src;
        
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        const productoExistente = carrito.find(p => p.id === id);
        
        if (productoExistente) {
          productoExistente.cantidad++;
        } else {
          carrito.push({
            id,
            nombre,
            precio,
            descripcion,
            imagen,
            cantidad: 1
          });
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar contador del carrito
        const cartCount = document.getElementById("cart-count");
        if (cartCount) {
          const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
          cartCount.textContent = totalItems;
        }
        
        // Mostrar mensaje de confirmación
        mostrarMensajeConfirmacion('Producto añadido al carrito');
      });
    });
  }
  
  // Función para aplicar estilos a los elementos de búsqueda
  function aplicarEstilos() {
    const style = document.createElement('style');
    style.id = 'estilos-busqueda';
    
    // Eliminar estilos previos si existen
    const estilosPrevios = document.getElementById('estilos-busqueda');
    if (estilosPrevios) {
      estilosPrevios.remove();
    }
    
    style.textContent = `
      .resultados_busqueda {
        padding: 20px;
        margin: 20px 0;
      }
      
      .resultados-header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .resultados-header h2 {
        font-size: 28px;
        margin-bottom: 10px;
        color: #333;
      }
      
      .resultados-header p {
        font-size: 16px;
        color: #666;
        margin-bottom: 15px;
      }
      
      .volver-btn {
        background-color: #f0f0f0;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.3s;
      }
      
      .volver-btn:hover {
        background-color: #e0e0e0;
      }
      
      .no-resultados {
        text-align: center;
        padding: 40px 20px;
        background-color: #f8f9fa;
        border-radius: 8px;
        margin: 20px 0;
      }
      
      .no-resultados p {
        margin: 10px 0;
        color: #666;
      }
      
      .add-to-cart-btn {
        background-color: #2e8b57; /* Verde bosque */
        color: white;
        border: none;
        border-radius: 4px;
        padding: 10px 15px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        font-family: 'Rubik', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .add-to-cart-btn:hover {
        background-color: #3cb371; /* Verde más claro al pasar el cursor */
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
      
      .add-to-cart-btn:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      .boton {
        margin-top: 10px;
        padding: 0 10px 10px 10px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Función para mostrar un mensaje de confirmación
  function mostrarMensajeConfirmacion(texto) {
    // Eliminar mensajes previos si existen
    const mensajesPrevios = document.querySelectorAll('.mensaje-confirmacion');
    mensajesPrevios.forEach(msg => msg.remove());
    
    const mensaje = document.createElement('div');
    mensaje.className = 'mensaje-confirmacion';
    mensaje.textContent = texto;
    mensaje.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #2e8b57;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: fadeIn 0.3s, fadeOut 0.3s 2s forwards;
    `;
    
    const keyframes = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
    `;
    
    const styleAnimation = document.createElement('style');
    styleAnimation.textContent = keyframes;
    document.head.appendChild(styleAnimation);
    
    document.body.appendChild(mensaje);
    
    // Eliminar el mensaje después de 2.5 segundos
    setTimeout(() => {
      mensaje.remove();
      styleAnimation.remove();
    }, 2500);
  }