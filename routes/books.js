var express = require('express');
var router = express.Router();
const { Book } = require('../models'); // Fixed import statement

function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

// GET /books: sends a list of books to the View
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ order: [['createdAt', 'DESC']] });
  res.render('books/index', { books, title: 'Library Books' }); // renders views/index.pug
}));

// /books/:id - get - send book detail form
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
   if (book) {
    res.render("books/view-book", { book, title: book.title });
    } else {
      res.sendStatus(404);
    }
}));


// /books/new - get - crete new book form
router.get('/new', asyncHandler(async (req, res) => {
  res.render('books/new', { book: {}, title: 'New Book' });
}));

// /books/new - post - create new book
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/" + book.id);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('books/new', { book, errors: error.errors });
    } else {
      throw error;
    }
  }
}));

// /books/:id/edit - get - send update form
router.get('/:id/edit', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/update-book', { book, title: 'Update Book' });
  } else {
    res.sendStatus(404);
  }
}));

// /books/:id/edit - post - update book
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books/' + book.id);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('books/update-book', { book, errors: error.errors, title: 'Update Book' });
    } else {
      throw error;
    }
  }
}));

// /books/:id/delete - get - show delete confirmation
router.get('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/delete', { book, title: 'Delete Book' });
  } else {
    res.sendStatus(404);
  }
}));

// /books/:id/delete - post - delete book
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
