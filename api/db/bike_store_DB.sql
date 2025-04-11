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
