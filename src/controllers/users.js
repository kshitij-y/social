// TODO: Implement users controller
// This controller should handle:
// - Following a user
// - Unfollowing a user
// - Getting users that the current user is following
// - Getting users that follow the current user
// - Getting follow counts for a user

const {
  searchUserDB,
  getUserProfile,
  updateUserProfileDB,
  doesEmailExists,
  doesUsernameExists,
} = require("../models/user");
const {
  getMyFollowersDB,
  getMyFollowingDB,
  followDB,
  unfollowDB,
  getFollowCountsDB,
} = require("../models/follow");
const logger = require("../utils/logger");

// TODO: Implement follow function
const follow = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { following_id } = req.body;

    if (!following_id) {
      return res.status(400).json({
        error: "following_id is required",
      });
    }

    if (userId === following_id) {
      return res.status(400).json({
        error: "Cannot follow yourself",
      });
    }

    const result = await followDB(userId, following_id);
    if (!result) {
      return res.status(409).json({
        message: "Already following this user",
      });
    }

    logger.verbose(`${userId} started following ${following_id}`);

    res.status(200).json({ message: "Successfully followed the user" });
  } catch (error) {
    logger.critical("follow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement unfollow function
const unfollow = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { following_id } = req.body;

    if (!following_id)
      return res.status(400).json({
        error: "following_id is required",
      });
    if (userId === following_id)
      return res.status(400).json({
        error: "Cannot unfollow yourself",
      });

    const result = await unfollowDB(userId, following_id);
    if (!result) {
      return res.status(409).json({ message: "You do not follow this user" });
    }

    logger.verbose(`${userId} unfollowed ${following_id}`);
    res.status(200).json({ message: "Successfully unfollowed the user" });
  } catch (error) {
    logger.critical("unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement getMyFollowing function
const getMyFollowing = async (req, res) => {
  try {
    const userId = req.user?.id;

    const following = await getMyFollowingDB(userId);

    logger.verbose(`[getMyFollowing] by ${userId}`);
    res.status(200).json(following);
  } catch (error) {
    logger.critical("getMyFollowing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement getMyFollowers function
const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user?.id;

    const followers = await getMyFollowersDB(userId);

    logger.verbose(`[getMyFollowers] by ${userId}`);
    res.status(200).json(followers);
  } catch (error) {
    logger.critical("getMyFollowers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const searchUser = async (req, res) => {
  try {
    const { key, page = 1, limit = 20 } = req.query;

    if (!key || key.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await searchUserDB(key, pageNum, limitNum);

    logger.verbose(`[searchUser] for key: ${key}`);
    res.status(200).json(result);
  } catch (error) {
    logger.critical("searchUser error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.user?.id;

    const userRes = await getUserProfile(userId);

    if (!userRes) return res.status(404).json({ error: "User not found" });

    logger.verbose(`[getUserStats] for user: ${userId}`);
    res.status(200).json(userRes);
  } catch (error) {
    logger.critical("getUserStats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const updates = req.validatedData;

    if (updates.email) {
      const emailExists = await doesEmailExists(updates.email);
      if (emailExists) {
        return res.status(400).json({
          error: "Email already taken",
        });
      }
    }

    if (updates.username) {
      const usernameExists = await doesUsernameExists(updates.username);
      if (usernameExists) {
        return res.status(400).json({
          error: "Username already taken",
        });
      }
    }

    const updatedUser = await updateUserProfileDB(userId, updates);

    if (!updatedUser) {
      return res.status(400).json({ error: "No changes were made" });
    }

    logger.verbose(`[updateUserProfile] updated profile for user_id=${userId}`);
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    logger.critical("updateUserProfile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// follow stats for any user
const getFollowCounts = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id)
      return res.status(400).json({
        error: "User ID required",
      });

    const counts = await getFollowCountsDB(user_id);
    logger.verbose(`[getFollowCounts] of user_id: ${user_id}`);
    res.status(200).json(counts);
  } catch (error) {
    logger.critical("getFollowCounts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  searchUser,
  getUserStats,
  getMyFollowers,
  getMyFollowing,
  follow,
  unfollow,
  updateUserProfile,
  getFollowCounts,
};
