const { gql } = require("graphql-tag");
  type Contact {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    contacts: [Contact!]!
  }
`;

exports.typeDefs = gql`
  type Contact {
    id: ID!
    name: String!
    email: String!
  }

  input AddContactInput {
    name: String!
    email: String!
    phone: String!
  }

  type Query {
    contacts: [Contact!]!
  }

  type Mutation {
    addContact(input: AddContactInput!): Contact
  }
`;
