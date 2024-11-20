// Model for authors that are added to the db

// Dependencies
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// "Blueprints" for user in the db and settings for validation
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
})

//for validating that user with same name is added only once to db
schema.plugin(uniqueValidator)

// Exports
module.exports = mongoose.model('User', schema)
