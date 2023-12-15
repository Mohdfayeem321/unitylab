const { createUserData, loginUser } = require('../controller/users');

const {
    createCatalog,
    sellerCatalogList,
    sellerList,
    createOrder,
    orderList
} = require('../controller/products');

const { Authentication, Authorization } = require('../middlewares/auth');

const express = require('express');

const router = express.Router();

router.post("/register", createUserData);

router.post("/login", loginUser);

router.get("/buyer/list-of-sellers", Authentication, sellerList);

router.post("/seller/create-catalog", Authentication, Authorization, createCatalog);

router.get("/buyer/seller-catalog/:seller_id", sellerCatalogList);

router.post("/buyer/create-order/:seller_id", Authentication, createOrder);

router.get("/seller/orders", Authentication, Authorization, orderList);

module.exports = router;
