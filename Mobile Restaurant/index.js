import { menuArray } from "./data";

const menuContainer = document.querySelector("#menu-container")
const orderContainer = document.querySelector("#order-container")


const orders = []
const orderEls = []

document.addEventListener("click", (e) => {
    if (e.target.dataset.menuItem) {
        addItem(e.target.dataset.menuItem)
    }
})

const addItem = (menuId) => {
    const menuObj = menuArray.filter((obj) => { return Number(menuId) === obj.id })[0]
    orders.push(menuObj)
    orderEls.push(`
        <div class="order-item-container">
            <h2 class="order-item">${menuObj.name}</h2>
            <button class="remove-btn">remove</button>
            <p class="price">${menuObj.price}</p>
        </div>
        `)
    document.getElementById("order-items-container").innerHTML = orderEls.join('')
    const totalPrice = orders.reduce((acc, currentValue) => {
        return acc + currentValue.price
    }, 0)
    document.getElementById("total-price").textContent = totalPrice
    orderContainer.style.display = "block"
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

const render = (domArray) => {
    menuContainer.innerHTML = domArray
}

render(getMenus())