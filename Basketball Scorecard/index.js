let homeCount = document.getElementById("home-count");
let guestCount = document.getElementById("guest-count");

let homeScore = 0;
let guestScore = 0;

function homeBtn1() {
    homeScore += 1;
    homeCount.textContent = homeScore;
}

function homeBtn2() {
    homeScore += 2;
    homeCount.textContent = homeScore;
}

function homeBtn3() {
    homeScore += 3;
    homeCount.textContent = homeScore;

}

function guestBtn1() {
    guestScore += 1;
    guestCount.textContent = guestScore;
}

function guestBtn2() {
    guestScore += 2;
    guestCount.textContent = guestScore;
}

function guestBtn3() {
    guestScore += 3;
    guestCount.textContent = guestScore;
}