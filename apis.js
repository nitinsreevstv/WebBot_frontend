export async function fetchCryptoPrice(coin) {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data[coin]) {
            return `${coin.charAt(0).toUpperCase() + coin.slice(1)} Price: $${data[coin].usd}`;
        } else {
            return `Sorry, I couldn't find the price for ${coin}. Try another coin!`;
        }
    } catch (error) {
        return "Error fetching crypto data. Please try again later!";
    }
}
