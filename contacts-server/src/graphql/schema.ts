import { gql } from "graphql-tag";

// TODO we want to be able to access all columns in the original contact_table and tables which are linked tomit using foreignn keys i.e. contac__email_address_table, email_adresss_table, contact__text_block_table, text_block_table ...

export const typeDefs = gql`
  type Contact {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    phone: String
    updatedAt: String
  }

  type Query {
    contacts: [Contact!]!
  }
`;
