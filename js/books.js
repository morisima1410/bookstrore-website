const API_URL = "http://localhost:3000";

/* ================= ADD BOOK ================= */
async function addBook() {
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const price = document.getElementById("price").value;

    if (!title || !author || !price) {
        alert("Please fill all fields");
        return;
    }

    await fetch(`${API_URL}/add-book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            author,
            price
        })
    });

    alert("Book added successfully ✅");

    // clear form
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("price").value = "";

    loadBooks();
}

/* ================= LOAD BOOKS ================= */
async function loadBooks() {
    try {
        const res = await fetch(`${API_URL}/books`);
        const books = await res.json();

        const list = document.getElementById("bookList");
        if (!list) return;

        list.innerHTML = "";

        if (books.length === 0) {
            list.innerHTML = "<p>No books available</p>";
            return;
        }

        books.forEach(b => {
            const div = document.createElement("div");
            div.className = "book-card";

            div.innerHTML = `
                <h3>${b.title || "No Title"}</h3>
                <p>Author: ${b.author || "Unknown"}</p>
                <p class="price">₹ ${b.price || 0}</p>

                <button class="cart-btn">🛒 Add to Cart</button>
                <button class="update-btn">✏ Update</button>
                <button class="delete-btn">🗑 Delete</button>
            `;

            /* Add to Cart */
            div.querySelector(".cart-btn").addEventListener("click", () => {
                addToCart(b);
            });

            /* Delete */
            div.querySelector(".delete-btn").addEventListener("click", () => {
                deleteBook(b._id);
            });

            /* Update */
            div.querySelector(".update-btn").addEventListener("click", () => {
                updateBook(b._id);
            });

            list.appendChild(div);
        });

    } catch (err) {
        console.error("Error loading books:", err);
    }
}

/* ================= ADD TO CART ================= */
function addToCart(book) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(book);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "cart.html";
}

/* ================= DELETE BOOK ================= */
async function deleteBook(id) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    await fetch(`${API_URL}/books/${id}`, {
        method: "DELETE"
    });

    loadBooks();
}

/* ================= UPDATE BOOK ================= */
function updateBook(id) {
    window.location.href = `books.html?id=${id}`;
}

/* ================= INITIAL LOAD ================= */
loadBooks();
