import 'dotenv/config'

const getCommodityPrice = async () => {

    // GC=F = Gold Futures
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d';

    try {
        const response = await fetch(url, {
            headers: {
                // Yahoo requires a User-Agent header to prevent blocking
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const data = await response.json();
        const result = data.chart.result[0];
        const latestPrice = result.meta.regularMarketPrice;

        console.log(`Live Gold Price: $${latestPrice} USD`);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

export { getCommodityPrice }
