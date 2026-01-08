import { ApolloServer } from "apollo-server";
import { gql } from "graphql-tag";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

// MySQL connection configuration
const dbConfig = {
  host:
    process.env.ENVIRONMENT === "cloud"
      ? process.env.AWS_RDS_HOST
      : process.env.MYSQL_HOST,
  user:
    process.env.ENVIRONMENT === "cloud"
      ? process.env.AWS_RDS_USER
      : process.env.MYSQL_USER,
  password:
    process.env.ENVIRONMENT === "cloud"
      ? process.env.AWS_RDS_PASSWORD
      : process.env.MYSQL_PASSWORD,
  database:
    process.env.ENVIRONMENT === "cloud"
      ? process.env.AWS_RDS_DATABASE
      : process.env.MYSQL_DATABASE,
  port:
    Number(
      process.env.ENVIRONMENT === "cloud"
        ? process.env.AWS_RDS_PORT
        : process.env.MYSQL_PORT
    ) || 3306,
};

console.log("Database config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  environment: process.env.ENVIRONMENT,
});

const pool = mysql.createPool(dbConfig);

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
        const [rows] = await pool.query(`
          SELECT 
            v.contact_id AS id, 
            CONCAT_WS(' ', v.first_name, v.last_name) AS name, 
            v.email1 AS email,
            t.phone1 AS phone,
            v.updated_timestamp AS updatedAt
          FROM contact_recent_general_view v
          LEFT JOIN contact_table t ON t.contact_id = v.contact_id
          ORDER BY v.updated_timestamp DESC
          LIMIT 50
        `);

        console.log(
          `Found ${
            Array.isArray(rows) ? rows.length : 0
          } contacts from database`
        );
        return (rows as any[]).map((row) => ({
          ...row,
          name: row.name?.trim() || "לא ידוע",
          email: row.email || "unknown@example.com",
          phone: row.phone || null,
          updatedAt: row.updatedAt,
        }));
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

server.listen({ port: 5002 }).then(({ url }: { url: string }) => {
  console.log(`🚀 GraphQL Server ready at ${url}`);
  console.log(`📊 GraphQL Playground available at ${url}`);
});
