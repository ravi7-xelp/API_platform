CREATE DATABASE xyz_company;
USE  xyz_company;
SHOW DATABASES;

CREATE TABLE IF NOT EXISTS employee(
	id INT PRIMARY KEY,
    name VARCHAR(50),
    salary INT
);


SHOW TABLES;

INSERT INTO employee 
(id,name,salary)
VALUES
(1,"Adam", 25000),
(2,"Bob", 30000),
(3,"Casey",40000);

SELECT * FROM employee;

