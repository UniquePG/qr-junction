/**
 * Create or update an admin account.
 *
 * Usage:
 *   node scripts/index.js you@domain.com YourPassword
 *   npm run admin:create -- you@domain.com YourPassword
 *
 * If the email already exists in Firebase or Postgres, the password is replaced
 * and the role is set to ADMIN (use --owner for OWNER).
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");

const MIN_PASSWORD_LENGTH = 6;

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];

  for (const arg of argv) {
    if (arg.startsWith("--")) flags.add(arg.slice(2).toLowerCase());
    else positional.push(arg);
  }

  return {
    email: (positional[0] || "").trim().toLowerCase(),
    password: positional[1] || "",
    role: flags.has("owner") ? "OWNER" : "ADMIN",
  };
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function initFirebase() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY in .env");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  }

  return admin.auth();
}

async function upsertFirebaseUser(auth, email, password) {
  try {
    const existing = await auth.getUserByEmail(email);
    const user = await auth.updateUser(existing.uid, {
      password,
      emailVerified: true,
      disabled: false,
    });
    return { user, created: false };
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    const user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      disabled: false,
    });
    return { user, created: true };
  }
}

async function upsertDbUser(prisma, firebaseUser, email, password, role) {
  const passwordHash = hashPassword(password);
  const name = email.split("@")[0] || "Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        firebaseUid: firebaseUser.uid,
        passwordHash,
        role,
        provider: "password",
        providerId: firebaseUser.uid,
        emailVerified: true,
        name: existing.name || name,
      },
    });
    return { user, created: false };
  }

  const user = await prisma.user.create({
    data: {
      firebaseUid: firebaseUser.uid,
      email,
      name,
      passwordHash,
      role,
      provider: "password",
      providerId: firebaseUser.uid,
      emailVerified: true,
    },
  });
  return { user, created: true };
}

async function main() {
  loadEnv();

  const { email, password, role } = parseArgs(process.argv.slice(2));
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Usage: node scripts/index.js <email> <password> [--owner]");
    process.exit(1);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }

  const auth = initFirebase();
  const prisma = new PrismaClient();

  try {
    const { user: firebaseUser, created: firebaseCreated } = await upsertFirebaseUser(
      auth,
      email,
      password,
    );
    const { user: dbUser, created: dbCreated } = await upsertDbUser(
      prisma,
      firebaseUser,
      email,
      password,
      role,
    );

    const action = firebaseCreated && dbCreated ? "Created" : "Updated";
    console.log(`${action} ${role} account ${email}`);
    console.log(`User id: ${dbUser.id}`);
    console.log("Sign in at /admin/login");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
