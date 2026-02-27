import { propertyForSaleArr } from './properties/propertyForSaleArr.js';

propertyForSaleArr.forEach((propertyObj) => {
    let totalSize = propertyObj.roomsM2.reduce((total, size) => total + size, 0);
    console.log(totalSize);
})