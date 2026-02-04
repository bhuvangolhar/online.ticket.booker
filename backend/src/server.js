import app from "./app.js";
import { initLocalDB, loadDB, saveAllCollections } from "./config/db.js";
import { DB_CONSTANTS } from "./utils/constants.js";

const startServer = async () => {
  try {
    // Initialize local database
    initLocalDB();
    
    // Load existing data into memory
    loadDB();

    // Start Express server
    const server = app.listen(DB_CONSTANTS.PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${DB_CONSTANTS.PORT}`);
      console.log(`📦 Environment: ${DB_CONSTANTS.NODE_ENV}`);
      console.log(`💾 Using Local Storage (JSON)\n`);
    });

    // Save data before graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, saving data and shutting down gracefully");
      saveAllCollections();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("\nSIGINT received, saving data and shutting down gracefully");
      saveAllCollections();
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
