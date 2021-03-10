const Product = require("../models/product");
const errorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsynError");

exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(200).json({
    success: true,
    product,
  });
});

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find().lean();
  setTimeout(() => {
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  }, 2000);
});

exports.productSearch = catchAsyncErrors(async (req, res, next) => {
  const { search } = req.query;
  console.log("SEARCH", search);
  let order = req.query.order ? req.query.order : "asc"; //ascendent or descendent
  let sortBy = req.query.sortBy ? req.query.sortBy : "name"; //id, name, etc
  let limit = req.query.limit ? parseInt(req.query.limit) : 20; //limit per page
  let skip = req.query.skip ? parseInt(req.query.skip) : 0; //offset
  let higherThen = req.query.gt ? req.query.gt : 0
  let lowerThen = req.query.lt ? req.query.lt : 10000000
  if (search) {
    Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    })
      .sort([[sortBy, order]])
      .limit(limit)
      .skip(skip)
      .where('price').gt(higherThen).lt(lowerThen)
      .exec((err, products) => {
        console.log(sortBy);
        if (err) {
          return next(new errorHandler("Product not found", 404));
        }
        res.status(200).json({
          success: true,
          count: products.length,
          products,
        });
      });
  } else {
    const products = await Product.find()
      .sort([[sortBy, order]])
      .limit(limit)
      .skip(skip)
      .where('price').gt(higherThen).lt(lowerThen)
      .lean();
    setTimeout(() => {
      res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    }, 2000);
  }
});

exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    return next(new errorHandler("Product not found", 404));
  }

  setTimeout(() => {
    return res.status(200).json({
      message: true,
      product,
    });
  }, 2000);
});

// UPDATE PRODUCT => /api/v1/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new errorHandler("Product not found", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.send(200).json({
    success: true,
    product,
  });
});

// DELETE PRODUCT => /api/v1/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new errorHandler("Product not found", 404));
  }

  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product is deleted.",
  });
});

exports.listBySearch = catchAsyncErrors(async (req, res, next) => {
  let order = req.body.order ? req.body.order : "desc"; //ascendent or descendent
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id"; //id, name, etc
  let limit = req.query.limit ? parseInt(req.query.limit) : 20; //limit per page
  let skip = req.query.skip ? parseInt(req.query.skip) : 0; //offset
  let findArgs = {};
  const filtersBody = req.body.filters;
  console.log(req.body.filters);

  for (let key in filtersBody) {
    console.log("KEY", key);
    if (filtersBody[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: filtersBody[key][0],
          $lte: filtersBody[key][1],
        };
      } else {
        findArgs[key] = filtersBody[key];
      }
    }
  }

  console.log("findArgs", findArgs);
  Product.find(findArgs)
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      console.log("LIMTE", limit);
      if (err) {
        return next(new errorHandler("Product not found", 404));
      }
      res.json({
        size: data.length,
        data,
      });
    });
});
