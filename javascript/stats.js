// Variable global para almacenar los datos de ventas actuales
let ventasActuales = [];

// Función para obtener los datos del usuario logueado
function obtenerUsuarioLogueado() {
  const usuario = localStorage.getItem("usuario");
  if (usuario) {
    try {
      return JSON.parse(usuario);
    } catch (error) {
      console.error("Error al parsear datos del usuario:", error);
      return null;
    }
  }
  return null;
}

function formatearMoneda(numero) {
  return '$' + Number(numero).toLocaleString('es-CO');
}

// Función para formatear fechas
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Cargar todas las ventas
async function cargarTodasLasVentas() {
  const loading = document.getElementById('loading-ventas');
  const tbody = document.getElementById('tbody-ventas');
  
  loading.style.display = 'block';
  tbody.innerHTML = '';

  try {
    const response = await fetch('http://localhost:3000/compras');
    const ventas = await response.json();
    
    ventasActuales = ventas; // Guardar datos para PDF
    mostrarVentas(ventas);
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error al cargar los datos</td></tr>';
  } finally {
    loading.style.display = 'none';
  }
}

// Filtrar ventas por fecha
async function filtrarVentas() {
  const desde = document.getElementById('desde1').value;
  const hasta = document.getElementById('hasta1').value;
  const loading = document.getElementById('loading-ventas');
  const tbody = document.getElementById('tbody-ventas');
  
  loading.style.display = 'block';
  tbody.innerHTML = '';

  try {
    let url = 'http://localhost:3000/compras/rango?';
    const params = new URLSearchParams();
    
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    
    const response = await fetch(url + params.toString());
    const ventas = await response.json();
    
    ventasActuales = ventas; // Guardar datos para PDF
    mostrarVentas(ventas);
  } catch (error) {
    console.error('Error al filtrar ventas:', error);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error al cargar los datos</td></tr>';
  } finally {
    loading.style.display = 'none';
  }
}

// Mostrar ventas en la tabla
function mostrarVentas(ventas) {
  const tbody = document.getElementById('tbody-ventas');
  const totalVentasEl = document.getElementById('total-ventas');
  
  if (ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay ventas para mostrar</td></tr>';
    totalVentasEl.textContent = 'Total de ventas: $0';
    return;
  }

  // Agrupar ventas por compra
  const ventasAgrupadas = {};
  ventas.forEach(venta => {
    if (!ventasAgrupadas[venta.id_compras]) {
      ventasAgrupadas[venta.id_compras] = {
        id_compras: venta.id_compras,
        fecha_compra: venta.fecha_compra,
        total_compra: venta.total_compra,
        id_usuarios: venta.id_usuarios,
        cliente_nombre: venta.cliente_nombre,
        cliente_apellido: venta.cliente_apellido,
        productos: []
      };
    }
    
    if (venta.id_producto) {
      ventasAgrupadas[venta.id_compras].productos.push({
        id_producto: venta.id_producto,
        producto_nombre: venta.producto_nombre,
        cantidad: venta.cantidad,
        precio: venta.precio
      });
    }
  });

  let totalGeneral = 0;
  tbody.innerHTML = '';

  Object.values(ventasAgrupadas).forEach(venta => {
    totalGeneral += parseFloat(venta.total_compra);
    
    // Crear nombre completo del cliente
    const nombreCompleto = venta.cliente_nombre && venta.cliente_apellido 
      ? `${venta.cliente_nombre} ${venta.cliente_apellido}`
      : venta.cliente_nombre 
        ? venta.cliente_nombre
        : `Cliente ${venta.id_usuarios}`;
    
    if (venta.productos.length === 0) {
      // Venta sin productos (caso edge)
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${venta.id_compras}</td>
        <td>${formatearFecha(venta.fecha_compra)}</td>
        <td>${nombreCompleto}</td>
        <td>Sin productos</td>
        <td>0</td>
        <td>$0</td>
        <td>${formatearMoneda(venta.total_compra)}</td>
      `;
      tbody.appendChild(fila);
    } else {
      // Mostrar cada producto de la venta
      venta.productos.forEach((producto, index) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${index === 0 ? venta.id_compras : ''}</td>
          <td>${index === 0 ? formatearFecha(venta.fecha_compra) : ''}</td>
          <td>${index === 0 ? nombreCompleto : ''}</td>
          <td>${producto.producto_nombre}</td>
          <td>${producto.cantidad}</td>
          <td>${formatearMoneda(producto.precio)}</td>
          <td>${index === 0 ? formatearMoneda(venta.total_compra) : ''}</td>
        `;
        tbody.appendChild(fila);
      });
    }
  });

  totalVentasEl.textContent = `Total de ventas: ${formatearMoneda(totalGeneral)}`;
}

