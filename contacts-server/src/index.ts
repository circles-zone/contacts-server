import { ApolloServer } from "apollo-server";
import { gql } from "graphql-tag";
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { MYSQL_DEFAULT_PORT } from "./db/database.js";

import {
  getAllContacts,
  addContact,
  updateContact,
  deleteContact,
} from "@circles-zone/contacts-local-typescript-package";
import { loggerRemote, ComponentCategory } from "@circles-zone/logger-remote";

dotenv.config();

const logger = loggerRemote(
  process.env.BRAND_NAME || "Circlez",
  process.env.ENVIRONMENT_NAME || "local"
);
const logFields = {
  componentId: 5002,
  componentName: "contacts-server",
  componentCategory: ComponentCategory.Code,
};
logger.init("contacts-server started", logFields);

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
    phone: String!
  }

  type Mutation {
    addContact(contact: AddContactInput!): Contact
    updateContact(
      id: ID!
      firstName: String!
      lastName: String
      phone: String
      email: String
    ): Contact
    deleteContact(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    contacts: async () => {
      try {
        const contacts = await getAllContacts();
        logger.info(`contacts query: found ${contacts.length} contacts`, logFields);
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
        logger.error("contacts query failed", { ...logFields, error: String(error) });
        return [];
      }
    },
  },
  Mutation: {
    addContact: async (
      _: unknown,
      // TODO email: EmailAddress
      {
        contact,
      }: {
        contact: {
          firstName: string;
          lastName?: string;
          email: string;
          phone: string;
        };
      },
    ) => {
      try {
        const newContact = await addContact(
          contact.firstName,
          contact.lastName,
          contact.phone,
          contact.email,
        );
        if (!newContact) return null;
        logger.info("addContact succeeded", { ...logFields, email: contact.email });
        return {
          ...newContact,
          firstName: (newContact.firstName as string)?.trim() || "Unknown",
          lastName: (newContact.lastName as string)?.trim() || null,
          email: newContact.email || "",
          phone: newContact.phone || null,
        };
      } catch (error) {
        logger.error("addContact failed", { ...logFields, error: String(error) });
        throw new Error("Failed to add contact", { cause: error });
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
      }: {
        id: string;
        firstName: string;
        lastName?: string;
        phone?: string;
        email?: string;
      },
    ) => {
      try {
        const updated = await updateContact(
          id,
          firstName,
          lastName,
          phone,
          email,
        );
        if (!updated) return null;
        logger.info("updateContact succeeded", { ...logFields, id });
        return {
          ...updated,
          firstName: (updated.firstName as string)?.trim() || "Unknown",
          lastName: (updated.lastName as string)?.trim() || null,
          email: updated.email || "",
          phone: updated.phone || null,
        };
      } catch (error) {
        logger.error("updateContact failed", { ...logFields, error: String(error) });
        throw new Error("Failed to update contact", { cause: error });
      }
    },
    deleteContact: async (_: unknown, { id }: { id: string }) => {
      try {
        return await deleteContact(id);
      } catch (error) {
        logger.error("deleteContact failed", { ...logFields, error: String(error) });
        throw new Error("Failed to delete contact", { cause: error });
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
  logger.info(`GraphQL Server ready at ${url}`, logFields);
  logger.info(`GraphQL Playground available at ${url}`, logFields);
});

// Logger REST API (separate Express server)
const loggerApp = express();
loggerApp.use(cors());
loggerApp.use(express.json());

// Create the logger pool once at module scope — NOT inside the request handler.
// Creating a new pool per request causes connection exhaustion under even
// moderate load (each pool holds up to 10 connections and is never closed).
const loggerPool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.LOGGER_DB || "logger",
  port: Number(process.env.MYSQL_PORT) || MYSQL_DEFAULT_PORT,
  connectionLimit: 10,
  waitForConnections: true,
});

const LOGGER_PRIMARY_VERSION = "v1";

const createLogHandler = async (
  req: express.Request,
  res: express.Response,
) => {
  const body = req.body;
  try {
    await loggerPool.query(
      `INSERT INTO logger_table
        (message, record, path, component_id, component_name, filename, function_name, line_number, severity_id, api_type, component_category, developer_email_address, payload, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        body.message || body.messageInternalEnglish || "",
        body.record || "",
        body.path || "",
        body.componentId || body.component_id || null,
        body.componentName || body.component_name || null,
        body.filename || null,
        body.functionName || body.function_name || null,
        body.lineNumber > 0
          ? body.lineNumber
          : body.line_number > 0
            ? body.line_number
            : null,
        body.severityId || body.severity_id || null,
        body.apiType || body.api_type || null,
        body.componentCategory || body.component_category || null,
        body.developerEmailAddress || body.developer_email_address || null,
        body.payload ? JSON.stringify(body.payload) : null,
      ],
    );
    res.json({ success: true });
  } catch (error) {
    logger.error("Logger endpoint error", { ...logFields, error: String(error) });
    res.status(500).json({ success: false });
  }
};

loggerApp.post(
  `/:environmentName/api/${LOGGER_PRIMARY_VERSION}/logger/createLog`,
  createLogHandler,
);
// Backward-compatible route for existing clients still using v0.
loggerApp.post("/:environmentName/api/v0/logger/createLog", createLogHandler);

const loggerPort = process.env.LOGGER_PORT
  ? Number(process.env.LOGGER_PORT)
  : 5003;
loggerApp.listen(loggerPort, () => {
  logger.info(`Logger REST API ready at http://localhost:${loggerPort}`, logFields);
});
