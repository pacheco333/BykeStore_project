document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".contenedor_productos");
  const btnFiltrar = document.getElementById("btn-filtrar");
  const btnLimpiar = document.getElementById("btn-limpiar");
  const tituloPagina = document.querySelector(".tituloRuta");

  // Al inicio del DOMContentLoaded, después de definir las variables:
  // Procesar parámetro de filtro al cargar
  const filterParam = getUrlParameter('filter');
  if (filterParam) {
    // Marcar el checkbox correspondiente
    const checkbox = document.querySelector(`.tipo_bicileta input[value="${filterParam}"]`);
    if (checkbox) {
      checkbox.checked = true;
      
      // Actualizar título de la página
      if (tituloPagina) {
        tituloPagina.textContent = `Bicicletas de ${filterParam}`;
      }
    }
  }

  // Función para obtener parámetros de la URL
  function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.search);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}



  // Función para renderizar productos
  function renderizarProductos(productos) {
    if (!productos || productos.length === 0) {
      contenedor.innerHTML = `
        <div class="sin-productos" style="grid-column: 1 / -1;">
          <img src="/img/no-products.png" alt="No hay productos" style="width: 150px; opacity: 0.7;">
          <h3 style="color: #666; margin-top: 20px;">No se encontraron bicicletas disponibles</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = productos.map(producto => `
      <div class="tarjeta">
        <a href="detalle.html?id=${producto.id}">
          <img src="${producto.imagen ? `data:image/jpeg;base64,${producto.imagen}` : '/img/default-bike.jpg'}" 
               alt="${producto.nombre}" 
               class="producto-imagen"
               onerror="this.src='/img/default-bike.jpg'">
          <div class="info_producto">
            <h3 class="titulo_producto">${producto.nombre}</h3>
            <p class="precio_producto">$${producto.precio.toLocaleString('es-CO')}</p>
            <p class="categoria_producto">${producto.categoria} · ${producto.gama}</p>
            <p class="descripcion_producto">${producto.descripcion || "Bicicleta de alta calidad"}</p>
          </div>
        </a>
        <div class="boton">
          <button class="add-to-cart-btn" data-id="${producto.id}">Añadir al carrito</button>
        </div>   
      </div>
    `).join("");
  }

  // Función para obtener rangos de precio seleccionados
  function getRangosPrecio() {
    const rangos = [];
    const precios = {
      precioUno: [1000000, 2000000],
      precio: [2000000, 3000000],
      precioDos: [3000000, 4000000],
      precioTres: [4000000, 5000000],
      precioCuatro: [5000000, 6000000],
      precioCinco: [6000000, 7000000],
      precioSeis: [7000000, 8000000],
      precioSiete: [8000000, 9000000],
      precioOcho: [9000000, 10000000]
    };

    document.querySelectorAll('.precio input[type="checkbox"]:checked').forEach(cb => {
      if (precios[cb.id]) {
        rangos.push(precios[cb.id]);
      }
    });

    return rangos;
  }

  // Función para aplicar todos los filtros
  function aplicarFiltros(productos, filtros) {
    let filtrados = [...productos];

    // Filtrar por categoría
    if (filtros.categorias && filtros.categorias.length > 0) {
      filtrados = filtrados.filter(p => 
        filtros.categorias.includes(p.categoria)
      );
    }

    // Filtrar por gama
    if (filtros.gamas && filtros.gamas.length > 0) {
      filtrados = filtrados.filter(p => 
        filtros.gamas.includes(p.gama)
      );
    }

    // Filtrar por precio
    if (filtros.rangosPrecio && filtros.rangosPrecio.length > 0) {
      filtrados = filtrados.filter(p => {
        return filtros.rangosPrecio.some(rango => {
          return p.precio >= rango[0] && p.precio <= rango[1];
        });
      });
    }

    return filtrados;
  }

  // Evento para aplicar filtros
  btnFiltrar.addEventListener("click", () => {
    const categorias = Array.from(document.querySelectorAll('.tipo_bicileta input[type="checkbox"]:checked'))
      .map(cb => cb.value);
    
    const gamas = Array.from(document.querySelectorAll('.gama input[type="checkbox"]:checked'))
      .map(cb => {
        const id = cb.id;
        if (id === "gamaAlta") return "Alta";
        if (id === "gamaMedia") return "Media";
        if (id === "gamaBaja") return "Baja";
        return "";
      })
      .filter(gama => gama !== "");

    const rangosPrecio = getRangosPrecio();

    console.log("Filtros aplicados:", { categorias, gamas, rangosPrecio });
    cargarProductos({ categorias, gamas, rangosPrecio });
  });

  // Función para cargar productos
  function cargarProductos(filtros = {}) {
    // Si hay un parámetro de filtro en la URL pero no se pasaron filtros
    const filterParam = getUrlParameter('filter');
    if (filterParam && !Object.values(filtros).some(arr => arr?.length > 0)) {
        filtros = {
            categorias: [filterParam],
            gamas: [],
            rangosPrecio: []
        };
    }

    fetch("http://localhost:3000/productos")
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(productos => {
        let productosFiltrados = productos.filter(p => p.activo && p.stock > 0);
        productosFiltrados = aplicarFiltros(productosFiltrados, filtros);
        renderizarProductos(productosFiltrados);
      })
      .catch(err => {
        console.error("Error:", err);
        contenedor.innerHTML = `
          <div class="error-carga">
            <p>Error al cargar los productos. Intenta recargar la página.</p>
          </div>
        `;
      });
  }

  // Limpiar filtros
 btnLimpiar.addEventListener("click", () => {
    // Limpiar todos los checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Eliminar el parámetro de filtro de la URL sin recargar
    const nuevaURL = window.location.pathname; // Ej: "/bicicletas.html"
    window.history.replaceState({}, '', nuevaURL);
    
    // Restablecer título y cargar productos sin filtros
    if (tituloPagina) tituloPagina.textContent = "Bicicletas";
    cargarProductos({ categorias: [], gamas: [], rangosPrecio: [] }); // Filtros vacíos explícitos
});

  // Función para actualizar contador del carrito
  function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let totalCantidad = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);

    let contador = document.getElementById("cart-count");
    if (!contador) {
      const logoCarrito = document.querySelector(".logo_carrito");
      contador = document.createElement("span");
      contador.id = "cart-count";
      logoCarrito.appendChild(contador);
    }

    contador.textContent = totalCantidad;
  }

  // Evento para agregar al carrito
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
      const tarjeta = e.target.closest(".tarjeta");

      const id = parseInt(e.target.dataset.id);
      const nombre = tarjeta.querySelector(".titulo_producto").textContent;
      const precio = tarjeta.querySelector(".precio_producto").textContent.replace("$", "").replace(/\./g, "").trim();
      const descripcion = tarjeta.querySelector(".descripcion_producto").textContent;
      const imagen = tarjeta.querySelector(".producto-imagen").src;

      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

      const productoExistente = carrito.find((p) => p.id === id);

      if (productoExistente) {
        productoExistente.cantidad++;
      } else {
        carrito.push({
          id,
          nombre,
          precio: parseFloat(precio),
          descripcion,
          imagen,
          cantidad: 1,
        });
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      actualizarContadorCarrito();
      
      // Mostrar notificación
      const toast = document.createElement("div");
      toast.className = "toast-mensaje";
      toast.textContent = `${nombre} agregado al carrito`;
      document.getElementById("toast-container").appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  });

  // Cargar productos iniciales y contador
  cargarProductos();
  actualizarContadorCarrito();
});

