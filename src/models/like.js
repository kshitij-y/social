const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 * TODO: Implement this model for the like functionality
 */



// TODO: Implement likePost function
// cannot like our own post
const likePostDB = async (userId, post_id) => {
  const result = await query(
    `INSERT INTO likes(post_id, user_id)
     SELECT $1, $2
     FROM posts p
     WHERE p.id = $1 AND p.is_deleted = false AND p.user_id != $2
     ON CONFLICT DO NOTHING`,
    [post_id, userId]
  );

  return result.rowCount > 0;
};


// TODO: Implement unlikePost function
const unlikePostDB = async (userId, post_id) => {
  const result = await query(
    `DELETE FROM likes l
     USING posts p
     WHERE l.post_id = $1 AND l.user_id = $2
       AND l.post_id = p.id AND p.is_deleted = false`,
    [post_id, userId]
  );

  return result.rowCount > 0;
};


// TODO: Implement getPostLikes function
const getPostLikesDB = async (post_id) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name
     FROM likes l
     JOIN users u ON l.user_id = u.id
     JOIN posts p ON l.post_id = p.id
     WHERE l.post_id = $1 AND p.is_deleted = false`,
    [post_id]
  );

  return {
    count: result.rowCount,
    users: result.rows,
  };
};


// TODO: Implement getUserLikes function
const getUserLikesDB = async (userId) => {
  const result = await query(
    `SELECT l.post_id
     FROM likes l
     JOIN posts p ON l.post_id = p.id
     WHERE l.user_id = $1 AND p.is_deleted = false`,
    [userId]
  );

  return result.rows;
};


// TODO: Implement hasUserLikedPost function
const hasUserLikedPostDB = async (userId, post_id) => {
  const result = await query(
    `SELECT 1
     FROM likes l
     JOIN posts p ON l.post_id = p.id
     WHERE l.user_id = $1 AND l.post_id = $2
       AND p.is_deleted = false`,
    [userId, post_id]
  );

  return result.rowCount > 0;
};



module.exports = {
  // Functions will be implemented here
  likePostDB,
  unlikePostDB,
  hasUserLikedPostDB,
  getPostLikesDB,
  getUserLikesDB,
};
