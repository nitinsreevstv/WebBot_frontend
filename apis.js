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

export async function fetchJoke() {
    try {
        const response = await fetch("https://official-joke-api.appspot.com/random_joke");
        const data = await response.json();
        return `${data.setup} 😂 ${data.punchline}`;
    } catch (error) {
        console.error("Joke API Error:", error);
        return "I tried to find a joke, but my humor module is offline! 🤖";
    }
}

export async function fetchFact() {
    try {
        const response = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en");
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("Fact API Error:", error);
        return "I tried to find a fact, but nothing find that you do not know !! 🤖";
    }
}

export async function getCountryInfo(country) {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("API response not OK");

        const data = await response.json();
        if (!data || data.status === 404) return "❌ Country not found!";

        return `
            🌍 <strong>${data[0].name.common}</strong><br>
            🏛️ Capital: ${data[0].capital ? data[0].capital[0] : "N/A"}<br>
            🌎 Region: ${data[0].region}<br>
            🗣️ Language: ${data[0].languages ? Object.values(data[0].languages).join(", ") : "N/A"}<br>
            💰 Currency: ${data[0].currencies ? Object.values(data[0].currencies)[0].name : "N/A"}<br>
            👥 Population: ${data[0].population.toLocaleString()}<br>
            📏 Area: ${data[0].area.toLocaleString()} km²<br>
            🇨🇺 Flag: <img src="${data[0].flags?.svg}" width="50"><br>
        `;
    } catch (error) {
        console.error("Error fetching country info:", error);
        return "⚠️ Error fetching country info.";
    }
}
