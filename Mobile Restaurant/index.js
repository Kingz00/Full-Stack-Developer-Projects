import { menuArray } from "./data";

const menuContainer = document.querySelector("#menu-container")
const orderContainer = document.querySelector("#order-container")


const orders = []

document.addEventListener("click", (e) => {
    if (e.target.dataset.menuItem) {
        addItem(e.target.dataset.menuItem)
    }
    else if (e.target.dataset.orderIndex) {
        removeOrder(e.target.dataset.orderIndex)
    }
    else if (e.target.id === "complete-btn") {
        document.getElementById("form-section").style.display = "flex"
    }
    else if (e.target.id === "form-section") {
        document.getElementById("form-section").style.display = "none"
    }
    else if (e.target.id === "pay-btn") {
        handlePay(e)
    }
})

const addItem = (menuId) => {
    const menuObj = menuArray.filter((obj) => { return Number(menuId) === obj.id })[0]
    orders.push(menuObj)
    document.getElementById("feedback-container").style.display = "none"
    renderOrders()
}

const removeOrder = (orderIndex) => {
    orders.splice(Number(orderIndex), 1)
    renderOrders()
    if (orders.length === 0) {
        orderContainer.style.display = "none"
    }
}

function handlePay(e) {
    e.preventDefault()
    const payForm = document.getElementById("payment-details")
    const inputData = new FormData(payForm)
    document.getElementById("feedback-text").textContent = `Thanks, ${inputData.get("user-name")}! Your order is on its way!`
    payForm.reset()
    document.getElementById("form-section").style.display = "none"
    orderContainer.style.display = "none"
    document.getElementById("feedback-container").style.display = "flex"
    orders.length = 0 //empties an array that has been declared as a const
}

const getMenus = () => {
    const menus = menuArray.map((menu) => {
        return `
            <div class="menu-item">
                <h1 class="emoji">${menu.emoji}</h1>
                <div class="item-detail">
                    <h2 class="item-name">${menu.name}</h2>
                    <p class="ingredients">${menu.ingredients.join(",")}</p>
                    <p class="price">${menu.price}</p>
                </div>
                <button id="add-item" class="add-item" data-menu-item="${menu.id}">+</button>
            </div>
        `
    }).join('')
    return menus
}

const render = () => {
    menuContainer.innerHTML = getMenus()
}

const renderOrders = () => {
    const orderEls = orders.map((order, index) => {
        return `
        <div class="order-item-container">
            <h2 class="order-item">${order.name}</h2>
            <button class="remove-btn" data-order-index="${index}">remove</button>
            <p class="price">${order.price}</p>
        </div>
        `
    })
    document.getElementById("order-items-container").innerHTML = orderEls.join('')
    const totalPrice = orders.reduce((acc, currentValue) => {
        return acc + currentValue.price
    }, 0)
    document.getElementById("total-price").textContent = totalPrice
    orderContainer.style.display = "block"
}

render()