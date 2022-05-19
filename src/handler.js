const { nanoid } = require('nanoid');
const books = require('./books');

const createBook = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  let finished;
  if (pageCount === readPage) {
    finished = true;
  } else {
    finished = false;
  }
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  let response;
  if (name === '' || name === undefined || name === null) {
    response = h
      .response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      })
      .code(400);
  } else if (readPage > pageCount) {
    response = h
      .response({
        status: 'fail',
        message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  } else if (isSuccess) {
    response = h
      .response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      })
      .code(201);
  } else {
    response = h
      .response({
        status: 'error',
        message: 'Buku gagal ditambahkan',
      })
      .code(500);
  }

  return response;
};

const getAllBooks = () => {
  const data = books.map(({ id, name, publisher }) => ({ id, name, publisher }));

  return data;
};

const getBooksByReading = (value) => {
  let result = null;

  if (value === '1') {
    result = books
      .filter((book) => book.reading === true)
      .map(({ name, publisher }) => ({ name, publisher }));
  } else if (value === '0') {
    result = books
      .filter((book) => book.reading === false)
      .map(({ name, publisher }) => ({ name, publisher }));
  } else {
    result = books.map(({ name, publisher }) => ({ name, publisher }));
  }

  return result;
};

const getBooksByFinished = (value) => {
  let result = null;

  if (value === '1') {
    result = books
      .filter((book) => book.finished === true)
      .map(({ name, publisher }) => ({ name, publisher }));
  } else if (value === '0') {
    result = books
      .filter((book) => book.finished === false)
      .map(({ name, publisher }) => ({ name, publisher }));
  } else {
    result = books.map(({ name, publisher }) => ({ name, publisher }));
  }

  return result;
};

const getBooksByName = (value) => {
  const result = books.filter((book) => book.name === value.toLowerCase());

  return result;
};

const getBooks = async (request, h) => {
  const result = {
    status: 'success',
    data: {
      books: null,
    },
  };

  if (request.query.reading !== undefined) {
    result.data.books = await getBooksByReading(request.query.reading);
  } else if (request.query.finished !== undefined) {
    result.data.books = await getBooksByFinished(request.query.finished);
  } else if (request.query.name !== undefined) {
    result.data.books = await getBooksByName(request.query.name);
  } else {
    result.data.books = await getAllBooks();
  }

  return h.response(result).code(200);
};

const getBookById = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((value) => value.id === bookId);
  if (book.length > 0) {
    return h
      .response({
        status: 'success',
        data: {
          book: book[0],
        },
      })
      .code(200);
  }

  return h
    .response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    })
    .code(404);
};
const updateBookById = (request, h) => {
  const { bookId } = request.params;
  const {
    name, year, author, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);
  let response;
  if (name === '' || name === undefined) {
    response = h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      })
      .code(400);
  } else if (readPage > pageCount) {
    response = h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  } else if (index === -1) {
    response = h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      })
      .code(404);
  } else if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };
    response = h
      .response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      })
      .code(200);
  }
  return response;
};
const deleteBookById = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);
  if (index !== -1) {
    books.splice(index, 1);
    return h
      .response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      })
      .code(200);
  }

  return h
    .response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    })
    .code(404);
};

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  getBooks,
};
