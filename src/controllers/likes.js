// TODO: Implement likes controller
// This controller should handle:
// - Liking posts
// - Unliking posts
// - Getting likes for a post
// - Getting posts liked by a user
const {
  likePostDB,
  unlikePostDB,
  hasUserLikedPostDB,
  getPostLikesDB,
  getUserLikesDB,
} = require("../models/like");
const logger = require("../utils/logger");

// TODO: Implement likePost function
const likePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { post_id } = req.params;

    if (!post_id) {
      return res.status(400).json({
        error: "Post ID is required",
      });
    }

    const liked = await likePostDB(userId, post_id);
    if (!liked) {
      return res.status(409).json({
        message: "Already liked this post",
      });
    }

    logger.verbose(`${post_id} post liked by ${userId}`);

    res.status(200).json({
      message: "Post liked",
    });
  } catch (error) {
    logger.critical("likePostController error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement unlikePost function
const unlikePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { post_id } = req.params;

    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const removed = await unlikePostDB(userId, post_id);
    if (!removed) {
      return res.status(404).json({ message: "Like not found" });
    }
    logger.verbose(`${post_id} post unliked by ${userId}`);
    res.status(200).json({ message: "Post unliked" });
  } catch (error) {
    logger.critical("unlikePost error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement getPostLikes function
const getPostLikes = async (req, res) => {
  try {
    const { post_id } = req.params;

    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({
        error: "Invalid post Id",
      });
    }

    const likes = await getPostLikesDB(post_id);
    logger.verbose(`[getPostLikes] on post_id: ${post_id}`);
    res.status(200).json({ likes });
  } catch (error) {
    logger.critical("getPostLikes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement getUserLikes function
const getUserLikes = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const posts = await getUserLikesDB(user_id);

    logger.verbose(`[getUserLikes] on user_id: ${user_id}`);

    res.status(200).json({ posts });
  } catch (error) {
    logger.critical("[getUserLikes] error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Has user liker a post
const hasUserLikedPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { post_id } = req.params;

    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({ error: "Invalid post Id" });
    }

    const result = await hasUserLikedPostDB(userId, post_id);
    logger.verbose("[hasUserLikedPost] called", { post_id, userId });
    res.status(200).json({
      result,
    });
  } catch (error) {
    logger.critical("[hasUserLikedPost] error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
};
