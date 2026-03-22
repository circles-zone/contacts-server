import { Pool } from "mysql2/promise";

// TODO after we add other database tables which are linked to contact_table will Contact be exactly is the DatabaeRaw interface? If so it is redundant.
export interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  updatedAt: string;
}

// TODO Should we rename it to ContactTableDatabaseRow?
interface DbRow {
  id: string;
  firstName: string;
  lastName: string | null;
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
              v.first_name AS firstName,
              v.last_name AS lastName,
              v.email1 AS email,
              t.phone1 AS phone,
              v.updated_timestamp AS updatedAt
            FROM contact_recent_general_view v
            LEFT JOIN contact_table t ON t.contact_id = v.contact_id
            ORDER BY v.updated_timestamp DESC
            LIMIT ?
          `;
          const [rows] = await pool.query(query, [50]);

          return (rows as DbRow[]).map((row) => ({
            ...row,
            firstName: row.firstName?.trim() || "Unknown",
            lastName: row.lastName?.trim() || null,
            email: row.email || "unknown@example.com",
            phone: row.phone || null,
            updatedAt: row.updatedAt,
          }));
        } catch (error) {
          // TODO make sure every place we call console.* we call our logger from logger-remote-typescript-package
          console.error("Database error:", error);
          return [];
        }
      },
    },
  };
}

export function formatContact(row: DbRow): Contact {
  return {
    id: row.id,
    firstName: row.firstName?.trim() || "Unknown",
    lastName: row.lastName?.trim() || null,
    email: row.email || "unknown@example.com",
    phone: row.phone || null,
    updatedAt: row.updatedAt,
  };
}
