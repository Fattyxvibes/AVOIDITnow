#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";
import mysql from "mysql2/promise";

const workbookPath = process.argv[2];
if (!workbookPath) throw new Error("Usage: node scripts/import_updated_workbook.mjs <xlsx>");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const parsed = JSON.parse(execFileSync("python3", ["scripts/read_updated_workbook.py", workbookPath], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }));
if (!Array.isArray(parsed.records) || parsed.records.length === 0) throw new Error("Workbook parser returned no records");

const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await connection.beginTransaction();
  await connection.query("DELETE FROM boycottListingAlternatives");
  await connection.query("DELETE FROM boycottListings");

  const listingSql = `INSERT INTO boycottListings
    (workbookRow, category, listedBrand, listedSubproduct, impactOnSource, countryShown, notes, sourceUrl, sourceLabel, sourceReviewedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const alternativeSql = `INSERT INTO boycottListingAlternatives
    (listingId, position, company, productService, sourceUrl)
    VALUES (?, ?, ?, ?, ?)`;

  for (const record of parsed.records) {
    const [result] = await connection.execute(listingSql, [
      record.workbookRow,
      record.category.slice(0, 120),
      record.listedBrand.slice(0, 200),
      record.listedSubproduct.slice(0, 500),
      record.impactOnSource.slice(0, 80),
      record.countryShown ? record.countryShown.slice(0, 160) : null,
      record.notes,
      record.sourceUrl.slice(0, 512),
      record.sourceLabel.slice(0, 220),
      record.sourceReviewedAt,
    ]);
    const listingId = result.insertId;
    for (const alternative of record.alternatives) {
      await connection.execute(alternativeSql, [
        listingId,
        alternative.position,
        alternative.company.slice(0, 200),
        alternative.productService.slice(0, 500),
        alternative.sourceUrl.slice(0, 512),
      ]);
    }
  }

  const [[listingCount]] = await connection.query("SELECT COUNT(*) AS count FROM boycottListings");
  const [[alternativeCount]] = await connection.query("SELECT COUNT(*) AS count FROM boycottListingAlternatives");
  const [[threeAlternativeRows]] = await connection.query(`
    SELECT COUNT(*) AS count FROM (
      SELECT listingId FROM boycottListingAlternatives GROUP BY listingId HAVING COUNT(*) = 3
    ) valid
  `);
  const expectedListings = parsed.records.length;
  const expectedAlternatives = expectedListings * 3;
  if (Number(listingCount.count) !== expectedListings || Number(alternativeCount.count) !== expectedAlternatives || Number(threeAlternativeRows.count) !== expectedListings) {
    throw new Error(`Integrity check failed: listings=${listingCount.count}/${expectedListings}, alternatives=${alternativeCount.count}/${expectedAlternatives}, complete=${threeAlternativeRows.count}/${expectedListings}`);
  }

  await connection.commit();
  console.log(JSON.stringify({
    importedWorkbook: parsed.sourceWorkbook,
    sourceReviewedAt: parsed.sourceReviewedAt,
    listings: Number(listingCount.count),
    alternatives: Number(alternativeCount.count),
    listingsWithThreeAlternatives: Number(threeAlternativeRows.count),
  }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
