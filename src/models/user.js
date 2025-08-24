const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name]
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// TODO: Implement findUsersByName function for search functionality
// This should support partial name matching and pagination
const searchUserDB = async (key, page, limit) => {
  const offSet = (page - 1) * limit;
  const searchKey = `%${key}%`;

  const totalResult = await query(
    `SELECT COUNT(*) FROM users
     WHERE (username ILIKE $1  OR full_name ILIKE $1)
     AND is_deleted = FALSE`,
    [searchKey]
  );

  const total = parseInt(totalResult.rows[0].count, 10);
  const totalPages = Math.ceil(total / limit);

  const result = await query(
    `SELECT id, username, full_name 
     FROM users 
     WHERE (username ILIKE $1 OR full_name ILIKE $1) 
       AND is_deleted = FALSE
     ORDER BY username
     LIMIT $2 OFFSET $3`,
    [searchKey, limit, offSet]
  );

  return {
    users: result.rows,
    total,
    page,
    totalPages,
  };
};

// TODO: Implement getUserProfile function that includes follower/following counts
const getUserProfile = async (id) => {
  const userRes = await query(
    `SELECT id, username, full_name, email, created_at
     FROM users
     WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );
  if (userRes.rows.length === 0) {
    return null;
  }

  const user = userRes[0];

  const followersResult = await query(
    `SELECT COUNT(*) AS followers_count
     FROM follows
     WHERE followed_id = $1`,
    [id]
  );

  const followingResult = await query(
    `SELECT COUNT(*) AS following_count
     FROM follows
     WHERE follower_id = $1`,
    [id]
  );

  return {
    ...user,
    followersCount: parseInt(followersResult.rows[0].followers_count, 10),
    followingCount: parseInt(followingResult.rows[0].following_count, 10),
  };
};

// TODO: Implement updateUserProfile function for profile updates
const updateUserProfileDB = async (userId, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in data) {
    fields.push(`${key} = $${idx}`);
    values.push(data[key]);
    idx++;
  }

  if (fields.length === 0) return null;

  values.push(userId);

  const result = await query(
    `UPDATE users
     SET ${fields.join(", ")}
     WHERE id = $${idx}
     RETURNING id, username, email, full_name, created_at
    `,
    values
  );
  const updatedUser = result.rows?.[0] || null;
  return updatedUser;
};

//checks if email exists
const doesEmailExists = async (email) => {
  const result = await query(`SELECT 1 FROM users WHERE email = $1 LIMIT 1`, [email]);
  return result.rowCount > 0;
}

//checks if username exists
const doesUsernameExists = async (username) => {
  const result = await query(`SELECT 1 FROM users WHERE username = $1 LIMIT 1`, [username]);
  return result.rowCount > 0;
}




module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  searchUserDB,
  getUserProfile,
  updateUserProfileDB,
  doesEmailExists,
  doesUsernameExists,
};
