// scripts/set-admin-credentials.ts
// Usage: npx ts-node scripts/set-admin-credentials.ts
// Ya: npx tsx scripts/set-admin-credentials.ts

import mongoose from "mongoose";
import * as readline from "readline";

// ---- Yahan apna MongoDB URL daalo ----
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/yourdb";

const adminCredentialsSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    mobile: String,
    role: {
      type: String,
      enum: ["user", "deliveryBoy", "admin"],
      default: "user",
    },
    image: String,
    adminCredentials: adminCredentialsSchema,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("\n🔐 Admin Credentials Setup\n");

  await mongoose.connect(MONGODB_URL);
  console.log("✅ Database se connect ho gaya\n");

  const email = await ask("Email daalo (jis user ko admin banana hai): ");
  const username = await ask("Admin Username: ");
  const password = await ask("Admin Password: ");

  const user = await User.findOne({ email: email.trim() });

  if (!user) {
    console.log(`\n❌ Koi user nahi mila email: ${email}`);
    rl.close();
    await mongoose.disconnect();
    return;
  }

  await User.findOneAndUpdate(
    { email: email.trim() },
    {
      adminCredentials: {
        username: username.trim(),
        password: password.trim(), // Production mein bcrypt use karein
      },
    },
    { new: true }
  );

  console.log(`\n✅ Admin credentials set ho gaye!`);
  console.log(`   Email    : ${email.trim()}`);
  console.log(`   Username : ${username.trim()}`);
  console.log(`   Password : ${"*".repeat(password.length)}`);
  console.log(`\nAb yeh user admin role select karke login kar sakta hai.\n`);

  rl.close();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error:", err);
  rl.close();
  process.exit(1);
});
