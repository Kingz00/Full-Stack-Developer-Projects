export function getStockData() {
    return {
        name: 'QtechAI',
        sym: 'QTA',
        price: getRandomPrice(),
        time: getCurrentTime()
    }
}

/* returns a random number between 0 and 3 to two decimal places*/
function getRandomPrice() {
    return (Math.random() * 3).toFixed(2);
}

/* returns a timestamp in the format: hh/mm/ss */
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0'); // ensures hours are always two digits
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}