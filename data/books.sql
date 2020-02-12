DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    author VARCHAR (255),
    title VARCHAR (255),
    isbn VARCHAR (255),
    image_url VARCHAR (255),
    descriptions VARCHAR (255),
    bookshelf VARCHAR (255)
)

INSERT INTO books (author, title, isbn, image_url, descriptions)
VALUES ('author', 'title', 'isbn', 'image_url', 'descriptions')