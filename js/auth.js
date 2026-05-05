// REGISTER VALIDATION
function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // ✅ Simple validation
    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message); // "Registered successfully"
            window.location.href = "login.html"; // redirect to login
        } else {
            alert(data.message); // User already exists / All fields required
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error. Try again later.");
    });
}

// Login User
async function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        window.location.href = "home.html";
    } else {
        alert(data.message);
    }
}
// Get cart example (for cart page)
async function loadCart(){
    const res = await fetch(`http://localhost:3000/cart/${loggedInUser.email}`);
    const data = await res.json();

    const cartBox = document.getElementById("cartItems");
    let total = 0;
    cartBox.innerHTML = "";
    data.items.forEach(item => {
        total += item.price;
        cartBox.innerHTML += `<div class="item">
            <span>${item.name}</span>
            <span>₹${item.price}</span>
            <button onclick="removeItem('${item.name}')">Remove</button>
        </div>`;
    });
    cartBox.innerHTML += `<div class="total">Total: ₹${total}</div>`;
}

async function removeItem(name){
    await fetch("http://localhost:3000/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: loggedInUser.email, itemName: name })
    });
    loadCart();
}

// Add to Cart (async with backend) and redirect
async function addToCart(name, price) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return alert('Please login first');

    const item = { name, price, quantity: 1 };

    // Save locally first for instant cart update
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));

    // Optional: Send to backend
    try {
        const res = await fetch('http://localhost:3000/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail: user.email, item })
        });
        const data = await res.json();
        console.log(data); // backend response
    } catch (err) {
        console.log("Backend error:", err);
    }

    // Redirect to cart page
    window.location.href = "cart.html";
}

// Load cart items on cart.html
function loadCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItemsDiv = document.getElementById("cartItems");
    let totalPriceDiv = document.getElementById("totalPrice");

    cartItemsDiv.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty</p>";
        totalPriceDiv.innerText = "Total: ₹0";
        return;
    }

    cart.forEach((item, index) => {
        total += item.price;

        cartItemsDiv.innerHTML += `
            <div class="cart-item">
                <span>${item.name} - ₹${item.price} x ${item.quantity}</span>
                <button onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    totalPriceDiv.innerText = "Total: ₹" + total;
}

async function addBook(){
    const name = document.getElementById("bookName").value;
    const author = document.getElementById("author").value;
    const price = document.getElementById("price").value;

    console.log(name, author, price); // 🔴 must show all values

    const res = await fetch("http://localhost:3000/add-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,        // ✅ MUST be "name"
            author: author,    // ✅ MUST be "author"
            price: price
        })
    });

    const data = await res.json();
    alert(data.message);

    if(data.success){
        window.location.href = "books.html";
    }
    return false;
}






