const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 * TODO: Implement this model for the follow functionality
 */

// TODO: Implement followUser function
const followDB = async (id, following_id) => {
  const result = await query(
    `INSERT INTO follows(follower_id, followed_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [id, following_id]
  );

  return result.rowCount > 0;
};

// TODO: Implement unfollowUser function
const unfollowDB = async (id, following_id) => {
  const result = await query(
    `DELETE FROM follows
    WHERE follower_id = $1 AND followed_id = $2`,
    [id, following_id]
  );

  return result.rowCount > 0;
};

// TODO: Implement getFollowing function
const getMyFollowingDB = async (id) => {
  const followings = await query(
    `SELECT u.id, u.username, u.full_name
     FROM follows f
     JOIN users u ON f.followed_id = u.id
     WHERE f.follower_id = $1 AND u.is_deleted = FALSE
     ORDER BY u.username`,
    [id]
  );

  return followings.rows;
};

// TODO: Implement getFollowers function
const getMyFollowersDB = async (id) => {
  const followers = await query(
    `SELECT u.id, u.username, u.full_name
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.followed_id = $1 AND u.is_deleted = FALSE
     ORDER BY u.username`,
    [id]
  );

  return followers.rows;
};


// TODO: Implement getFollowCounts function
const getFollowCountsDB = async (userId) => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*) FROM follows WHERE follower_id = $1) AS following_count,
       (SELECT COUNT(*) FROM follows WHERE followed_id = $1) AS followers_count`,
    [userId]
  );

  return result.rows[0] || { followingCount: 0, followersCount: 0 };
};

module.exports = {
  // Functions will be implemented here
  getMyFollowersDB,
  getMyFollowingDB,
  followDB,
  unfollowDB,
  getFollowCountsDB,
};
