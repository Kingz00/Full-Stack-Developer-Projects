import { menuArray } from "./data";

const menuEl = document.querySelector("#menu")

document.addEventListener("click", (e) => {

})

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
                <button id="add-item" class="add-item">+</button>
            </div>
        `
    }).join('')
    return menus
}

const render = () => {
    menuEl.innerHTML = getMenus()
}

render()