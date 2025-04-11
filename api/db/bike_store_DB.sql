Create database bike_store;
use bike_store;
Create table clientes(
	id int primary key auto_increment,
    nombre varchar (255),
    apellido varchar (255),
    correo varchar (255) UNIQUE,
    telefono varchar (15),
    contrasena varchar (255)

);

alter table clientes
change column contraseña contrasena varchar(255);


select * from clientes;
Create table productos(
    id int primary key auto_increment,
    imagen longblob,
    nombre varchar (255),
    precio varchar (255), 
    descripcion varchar(255)
);

select * from productos;

select * from compras;
CREATE TABLE compras (
  id_compras INT AUTO_INCREMENT PRIMARY KEY,
  id_usuarios INT,
  total_compra DECIMAL(10, 2),
  fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuarios) REFERENCES clientes(id)
);

DROP TABLE compra;


CREATE TABLE detalle_venta (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT,
  id_producto INT,
  cantidad INT,
  precio DECIMAL(10, 2),
  FOREIGN KEY (id_compra) REFERENCES compras(id_compras),
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);

select * from detalle_venta;