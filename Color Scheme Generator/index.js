const dropdown = document.getElementById('color-dropdown')
const picker = document.getElementById('color-picker')
const colorSchemeBtn = document.getElementById('color-scheme-btn')
const colorSchemeSection = document.getElementById('color-scheme-section')
const themeBtn = document.getElementById('theme-btn')

let isDark = true

colorSchemeBtn.addEventListener("click", async () => {
    try {
        const res = await fetch(`https://www.thecolorapi.com/scheme?hex=${picker.value.slice(1)}&mode=${dropdown.value}&count=5`)
        if (!res.ok) {
            throw new Error("Something went wrong")
        }
        const data = await res.json()
        console.log(data.colors)
        const colorSchemeEls = data.colors.map((colorObj) => {
            return `
                <div class="scheme-container">
                    <div class="color-scheme" style="background-color: ${colorObj.hex.value};"></div>
                    <span class="scheme-hex">${colorObj.hex.value}</span>
                </div>
            `
        }).join('')
        colorSchemeSection.innerHTML = colorSchemeEls
    }
    catch (err) {
        console.error(err)
    }
})

themeBtn.addEventListener("click", (e) => {
    isDark = !isDark
    themeBtn.textContent = isDark ? "Light Theme" : "Dark Theme"
    document.body.classList.toggle("dark-theme")
    themeBtn.classList.toggle("dark-theme-btn")
    colorSchemeBtn.classList.toggle("dark-theme-btn")
})