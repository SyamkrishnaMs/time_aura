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

    // Check whether admin user already exists
    const existingAdmin = await User.findOne({
      email: "admin@timeaura.com",
    });

    if (existingAdmin) {
      // Change existing user to admin
      existingAdmin.role = "admin";

      // Reset admin password
      existingAdmin.password = await bcrypt.hash(
        "Admin@123",
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
      "Admin@123",
      10
    );

    // Create new admin
    const admin = await User.create({
      name: "Time Aura Admin",
      email: "admin@timeaura.com",
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