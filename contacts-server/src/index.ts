import { ApolloServer } from "apollo-server";
import { gql } from "graphql-tag";
import * as dotenv from "dotenv";

import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
} from "@circles-zone/contacts-local-typescript-package";

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
    email: String!
    phone: String!
  }

  type Mutation {
    addContact(contact: AddContactInput!): Contact
    updateContact(id: ID!, firstName: String!, lastName: String, phone: String, email: String): Contact
    deleteContact(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    contacts: async () => {
      try {
        const contacts = await getAllContacts();
        console.log(`Found ${contacts.length} contacts from database`);
        return contacts.map(
          (contact: {
            id: string;
            firstName?: string;
            lastName?: string;
            email?: string;
            phone?: string;
            updatedAt?: string | null;
          }) => ({
            ...contact,
            firstName: contact.firstName?.trim() || "Unknown",
            lastName: contact.lastName?.trim() || null,
            email: contact.email || "",
            phone: contact.phone || null,
          }),
        );
      } catch (error) {
        console.error("Database error:", error);
        return [];
      }
    },
  },
  Mutation: {
    addContact: async (
      _: unknown,
      // TODO email: EmailAddress
      { contact }: { contact: { firstName: string; lastName?: string; email: string; phone: string } },
    ) => {
      try {
        const newContact = await addContact(contact.firstName, contact.lastName, contact.phone, contact.email);
        if (!newContact) return null;
        return {
          ...newContact,
          firstName: (newContact.firstName as string)?.trim() || "Unknown",
          lastName: (newContact.lastName as string)?.trim() || null,
          email: newContact.email || "",
          phone: newContact.phone || null,
        };
      } catch (error) {
        console.error("Add error:", error);
        throw new Error("Failed to add contact");
      }
    },
    updateContact: async (
      _: unknown,
      {
        id,
        firstName,
        lastName,
        phone,
        email,
      }: { id: string; firstName: string; lastName?: string; phone?: string; email?: string },
    ) => {
      try {
        const updated = await updateContact(id, firstName, lastName, phone, email);
        if (!updated) return null;
        return {
          ...updated,
          firstName: (updated.firstName as string)?.trim() || "Unknown",
          lastName: (updated.lastName as string)?.trim() || null,
          email: updated.email || "",
          phone: updated.phone || null,
        };
      } catch (error) {
        console.error("Update error:", error);
        throw new Error("Failed to update contact");
      }
    },
    deleteContact: async (_: unknown, { id }: { id: string }) => {
      try {
        return await deleteContact(id);
      } catch (error) {
        console.error("Delete error:", error);
        throw new Error("Failed to delete contact");
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin: true,
    credentials: true,
  },
});

const port = process.env.PORT ? Number(process.env.PORT) : 5002;
server.listen({ port }).then(({ url }: { url: string }) => {
  console.log(`🚀 GraphQL Server ready at ${url}`);
  console.log(`📊 GraphQL Playground available at ${url}`);
});
