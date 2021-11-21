// Variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const proceedCartBtn = document.querySelector(".proceed-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// Main Cart Variable Array
let cart = [];

// Main Buttons Array
let buttonsDOM = [];

// Products class
class Products {
  // Used to get the products from JSON
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();

            let products = data.items;
            products = products.map((item) => {
            const { title, price } = item.fields;
            const { id } = item.sys;
            const image = item.fields.image.fields.file.url;
            const soldout = item.fields.soldout;
            return { title, price, id, image };
        });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}
// UI of the Application
class UI {
    displayProducts(products) {
        let result = "";
        // Show products on All Shoes
        products.forEach((product) => {
            result += `
            <article class="product">
            <div class="img-container">
            <img src=${product.image} alt="product" class="product-img" onclick="window.open(this.src)"/>
            <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>Add to Cart
            </button>
            </div>
                <h3>${product.title}</h3>
                <h4>£${product.price}</h4>
            </article>
        `;
    });
        productsDOM.innerHTML = result;
    }

    // Register the buttons for Add to Cart
    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
        let id = button.dataset.id;
        let inCart = cart.find((item) => item.id === id);
        if (inCart) {
            button.innerText = "In Cart";
            button.disabled = true;
        }
        button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        // Get all products in Cart
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // Add to Cart
        cart = [...cart, cartItem];
        //Save Cart in local storage for refresh issues
        Storage.saveCart(cart);
        // Set Cart Values from storage
        this.setCartValues(cart);
        // Display individual Cart item
        this.addCartItem(cartItem);
        // Show Cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  // Adds the shoes in the Cart
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
        <div>
            <div class="row-2">
                <div class="col-2">
                <h4>${item.title}</h4>
                    <p>
                        Size:
                    </p>
                    <select class="size">
                        <option>UK 3 (220mm)</option>
                        <option>UK 4 (229mm)</option>
                        <option>UK 5 (237mm)</option>
                        <option>UK 6 (246mm)</option>
                        <option>UK 7 (254mm)</option>
                        <option>UK 7.5 (258mm)</option>
                        <option>UK 8 (262mm)</option>
                        <option>UK 8.5 (266mm)</option>
                        <option>UK 9 (271mm)</option>
                        <option>UK 9.5 (275mm)</option>
                        <option>UK 10 (279mm)</option>
                        <option>UK 10.5 (283mm)</option>
                        <option>UK 11 (288mm)</option>
                        <option>UK 12 (296mm)</option>
                        <option>UK 13 (305mm)</option>
                        <option>UK 14 (314mm)</option>
                    </select>
                </div>
                <div class="col-2">
                    <h5>£${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>remove</span>
                </div>
            </div>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
    cartContent.appendChild(div);
  }
  // Shows the Cart on screen
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    // Proceed cart button
    // At this time the proceed button clears the cart
    proceedCartBtn.addEventListener("click", () => {
      this.proceedCart();
    });
    // Cart Functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(
          removeItem.parentElement.parentElement.parentElement.parentElement
        );
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  // Clears the Cart
  // Needs to go to a separate page for checkout
  proceedCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id) {
        return buttonsDOM.find((button) => button.dataset.id === id);
    }
}
// Local Storage to hold the products in the Cart on refresh
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart")
        ? JSON.parse(localStorage.getItem("cart"))
        : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // Setup Application
    ui.setupAPP();
    // Get Products
    products
    .getProducts()
    .then((products) => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    })
    .then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});

// Send email for Newsletter
function sendMail() {
    Email.send({
        Host: "smtp.gmail.com",
        Username: "goldenshoehalifax@gmail.com",
        Password: "a1b2c3..",
        To: document.getElementById("email").value,
        From: "goldenshoehalifax@gmail.com",
        Subject: "Subscription to Golden Shoe",
        Body:
        "Dear " +
        document.getElementById("email_name").value +
        ",\n Thank you for subscribing to our weekly newsletter. You will find weekly in-store offers during the following weeks."
    }).then(function (message) {
        alert("Mail has been sent successfully");
        document.getElementById("email").value = "";
        document.getElementById("email_name").value = "";
        console.log(document.getElementById("email").value);
    });
}

// Shows the Return Policy popup
function showReturn() {
  document.getElementById("popup-1").classList.toggle("active");
}
// Shows the Delivery Dates and Times popup
function showDelivery() {
  document.getElementById("popup-2").classList.toggle("active");
}
// Shows the About Us popup
function showAbout() {
  document.getElementById("popup-3").classList.toggle("active");
}