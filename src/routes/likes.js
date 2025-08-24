const express = require("express");
const { authenticateToken } = require("../middleware/auth");

const {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
} = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 * TODO: Implement like routes when like functionality is added
 */

// TODO: POST /api/likes - Like a post
router.post("/:post_id", authenticateToken, likePost);

// // TODO: DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id", authenticateToken, unlikePost);

// TODO: GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id", getPostLikes);



// TODO: GET /api/likes/user/:user_id - Get posts liked by a user
router.get("/user/:user_id", getUserLikes);

//hasUserliked a post
router.get("/hasUserLiked/:post_id", authenticateToken, hasUserLikedPost);



module.exports = router;
