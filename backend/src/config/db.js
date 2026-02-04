// Local storage initialization
// Using JSON files for storage instead of MongoDB

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, "../../db");

// Initialize database directory and files
export const initLocalDB = () => {
  try {
    // Create db directory if it doesn't exist
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // Initialize collections if they don't exist
    const collections = ["users", "events", "seats", "bookings", "payments"];
    collections.forEach((collection) => {
      const filePath = path.join(DB_DIR, `${collection}.json`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({ data: [] }, null, 2));
      }
    });

    console.log(`✅ Local database initialized at ${DB_DIR}`);
  } catch (error) {
    console.error("Failed to initialize local database:", error.message);
    process.exit(1);
  }
};

// Global database object for runtime storage
export const db = {
  users: [],
  events: [],
  seats: [],
  bookings: [],
  payments: [],
};

// Load all collections into memory
export const loadDB = () => {
  try {
    const collections = ["users", "events", "seats", "bookings", "payments"];
    collections.forEach((collection) => {
      const filePath = path.join(DB_DIR, `${collection}.json`);
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      db[collection] = parsed.data || [];
    });
    console.log(`✅ Database loaded into memory`);
  } catch (error) {
    console.error("Failed to load database:", error.message);
  }
};

// Save a specific collection to file
export const saveCollection = (collectionName) => {
  try {
    const filePath = path.join(DB_DIR, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ data: db[collectionName] }, null, 2));
  } catch (error) {
    console.error(`Failed to save ${collectionName}:`, error.message);
  }
};

// Save all collections to files
export const saveAllCollections = () => {
  try {
    const collections = ["users", "events", "seats", "bookings", "payments"];
    collections.forEach((collection) => {
      saveCollection(collection);
    });
  } catch (error) {
    console.error("Failed to save collections:", error.message);
  }
};
