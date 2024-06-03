document.addEventListener("DOMContentLoaded", function() {
    loadStockFromLocalStorage();
});

const menu = document.getElementById("menu");
let cart = [];
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCounter = document.getElementById("cart-counter");
const cartModal = document.getElementById("cart-modal");
const cartBtn = document.getElementById("cart-btn");
const closeModalBtn = document.getElementById("close-modal");
const checkoutBtn = document.getElementById("checkout-btn");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const pickupCheckbox = document.getElementById("pickup-checkbox");
const nameContainer = document.getElementById("name-container");
const nameInput = document.getElementById("name-input");
const nameWarn = document.getElementById("name-warn");
const timeContainer = document.getElementById("time-container");
const timeInput = document.getElementById("pickup-time-input");
const timeWarn = document.getElementById("time-warn");
const paymentContainer = document.getElementById("payment-container");
const paymentMethod = document.getElementById("payment-method");
const paymentWarn = document.getElementById("payment-warn");

menu.addEventListener("click", function(event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price").replace(",", "."));
        const stockInput = parentButton.parentElement.querySelector(".stock-input");
        const stock = parseInt(stockInput.value);

        if (stock > 0) {
            addToCart(name, price);
            updateQuantityAvailable(name, -1);
            stockInput.value = stock - 1;
            saveStockToLocalStorage();
        } else {
            Toastify({
                text: "Produto esgotado!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true,
                style: {
                    background: "#ef4444",
                },
            }).showToast();
        }
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }
    updateCartModal();
}

function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Quantidade: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
            </div>
        `;

        cartItemsContainer.appendChild(cartItemElement);
        total += item.price * item.quantity;
    });

    cartTotal.innerText = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    cartCounter.innerText = cart.reduce((count, item) => count + item.quantity, 0);
}

cartBtn.addEventListener("click", function() {
    cartModal.style.display = "flex";
    updateCartModal();
});

closeModalBtn.addEventListener("click", function() {
    cartModal.style.display = "none";
    clearPickupCheckbox();
});

window.addEventListener("click", function(event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
        clearPickupCheckbox();
    }
});

cartItemsContainer.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
        updateQuantityAvailable(name, 1);
        saveStockToLocalStorage();
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartModal();
    }
}

checkoutBtn.addEventListener("click", function() {
    const isOpen = checkRestaurantOpen();
    if (!isOpen) {
        Toastify({
            text: "Ops a doceria está fechada!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();

        return;
    }

    if (cart.length === 0) return;

    if (pickupCheckbox.checked) {
        if (nameInput.value === "") {
            nameWarn.classList.remove("hidden");
            nameInput.classList.add("border-red-500");
            return;
        }

        if (timeInput.value === "") {
            timeWarn.classList.remove("hidden");
            timeInput.classList.add("border-red-500");
            return;
        }
    } else {
        if (addressInput.value === "") {
            addressWarn.classList.remove("hidden");
            addressInput.classList.add("border-red-500");
            return;
        }
    }

    if (paymentMethod.value === "") {
        paymentWarn.classList.remove("hidden");
        paymentMethod.classList.add("border-red-500");
        return;
    }

    const cartItems = cart.map((item) => {
        return (
            `Produto: ${item.name}\nQuantidade: ${item.quantity}\nPreço: R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`
        );
    }).join("\n");

    let message = encodeURIComponent(cartItems);
    const phone = "17996249944";

    let pickupText = "";
    if (pickupCheckbox.checked) {
        pickupText = `Retirar pessoalmente às ${timeInput.value}`;
    } else {
        pickupText = `Endereço: ${addressInput.value}`;
    }

    let nameText = "";
    if (nameInput.value) {
        nameText = `Nome: ${nameInput.value}`;
    }

    let paymentText = `Meio de Pagamento: ${paymentMethod.value}`;

    window.open(`https://wa.me/${phone}?text=${message}\n${pickupText}\n${nameText}\n${paymentText}`, "_blank");

    cart.forEach(item => updateQuantityAvailable(item.name, -item.quantity, true));
    cart = [];
    updateCartModal();
    clearPickupCheckbox();
    saveStockToLocalStorage();
});

