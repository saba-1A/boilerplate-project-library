'use strict';
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
mongoose.connect(process.env.DB);

const bookSchema = new mongoose.Schema({
  title: String,
  comments: []
})

const BookModel = mongoose.model('book', bookSchema)

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      
      BookModel.find({}, (err, data) => {
        if (err) return console.log(err)
        if (!data) {
          return res.json([])
        }
        return res.send(data.map(book => ({_id: book._id, title: book.title, commentcount: book.comments.length})))
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      let title = req.body.title
      if (!title) {
        return res.json("missing required field title")
      }

      const newBook = BookModel({
        title: title,
        comments: new Array(0)
      })

      newBook.save((err, data) => {
        if (err) return console.log(err)
        return res.json({_id: data._id, title: data.title})
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      BookModel.remove({}, (err, data) => {
        return res.json("complete delete successful")
      })
    });



  app.route('/api/books/:id')
    
    .get(function (req, res){
      let bookid = req.params.id;
      BookModel.find({_id: bookid}, (err, data) => {
        if (!data || data.length === 0) {
          return res.json("no book exists")
        }
        return res.json(data.map(book => ({_id: book._id, title: book.title, comments: book.comments}))[0])
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {
        return res.json("missing required field comment")
      }

    BookModel.findById({_id: bookid}, (err, data) => {
      if (err) {
        res.json("no book exists")
        return console.log(err)
      }
      if (!data) {
        return res.json("no book exists")
      }
      data.comments = [...data.comments, comment]
      data.save((err, data) => {
        return res.json({_id: bookid, title: data.title, comments: data.comments})
      })
    })
      
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;

      BookModel.remove({_id: bookid}, (err, data) => {
        if (err) {
          res.json("no book exists")
          return console.log(err)
        }
        if (!data || data.deletedCount === 0) {
          return res.json("no book exists")
        }
        return res.json("delete successful")
      })
      //if successful response will be 'delete successful'
    });
  
};
