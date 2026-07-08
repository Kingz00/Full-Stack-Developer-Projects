import 'dotenv/config'

const getCommodityPrice = async (amount) => {

    try {

        // XAU price from CommodityPriceApi
        const res = await fetch(`https://api.commoditypriceapi.com/v2/rates/latest?symbols=xau&apiKey=${process.env.COMMODITY_PRICE_API}`)
        const data = await res.json()

        const price = amount * data.rates.XAU
        console.log(price)
        return price

    } catch (err) {
        console.error(err)
    }
}

export { getCommodityPrice }
