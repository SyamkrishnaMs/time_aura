import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import connectDB from "./app/lib/mongodb.js";
import User from "./app/models/user.schema.js";

const seedAdmin = async () => {
  try {
    console.log("Starting admin seed...");

    await connectDB();

    console.log("MongoDB connected");

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check whether admin credentials exist
    if (!adminEmail || !adminPassword) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are missing in .env.local"
      );
    }

    // Check whether admin user already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      // Change existing user to admin
      existingAdmin.role = "admin";

      // Reset admin password
      existingAdmin.password = await bcrypt.hash(
        adminPassword,
        10
      );

      // Save changes
      await existingAdmin.save();

      console.log("Existing user updated to admin");
      console.log("Name:", existingAdmin.name);
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);

      process.exit(0);
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    // Create new admin
    const admin = await User.create({
      name: "Time Aura Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    process.exit(0);
  } catch (error) {
    console.error("Admin seed error:", error);
    process.exit(1);
  }
};

seedAdmin();