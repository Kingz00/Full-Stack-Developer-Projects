const lengthResult = document.getElementById('length-result');
const massResult = document.getElementById('mass-result');
const volumeResult = document.getElementById('volume-result');
const convertBtn = document.getElementById('convert-btn');
const inputValue = document.getElementById('input-box');

let value = 0;

function lengthConversion(value) {
    const metersToFeet = (value * 3.28084)
    const feetToMeters = (value / 3.28084)
    return `${value} meters = ${metersToFeet.toFixed(3)} feet | ${value} feet = ${feetToMeters.toFixed(3)} meters`
}

function volumeConversion(value) {
    const litersToGallons = (value * 0.264)
    const gallonsToLiters = (value / 0.264)
    return `${value} liters = ${litersToGallons.toFixed(3)} gallons | ${value} gallons = ${gallonsToLiters.toFixed(3)} liters`
}

function massConversion(value) {
    const kilosToPounds = (value * 2.204)
    const poundsToKilos = (value / 2.204)
    return `${value} kilos = ${kilosToPounds.toFixed(3)} pounds | ${value} pounds = ${poundsToKilos.toFixed(3)} kilos`
}

convertBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (inputValue.value === '' && inputValue.placeholder === '20') {
        value = 20;
    } else if (inputValue.value === '' && inputValue.placeholder === '') {
        alert('Please enter a value to convert');
    } else {
        value = Number(inputValue.value);
    }
    lengthResult.textContent = lengthConversion(value);
    volumeResult.textContent = volumeConversion(value);
    massResult.textContent = massConversion(value);
    inputValue.value = '';
    inputValue.placeholder = '';
    inputValue.focus(); // Call the focus method to set the cursor back to the input field after conversion
})