const express = require("express");
const { route } = require("./products");
const router = express.Router(); //to create a new router object

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Order is fetched successfully"
  });
});

router.post("/", (req, res, next) => {
  res.status(201).json({
    message: "Order is Created successfully"
  });
});

// get the order by id

router.get("/:orderId", (req, res, next) => {
  res.status(200).json({
    message: "Order details",
    orderId: req.params.orderId
  });
});

// delete order by id

router.delete("/:orderId", (req, res, next) => {
  res.status(200).json({
    message: "Order deleted successfully",
    orderId: req.params.orderId
  });
});

module.exports = router;
