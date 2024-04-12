import axios from "axios";
import Noty from "noty";
import { initAdmin } from "./admin";
import moment from "moment";
import { initStripe } from "./stripe";

let addToCart = document.querySelectorAll(".add-to-cart");

let cartCounter = document.querySelector("#cartCounter");

function updateCart(pizza) {
  axios
    .post("/update-cart", pizza)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        theme: "metroui",
        type: "success",
        timeout: 1000,
        text: "Item added to cart",
        progressBar: true,
      }).show();
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 1000,
        text: "Something went wrong",
        progressBar: true,
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let pizza = JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
    // console.log(pizza)
  });
});

// Remove alert message after X seconds
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

//customer order status update
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
// console.log(order)
let time = document.createElement("small");
//updatestatus function for customer
function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });
  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      if (status.nextElementSibling) {
        time.innerText = moment(order.updatedAt).format("hh:mm A");
        status.appendChild(time);
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

initStripe()

//socket
let socket = io();

//join
if (order) {
  socket.emit("join", `order_${order._id}`);
}

//admin room for new order notification
let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  initAdmin(socket);
  socket.emit("join", "adminRoom");
}

//customer order update notification
socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  // console.log(data)
  updateStatus(updatedOrder);
  new Noty({
    theme: "metroui",
    type: "success",
    timeout: 1000,
    text: "Order updated",
    progressBar: true,
  }).show();
});
