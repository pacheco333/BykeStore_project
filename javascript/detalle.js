document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      console.error('ID no especificado');
      return;
    }

    fetch(`http://localhost:3000/api/productos/${id}`)
      .then(res => res.json())
      .then(producto => {
        if (producto.error) {
          document.getElementById('nombreProducto').textContent = 'Producto no encontrado';
          return;
        }

        // Mostrar imagen principal (la misma imagen en todas por ahora)
        const imagenSrc = `data:image/jpeg;base64,${producto.imagen}`;

        document.getElementById('imagenPrincipal').src = imagenSrc;
        document.getElementById('vista1').src = imagenSrc;
        document.getElementById('vista2').src = imagenSrc;
        document.getElementById('vista3').src = imagenSrc;

        // Mostrar info
        document.getElementById('nombreProducto').textContent = producto.nombre;
        document.getElementById('precioProducto').textContent = `$${producto.precio}`;
        document.getElementById('descripcionProducto').textContent = producto.descripcion;
      })
      .catch(err => {
        console.error('Error al obtener el producto:', err);
      });
  });
    