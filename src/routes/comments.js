const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  deleteCommentFromOwnPost,
} = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 * TODO: Implement comment routes when comment functionality is added
 */

// TODO: POST /api/comments - Create a comment on a post
router.post("/:post_id", authenticateToken, createComment);

// TODO: PUT /api/comments/:comment_id - Update a comment
router.put("/:comment_id", authenticateToken, updateComment);

// TODO: DELETE /api/comments/:comment_id - Delete a comment
router.delete("/:comment_id", authenticateToken, deleteComment);

// deletes commenst from user post commented by other
router.delete("/:comment_id/on-own-post", authenticateToken, deleteCommentFromOwnPost);

// TODO: GET /api/comments/post/:post_id - Get comments for a post
router.get("/post/:post_id", optionalAuth, getPostComments);


module.exports = router;
