import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { gql } from "graphql-tag";
import * as dotenv from "dotenv";

import { getContacts, createContact, editContact, removeContact } from "./contactService.js";

export { getContacts, createContact, editContact, removeContact };

dotenv.config();

const typeDefs = gql`
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

  input AddContactInput {
    firstName: String!
    lastName: String
    # TODO emailAddress: EmailAddress!
    email: String!
    # TODO phoneNumber: PhoneNumber!
    phone: String!
  }

  type Mutation {
    # TODO addContact( contact : ContactLocal )
    addContact(contact: AddContactInput!): Contact
    updateContact(id: ID!, firstName: String!, lastName: String, phone: String, email: String): Contact
    deleteContact(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    contacts: async () => {
      try {
        const contacts = await getContacts();
        console.log(`Found ${contacts.length} contacts from database`);
        return contacts;
      } catch (error) {
        console.error("Database error:", error);
        return [];
      }
    },
  },
  Mutation: {
    addContact: async (
      _: unknown,
      { contact }: { contact: { firstName: string; lastName?: string; email: string; phone: string } },
    ) => {
      try {
        return await createContact(contact.firstName, contact.lastName, contact.phone, contact.email);
      } catch (error) {
        console.error("Add error:", error);
        throw new Error("Failed to add contact");
      }
    },
    updateContact: async (
      _: unknown,
      { id, firstName, lastName, phone, email }: { id: string; firstName: string; lastName?: string; phone?: string; email?: string },
    ) => {
      try {
        return await editContact(id, firstName, lastName, phone, email);
      } catch (error) {
        console.error("Update error:", error);
        throw new Error("Failed to update contact");
      }
    },
    deleteContact: async (_: unknown, { id }: { id: string }) => {
      try {
        return await removeContact(id);
      } catch (error) {
        console.error("Delete error:", error);
        throw new Error("Failed to delete contact");
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const port = process.env.PORT ? Number(process.env.PORT) : 5002;
const { url } = await startStandaloneServer(server, {
  listen: { port },
});
console.log(`🚀 GraphQL Server ready at ${url}`);
