const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});

module.exports = mongoose.model('Book', bookSchema);
