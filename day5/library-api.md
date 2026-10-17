# Library Books REST API Design

## Overview

This API manages books in a library. The main resource is `books`.

Base URL: `https://api.example.com`

The API follows REST principles by using plural resource names, HTTP methods to represent actions, and resource IDs to identify individual books.

## 1. List All Books

- **Method:** `GET`
- **Path:** `/books`
- **Description:** Returns a list of all books in the library.
- **Example request body:** None.
- **Success status code:** `200 OK`

## 2. Get One Book

- **Method:** `GET`
- **Path:** `/books/{id}`
- **Description:** Returns the details of a book with the specified ID.
- **Example request body:** None.
- **Success status code:** `200 OK`

Example request:

`GET /books/42`

## 3. Create a Book

- **Method:** `POST`
- **Path:** `/books`
- **Description:** Creates a new book in the library.
- **Example request body:**

json
{
"title": "Things Fall Apart",
"author": "Chinua Achebe",
"publishedYear": 1958
}

- **Success status code:** `201 Created`

## 4. Replace a Book

- **Method:** `PUT`
- **Path:** `/books/{id}`
- **Description:** Replaces the existing details of a book with the supplied data.
- **Example request body:**

json
{
"title": "Things Fall Apart",
"author": "Chinua Achebe",
"publishedYear": 1958
}

- **Success status code:** `200 OK`

## 5. Partially Update a Book

- **Method:** `PATCH`
- **Path:** `/books/{id}`
- **Description:** Updates selected fields of an existing book without replacing all its details.
- **Example request body:**

json
{
"title": "Updated Book Title"
}

- **Success status code:** `200 OK`

## 6. Delete a Book

- **Method:** `DELETE`
- **Path:** `/books/{id}`
- **Description:** Deletes the book with the specified ID.
- **Example request body:** None.
- **Success status code:** `204 No Content`

Example request:

`DELETE /books/42`

## 7. List Books by Author

- **Method:** `GET`
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Returns books written by the specified author using the `author` query parameter.
- **Example request body:** None.
- **Success status code:** `200 OK`

Example request:

`GET /books?author=Chinua%20Achebe`

## Error Status Codes

### 400 Bad Request

The request contains invalid data or does not meet the API's validation rules.

**Example:** A client attempts to create a book without a required title or sends an invalid publication year.

### 404 Not Found

The requested resource does not exist.

**Example:** A client requests `GET /books/9999`, but no book with ID `9999` exists.

## REST Design Principles Used

- Use plural nouns such as `/books` to represent collections of resources.
- Use HTTP methods to indicate actions: `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.
- Use resource IDs in paths to identify individual books.
- Use query parameters to filter collections, such as `/books?author=Chinua%20Achebe`.
- Return appropriate HTTP status codes to communicate the result of each request.
