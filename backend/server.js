const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/bookstore")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ================= USER SCHEMA ================= */
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});
const User = mongoose.model("User", UserSchema);

/* ================= BOOK SCHEMA ================= */
const BookSchema = new mongoose.Schema({
    title: String,
    author: String,
    price: Number
});
const Book = mongoose.model("Book", BookSchema);

/* ================= ADD BOOK ================= */


app.post("/add-book", async (req, res) => {
  console.log(req.body); // 👈 terminal ma check karo
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    price: req.body.price
  });
  await book.save();
  res.json({ message: "Book saved" });
});
/* ===== DELETE BOOK (IMPORTANT) ===== */
app.delete("/books/:id", async (req, res) => {
    const { id } = req.params;

    await Book.findByIdAndDelete(id);

    res.json({ message: "Book Deleted Successfully" });
});


app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});








/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.json({ message: "Registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) {
        return res.json({ success: false, message: "Invalid credentials" });
    }

    res.json({
        success: true,
        user: { name: user.name, email: user.email }
    });
});



/* ================= SERVER ================= */
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
/* ================= CART SCHEMA ================= */
const CartSchema = new mongoose.Schema({
    userEmail: String,        // email of the logged-in user
    items: [
        {
            name: String,
            price: Number,
            quantity: { type: Number, default: 1 }
        }
    ]
});
const Cart = mongoose.model("Cart", CartSchema);

/* ================= ADD TO CART ================= */
app.post("/cart/add", async (req, res) => {
    const { userEmail, item } = req.body;
    if(!userEmail || !item) return res.json({ success: false, message: "Invalid data" });

    let cart = await Cart.findOne({ userEmail });
    if(!cart){
        cart = new Cart({ userEmail, items: [item] });
    } else {
        // Check if item already exists in cart
        const index = cart.items.findIndex(i => i.name === item.name);
        if(index > -1){
            cart.items[index].quantity += 1;
        } else {
            cart.items.push(item);
        }
    }
    await cart.save();
    res.json({ success:true, message:`"${item.name}" added to cart!` });
});

/* ================= REMOVE ITEM FROM CART ================= */
app.post("/cart/remove", async (req, res) => {
    const { userEmail, index } = req.body;

    if(userEmail == null || index == null) {
        return res.json({ success:false, message:"Invalid data" });
    }

    const cart = await Cart.findOne({ userEmail });
    if(!cart) return res.json({ success:false, message:"Cart not found" });

    cart.items.splice(index,1); // remove item by index
    await cart.save();

    res.json({ success:true, message:"Item removed from cart!" });
});


app.get("/cart/:userEmail", async (req, res) => {
    const cart = await Cart.findOne({ userEmail: req.params.userEmail });
    res.json(cart ? cart.items : []);
});


