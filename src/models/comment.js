const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 * TODO: Implement this model for the comment functionality
 */

// TODO: Implement createComment function
const createCommentDB = async (userId, post_id, content) => {
  const result = await query(
    `INSERT INTO comments(user_id, post_id, content)
     SELECT $1, p.id, $2
     FROM posts p
     WHERE p.id = $3 AND p.is_deleted = false AND p.comments_enabled = true
     RETURNING *`,
    [userId, content, post_id]
  );

  return result.rows[0] || null;
};


// TODO: Implement updateComment function
const updateCommentDB = async (comment_id, content) => {
  const result = await query(
    `UPDATE comments
     SET content = $1
     WHERE id = $2
     RETURNING *`,
    [content, comment_id]
  );
  return result.rows[0];
};

// TODO: Implement deleteComment function
const deleteCommentDB = async (comment_id) => {
  const result = await query(`DELETE FROM comments WHERE id = $1`, [comment_id]);

  return result.rowCount > 0;
};

// TODO: Implement getPostComments function
const getPostCommentsDB = async (postId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT c.id, c.content, c.created_at,
            u.id AS user_id, u.username, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return result.rows;
};


// TODO: Implement getCommentById function
const getCommentByIdDB = async (comment_id) => {
  const result = await query(`SELECT * FROM comments WHERE id = $1`, [
    comment_id,
  ]);
  return result.rows[0] || null;
};

module.exports = {
  // Functions will be implemented here
  createCommentDB,
  getCommentByIdDB,
  updateCommentDB,
  deleteCommentDB,
  getPostCommentsDB,
};
