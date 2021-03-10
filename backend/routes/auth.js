const router = require("express").Router();

const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  authorizeRules,
  allUsers,
  updateUser,
  getUserDetails,deleteUser
} = require("../controllers/userController");
const {isAuthenticatedUser} = require('../middleware/auth')

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/password/forgot", forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.get('/me',isAuthenticatedUser, getUserProfile)
router.put('/password/update', isAuthenticatedUser, updatePassword)
router.put('/me/update', isAuthenticatedUser, updateProfile)
router.get("/logout", logout);

// admin routes
router.get('/admin/users', isAuthenticatedUser, authorizeRules('admin'), allUsers)
router.get('/admin/user/:id', isAuthenticatedUser, authorizeRules('admin'), getUserDetails)
router.put('/admin/user/:id', isAuthenticatedUser, authorizeRules('admin'), updateUser)
router.delete('/admin/user/:id', isAuthenticatedUser, authorizeRules('admin'), deleteUser)

module.exports = router;
