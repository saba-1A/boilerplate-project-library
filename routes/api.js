'use strict';

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  app.route('/api/books')
    .get(function (req, res) {
      Book.find({}, (err, books) => {
        if (err) return res.status(500).send('Database error');
        res.json(books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        })));
      });
    })

    .post(function (req, res) {
      const { title } = req.body;
      if (!title) return res.send('missing required field title');
      const newBook = new Book({ title, comments: [] });
      newBook.save((err, savedBook) => {
        if (err) return res.status(500).send('Database error');
        res.json({ _id: savedBook._id, title: savedBook.title });
      });
    })

    .delete(function (req, res) {
      Book.deleteMany({}, err => {
        if (err) return res.status(500).send('Database error');
        res.send('complete delete successful');
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res) {
      Book.findById(req.params.id, (err, book) => {
        if (err || !book) return res.send('no book exists');
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      });
    })

    .post(function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) return res.send('missing required field comment');

      Book.findById(bookid, (err, book) => {
        if (err || !book) return res.send('no book exists');
        book.comments.push(comment);
        book.save((err, updatedBook) => {
          if (err) return res.status(500).send('Database error');
          res.json({
            _id: updatedBook._id,
            title: updatedBook.title,
            comments: updatedBook.comments
          });
        });
      });
    })

    .delete(function (req, res) {
      Book.findByIdAndDelete(req.params.id, (err, result) => {
        if (err || !result) return res.send('no book exists');
        res.send('delete successful');
      });
    });
};
