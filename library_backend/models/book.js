// Model for books that are added to the db

// Dependencies
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// "Blueprints" for book in the db and settings for validation
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
  },
  genres: [{ type: String }],
})

//for validating that book with same title is added only once to db
schema.plugin(uniqueValidator)

// Exports
module.exports = mongoose.model('Book', schema)
