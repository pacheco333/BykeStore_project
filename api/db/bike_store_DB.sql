# Creacion  de la base de datos bike_store
Create database bike_store;
# Utilizamos la tabla
use bike_store;

#Tabla de clientes
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

#Tabla de productos
Create table productos(
    id int primary key auto_increment,
    imagen longblob,
    nombre varchar (255),
    precio varchar (255), 
    descripcion varchar(255)
);

select * from productos;

select * from compras;

#Tabla de compras
CREATE TABLE compras (
  id_compras INT AUTO_INCREMENT PRIMARY KEY,
  id_usuarios INT,
  total_compra DECIMAL(10, 2),
  fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuarios) REFERENCES clientes(id)
);

DROP TABLE compra;

#tabla de detalle compras o detalle ventas
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


#tabla de roles
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (nombre) VALUES 
('usuario'),
('administrador'),
('superadmin');

SELECT * FROM clientes;
SELECT * FROM roles;

ALTER TABLE clientes ADD COLUMN rol_id INT DEFAULT 1;

ALTER TABLE clientes
ADD CONSTRAINT fk_rol_cliente
FOREIGN KEY (rol_id) REFERENCES roles(id);

SELECT * FROM clientes;

SELECT * FROM roles;

DESCRIBE clientes;

ALTER TABLE clientes
CHANGE COLUMN contraseña contrasena VARCHAR(255);






