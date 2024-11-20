// Import required packages and modules
const { ApolloServer } = require('@apollo/server')
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@apollo/server/express4')

const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const express = require('express')
const cors = require('cors')
const http = require('http')

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const User = require('./models/user')

// Import GraphQL schema and resolvers
const typeDefs = require('./schema')
const resolvers = require('./resolvers')

// Load environment variables
require('dotenv').config()

// Set MongoDB URI
const mongooseUri =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

// Set port
const port =
  process.env.NODE_ENV === 'test' ? process.env.TEST_PORT : process.env.PORT

const MONGODB_URI = mongooseUri

console.log('connecting to', MONGODB_URI)

// connection to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// starting the server with websocket
const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  // websocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })

  // GraphQL schema using type definitions and resolvers
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // GraphQL WebSocket server cleanup on server shutdown
  const serverCleanup = useServer({ schema }, wsServer)

  // Apollo Server with schema and necessary plugins
  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  // start the server
  await server.start()

  // Apollo Server middleware
  app.use(
    '/',
    cors(), // Cross-Origin Resource Sharing
    express.json(), // Parse JSON bodies
    expressMiddleware(server, {
      context: async ({ req }) => {
        // jwt token verification
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(
            auth.substring(7), // Remove 'Bearer '
            process.env.JWT_SECRET, // Use key to verify token
          )
          const currentUser = await User.findById(decodedToken.id) // Find user by ID
          return { currentUser } // Return the current user
        }
      },
    }),
  )

  const PORT = port
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`),
  )
}

start()
