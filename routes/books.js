var express = require('express');
var router = express.Router();
const { Book } = require('../models'); // Fixed import statement
const { Op } = require('sequelize');

function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  }
}

// GET /books: sends a list of books to the View
router.get('/', asyncHandler(async (req, res, next) => {
  const { search, page = 1 } = req.query;
  const limit = 10; // Number of books per page
  
  // Validate page number
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.render('books/errors', { 
      errors: [{ message: 'Invalid page number' }],
      title: 'Error'
    });
  }
  
  const offset = (pageNum - 1) * limit;
  
  let books;
  let totalBooks;
  
  if (search) {
    // parse search as number
    const searchYear = parseInt(search, 10);
    const isYearSearch = !isNaN(searchYear);
    
    const whereClause = {
      // Operators
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } },
        { genre: { [Op.like]: `%${search}%` } },
        ...(isYearSearch ? [{ year: searchYear }] : [])
      ]
    };

    books = await Book.findAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    totalBooks = await Book.count({ where: whereClause });
  } else {
    books = await Book.findAll({ 
      limit,
      offset,
      order: [['createdAt', 'DESC']] 
    });
    totalBooks = await Book.count();
  }
  
  const totalPages = Math.ceil(totalBooks / limit);
  
  // Check if requested page is beyond total pages
  if (pageNum > totalPages && totalPages > 0) {
    return res.render('books/errors', { 
      errors: [{ message: "Sorry! We couldn't find the page you were looking for." }],
      title: 'Error'
    });
  }

  res.render('books/index', { 
    books, 
    title: 'Library Books', 
    search,
    pagination: {
      currentPage: pageNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      nextPage: pageNum + 1,
      previousPage: pageNum - 1
    }
  });
}));


// /books/new - get - crete new book form
router.get('/new', asyncHandler(async (req, res) => {
  res.render('books/new-book', { book: {}, title: 'New Book' });
}));

// /books/new - post - create new book
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    const bookData = { ...req.body };
    if (bookData.year === '') {
      bookData.year = null;
    } else if (bookData.year) {
      bookData.year = parseInt(bookData.year, 10);
    }
    book = await Book.create(bookData);
    res.redirect('/books/' + book.id);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('books/new-book', { book, errors: error.errors, title: 'New Book - Error' });
    } else {
      throw error;
    }
  }
}));

// /books/:id - get - send book detail form
router.get('/:id', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
   if (book) {
       res.render('books/view-book', { book, title: book.title });
    } else {
      res.render('page-not-found', { title: 'Page Not Found' });
    }
}));


// /books/:id/edit - get - send update form
router.get('/:id/edit', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/update-book', { book, title: 'Update Book' });
  } else {
     res.render('page-not-found', { title: 'Page Not Found' });
  }
}));

// /books/:id/edit - post - update book
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      const bookData = { ...req.body };
      if (bookData.year === '') {
        bookData.year = null;
      } else if (bookData.year) {
        bookData.year = parseInt(bookData.year, 10);
      }
      await book.update(bookData);
      res.redirect('/books/' + book.id);
    } else {
      res.render('page-not-found', { title: 'Page Not Found' });
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
    res.render('page-not-found', { title: 'Page Not Found' });
  }
}));

// /books/:id/delete - post - delete book
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    res.render('page-not-found', { title: 'Page Not Found' });
  }
}));



module.exports = router;
