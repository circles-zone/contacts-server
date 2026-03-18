// Why do we need src/db/database.ts if we are using GraphQL to access the database?

import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

export interface DbConfig {
  host: string | undefined;
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
  port: number;
}

export function getDbConfig(): DbConfig {
  const isCloud = process.env.ENVIRONMENT === "cloud";

  return {
    host: isCloud ? process.env.AWS_RDS_HOST : process.env.MYSQL_HOST,
    user: isCloud ? process.env.AWS_RDS_USER : process.env.MYSQL_USER,
    password: isCloud
      ? process.env.AWS_RDS_PASSWORD
      : process.env.MYSQL_PASSWORD,
    database: isCloud
      ? process.env.AWS_RDS_DATABASE
      : process.env.MYSQL_DATABASE,
    port:
      Number(isCloud ? process.env.AWS_RDS_PORT : process.env.MYSQL_PORT) ||
      3306,
  };
}

export function createPool(config: DbConfig) {
  return mysql.createPool(config);
}

export async function testConnection(pool: mysql.Pool): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
