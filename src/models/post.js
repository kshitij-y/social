const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
}) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, NOW(), false)
     RETURNING id, user_id, content, media_url, comments_enabled, created_at`,
    [user_id, content, media_url, comments_enabled],
  );

  return result.rows[0];
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*,
     u.username,
     u.full_name,
     (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
     (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.is_deleted = FALSE`,
    [postId]
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT
      p.*,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.is_deleted = false
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = true WHERE id = $1 AND user_id = $2",
    [postId, userId],
  );

  return result.rowCount > 0;
};

// TODO: Implement getFeedPosts function that returns posts from followed users
// This should include pagination and ordering by creation date
const feed = async (userId, limit, offset = 0) => {
  const posts = await query(
    `SELECT p.id, p.user_id, p.content, p.media_url, p.comments_enabled, p.created_at,
     u.username, u.full_name,
     (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes,
     (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.is_deleted = FALSE
      AND (p.user_id = $1 OR p.user_id IN (
         SELECT followed_id
         FROM follows
         WHERE follower_id = $1
       ))
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  return posts.rows;
}

// TODO: Implement updatePost function for editing posts
const updatePost = async (post_id, userId, data) => {
  const fields = [];
  const values = [];

  let idx = 1;

  for (const key of ["content", "media_url", "comments_enabled"]) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }

  if (fields.length === 0) return null;
  values.push(post_id, userId);
  console.log("reached here")

  const postRes = await query(
    `UPDATE posts
    SET ${fields.join(", ")}
    WHERE id = $${idx} AND user_id = $${idx+1} AND is_deleted = FALSE
    RETURNING *`,
    values
  );

  return postRes.rows[0];
}

// TODO: Implement searchPosts function for content search
const searchContent = async (content, limit, offset = 0) => {
  const posts = await query(
    `SELECT 
       p.id, p.content, p.media_url, p.comments_enabled, p.created_at,
       u.username, u.full_name
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.is_deleted = FALSE
       AND p.content ILIKE $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${content}%`, limit, offset]
  );

  return posts.rows;
};

//checks if a post is deleted
const isDeleted = async (id) => {
  const result = await query(
    `SELECT is_deleted FROM posts WHERE id = $1`, [id]
  );

  if (result.rowCount === 0) return true;

  return result.rows[0].is_deleted;
}


module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  feed,
  updatePost,
  searchContent,
  isDeleted,
};
