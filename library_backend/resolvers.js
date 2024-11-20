// dependencies
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

// GraphQL resolvers
const resolvers = {
  //queries for getting data from db
  Query: {
    //query for book count
    bookCount: async () => Book.collection.countDocuments(),
    //query for author count
    authorCount: async () => Author.collection.countDocuments(),
    //query for all books
    allBooks: async (root, args) => {
      let books
      if (!args.author && !args.genre) {
        //all books withput filter
        books = await Book.find().populate('author')
      } else if (args.author && !args.genre) {
        //all books of specific author
        const author = await Author.findOne({ name: args.author })
        books = await Book.find({ author: author.id }).populate('author')
      } else if (args.genre && !args.author) {
        //all books of specific genre
        books = await Book.find({ genres: args.genre }).populate('author')
      } else {
        //all books of specific genre and author
        const author = await Author.findOne({ name: args.author })
        books = await Book.find({
          genres: args.genre,
          author: author.id,
        }).populate('author')
      }

      return books
    },
    //query for all authors
    allAuthors: async () => {
      console.log('author.find')

      // getting all authors
      const authors = await Author.find({})

      // getting authors book count with aggregate query for preventin 1+n problem
      const bookCounts = await Book.aggregate([
        { $group: { _id: '$author', count: { $sum: 1 } } }, // countin bookCount by author
      ])

      // combining book count and author
      return authors.map((author) => {
        const bookCount = bookCounts.find(
          (count) => count._id.toString() === author.id.toString(),
        )
        return {
          ...author.toObject(),
          bookCount: bookCount ? bookCount.count : 0,
        }
      })
    },
    //query for all users
    allUsers: async () => {
      return User.find({})
    },
    //query for current
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  //mutations for adding and changin data at the db
  Mutation: {
    //mutation for adding books
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      //check if user is logged in
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      //check for error message if book is already in db
      const existingBook = await Book.findOne({ title: args.title })
      if (existingBook) {
        throw new GraphQLError('Book already exists', {
          extensions: {
            code: 'BAD_USER_INPUT',
            error: 'A book with this title already exists in the catalog.',
          },
        })
      }
      //defining new book
      const book = new Book({ ...args })

      try {
        //check if author already exist or add new author
        let author = await Author.findOne({ name: args.author.name })

        if (!author) {
          //define new author
          author = new Author({
            name: args.author.name,
            born: args.author.born || null,
          })
          //save new author
          await author.save()
        }
        //set author to the new book
        book.author = author._id
        //save new book
        await book.save()
      } catch (error) {
        //handle validation errors
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error,
          },
        })
      }
      //populate book with author info
      await book.populate('author')
      //add to ws server for showing change to other users
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      //return the new book
      return book
    },
    //mutation for editing authors born year
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      //check if user is logged in
      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      //check if author exist
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      //set new year to author
      author.born = args.setBornTo
      try {
        //save change
        await author.save()
      } catch (error) {
        //handle validation errors
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.born,
            error,
          },
        })
      }
      //return the updated author
      return author
    },
    //mutation for adding new user
    createUser: async (root, args) => {
      //defining new user
      const user = new User({ ...args })
      //save and return new user
      return user.save().catch((error) => {
        //handle validation errors
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          },
        })
      })
    },
    //mutation for logging in user
    login: async (root, args) => {
      //find user from db
      const user = await User.findOne({ username: args.username })
      //handle error if username or password is wrong
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      //set user
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      //set token for user
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  //subscription for adding books to websocet server
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

module.exports = resolvers
