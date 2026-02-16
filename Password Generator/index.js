const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "=", "+", "[", "]", "{", "}", "|", ";", ":", "'", '"', ",", ".", "<", ">", "/", "?"];

let passwordBtn = document.getElementById("password_btn");
let password1 = document.getElementById("pass_1");
let password2 = document.getElementById("pass_2");

passwordBtn.addEventListener("click", function () {
    let passwordLength = 15;
    let pass1 = "";
    let pass2 = "";
    for (let i = 0; i < passwordLength; i++) {
        let randomIndex1 = Math.floor(Math.random() * characters.length);
        let randomIndex2 = Math.floor(Math.random() * characters.length);
        pass1 += characters[randomIndex1];
        pass2 += characters[randomIndex2];
    }
    password1.textContent = pass1;
    password2.textContent = pass2;
})