const {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  feed,
  updatePost,
  searchContent,
} = require("../models/post.js");
const logger = require("../utils/logger");

/**
 * Create a new post
 */
const create = async (req, res) => {
  try {
    const { content, media_url, comments_enabled } = req.validatedData;
    const userId = req.user?.id;

    const post = await createPost({
      user_id: userId,
      content,
      media_url,
      comments_enabled,
    });

    logger.verbose(`User ${userId} created post ${post.id}`);

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    logger.critical("Create post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a single post by ID
 */
const getById = async (req, res) => {
  try {
    const { post_id } = req.params;

    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({
        error: "Invalid post Id"
      });
    }

    const post = await getPostById(parseInt(post_id));

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    logger.verbose(`[getById] for post_id=${post_id}`);
    res.status(200).json({ post });
  } catch (error) {
    logger.critical("[getById] error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts by a specific user
 */
const getUserPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (isNaN(user_id)) {
      return res.status(400).json({
        error: "Invalid user Id",
      });
    }

    const posts = await getPostsByUserId(parseInt(user_id), limit, offset);

    logger.verbose(`[getUserPosts] retrieved posts for user_id=${user_id}`);
    res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("getUserPosts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user's posts
 */
const getMyPosts = async (req, res) => {
  try {
    // const { user_id: userId } = req.params; // bug
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(userId, limit, offset);

    logger.verbose(`[getMyPosts] retrieved posts for user_id=${userId}`);
    res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("getMyPosts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a post
 */
const remove = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;
    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({
        error: "Invalid post Id",
      });
    }

    const success = await deletePost(parseInt(post_id), userId);

    if (!success) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`[remove] post ${post_id} deleted by user_id=${userId}`);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.critical("Delete post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement getFeed controller for content feed functionality
// This should return posts from users that the current user follows
const getFeed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await feed(userId, limit, offset);

    logger.verbose(`[getFeed] feed for ${userId}`);
    res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
    
  } catch (error) {
    logger.critical("getFeed post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// TODO: Implement updatePost controller for editing posts
const update = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { post_id } = req.params;
    const value = req.validatedData;

    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({
        error: "Invalid post Id",
      });
    }

    const post = await getPostById(post_id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found"
      });
    }
    if (post.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to update this post" });
    }

    const updatedPost = await updatePost(post_id, userId, value);
    if (!updatedPost) {
      return res.status(400).json({
        error: "No changes made to the post",
      });
    }
    logger.verbose(`[update] updated post_id=${post_id} by user_id=${userId}`);
    res.status(200).json({
      post: updatedPost
    });

  } catch (error) {
    logger.critical("Update post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// TODO: Implement searchPosts controller for searching posts by content
const searchByContent = async (req, res) => {
  try {
    const { key }= req.body;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!key) {
      return res.status(400).json({
        error: "missing key in body"
      });
    }

    const posts = await searchContent(key, limit, offset)

    logger.verbose(`[searchByContent] searched posts with key="${key}"`);
    res.status(200).json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("searchByContent error:", error);
    res.status(500).json({ error: "Internal server error" });    
  }
}

module.exports = {
  create,
  getById,
  getUserPosts,
  getMyPosts,
  remove,
  getFeed,
  update,
  searchByContent,
};