function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 8 && hora < 18;
}

function clearPickupCheckbox() {
    pickupCheckbox.checked = false;
    addressInput.disabled = false;
    addressInput.value = "";
    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
    nameContainer.classList.add("hidden");
    nameInput.value = "";
    nameInput.classList.remove("border-red-500");
    nameWarn.classList.add("hidden");
    timeContainer.classList.add("hidden");
    timeInput.value = "";
    timeInput.classList.remove("border-red-500");
    timeWarn.classList.add("hidden");
    paymentContainer.classList.add("hidden");
    paymentMethod.value = "";
    paymentMethod.classList.remove("border-red-500");
    paymentWarn.classList.add("hidden");
}

pickupCheckbox.addEventListener("change", function() {
    if (pickupCheckbox.checked) {
        addressInput.disabled = true;
        addressInput.value = "";
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
        nameContainer.classList.remove("hidden");
        timeContainer.classList.remove("hidden");
    } else {
        addressInput.disabled = false;
        nameContainer.classList.add("hidden");
        nameInput.classList.remove("border-red-500");
        nameWarn.classList.add("hidden");
        timeContainer.classList.add("hidden");
        timeInput.classList.remove("border-red-500");
        timeWarn.classList.add("hidden");
    }
});

addressInput.addEventListener("input", function() {
    if (addressInput.value.trim() !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
        paymentContainer.classList.remove("hidden");
    } else {
        paymentContainer.classList.add("hidden");
    }
});

nameInput.addEventListener("input", function() {
    if (nameInput.value.trim() !== "") {
        nameInput.classList.remove("border-red-500");
        nameWarn.classList.add("hidden");
        paymentContainer.classList.remove("hidden");
    } else {
        paymentContainer.classList.add("hidden");
    }
});

timeInput.addEventListener("input", function() {
    if (timeInput.value.trim() !== "") {
        timeInput.classList.remove("border-red-500");
        timeWarn.classList.add("hidden");
    }
});

function updateQuantityAvailable(name, amount, forceUpdate = false) {
    const product = menu.querySelector(`[data-name="${name}"]`);
    if (product) {
        const stockInput = product.parentElement.querySelector(".stock-input");
        const stock = parseInt(stockInput.value);

        if (forceUpdate) {
            stockInput.value = Math.max(stock + amount, 0);
        } else {
            stockInput.value = stock + amount;
        }

        if (stockInput.value <= 0) {
            product.disabled = true;
        } else {
            product.disabled = false;
        }
    }
}

function saveStockToLocalStorage() {
    const stockData = {};

    menu.querySelectorAll(".stock-input").forEach((input) => {
        const name = input.closest(".add-to-cart-btn").getAttribute("data-name");
        const stock = parseInt(input.value);
        stockData[name] = stock;
    });

    localStorage.setItem("stockData", JSON.stringify(stockData));
}

function loadStockFromLocalStorage() {
    const stockData = JSON.parse(localStorage.getItem("stockData")) || {};

    menu.querySelectorAll(".stock-input").forEach((input) => {
        const name = input.closest(".add-to-cart-btn").getAttribute("data-name");
        if (stockData.hasOwnProperty(name)) {
            input.value = stockData[name];
            if (stockData[name] <= 0) {
                input.closest(".add-to-cart-btn").disabled = true;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(button => {
        const stockValueElement = button.closest('.flex').querySelector('.stock-value');
        const productId = stockValueElement.getAttribute('data-product-id');
        
        // Load stock value from localStorage if it exists
        let stockValue = localStorage.getItem(`stock-${productId}`);
        if (stockValue !== null) {
            stockValueElement.textContent = stockValue;
        } else {
            stockValue = parseInt(stockValueElement.textContent);
        }

        button.addEventListener('click', function () {
            if (stockValue > 0) {
                stockValue--;
                stockValueElement.textContent = stockValue;
                localStorage.setItem(`stock-${productId}`, stockValue);
            } else {
                alert('Produto esgotado!');
            }
        });
    });
});

