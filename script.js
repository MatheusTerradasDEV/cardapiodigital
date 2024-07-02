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
                    background: "linear-gradient(135deg, #ff7eb6, #ff4d80)",
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



function checkRestaurantOpen() {
    const data = new Date();
    const hora = data.getHours();
    return hora >= 8 && hora < 23;
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

    let pickupText = "";
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

        // Monta o texto para retirada pessoal
        pickupText = `Retirar pessoalmente\n`;
        pickupText += `Nome: ${nameInput.value}\n`;
        pickupText += `Horário de Retirada: ${timeInput.value}\n`;

        // Adiciona o meio de pagamento se selecionado
        if (paymentMethod.value !== "") {
            pickupText += `Meio de Pagamento: ${paymentMethod.value}`;
        }
    } else {
        if (addressInput.value === "") {
            addressWarn.classList.remove("hidden");
            addressInput.classList.add("border-red-500");
            return;
        }

        
        pickupText += `Endereço: ${addressInput.value}\n`;

   
        if (nameInput.value !== "") {
            pickupText += `Nome: ${nameInput.value}\n`;
        }

       
        if (paymentMethod.value !== "") {
            pickupText += `Meio de Pagamento: ${paymentMethod.value}`;
        } else {
            pickupText += `\n`;
        }
    }

    const cartItemsText = cart.map((item) => {
        return `${item.name}: ${item.quantity}x - R$ ${(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }).join("\n");

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const receipt =
`*Recibo de Compra* 

*Produtos:*
${cartItemsText}

*Detalhes da Compra:*
${pickupText ? `${pickupText}` : ''}
------------------------
*Total:*
R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Obrigado por comprar conosco!`;

    const message = encodeURIComponent(receipt);
    const phone = "5517996249944"; // Substitua pelo seu número de WhatsApp, incluindo o código do país sem o sinal de +
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");

    cart.forEach(item => updateQuantityAvailable(item.name, -item.quantity, true));
    cart = [];
    updateCartModal();
    clearPickupCheckbox();
    saveStockToLocalStorage();
});










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
        const name = input.closest(".flex").querySelector(".add-to-cart-btn").getAttribute("data-name");
        const stock = parseInt(input.value);
        stockData[name] = stock;
    });

    localStorage.setItem("stockData", JSON.stringify(stockData));
}




addressInput.addEventListener("input", function() {
    if (addressInput.value.trim() !== "") {
       
        addressWarn.textContent = "Atenção: As entregas são feitas a partir dos sábados.";
        addressWarn.classList.remove("hidden");
    } else {
        addressWarn.classList.add("hidden");
    }
});










pickupCheckbox.addEventListener("change", function() {
    if (pickupCheckbox.checked) {
        // Mostra os containers necessários para retirada pessoal
        nameContainer.classList.remove("hidden");
        timeContainer.classList.remove("hidden");

        // Mostra o container de meio de pagamento
        paymentContainer.classList.remove("hidden");
    } else {
        // Esconde os containers quando não for retirada pessoal
        nameContainer.classList.add("hidden");
        timeContainer.classList.add("hidden");

        // Esconde o container de meio de pagamento
        paymentContainer.classList.add("hidden");
    }
});


addressInput.addEventListener("input", function() {
    // Verifica se o campo de endereço não está vazio
    if (addressInput.value.trim() !== "") {
        // Mostra o container de nome
        nameContainer.classList.remove("hidden");
    } else {
        // Esconde o container de nome se o campo de endereço estiver vazio
        nameContainer.classList.add("hidden");
    }
});






