'use strict';
const mongoose = require('mongoose');
const Book = require('../models/book');

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = function (app) {

  app.route('/api/books')
    .get(async (req, res) => {
      const books = await Book.find({});
      res.json(books.map(book => ({
        _id: book._id,
        title: book.title,
        commentcount: book.comments.length
      })));
    })

    .post(async (req, res) => {
      const { title } = req.body;
      if (!title) return res.send('missing required field title');
      try {
        const book = await Book.create({ title, comments: [] });
        res.json({ _id: book._id, title: book.title });
      } catch (err) {
        res.send('error saving book');
      }
    })

    .delete(async (req, res) => {
      await Book.deleteMany({});
      res.send('complete delete successful');
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.send('no book exists');
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch {
        res.send('no book exists');
      }
    })

    .post(async (req, res) => {
      const { comment } = req.body;
      if (!comment) return res.send('missing required field comment');

      try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.send('no book exists');
        book.comments.push(comment);
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch {
        res.send('no book exists');
      }
    })

    .delete(async (req, res) => {
      try {
        const result = await Book.findByIdAndDelete(req.params.id);
        if (!result) return res.send('no book exists');
        res.send('delete successful');
      } catch {
        res.send('no book exists');
      }
    });

};
