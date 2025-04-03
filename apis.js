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

export async function fetchWikipediaSummary(query) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.extract) {
            return {
                title: data.title,
                extract: data.extract,
                image: data.thumbnail ? data.thumbnail.source : null,
                link: data.content_urls.desktop.page
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return null;
    }
}

export async function fetchJoke(text) {
    try {
        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        const data = await response.json();
        return `${data.setup} 😂 ${data.punchline}`;
    } catch (error) {
        console.error("Joke API Error:", error);
        return "I tried to find a joke, but my humor module is offline! 🤖";
    }
}