import { Pool } from "mysql2/promise";
import { loggerRemote, ComponentCategory } from "@circles-zone/logger-remote";

const logger = loggerRemote(
  process.env.BRAND_NAME || "Circlez",
  process.env.ENVIRONMENT_NAME || process.env.ENVIRONMENT || "local"
);
const loggerFields = {
  componentId: 5002,
  componentName: "contacts-server-graphql",
  componentCategory: ComponentCategory.Code,
};
logger.init("contactResolvers started", loggerFields);

// TODO after we add other database tables which are linked to contact_table will Contact be exactly is the DatabaeRaw interface? If so it is redundant.
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  updatedAt: string;
}

// TODO Should we rename it to ContactTableDatabaseRow?
interface DbRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  updatedAt: string;
}

export function createResolvers(pool: Pool) {
  return {
    Query: {
      // TODO We might need more resolvers to bring data from other tables linked to contact_tables i.e. email_address, text_block, url ...
      contacts: async (): Promise<Contact[]> => {
        try {
          // TODO let's have two altermatives to access the databse 1. direct 2. via GenericCrudMysql from database-mysql-local-python-package and compare the performance
          const query = `
            SELECT 
              v.contact_id AS id, 
              CONCAT_WS(' ', v.first_name, v.last_name) AS name, 
              v.email1 AS email,
              t.phone1 AS phone,
              v.updated_timestamp AS updatedAt
            FROM contact_recent_general_view v
            LEFT JOIN contact_table t ON t.contact_id = v.contact_id
            ORDER BY v.updated_timestamp DESC
            LIMIT ?
          `;
          const [rows] = await pool.query(query, [50]);

          const contacts = (rows as DbRow[]).map((row) => ({
            ...row,
            name: row.name?.trim() || "לא ידוע",
            email: row.email || "unknown@example.com",
            phone: row.phone || null,
            updatedAt: row.updatedAt,
          }));
          logger.info("contacts query succeeded", { ...loggerFields, count: contacts.length });
          return contacts;
        } catch (error) {
          logger.error("contacts query failed", { ...loggerFields, error: String(error) });
          return [];
        }
      },
    },
  };
}

export function formatContact(row: DbRow): Contact {
  return {
    id: row.id,
    name: row.name?.trim() || "לא ידוע",
    email: row.email || "unknown@example.com",
    phone: row.phone || null,
    updatedAt: row.updatedAt,
  };
}
