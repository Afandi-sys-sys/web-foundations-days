PRAGMA foreign_keys = ON;

-- Drop existing tables so the script can be rerun safely.
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;


-- 1. CREATE TABLE STATEMENTS

-- Students table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Courses table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL,
    description TEXT
);

-- Enrolments table
-- Connects students to courses and stores their grades.
CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    UNIQUE (student_id, course_id)
);


-- 2. INSERT SAMPLE DATA

-- Insert at least three students.
INSERT INTO students (id, name, email) VALUES
    (1, 'Alpha Munene', 'alph@example.com'),
    (2, 'Hillary Kungu', 'kungu@example.com'),
    (3, 'Annita Waceke', 'annita@example.com');

-- Insert at least three courses.
INSERT INTO courses (id, course_name, description) VALUES
    (1, 'Database Fundamentals', 'Introduction to databases and SQL'),
    (2, 'Web Development', 'Introduction to HTML, CSS and JavaScript'),
    (3, 'Computer Networks', 'Introduction to computer networking');

-- Insert at least five enrolments.
INSERT INTO enrolments (id, student_id, course_id, grade) VALUES
    (1, 1, 1, 'B'),
    (2, 1, 2, 'A'),
    (3, 2, 1, 'B'),
    (4, 2, 3, 'C'),
    (5, 1, 3, 'A');


-- 3. REQUIRED QUERIES

-- QUERY 1:
-- Find all courses taken by one student, using the student's name.
SELECT
    students.name AS student_name,
    courses.course_name,
    enrolments.grade
FROM students
JOIN enrolments
    ON students.id = enrolments.student_id
JOIN courses
    ON enrolments.course_id = courses.id
WHERE students.name = 'Alpha Munene'
ORDER BY courses.course_name;


-- QUERY 2:
-- Find all students enrolled in one course.
SELECT
    students.name AS student_name,
    students.email,
    courses.course_name
FROM students
JOIN enrolments
    ON students.id = enrolments.student_id
JOIN courses
    ON enrolments.course_id = courses.id
WHERE courses.course_name = 'Database Fundamentals'
ORDER BY students.name;


-- QUERY 3:
-- Count the number of students enrolled in each course.
-- LEFT JOIN also includes courses with zero enrolments.
SELECT
    courses.course_name,
    COUNT(enrolments.student_id) AS number_of_students
FROM courses
LEFT JOIN enrolments
    ON courses.id = enrolments.course_id
GROUP BY courses.id, courses.course_name
ORDER BY courses.course_name;


-- QUERY 4:
-- Find students who have no enrolments.
SELECT
    students.id,
    students.name,
    students.email
FROM students
LEFT JOIN enrolments
    ON students.id = enrolments.student_id
WHERE enrolments.student_id IS NULL
ORDER BY students.name;


-- QUERY 5:
-- Update the grade for one student's enrolment.
UPDATE enrolments
SET grade = 'A'
WHERE student_id = 2
  AND course_id = 1;

-- Display the updated enrolment to verify the change.
SELECT
    students.name AS student_name,
    courses.course_name,
    enrolments.grade
FROM enrolments
JOIN students
    ON enrolments.student_id = students.id
JOIN courses
    ON enrolments.course_id = courses.id
WHERE enrolments.student_id = 2
  AND enrolments.course_id = 1;