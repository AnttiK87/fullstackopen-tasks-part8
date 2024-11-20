// Model for authors that are added to the db

// Dependencies
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// "Blueprints" for author in the db and settings for validation
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
  },
})

//for validating that author with same name is added only once to db
schema.plugin(uniqueValidator)

// Exports
module.exports = mongoose.model('Author', schema)
