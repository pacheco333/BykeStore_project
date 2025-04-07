document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productoId = params.get('id');
  console.log('ID del producto:', productoId);

  fetch(`http://localhost:3000/api/productos/${productoId}`)
    .then(response => response.json()) // ✅ Primero convertimos la respuesta a JSON
    .then(productoArray => {
      const producto = productoArray[0]; // ✅ Accedemos al primer objeto del array
      console.log("Producto recibido:", producto);

      let imagenBase64 = "";
      if (producto.imagen && producto.imagen.data) {
        const byteArray = new Uint8Array(producto.imagen.data);
        imagenBase64 = btoa(
          byteArray.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
      }
      const imagenSrc = `data:image/png;base64,${imagenBase64}`;

      document.getElementById('imagenPrincipal').src = imagenSrc;
      document.getElementById('vista1').src = imagenSrc;
      document.getElementById('vista2').src = imagenSrc;
      document.getElementById('vista3').src = imagenSrc;

      document.getElementById('nombreProducto').textContent = producto.nombre;
      document.getElementById('precioProducto').textContent = `$${producto.precio}`;
      document.getElementById('descripcionProducto').textContent = producto.descripcion;
    })
    .catch(err => {
      console.error('Error al obtener el producto:', err);
    });
});

  
//     .then(response => response.json())
//     .then(producto => {
//       let imagenBase64 = producto.imagen || "";
//       const imagenSrc = `data:image/png;base64,${imagenBase64}`;

//       document.getElementById('imagenPrincipal').src = imagenSrc;
//       document.getElementById('vista1').src = imagenSrc;
//       document.getElementById('vista2').src = imagenSrc;
//       document.getElementById('vista3').src = imagenSrc;

//       document.getElementById('nombreProducto').textContent = producto.nombre;
//       document.getElementById('precioProducto').textContent = `$${producto.precio}`;
//       document.getElementById('descripcionProducto').textContent = producto.descripcion;
      
//       console.log('Producto recibido:', producto);

//     })
//     .catch(err => {
//       console.error('Error al obtener el producto:', err);
//     });
// });