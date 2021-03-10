const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String, 
      unique:true,
      required: [true, "Please enter product name"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      maxlength: [5, "Product price cannot exceed 5 characters"],
      default: 0.0,
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Please select category for this product"],
      enum: {
        values: [
          "Eletronics",
          "Cameras",
          "Acessories",
          "Headphones",
          "Food",
          "Books",
          "clothes/Shoes",
          "Beauty/Health",
          "Sports",
          "Outdoor",
          "Home",
        ],
        message: "Please select correct category for the product",
      },
    },
    seller: {
      type: String,
      required: [true, "Please enter product seller"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      maxlength: [5, "Product name cannot exceed 5 characters "],
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user:{
      type:mongoose.Schema.ObjectId,
      ref:'User',
      required:true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
