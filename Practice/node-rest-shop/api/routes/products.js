const express = require("express");
const router = express.Router();
router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Handling GET request to /products..."
  });
});

router.post("/", (req, res, next) => {
  res.status(201).json({
    message: "Handling POST request to /products..."
  });
});

// Get request for individual products  [ get with productsId]
router.get("/:productsId", (req, res, next) => {
  const id = req.params.productsId;
  id == "special"
    ? res.status(200).json({ message: "You discorverd special ID", id: id })
    : res.status(200).json({ message: `you passed the ID` });
});

// update product by id [ update with productId ]
router.patch("/:productsId", (req, res, next) => {
  res.status(200).json({ message: "Updated  products!" });
});

// delete product by id [ delete with productsId ]
router.delete("/:productsId", (req, res, next) => {
  res.status(200).json({ message: "Deleted products!" });
});

module.exports = router;
