const express = require("express");
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  deleteProduct,
  updateProduct,
  productSearch,
  listBySearch,
} = require("../controllers/productController");
const { isAuthenticatedUser } = require("../middleware/auth");
const { authorizeRules } = require("../controllers/userController");

router.get("/products", getProducts);
router.get("/product/:id", getSingleProduct);
router.get("/products/find", productSearch);

router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRules("user"), newProduct);
router
  .route("/admin/product/:id")
  .put(isAuthenticatedUser, authorizeRules("user"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRules("user"), deleteProduct);
router.get("/listBySearch", listBySearch);

module.exports = router;
