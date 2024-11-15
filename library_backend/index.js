const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
require('dotenv').config()

const mongooseUri =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

const port =
  process.env.NODE_ENV === 'test' ? process.env.TEST_PORT : process.env.PORT

const MONGODB_URI = mongooseUri

console.log('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
 type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

  type Token {
    value: String!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  input AuthorInput {
    name: String!
    born: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    allUsers: [User!]!
    authorBooksCount(author: String!): Int!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      genres: [String!]!
      author: AuthorInput!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author

    createUser(
      username: String!,
      favoriteGenre: String!
    ): User
    
    login(
      username: String!
      password: String!
    ): Token  
  }
`
const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let books

      if (!args.author && !args.genre) {
        books = await Book.find().populate('author')
      } else if (args.author && !args.genre) {
        const author = await Author.findOne({ name: args.author })
        books = await Book.find({ author: author.id }).populate('author')
      } else if (args.genre && !args.author) {
        books = await Book.find({ genres: args.genre }).populate('author')
      } else {
        const author = await Author.findOne({ name: args.author })
        books = await Book.find({
          genres: args.genre,
          author: author.id,
        }).populate('author')
      }

      return books
    },
    allAuthors: async () => {
      return Author.find({})
    },
    allUsers: async () => {
      return User.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },

  Author: {
    bookCount: async (parent) => {
      return Book.find({ author: parent.id }).countDocuments()
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const book = new Book({ ...args })

      try {
        let author = await Author.findOne({ name: args.author.name })

        if (!author) {
          author = new Author({
            name: args.author.name,
            born: args.author.born || null,
          })
          await author.save()
        }

        book.author = author._id
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error,
          },
        })
      }

      return book.populate('author')
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        throw new GraphQLError('Author not found', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.born,
            error,
          },
        })
      }
      return author
    },
    createUser: async (root, args) => {
      //console.log('Creating user with data:', args)
      const user = new User({ ...args })
      //console.log('Creating user:', user)

      return user.save().catch((error) => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error,
          },
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: port },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
