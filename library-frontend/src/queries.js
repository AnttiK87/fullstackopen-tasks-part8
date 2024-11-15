import { gql } from '@apollo/client'

export const CURRENT_USER = gql`
  query {
    me {
      favoriteGenre
    }
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      bookCount
      born
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
    }
  }
`

export const ALL_BOOKS_BY_GENRE = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      author {
        name
      }
      genres
      published
      title
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $published: Int!, $genres: [String!]!, $author: String!) {
    addBook(title: $title, published: $published, genres: $genres, author: { name: $author }) {
      title
      author {
        name
      }
    }
  }
`

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $born: Int!) {
    editAuthor(name: $name, setBornTo: $born) {
      name
      born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`
