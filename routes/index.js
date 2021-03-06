const express = require("express");
const router = express.Router();

const session = require("express-session");
const MongoStore = require("connect-mongo");

const authRoutes = require("./auth-routes");
const itemRoutes = require("./item-routes");
const cartRoutes = require("./cart-routes");
const orderRoutes = require("./order-routes");
const userRoutes = require("./user-routes");
const adminRoutes = require("./admin-routes");
const catalogueRoutes = require("./catalogue-routes");

const auth = require("../middleware/authenticate");
const adminAuth = require("../middleware/admin-auth");
const customerAuth = require("../middleware/customer-auth");
const storeAuth = require("../middleware/store-auth");

const sessionConfig = {
  name: "UID", // name of cookie
  secret: process.env.COOKIE_SECRET, // secret that makes the cookie effective
  proxy: true,
  cookie: {
    maxAge: 1000 * 60 * 60, // time span of cookie in ms
    // set to true in production for HTTPS only access
    // set to false for testing environment
    // TEST can be set in the .env file
    secure: process.env.TEST === "true" ? false : true,
    sameSite: "none",
    httpOnly: true,
  },
  resave: false,
  // set to false in production, user has to give consent
  // set to true for testing environment
  // TEST can be set in the .env file
  saveUninitialized: process.env.TEST === "true" ? true : false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_STORE_URI,
    autoRemove: "interval",
    autoRemoveInterval: 60,
  }),
};

router.use(session(sessionConfig));

router.use("/auth", authRoutes);
router.use("/catalogue", catalogueRoutes);
router.use("/items", auth, storeAuth, itemRoutes);
router.use("/cart", auth, customerAuth, cartRoutes);
router.use("/order", auth, orderRoutes);
router.use("/user", auth, userRoutes);
router.use("/admin", adminAuth, adminRoutes);

module.exports = router;
