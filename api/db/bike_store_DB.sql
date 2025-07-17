CREATE DATABASE bike_store;
USE bike_store;

drop database bike_store;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

select * from compras;
select * from detalle_venta;
select * from clientes;
select * from productos;

INSERT INTO roles (nombre) VALUES 
('usuario'),
('administrador'),
('superadmin');


CREATE TABLE clientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255),
    apellido VARCHAR(255),
    correo VARCHAR(255) UNIQUE,
    telefono VARCHAR(15),
    contrasena VARCHAR(255),
    rol_id INT DEFAULT 1,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);


INSERT INTO clientes (nombre, apellido, correo, telefono, contrasena, rol_id)
VALUES 
('admin', 'pacheco', 'admin@gmail.com', '142124141', '123123', 2),
('superadmin', 'user', 'superadmin12@gmail.com', '544445123', '123456', 3);


CREATE TABLE productos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    imagen LONGBLOB,
    nombre VARCHAR(255),
    precio VARCHAR(255),
    stock INT,
    descripcion VARCHAR(255),
    categoria VARCHAR(100),
    gama VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);


CREATE TABLE compras (
    id_compras INT AUTO_INCREMENT PRIMARY KEY,
    id_usuarios INT,
    total_compra DECIMAL(10, 2),
    fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuarios) REFERENCES clientes(id)
);



CREATE TABLE detalle_venta (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_compra INT,
    id_producto INT,
    cantidad INT,
    precio DECIMAL(10, 2),
    FOREIGN KEY (id_compra) REFERENCES compras(id_compras),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);
