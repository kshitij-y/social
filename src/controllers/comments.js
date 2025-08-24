// TODO: Implement comments controller
// This controller should handle:
// - Creating comments on posts
// - Editing user's own comments
// - Deleting user's own comments
// - Getting comments for a post
// - Pagination for comments

const {
  createCommentDB,
  updateCommentDB,
  deleteCommentDB,
  getPostCommentsDB,
  getCommentByIdDB,
} = require("../models/comment");
const { isDeleted, getPostById } = require("../models/post");
const logger = require("../utils/logger");

// TODO: Implement createComment function
const createComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { post_id } = req.params;
    const { content } = req.body;

    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({
        error: "Post ID is required",
      });
    }

    if (await isDeleted(post_id)) {
      return res.status(404).json({
        error: "Invalid Post",
      });
    }

    const comment = await createCommentDB(userId, post_id, content);

    logger.verbose(`new comment create by ${userId}`);

    res.status(201).json({ comment });
  } catch (error) {
    logger.critical("createComment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement updateComment function
const updateComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { comment_id } = req.params;
    const { content } = req.body;

    if (!comment_id || isNaN(comment_id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content cannot be empty" });
    }

    const comment = await getCommentByIdDB(comment_id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: "You are not authorized" });
    }

    const updatedComment = await updateCommentDB(comment_id, content);

    logger.verbose(`${comment_id} comment updated by ${userId}`);

    res.status(200).json({ comment: updatedComment });
  } catch (error) {
    logger.critical("updateComment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement deleteComment function
const deleteComment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { comment_id } = req.params;

    if (!comment_id || isNaN(comment_id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await getCommentByIdDB(comment_id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: "You are not authorized" });
    }

    const deleted = await deleteCommentDB(comment_id);

    if (!deleted) {
      return res.status(400).json({ error: "Comment could not be deleted" });
    }
    logger.verbose(`${comment_id} comment deleted by ${userId}`);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    logger.critical("deleteComment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// TODO: Implement getPostComments function
const getPostComments = async (req, res) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!post_id || isNaN(post_id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const comments = await getPostCommentsDB(post_id, limit, offset);

    logger.verbose(`[getPostComments] on post_id: ${post_id}`);

    res.status(200).json({
      comments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    logger.critical("getPostComments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// to delete any comment on user post
const deleteCommentFromOwnPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { comment_id } = req.params;

    const comment = await getCommentByIdDB(comment_id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const post = await getPostById(comment.post_id);
    if (post.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    const deleted = await deleteCommentDB(comment_id);
    if (!deleted) {
      return res.status(400).json({ error: "Could not delete comment" });
    }

    logger.verbose(`${comment_id} comment deleted by ${userId}`);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    logger.critical("deleteCommentFromOwnPost error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  // Functions will be implemented here
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  deleteCommentFromOwnPost,
};
