import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
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
        const contacts = await getAllContacts();
        console.log(`Found ${contacts.length} contacts from database`);
        return contacts.map(
          (contact: {
            id: string;
            firstName?: string;
            lastName?: string;
            name?: string;
            email?: string;
            phone?: string;
            updatedAt?: string | null;
          }) => {
            const nameParts = (contact.name || "").trim().split(/\s+/);
            return {
              ...contact,
              firstName: contact.firstName?.trim() || nameParts[0] || "Unknown",
              lastName: contact.lastName?.trim() || nameParts.slice(1).join(" ") || null,
              email: contact.email || "",
              phone: contact.phone || null,
            };
          },
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
        const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ");
        const newContact = await addContact(name, contact.phone, contact.email);
        if (!newContact) return null;
        const nameParts = (newContact.name as string)?.trim().split(" ") || [];
        return {
          ...newContact,
          firstName: nameParts[0] || "Unknown",
          lastName: nameParts.slice(1).join(" ") || null,
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
        const name = [firstName, lastName].filter(Boolean).join(" ");
        const updated = await updateContact(id, name, phone, email);
        if (!updated) return null;
        const nameParts = (updated.name as string)?.trim().split(" ") || [];
        return {
          ...updated,
          firstName: nameParts[0] || "Unknown",
          lastName: nameParts.slice(1).join(" ") || null,
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

const server = new ApolloServer({ typeDefs, resolvers });

const port = process.env.PORT ? Number(process.env.PORT) : 5002;
const { url } = await startStandaloneServer(server, {
  listen: { port },
});
console.log(`🚀 GraphQL Server ready at ${url}`);
