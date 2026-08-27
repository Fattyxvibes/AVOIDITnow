import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not available for database seeding.");
}

const sql = await readFile("/home/ubuntu/avoid-it/research/workbook_extract_expanded/seed_boycott_workbook.sql", "utf8");
const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, multipleStatements: true });

try {
  await connection.query(sql);
  const [listingCount] = await connection.query("SELECT COUNT(*) AS count FROM boycottListings");
  const [alternativeCount] = await connection.query("SELECT COUNT(*) AS count FROM boycottListingAlternatives");
  console.log(JSON.stringify({ listings: listingCount[0]?.count, alternatives: alternativeCount[0]?.count }));
} finally {
  await connection.end();
}
