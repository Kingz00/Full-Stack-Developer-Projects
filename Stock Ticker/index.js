import { getStockData } from './fakeStockAPI.js';

function renderStockTicker(stockData) {
    const stockDisplayName = document.getElementById('name')
    const stockDisplaySymbol = document.getElementById('symbol')
    const stockDisplayPrice = document.getElementById('price')
    const stockDisplayTime = document.getElementById('time')

    stockDisplayName.textContent = stockData.name;
    stockDisplaySymbol.textContent = stockData.sym;
    stockDisplayPrice.textContent = `$ ${stockData.price}`;
    stockDisplayTime.textContent = stockData.time;
}

function updateStockTicker() {
    const stockData = getStockData();
    renderStockTicker(stockData);
    return stockData.price;
}

let previousPrice = null;

// Initial render
previousPrice = updateStockTicker();

function updatePriceIcon() {
    const stockDisplayPriceIcon = document.getElementById('price-icon');
    let currentPrice = updateStockTicker();

    if (previousPrice !== null) {
        if (currentPrice > previousPrice) {
            stockDisplayPriceIcon.src = './svg/ticker_up.svg';
        } else if (currentPrice < previousPrice) {
            stockDisplayPriceIcon.src = './svg/ticker_down.svg';
        } else {
            stockDisplayPriceIcon.src = './svg/ticker_sideways.svg';
        }
    }

    // Update previous price for the next comparison
    previousPrice = currentPrice;
}

// Update every 1.5 seconds
setInterval(updatePriceIcon, 1500);