// Cargar todos los productos más vendidos
async function cargarTodosLosProductos() {
  const loading = document.getElementById('loading-productos');
  const tbody = document.getElementById('tbody-productos');
  
  loading.style.display = 'block';
  tbody.innerHTML = '';

  try {
    const response = await fetch('http://localhost:3000/compras/productos-mas-vendidos');
    const productos = await response.json();
    
    mostrarProductos(productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar los datos</td></tr>';
  } finally {
    loading.style.display = 'none';
  }
}

// Filtrar productos más vendidos por fecha
async function filtrarProductos() {
  const desde = document.getElementById('desde2').value;
  const hasta = document.getElementById('hasta2').value;
  const loading = document.getElementById('loading-productos');
  const tbody = document.getElementById('tbody-productos');
  
  loading.style.display = 'block';
  tbody.innerHTML = '';

  try {
    let url = 'http://localhost:3000/compras/productos-mas-vendidos?';
    const params = new URLSearchParams();
    
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    
    const response = await fetch(url + params.toString());
    const productos = await response.json();
    
    mostrarProductos(productos);
  } catch (error) {
    console.error('Error al filtrar productos:', error);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar los datos</td></tr>';
  } finally {
    loading.style.display = 'none';
  }
}

// Mostrar productos en la tabla
function mostrarProductos(productos) {
  const tbody = document.getElementById('tbody-productos');
  
  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay productos para mostrar</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  productos.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td>${producto.descripcion || 'Sin descripción'}</td>
      <td>${producto.unidades_vendidas}</td>
      <td>${formatearMoneda(producto.total_ventas)}</td>
    `;
    tbody.appendChild(fila);
  });
}

// Función para exportar PDF
function exportarPDF() {
  if (ventasActuales.length === 0) {
    alert('No hay datos de ventas para exportar');
    return;
  }

  // Obtener datos del usuario logueado
  const usuario = obtenerUsuarioLogueado();
  let nombreEmisor = 'Administrador'; // Valor por defecto
  
  if (usuario) {
    // Verificar si el usuario tiene nombre y apellido
    if (usuario.nombre && usuario.apellido) {
      nombreEmisor = `${usuario.nombre} ${usuario.apellido}`;
    } else if (usuario.nombre) {
      nombreEmisor = usuario.nombre;
    } else if (usuario.correo) {
      nombreEmisor = usuario.correo;
    }
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Estilos base
  const marginX = 20;

  const logoImg = document.getElementById('logo');
  doc.addImage(logoImg, 'PNG', 20, 10, 30, 30);

  // Título del documento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('REPORTE DE VENTAS', 105, 25, { align: 'center' });

  // Línea horizontal
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(marginX, 30, 190, 30);

  // Información del emisor
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const fechaEmision = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.text(`Fecha de emisión: ${fechaEmision}`, marginX, 40);
  doc.text(`Usuario emisor: ${nombreEmisor}`, marginX, 48);

  // Agrupar ventas
  const ventasAgrupadas = {};
  ventasActuales.forEach(venta => {
    if (!ventasAgrupadas[venta.id_compras]) {
      ventasAgrupadas[venta.id_compras] = {
        id_compras: venta.id_compras,
        fecha_compra: venta.fecha_compra,
        total_compra: venta.total_compra,
        id_usuarios: venta.id_usuarios,
        cliente_nombre: venta.cliente_nombre,
        cliente_apellido: venta.cliente_apellido,
        productos: []
      };
    }

    if (venta.id_producto) {
      ventasAgrupadas[venta.id_compras].productos.push({
        id_producto: venta.id_producto,
        producto_nombre: venta.producto_nombre,
        cantidad: venta.cantidad,
        precio: venta.precio
      });
    }
  });

  // Preparar datos para la tabla
  const tableData = [];
  let totalGeneral = 0;

  Object.values(ventasAgrupadas).forEach(venta => {
    totalGeneral += parseFloat(venta.total_compra);
    
    const nombreCompleto = venta.cliente_nombre && venta.cliente_apellido 
      ? `${venta.cliente_nombre} ${venta.cliente_apellido}`
      : venta.cliente_nombre 
        ? venta.cliente_nombre
        : `Cliente ${venta.id_usuarios}`;

    const fechaFormateada = new Date(venta.fecha_compra).toLocaleDateString('es-CO');

    if (venta.productos.length === 0) {
      tableData.push([
        venta.id_compras,
        fechaFormateada,
        nombreCompleto,
        'Sin productos',
        '0',
        '$0',
        formatearMoneda(venta.total_compra)
      ]);
    } else {
      venta.productos.forEach((producto, index) => {
        tableData.push([
          index === 0 ? venta.id_compras : '',
          index === 0 ? fechaFormateada : '',
          index === 0 ? nombreCompleto : '',
          producto.producto_nombre,
          producto.cantidad,
          formatearMoneda(producto.precio),
          index === 0 ? formatearMoneda(venta.total_compra) : ''
        ]);
      });
    }
  });

  // Crear tabla con estilo elegante
  doc.autoTable({
    head: [['ID Venta', 'Fecha', 'Cliente', 'Producto', 'Unidades', 'Precio Unit.', 'Total con Envío']],
    body: tableData,
    startY: 60,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      valign: 'middle'
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [230, 240, 255]  // Azul suave
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 25, halign: 'right' }
    }
  });

  // Agregar total general
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL GENERAL: ${formatearMoneda(totalGeneral)}`, marginX, finalY);

  // Pie de página con número de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
  }

  // Descargar el PDF
  const fileName = `reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Configurar event listeners cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  // Asignar eventos a los botones
  document.getElementById('filtrar-ventas').addEventListener('click', filtrarVentas);
  document.getElementById('ver-todas-ventas').addEventListener('click', cargarTodasLasVentas);
  document.getElementById('filtrar-productos').addEventListener('click', filtrarProductos);
  document.getElementById('ver-todos-productos').addEventListener('click', cargarTodosLosProductos);
  document.getElementById('exportar-pdf').addEventListener('click', exportarPDF);

  // Cargar datos iniciales
  cargarTodasLasVentas();
  cargarTodosLosProductos();
});