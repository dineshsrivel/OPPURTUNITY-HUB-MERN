/**
 * Admin Account Management
 * ─────────────────────────
 * Two ways to use this file:
 *
 * 1. As a CLI script (run once):
 *      node server/utils/createAdmin.js
 *    or:
 *      npm run create:admin   (from /server)
 *
 * 2. As a module imported by server.js:
 *      const { ensureAdminExists } = require('./utils/createAdmin');
 *      connectDB().then(() => ensureAdminExists());
 *
 * Default admin credentials:
 *   Email    : admin@opportunityhub.com
 *   Password : Admin@123  (bcrypt-hashed, 12 rounds)
 *   Role     : admin
 */

const ADMIN_EMAIL    = 'admin@opportunityhub.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME     = 'Admin';

/**
 * Ensures the default admin account exists in MongoDB.
 * Safe to call on every server start — exits immediately if admin already exists.
 * @returns {Promise<void>}
 */
const ensureAdminExists = async () => {
  const User = require('../models/User');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Already present — nothing to do
    return;
  }

  // The User model pre-save hook hashes the password automatically (bcrypt, 12 rounds)
  await User.create({
    name:       ADMIN_NAME,
    email:      ADMIN_EMAIL,
    password:   ADMIN_PASSWORD,
    role:       'admin',
    isVerified: true,
    isActive:   true,
  });

  console.log(`✅  Default admin account created: ${ADMIN_EMAIL}`);
};

module.exports = { ensureAdminExists };

// ── CLI Entry Point ───────────────────────────────────────────────────────────
// Only runs when called directly (not when imported as a module)
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅  Connected to MongoDB');

      const User = require('../models/User');
      const existing = await User.findOne({ email: ADMIN_EMAIL });

      if (existing) {
        console.log(`ℹ️   Admin account already exists.`);
        console.log(`     Email  : ${existing.email}`);
        console.log(`     Role   : ${existing.role}`);
        console.log(`     Active : ${existing.isActive}`);
      } else {
        await ensureAdminExists();
        console.log('🎉  Admin account created successfully!');
        console.log(`     Email    : ${ADMIN_EMAIL}`);
        console.log(`     Password : ${ADMIN_PASSWORD}  (stored as bcrypt hash)`);
        console.log(`     Role     : admin`);
      }
    } catch (err) {
      console.error('❌  Error:', err.message);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log('🔌  Disconnected from MongoDB');
    }
  })();
}
