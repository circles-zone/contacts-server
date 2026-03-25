import { ApolloServer } from "apollo-server";
import { gql } from "graphql-tag";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

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

// Logger REST API (separate Express server)
const loggerApp = express();
loggerApp.use(cors());
loggerApp.use(express.json());

loggerApp.post("/:environmentName/api/v0/logger/createLog", async (req, res) => {
  const body = req.body;
  try {
    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: "logger",
      port: Number(process.env.MYSQL_PORT) || 3306,
    });
    await pool.query(
      `INSERT INTO logger_table
        (message, component_id, component_name, filename, function_name, line_number, severity_id, api_type, component_category, developer_email_address, payload, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        body.message || body.messageInternalEnglish || null,
        body.componentId || body.component_id || null,
        body.componentName || body.component_name || null,
        body.filename || null,
        body.functionName || body.function_name || null,
        body.lineNumber > 0 ? body.lineNumber : body.line_number > 0 ? body.line_number : null,
        body.severityId || body.severity_id || null,
        body.apiType || body.api_type || null,
        body.componentCategory || body.component_category || null,
        body.developerEmailAddress || body.developer_email_address || null,
        body.payload ? JSON.stringify(body.payload) : null,
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Logger endpoint error:", error);
    res.status(500).json({ success: false });
  }
});

const loggerPort = process.env.LOGGER_PORT ? Number(process.env.LOGGER_PORT) : 5003;
loggerApp.listen(loggerPort, () => {
  console.log(`📋 Logger REST API ready at http://localhost:${loggerPort}`);
});
