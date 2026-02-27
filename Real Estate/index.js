import { propertyForSaleArr } from './properties/propertyForSaleArr.js';
import { placeholderPropertyObj } from './properties/placeholderPropertyObj.js';

function getPropertyHtml(propertyArr = [placeholderPropertyObj]) {

    const propertyHtml = propertyArr.map((propertyObj) => {

        const { propertyLocation, priceGBP, roomsM2, comment, image } = propertyObj;

        const totalSize = roomsM2.reduce((total, size) => total + size, 0);

        return `<section class="card">
            <img id="property-image" src="/images/${image}" alt="Property Image">
            <div class="card-right">
                <h2 id="location">${propertyLocation}</h2>
                <h3 id="price">£${priceGBP.toLocaleString()}</h3>
                <p id="description">${comment}</p>
                <h3 id="size">${totalSize}m²</h3>
            </div>
        </section>`
    }).join('');

    return propertyHtml;
}

const renderProperties = () => {
    const properties = document.body;
    properties.innerHTML = getPropertyHtml(propertyForSaleArr);
}

renderProperties();