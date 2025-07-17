document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("product-form");
  const productContainer = document.getElementById("product-container");
  
  // Agregar botón para mostrar/ocultar productos inactivos
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "Mostrar productos inactivos";
  toggleButton.style.cssText = `
    margin: 10px;
    padding: 10px 20px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;
  
  let mostrarInactivos = false;
  toggleButton.addEventListener("click", () => {
    mostrarInactivos = !mostrarInactivos;
    toggleButton.textContent = mostrarInactivos ? "Ocultar productos inactivos" : "Mostrar productos inactivos";
    toggleButton.style.background = mostrarInactivos ? "#dc3545" : "#6c757d";
    cargarProductos();
  });
  
  productContainer.parentNode.insertBefore(toggleButton, productContainer);

  // ✅ Función para cargar productos (actualizada para mostrar gama y categoría)
  function cargarProductos() {
    productContainer.innerHTML = "";
    const url = mostrarInactivos 
      ? "http://localhost:3000/productos?incluir_inactivos=true"
      : "http://localhost:3000/productos";

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        data.forEach((product) => {
          const imageSrc = product.imagen
            ? `data:image/jpeg;base64,${product.imagen}`
            : "imagen_por_defecto.jpg";
          addProduct(
            product.id, 
            product.nombre, 
            product.precio, 
            imageSrc, 
            product.stock, 
            product.activo,
            product.gama,
            product.categoria
          );
        });
      })
      .catch((error) => console.error("Error cargando productos:", error));
  }

  // Cargar productos inicialmente
  cargarProductos();

  // ✅ Agregar producto con imagen (actualizado con gama y categoría)
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("product-name").value;
    const price = document.getElementById("product-price").value;
    const description = document.getElementById("product-desc").value;
    const stock = document.getElementById("product-stock").value;
    const gama = document.getElementById("product-gama").value;
    const categoria = document.getElementById("product-category").value;
    const imageInput = document.getElementById("product-image").files[0];

    // Validación mejorada
    if (!/^\d+(\.\d{1,2})?$/.test(price)) {
      alert("El precio debe ser un número válido (100.00)");
      return;
    }
    if (!gama || !categoria) {
      alert("Debes seleccionar una gama y una categoría");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", name);
    formData.append("precio", price);
    formData.append("descripcion", description);
    formData.append("stock", stock);
    formData.append("gama", gama);
    formData.append("categoria", categoria);
    if (imageInput) formData.append("imagen", imageInput);

    try {
      let response = await fetch("http://localhost:3000/productos", {
        method: "POST",
        body: formData,
      });

      let data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear producto");
      }

      // Mostrar la imagen en Base64 después de agregar el producto
      const imageBase64 = imageInput ? await fileToBase64(imageInput) : null;
      addProduct(
        data.id, 
        name, 
        price, 
        imageBase64 || "imagen_por_defecto.jpg", 
        stock, 
        true,
        gama,
        categoria
      );

      productForm.reset();
      alert("Producto creado exitosamente!");
    } catch (error) {
      console.error("Error agregando producto:", error);
      alert(`Error al agregar producto: ${error.message}`);
    }
  });

  // ✅ Función addProduct actualizada con gama y categoría
  function addProduct(id, name, price, image, stock = 0, activo = true, gama = "Sin gama", categoria = "Sin categoría") {
    const card = document.createElement("div");
    card.classList.add("product-card");
    
    // Estilo diferente para productos inactivos
    const borderColor = activo ? "#ddd" : "#dc3545";
    const backgroundColor = activo ? "#ffffff" : "#f8f9fa";
    const opacity = activo ? "1" : "0.7";
    
    card.style.cssText = `
      border: 2px solid ${borderColor};
      border-radius: 8px;
      padding: 15px;
      margin: 10px;
      display: inline-block;
      width: 280px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      background: ${backgroundColor};
      opacity: ${opacity};
      position: relative;
    `;

    const estadoBadge = activo 
      ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; position: absolute; top: 10px; right: 10px;">ACTIVO</span>'
      : '<span style="background: #dc3545; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; position: absolute; top: 10px; right: 10px;">INACTIVO</span>';

    card.innerHTML = `
      ${estadoBadge}
      <img src="${image}" alt="${name}" class="producto-imagen" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px;">
      <h3 class="product-name" style="margin: 10px 0; color: #333;">${name}</h3>
      <p class="product-price" style="font-size: 18px; font-weight: bold; color: #2c5aa0;">$<span class="price-value">${price}</span></p>
      <p class="product-stock" style="margin: 5px 0;">Stock: <span class="stock-value">${stock}</span></p>
      <p class="product-gama" style="margin: 5px 0; font-style: italic;">Gama: <strong>${gama}</strong></p>
      <p class="product-category" style="margin: 5px 0;">Categoría: <span style="color: #2c5aa0;">${categoria}</span></p>
      
      <!-- Sección para reducir stock -->
      <div style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; ${!activo ? 'opacity: 0.5;' : ''}">
        <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #dc3545;">Reducir Stock:</h4>
        <input type="number" class="reduce-stock-input" min="1" placeholder="Cantidad" style="width: 60px; margin-right: 10px; padding: 4px;" ${!activo ? 'disabled' : ''}>
        <button class="reduce-stock-button" data-id="${id}" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" ${!activo ? 'disabled' : ''}>Reducir</button>
      </div>
      
      <!-- Sección para aumentar stock -->
      <div style="margin: 10px 0; padding: 10px; background: #d4edda; border-radius: 4px;">
        <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #155724;">Aumentar Stock:</h4>
        <input type="number" class="increase-stock-input" min="1" placeholder="Cantidad" style="width: 60px; margin-right: 10px; padding: 4px;">
        <button class="increase-stock-button" data-id="${id}" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Aumentar</button>
      </div>
      
      <!-- Sección para actualizar precio -->
      <div style="margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 4px; ${!activo ? 'opacity: 0.5;' : ''}">
        <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #856404;">Actualizar Precio:</h4>
        <input type="number" class="update-price-input" min="0.01" step="0.01" placeholder="Nuevo precio" style="width: 80px; margin-right: 10px; padding: 4px;" ${!activo ? 'disabled' : ''}>
        <button class="update-price-button" data-id="${id}" style="background: #ffc107; color: #212529; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" ${!activo ? 'disabled' : ''}>Actualizar</button>
      </div>
      
      <!-- Botón para desactivar producto (solo para productos activos) -->
      ${activo ? `
      <div style="margin: 10px 0; padding: 10px; background: #f8d7da; border-radius: 4px;">
        <button class="deactivate-button" data-id="${id}" style="background: #721c24; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; width: 100%;">
          Desactivar producto
        </button>
      </div>
      ` : ''}
    `;

    // Eventos para los botones (mantenidos igual)
    card.querySelector(".reduce-stock-button").addEventListener("click", () => {
      if (!activo) {
        alert("No se puede reducir stock de un producto inactivo");
        return;
      }

      const input = card.querySelector(".reduce-stock-input");
      const cantidad = parseInt(input.value);

      if (isNaN(cantidad) || cantidad <= 0) {
        alert("Cantidad inválida");
        return;
      }

      fetch(`http://localhost:3000/productos/stock/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message);
          input.value = "";
          
          // Si el producto se volvió inactivo, recargar la vista
          if (!data.activo) {
            cargarProductos();
          } else {
            // Solo actualizar el stock
            const stockValue = card.querySelector(".stock-value");
            stockValue.textContent = data.stock;
          }
        })
        .catch((err) => {
          console.error("Error reduciendo stock:", err);
          alert("Error reduciendo stock");
        });
    });

    card.querySelector(".increase-stock-button").addEventListener("click", () => {
      const input = card.querySelector(".increase-stock-input");
      const cantidad = parseInt(input.value);

      if (isNaN(cantidad) || cantidad <= 0) {
        alert("Cantidad inválida");
        return;
      }

      fetch(`http://localhost:3000/productos/stock/increase/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message);
          input.value = "";
          
          // Si el producto se reactivó, recargar la vista
          if (data.activo && !activo) {
            cargarProductos();
          } else {
            // Solo actualizar el stock
            const stockValue = card.querySelector(".stock-value");
            stockValue.textContent = data.stock;
          }
        })
        .catch((err) => {
          console.error("Error aumentando stock:", err);
          alert("Error aumentando stock");
        });
    });

    card.querySelector(".update-price-button").addEventListener("click", () => {
       if (!activo) {
        alert("No se puede actualizar precio de un producto inactivo");
        return;
      }

      const input = card.querySelector(".update-price-input");
      const nuevoPrecio = parseFloat(input.value);

      if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
        alert("Precio inválido");
        return;
      }

      if (!/^\d+(\.\d{1,2})?$/.test(input.value)) {
        alert("El precio debe tener máximo 2 decimales");
        return;
      }

      fetch(`http://localhost:3000/productos/precio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ precio: nuevoPrecio }),
      })
        .then((res) => res.json())
        .then((data) => {
          const priceValue = card.querySelector(".price-value");
          priceValue.textContent = nuevoPrecio.toFixed(2);
          input.value = "";
          alert("Precio actualizado con éxito");
        })
        .catch((err) => {
          console.error("Error actualizando precio:", err);
          alert("Error actualizando precio");
        });
    });

    const deactivateButton = card.querySelector(".deactivate-button");
    if (deactivateButton) {
      deactivateButton.addEventListener("click", () => {
        if (confirm("¿Estás seguro de que quieres desactivar este producto?")) {
          deactivateProduct(id);
        }
      });
    }

    productContainer.appendChild(card);
  }

  async function deactivateProduct(id) {
    try {
      let response = await fetch(`http://localhost:3000/productos/deactivate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      let data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        cargarProductos();
      } else {
        alert("Error desactivando producto: " + data.message);
      }
    } catch (error) {
      console.error("Error desactivando producto:", error);
      alert("Error desactivando producto");
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
});