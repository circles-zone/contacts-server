import { ApolloServer } from "apollo-server";
import { gql } from "graphql-tag";
import * as dotenv from "dotenv";

import { getAllContacts } from "@circles-zone/contacts-local-typescript-package";

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
            updatedAt?: string;
          }) => ({
            ...contact,
            name: contact.name?.trim() || "לא ידוע",
            email: contact.email || "unknown@example.com",
            phone: contact.phone || null,
          }),
        );
      } catch (error) {
        console.error("Database error:", error);
        return [];
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
