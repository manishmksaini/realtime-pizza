const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const homeController = require("../app/http/controllers/homeController");
const AdminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");

//middlewares
const guest = require("../app/http/middleware/guest");
const auth = require("../app/http/middleware/auth");
const admin = require("../app/http/middleware/admin");


function initRoutes(app) {
  app.get("/", homeController().index);

  app.get("/cart", cartController().index);

  app.get("/login", guest, authController().login);
  //user login route
  app.post("/login", authController().postLogin);
  app.get("/register", guest, authController().register);
  //user register route
  app.post("/register", authController().postRegister);
  //logout route
  app.post("/logout", authController().logout);

  app.post("/update-cart", cartController().update);

  //customer routes
  app.post("/orders", auth, orderController().store);
  app.get("/customer/orders", auth, orderController().index);
  //customer singleorder status detail route
  app.get("/customer/orders/:id", auth, orderController().showOrder);

  //admin routes
  app.get("/admin/orders", admin, AdminOrderController().index);
  
  //admin status update route
  app.post("/admin/order/status", admin, statusController().update);
}
module.exports = initRoutes;

