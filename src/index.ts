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
    name: String!
    email: String!
    phone: String
    updatedAt: String
  }

  type Query {
    contacts: [Contact!]!
  }

  input AddContactInput {
    name: String!
    email: String!
    phone: String!
  }

  type Mutation {
    // TODO addContact( contact: ContactLocal)
    addContact(input: AddContactInput!): Contact
    updateContact(id: ID!, name: String!, phone: String, email: String): Contact
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
            name?: string;
            email?: string;
            phone?: string;
            updatedAt?: string | null;
          }) => ({
            ...contact,
            name: contact.name?.trim() || "לא ידוע",
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
      { input }: { input: { name: string; email: string; phone: string } },
    ) => {
      try {
        const newContact = await addContact(input.name, input.phone, input.email);
        if (!newContact) return null;
        return {
          ...newContact,
          name: (newContact.name as string)?.trim() || "לא ידוע",
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
        name,
        phone,
        email,
      }: { id: string; name: string; phone?: string; email?: string },
    ) => {
      try {
        const updated = await updateContact(id, name, phone, email);
        if (!updated) return null;
        return {
          ...updated,
          name: (updated.name as string)?.trim() || "לא ידוע",
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
