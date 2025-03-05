const yahooFinance = require('yahoo-finance2').default;
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors({ origin: '*' }));

// Función para obtener cotizaciones en tiempo real
const fetchYahooFinanceQuote = async (symbol) => {
    try {
        const quote = await yahooFinance.quote(symbol);
        return {
            symbol,
            price: quote.regularMarketPrice,
            percent: quote.regularMarketChangePercent,
            bid: quote.bid,
            ask: quote.ask,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            prevClose: quote.regularMarketPreviousClose,
            volume: quote.regularMarketVolume,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow
        };
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
};

// Función para obtener datos históricos de 120 meses
const fetchYahooFinanceData = async (symbol) => {
    const now = new Date();
    const to = new Date(now.setHours(0, 0, 0, 0));

    const from = new Date(to);
    from.setMonth(to.getMonth() - 120);  // 120 meses atrás

    try {
        const chartData = await yahooFinance.historical(symbol, {
            period1: from.toISOString(),
            period2: to.toISOString(),
            interval: '1d',
        });

        const output = chartData.map(data => ({
            date: data.date.getTime() / 1000, // Convertir a timestamp Unix
            close: data.close,
            low: data.low,
            open: data.open,
            high: data.high,
            volume: data.volume
        }));

        return output;
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
    }
};

// Endpoint para obtener cotizaciones en tiempo real
app.get('/quote', async (req, res) => {
    const { symbol } = req.query;  // Obtener el símbolo desde la query string

    if (!symbol) {
        return res.status(400).send('Symbol parameter is required');
    }

    const quote = await fetchYahooFinanceQuote(symbol);

    if (quote) {
        res.json(quote);
    } else {
        res.status(500).send('Request failed');
    }
});

// Endpoint para obtener los datos históricos de 120 meses
app.get('/share-price-information', async (req, res) => {
    const { symbol } = req.query;  // Obtener el símbolo desde la query string

    if (!symbol) {
        return res.status(400).send('Symbol parameter is required');
    }

    const data = await fetchYahooFinanceData(symbol);

    if (data) {
        res.json(data);
    } else {
        res.status(500).send('Request failed');
    }
});

// Iniciar la API
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});
