const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { searchUser, getUserStats, getMyFollowers, getMyFollowing,follow, unfollow, updateUserProfile, getFollowCounts } = require("../controllers/users");
const { validateRequest, updateUserSchema } = require("../utils/validation");

const router = express.Router();

/**
 * User-related routes
 * TODO: Implement user routes when follow functionality is added
 */

// TODO: POST /api/users/follow - Follow a user
router.post("/follow", authenticateToken, follow);

// TODO: DELETE /api/users/unfollow - Unfollow a user
router.delete("/unfollow", authenticateToken, unfollow);

// TODO: GET /api/users/following - Get users that current user follows
router.get("/following", authenticateToken, getMyFollowing);

// TODO: GET /api/users/followers - Get users that follow current user
router.get("/followers", authenticateToken, getMyFollowers);

// TODO: GET /api/users/stats - Get follow stats for current user
router.get("/stats", authenticateToken, getUserStats);

// TODO: POST /api/users/search - Find users by name // should be GET
router.get("/search", authenticateToken, searchUser);

// PUT api/users/update - update user table
router.put("/update", authenticateToken, validateRequest(updateUserSchema), updateUserProfile);

// follow count for any user
router.get("/stats/:user_id", optionalAuth, getFollowCounts);



module.exports = router;
