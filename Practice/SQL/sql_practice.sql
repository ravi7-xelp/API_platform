CREATE DATABASE college; -- create  database: 
USE college; -- Switch to college database.: 

CREATE DATABASE college;  -- Throw an error if the database name already exists; create it if it doesn't.
CREATE DATABASE IF NOT EXISTS college; -- Issue a warning if the database name exists; create it if it doesn't.

DROP DATABASE company ; -- Delete the database if it exists; otherwise, throw an error.
DROP DATABASE IF EXISTS company; -- Delete the database if it exists, otherwise, issue a warning.

SHOW DATABASES; -- Show all database names.
SHOW TABLES; -- List all table names in the current database.

-- create table: -- --
CREATE TABLE student (
	id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT NOT NULL
); 

INSERT INTO student VALUES(1,"AMAN", 26);
INSERT INTO student VALUES(2,"ADI", 26);

SELECT * FROM student;

CREATE TABLE not_null(
 id INT NOT NULL,
 name VARCHAR(50)
);
DROP TABLE not_null;
INSERT INTO not_null (id, name) VALUES (1,"NAMEERA");
SELECT * FROM not_null;

CREATE TABLE id_unique(
id INT UNIQUE
);

INSERT INTO id_unique VALUES(101);
INSERT INTO id_unique VALUES(101);-- THIS LINE THROWS ERROR SINCE ID HAS UNIQUE AS CONSTRATE

CREATE TABLE primary_key1(
	id INT PRIMARY KEY,
    name VARCHAR(50)
);

INSERT INTO primary_key1 VALUES(1, "NAMEERA");

-- INSERT INTO primary_key1 VALUES(1, "NAMEERA");--THROWS ERROR ON EXECUTION

CREATE TABLE primary_key2(
	id INT,
    name VARCHAR(50),
    PRIMARY KEY(id)
);

INSERT INTO primary_key2 (id,name) VALUES (1,"ADAM");

-- INSERT INTO primary_key2 (id,name) VALUES (1,"ADAM"); THROWS ERROR ON EXECUTION

-- COMBINATION OF COLUMNS AS PKs.

CREATE TABLE pk_col_combination(
	id INT,
    name VARCHAR(50),
    age INT,
    city VARCHAR(50),
    PRIMARY KEY (id,name)
); 

INSERT INTO pk_col_combination 
(id, name, age) 
VALUES
(1,"Adam", 23),
(2,"Bob", 22),
(3,"Casey",19),
(3,"Drosy",19),
(4,"Stew",19),
(5,"Stew",19);
SELECT * FROM pk_col_combination;

-- ID AND NAME CAN BE DUBLICATE AS THE INDIVIDUALE BUT THERE COMBINATION SHOULD BE UNIQUE

 DROP TABLE user_check;
CREATE TABLE user_check(
	id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    CONSTRAINT age_check CHECK (age > 18)
);

INSERT INTO user_check VALUES (1, "ADAM", 19);
INSERT INTO user_check VALUES (2, "SMITH",16); -- WILL THROW ERRO SINCE THE AGE OF THE PERSON IS LESS THAN 18 



