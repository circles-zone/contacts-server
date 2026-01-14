import { Pool } from "mysql2/promise";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  updatedAt: string;
}

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
      contacts: async (): Promise<Contact[]> => {
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

          return (rows as DbRow[]).map((row) => ({
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
