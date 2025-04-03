document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");
    const productContainer = document.getElementById("product-container");

    // ✅ Cargar productos desde la API
    fetch("http://localhost:3000/productos")
    .then(response => response.json())
    .then(data => {
        data.forEach(product => {
            const imageSrc = product.imagen 
                ? `data:image/jpeg;base64,${product.imagen}`
                : "imagen_por_defecto.jpg"; // Imagen por defecto si no hay
            addProduct(product.id, product.nombre, product.precio, imageSrc);
        });
    })
    .catch(error => console.error("Error cargando productos:", error));

    // ✅ Agregar producto con imagen
    productForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("product-name").value;
        const price = document.getElementById("product-price").value;
        const imageInput = document.getElementById("product-image").files[0];

        const formData = new FormData();
        formData.append("nombre", name);
        formData.append("precio", price);
        formData.append("imagen", imageInput);

        try {
            let response = await fetch("http://localhost:3000/productos", {
                method: "POST",
                body: formData
            });

            let data = await response.json();
            
            // ✅ Mostrar la imagen en Base64 después de agregar el producto
            const imageBase64 = await fileToBase64(imageInput);
            addProduct(data.id, name, price, imageBase64);
            
            productForm.reset();
        } catch (error) {
            console.error("Error agregando producto:", error);
        }
    });

    
    function addProduct(id, name, price, image) {
        const card = document.createElement("div");
        card.classList.add("product-card");
    
        card.innerHTML = `
            <img src="${image}" alt="${name}" class="producto-imagen">
            <h3 class="product-name">${name}</h3>
            <p class="product-price">$${price}</p>
            <button class="delete-product" data-id="${id}">Eliminar</button>
        `;
    
        card.querySelector(".delete-product").addEventListener("click", () => {
            deleteProduct(id, card);
        });
    
        productContainer.appendChild(card);
    }

    async function deleteProduct(id, card) {
        try {
            let response = await fetch(`http://localhost:3000/productos/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                card.remove();
                alert("Producto eliminado con éxito");
            }
        } catch (error) {
            console.error("Error eliminando producto:", error);
        }
    }

    // ✅ Convierte un archivo a Base64 para mostrarlo después de subirlo
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
});


// document.addEventListener("DOMContentLoaded", () => {
//     const productForm = document.getElementById("product-form");
//     const productContainer = document.getElementById("product-container");

//     // Cargar productos desde la API
//     fetch("http://localhost:3000/productos")
//         .then(response => response.json())
//         .then(data => {
//             data.forEach(product => {
//                 addProduct(product.id, product.nombre, product.precio, "data:image/png;base64," + arrayBufferToBase64(product.imagen));
//             });
//         })
//         .catch(error => console.error("Error cargando productos:", error));

//     productForm.addEventListener("submit", (event) => {
//         event.preventDefault();

//         const name = document.getElementById("product-name").value;
//         const price = document.getElementById("product-price").value;
//         const imageInput = document.getElementById("product-image").files[0];

//         const formData = new FormData();
//         formData.append("nombre", name);
//         formData.append("precio", price);
//         formData.append("imagen", imageInput);

//         fetch("http://localhost:3000/productos", {
//             method: "POST",
//             body: formData
//         })
//         .then(response => response.json())
//         .then(data => {
//             addProduct(data.id, name, price, URL.createObjectURL(imageInput));
//             productForm.reset();
//         })
//         .catch(error => console.error("Error agregando producto:", error));
//     });

//     function addProduct(id, name, price, image) {
//         const card = document.createElement("div");
//         card.classList.add("product-card");

//         card.innerHTML = `
//             <img src="${image}" alt="${name}" class="product-image">
//             <h3 class="product-name">${name}</h3>
//             <p class="product-price">$${price}</p>
//             <button class="delete-product" data-id="${id}">Eliminar</button>
//         `;

//         card.querySelector(".delete-product").addEventListener("click", () => {
//             deleteProduct(id, card);
//         });

//         productContainer.appendChild(card);
//     }

//     function deleteProduct(id, card) {
//         fetch(`http://localhost:3000/productos/${id}`, {
//             method: "DELETE"
//         })
//         .then(response => response.json())
//         .then(() => {
//             card.remove();
//             alert("Producto eliminado con éxito");
//         })
//         .catch(error => console.error("Error eliminando producto:", error));
//     }

//     function arrayBufferToBase64(buffer) {
//         let binary = "";
//         let bytes = new Uint8Array(buffer);
//         bytes.forEach(byte => binary += String.fromCharCode(byte));
//         return btoa(binary);
//     }
// });