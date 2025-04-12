// Modal de búsqueda para index.html
document.addEventListener("DOMContentLoaded", () => {
    const formBusqueda = document.getElementById("form-busqueda");
    const inputBusqueda = document.getElementById("buscar-input");
  
    // Crear el modal si no existe
    crearModalBusqueda();
  
    // Verificar si hay un parámetro de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    // Si hay un parámetro de búsqueda, realizar la búsqueda
    if (searchQuery) {
      // Mostrar el término de búsqueda en el input
      if (inputBusqueda) {
        inputBusqueda.value = searchQuery;
      }
      
      // Realizar la búsqueda y mostrar el modal
      buscarProductos(searchQuery);
    }
  
    // Configurar el formulario de búsqueda
    if (formBusqueda && inputBusqueda) {
      formBusqueda.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = inputBusqueda.value.trim();
        if (query) {
          // Actualizar la URL sin recargar la página
          const newUrl = `${window.location.pathname}?q=${encodeURIComponent(query)}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
          
          // Realizar la búsqueda y mostrar el modal
          buscarProductos(query);
        }
      });
    }
  });
  
  // Función para crear el modal de búsqueda
  function crearModalBusqueda() {
    // Verificar si el modal ya existe
    if (document.getElementById('modal-busqueda')) {
      return;
    }
    
    // Crear estructura del modal
    const modal = document.createElement('div');
    modal.id = 'modal-busqueda';
    modal.className = 'modal-busqueda';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="modal-contenido">
        <span class="cerrar-modal">&times;</span>
        <div class="modal-header">
          <h2>Resultados de búsqueda</h2>
          <p class="contador-resultados"></p>
        </div>
        <div class="modal-body">
          <div class="productos-grid"></div>
        </div>
      </div>
    `;
    
    // Agregar estilos para el modal
    const styles = document.createElement('style');
    styles.id = 'estilos-modal-busqueda';
    styles.textContent = `
      .modal-busqueda {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.7);
        animation: fadeIn 0.3s;
      }
      
      .modal-contenido {
        background-color: #fff;
        margin: 5% auto;
        width: 90%;
        max-width: 1000px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        position: relative;
        animation: slideIn 0.3s;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }
      
      .modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        position: sticky;
        top: 0;
        background-color: #fff;
        border-radius: 8px 8px 0 0;
        z-index: 1;
      }
      
      .modal-header h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
      }
      
      .contador-resultados {
        color: #666;
        margin: 5px 0 0 0;
      }
      
      .modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      
      .cerrar-modal {
        color: #aaa;
        float: right;
        font-size: 32px;
        font-weight: bold;
        cursor: pointer;
        position: absolute;
        right: 20px;
        top: 10px;
        transition: color 0.3s;
      }
      
      .cerrar-modal:hover {
        color: #333;
      }
      
      .productos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }
      
      .producto-card {
        border: 1px solid #eee;
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.3s, box-shadow 0.3s;
        background-color: #fff;
      }
      
      .producto-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
      }
      
      .producto-imagen {
        width: 100%;
        height: 180px;
        object-fit: cover;
        border-bottom: 1px solid #eee;
      }
      
      .producto-info {
        padding: 15px;
      }
      
      .producto-nombre {
        margin: 0 0 5px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
      
      .producto-precio {
        font-size: 18px;
        font-weight: 700;
        color:rgb(0, 0, 0);
        margin: 5px 0;
      }
      
      .producto-descripcion {
        font-size: 14px;
        color: #666;
        margin: 5px 0 15px 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .btn-agregar {
        background-color:rgb(0, 0, 0);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 10px 15px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .btn-agregar:hover {
        background-color: #3cb371;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      .btn-agregar:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .no-resultados {
        text-align: center;
        padding: 40px;
        background-color: #f8f9fa;
        border-radius: 8px;
      }
      
      .mensaje-confirmacion {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #2e8b57;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: fadeIn 0.3s, fadeOut 0.3s 2s forwards;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @media (max-width: 768px) {
        .productos-grid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }
        
        .modal-contenido {
          width: 95%;
          margin: 10% auto;
        }
      }
    `;
    
    // Agregar el modal y los estilos al DOM
    document.head.appendChild(styles);
    document.body.appendChild(modal);
    
    // Agregar evento de cierre al modal
    const cerrarBtn = modal.querySelector('.cerrar-modal');
    cerrarBtn.addEventListener('click', cerrarModal);
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarModal();
      }
    });
    
    // Cerrar modal con la tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') {
        cerrarModal();
      }
    });
  }
  
  // Función para abrir el modal
  function abrirModal() {
    const modal = document.getElementById('modal-busqueda');
    if (modal) {
      modal.style.display = 'block';
      // Prevenir scroll en el body
      document.body.style.overflow = 'hidden';
    }
  }
  
  // Función para cerrar el modal
  function cerrarModal() {
    const modal = document.getElementById('modal-busqueda');
    if (modal) {
      modal.style.display = 'none';
      // Restaurar scroll en el body
      document.body.style.overflow = '';
      
      // Limpiar URL si hay parámetro de búsqueda
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('q')) {
        window.history.pushState({}, '', window.location.pathname);
        
        // Limpiar input de búsqueda
        const inputBusqueda = document.getElementById("buscar-input");
        if (inputBusqueda) {
          inputBusqueda.value = '';
        }
      }
    }
  }
  
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
      
      // Mostrar resultados en el modal
      mostrarResultadosBusqueda(resultados, query);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      // Mostrar error en el modal
      mostrarErrorBusqueda();
    }
  }
  
  // Función para mostrar los resultados de búsqueda en el modal
  function mostrarResultadosBusqueda(productos, query) {
    const modal = document.getElementById('modal-busqueda');
    if (!modal) return;
    
    // Actualizar título y contador
    const modalHeader = modal.querySelector('.modal-header h2');
    modalHeader.textContent = `Resultados para: "${query}"`;
    
    const contadorResultados = modal.querySelector('.contador-resultados');
    contadorResultados.textContent = `Se encontraron ${productos.length} productos`;
    
    // Obtener el contenedor de productos
    const productosGrid = modal.querySelector('.productos-grid');
    
    // Si no hay resultados
    if (productos.length === 0) {
      productosGrid.innerHTML = `
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
          <div class="producto-card">
            <a href="detalle.html?id=${producto.id}" class="producto-link">
              <img src="data:image/jpeg;base64,${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
              <div class="producto-info">
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <p class="producto-precio">$ ${producto.precio}</p>
                <p class="producto-descripcion">${producto.descripcion}</p>
              </div>
            </a>
            <div class="producto-acciones">
              <button class="btn-agregar" data-id="${producto.id}">Añadir al carrito</button>
            </div>
          </div>
        `;
      });
      
      // Mostrar los productos
      productosGrid.innerHTML = productosHTML;
      
      // Configurar los botones de "Añadir al carrito"
      document.querySelectorAll('.btn-agregar').forEach(button => {
        button.addEventListener('click', function() {
          const id = parseInt(this.dataset.id);
          const productoCard = this.closest('.producto-card');
          const nombre = productoCard.querySelector('.producto-nombre').textContent;
          const precio = productoCard.querySelector('.producto-precio').textContent.replace('$', '').trim();
          const descripcion = productoCard.querySelector('.producto-descripcion').textContent;
          const imagen = productoCard.querySelector('.producto-imagen').src;
          
          agregarAlCarrito(id, nombre, precio, descripcion, imagen);
        });
      });
    }
    
    // Mostrar el modal
    abrirModal();
  }
  
  // Función para mostrar error en el modal
  function mostrarErrorBusqueda() {
    const modal = document.getElementById('modal-busqueda');
    if (!modal) return;
    
    // Actualizar título y contador
    const modalHeader = modal.querySelector('.modal-header h2');
    modalHeader.textContent = 'Error de búsqueda';
    
    const contadorResultados = modal.querySelector('.contador-resultados');
    contadorResultados.textContent = '';
    
    // Obtener el contenedor de productos
    const productosGrid = modal.querySelector('.productos-grid');
    
    productosGrid.innerHTML = `
      <div class="no-resultados">
        <p>Lo sentimos, ocurrió un error al buscar productos.</p>
        <p>Por favor intenta nuevamente más tarde.</p>
      </div>
    `;
    
    // Mostrar el modal
    abrirModal();
  }
  
  // Función para agregar un producto al carrito
  function agregarAlCarrito(id, nombre, precio, descripcion, imagen) {
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
  }
  
  // Función para mostrar un mensaje de confirmación
  function mostrarMensajeConfirmacion(texto) {
    // Eliminar mensajes previos
    const mensajesPrevios = document.querySelectorAll('.mensaje-confirmacion');
    mensajesPrevios.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const mensaje = document.createElement('div');
    mensaje.className = 'mensaje-confirmacion';
    mensaje.textContent = texto;
    
    // Agregar al DOM
    document.body.appendChild(mensaje);
    
    // Eliminar después de 2.5 segundos
    setTimeout(() => {
      mensaje.remove();
    }, 2500);
  }