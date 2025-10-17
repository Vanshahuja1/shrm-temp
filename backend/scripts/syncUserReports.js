const mongoose = require("mongoose");
require("dotenv").config({ path: "../config/.env" });

// Import models
const User = require("../models/userModel");
const Report = require("../models/reportModel");

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Function to create report data from user data
const createReportDataFromUser = (user) => {
  return {
    id: user.id,
    name: user.name || "N/A",
    designation: user.designation || "N/A",
    department: user.departmentName || "N/A",
    email: user.email || `${user.id || "user"}@placeholder.email`,
    growthAndHR: {
      joiningDate: user.joiningDate || new Date(),
    },
    finance: {
      currentSalary: (user.salary || 0).toString(),
    },
  };
};

// Main sync function
const syncUserReports = async () => {
  try {
    console.log("🔄 Starting user-report synchronization...\n");

    // Get all users
    const users = await User.find({}).select(
      "id name designation departmentName email joiningDate salary"
    );
    console.log(`📊 Found ${users.length} users in the database`);

    // Get all existing reports
    const existingReports = await Report.find({}).select("id");
    const existingReportIds = new Set(existingReports.map(report => report.id));
    console.log(`📋 Found ${existingReports.length} existing reports`);

    // Find users without reports
    const usersWithoutReports = users.filter(user => !existingReportIds.has(user.id));
    console.log(`🔍 Found ${usersWithoutReports.length} users without reports\n`);

    if (usersWithoutReports.length === 0) {
      console.log("✅ All users already have corresponding reports!");
      return;
    }

    // Create reports for users without them
    const reportsToCreate = usersWithoutReports.map(user => createReportDataFromUser(user));

    console.log("📝 Creating missing reports...");
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Create reports in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < reportsToCreate.length; i += batchSize) {
      const batch = reportsToCreate.slice(i, i + batchSize);
      
      try {
        const createdReports = await Report.insertMany(batch, { ordered: false });
        successCount += createdReports.length;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: Created ${createdReports.length} reports`);
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate key errors
          const duplicateErrors = error.writeErrors || [];
          duplicateErrors.forEach(err => {
            errorCount++;
            errors.push(`Duplicate report for user: ${err.op?.id || 'Unknown'}`);
          });
          
          // Count successful inserts even with some duplicates
          const successfulInBatch = batch.length - duplicateErrors.length;
          successCount += successfulInBatch;
          console.log(`⚠️  Batch ${Math.floor(i / batchSize) + 1}: Created ${successfulInBatch} reports, ${duplicateErrors.length} duplicates skipped`);
        } else {
          console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
          errorCount += batch.length;
          errors.push(`Batch error: ${error.message}`);
        }
      }
    }

    // Summary
    console.log("\n📊 SYNCHRONIZATION SUMMARY:");
    console.log("=" * 50);
    console.log(`👥 Total users: ${users.length}`);
    console.log(`📋 Existing reports: ${existingReports.length}`);
    console.log(`🔍 Users without reports: ${usersWithoutReports.length}`);
    console.log(`✅ Reports created successfully: ${successCount}`);
    console.log(`❌ Failed/Skipped: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\n⚠️  ERRORS/WARNINGS:");
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // Verify final state
    const finalReportCount = await Report.countDocuments();
    const finalUserCount = await User.countDocuments();
    
    console.log("\n🔍 FINAL VERIFICATION:");
    console.log(`👥 Total users: ${finalUserCount}`);
    console.log(`📋 Total reports: ${finalReportCount}`);
    
    if (finalReportCount >= finalUserCount) {
      console.log("✅ SUCCESS: All users now have corresponding reports!");
    } else {
      console.log(`⚠️  WARNING: ${finalUserCount - finalReportCount} users still missing reports`);
    }

  } catch (error) {
    console.error("❌ Synchronization failed:", error);
    throw error;
  }
};

// Function to verify sync status without making changes
const checkSyncStatus = async () => {
  try {
    console.log("🔍 Checking user-report synchronization status...\n");

    const userCount = await User.countDocuments();
    const reportCount = await Report.countDocuments();

    // Get users without reports
    const users = await User.find({}).select("id");
    const reports = await Report.find({}).select("id");
    
    const userIds = new Set(users.map(u => u.id));
    const reportIds = new Set(reports.map(r => r.id));
    
    const usersWithoutReports = users.filter(user => !reportIds.has(user.id));
    const reportsWithoutUsers = reports.filter(report => !userIds.has(report.id));

    console.log("📊 SYNC STATUS REPORT:");
    console.log("=" * 40);
    console.log(`👥 Total users: ${userCount}`);
    console.log(`📋 Total reports: ${reportCount}`);
    console.log(`🔍 Users without reports: ${usersWithoutReports.length}`);
    console.log(`🗑️  Reports without users: ${reportsWithoutUsers.length}`);

    if (usersWithoutReports.length > 0) {
      console.log("\n👥 Users missing reports:");
      usersWithoutReports.slice(0, 10).forEach(user => {
        console.log(`   - ${user.id}`);
      });
      if (usersWithoutReports.length > 10) {
        console.log(`   ... and ${usersWithoutReports.length - 10} more`);
      }
    }

    if (reportsWithoutUsers.length > 0) {
      console.log("\n📋 Reports without corresponding users:");
      reportsWithoutUsers.slice(0, 10).forEach(report => {
        console.log(`   - ${report.id}`);
      });
      if (reportsWithoutUsers.length > 10) {
        console.log(`   ... and ${reportsWithoutUsers.length - 10} more`);
      }
    }

    if (usersWithoutReports.length === 0 && reportsWithoutUsers.length === 0) {
      console.log("\n✅ Perfect sync! All users have corresponding reports.");
    }

    return {
      userCount,
      reportCount,
      usersWithoutReports: usersWithoutReports.length,
      reportsWithoutUsers: reportsWithoutUsers.length,
      isInSync: usersWithoutReports.length === 0
    };

  } catch (error) {
    console.error("❌ Status check failed:", error);
    throw error;
  }
};

// Main execution function
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || "sync";

  try {
    await connectDB();

    switch (command.toLowerCase()) {
      case "check":
      case "status":
        await checkSyncStatus();
        break;
      case "sync":
      case "run":
      default:
        await syncUserReports();
        break;
    }

  } catch (error) {
    console.error("❌ Script execution failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Handle script execution
if (require.main === module) {
  console.log("🚀 User-Report Synchronization Script");
  console.log("=====================================\n");
  
  const args = process.argv.slice(2);
  const command = args[0] || "sync";
  
  if (args.includes("--help") || args.includes("-h")) {
    console.log("USAGE:");
    console.log("  node syncUserReports.js [command]");
    console.log("");
    console.log("COMMANDS:");
    console.log("  sync, run (default) - Create reports for users that don't have them");
    console.log("  check, status       - Check sync status without making changes");
    console.log("  --help, -h          - Show this help message");
    console.log("");
    console.log("EXAMPLES:");
    console.log("  node syncUserReports.js");
    console.log("  node syncUserReports.js sync");
    console.log("  node syncUserReports.js check");
    process.exit(0);
  }

  main();
}

module.exports = {
  syncUserReports,
  checkSyncStatus,
  createReportDataFromUser
};
