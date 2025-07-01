USE college;
-- DROP TABLE IF EXISTS student;
CREATE TABLE IF NOT EXISTS student(
 rollno INT PRIMARY KEY,
 name VARCHAR(50)
);

SHOW TABLES;
SELECT * FROM student;

INSERT INTO student
(rollno,name)
VALUES
(101, "Karan"),
(102,"Arjun");

INSERT INTO student VALUES (103, "Naresh");

--  ------------------------------------------------------------------------------------------------

CREATE DATABASE college1;
USE college1;

CREATE TABLE student(
	rollno INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT NOT NULL,
    grade VARCHAR(1),
    city VARCHAR(20)
);

INSERT INTO student
( rollno, name, marks, grade, city)
VALUES
(101, "anil", 78, "C", "Pune"),
(102, "bhumika", 93, "A", "Mumbai"),
(103, "chetan", 85, "B", "Mumbai"),
(104, "dhruv", 96, "A", "Delhi"),
(105, "emanuel", 12, "F", "Delhi"),
(106, "farah", 82, "B", "Delhi");

INSERT INTO student
( rollno, name, marks, grade, city)
VALUES
(107, "adil", 80, "B", "Delhi"),
(108, "azeem", 90, "A", "Mumbai");
SELECT * FROM student;

SELECT name, marks FROM student;

SELECT DISTINCT city FROM student; -- WILL DISPLAY UNIQUE DATA FROM THE "student" TABLE.
 
SELECT * FROM student WHERE marks > 80; --  DISPLAY ALL THE STUDENTS WHOSE MARKS ARE >80 (marks>80)

SELECT * FROM student WHERE city = "Mumbai"; -- DISPLAY STUDENTS BELONG TO CITY "Mumbai"

SELECT * FROM student WHERE marks > 80 AND city = "Mumbai"; -- DISPLAY STUDENTS WHOSE MARKS > 80 AND BELONG TO CITY MUMBAI.

SELECT * FROM student WHERE marks > 90 AND city = "Mumbai"; --  AND operator ( BOTH CONDITIONS = TRUE)

SELECT * FROM student WHERE marks > 90 OR city = "Mumbai"; -- OR operator (ANY ONE CONDITION = TRUE)

SELECT * FROM student WHERE marks +10 > 100;

SELECT * FROM student WHERE marks BETWEEN 80 AND 90;

SELECT * FROM student WHERE city IN ("Mumbai", "Delhi"); -- DISPLAY ALL THE STUDENT BELONG TO "Mumbai" & "Delhi"

SELECT * FROM student WHERE city IN ("Mumbai", "Delhi", "Hyderabad"); -- EVEN THOUGH Hyderabad NOT IN DB THIS QUERY WON'T THORW ANY ERROR.

SELECT * FROM student WHERE city IN ("Hyderabad"); -- SINCE THERE ARE NO STUDENT BELONG TO Hyderabad CITY IT WILL DISPLAY EMPTY TABLE

SELECT * FROM student WHERE city NOT IN ("Mumbai", "Delhi"); -- WILL DISPLAY ALL THE STUDENT WHO DOESN'T BELLON TO "Mumbai" AND "Delhi"

