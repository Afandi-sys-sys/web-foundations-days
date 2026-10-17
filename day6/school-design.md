# School Database Design

## 1. Tables and Their Purposes

### Students

The `students` table stores information about students. It contains an `id` column as the primary key, a `name` column and an `email` column. The ID uniquely identifies each student, while the email must be unique so that two students cannot register with the same email address. The name and email are required fields.

### Courses

The `courses` table stores information about the courses offered by the school. It contains an `id` primary key, a required `course_name` column and an optional `description` column. Each course has a unique ID that other tables can reference.

### Enrolments

The `enrolments` table records which students take which courses. It contains its own primary key, `student_id` and `course_id` foreign keys, and a `grade` column. The foreign keys connect each enrolment to an existing student and course. The grade records the student's result for that course. A UNIQUE constraint on `(student_id, course_id)` prevents the same student from enrolling in the same course more than once.

## 2. Relationships Between the Tables

There is a one-to-many relationship between students and enrolments because one student can have several enrolment records, but each enrolment belongs to one student. There is also a one-to-many relationship between courses and enrolments because one course can have several enrolment records, but each enrolment belongs to one course.

Students and courses have a many-to-many relationship. One student can take several courses, and one course can have several students. A relational database represents this relationship using the `enrolments` join table. Each enrolment connects one student to one course and stores the grade for that particular combination. This avoids repeating student and course information unnecessarily and allows the database to enforce the relationship using foreign keys.

## 3. Index

I would add an index on `enrolments.course_id`:

sql
CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);

This index can make it faster to find all students enrolled in a particular course because the database can locate matching enrolment records more efficiently. It can also help when counting students per course. An index requires additional storage and can make inserts and updates slightly slower, so indexes should be added where they are useful.

## 4. SQL or NoSQL?

I would choose a relational SQL database for this school system. Students, courses and enrolments have clear relationships, and the system needs to maintain data integrity. SQL supports primary keys, foreign keys, unique constraints and joins, which help ensure that enrolments refer to valid students and courses and prevent duplicate enrolments. SQL also makes it straightforward to retrieve courses for a student, list students on a course and calculate enrolment totals. A NoSQL database could also represent this information, but SQL is a suitable choice because the data is structured and the relationships are important.
