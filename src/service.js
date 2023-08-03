const axios = require("axios");
const config = require("./config.js");

let alerts = {};

async function fetchData(params) {
    const options = {
        method: 'GET',
        url: 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/' + params,
        headers: {
            'X-RapidAPI-Key': config.API_KEY,
            'X-RapidAPI-Host': config.API_HOST
        }
    };

    try {
        let response = await axios.request(options);
        return response;
    }
    catch (error) {
        console.log(error);
    }
}

function appendAlert(id, alert) {
    if (alerts[id] === undefined) {
        alerts[id] = [];
    }
    alerts[id].push(alert);
}

function emptyAlert(id) {
    if (alerts[id] !== undefined) {
        delete alerts[id];
    }
}

function alertsToTickers(id) {
    let tempAlerts = alerts[id];

    let tickers = [];

    tempAlerts.forEach((alert) => {
        let regex = /\$[A-Z]+/gm;
        let result = alert.match(regex);

        if (result !== null) {
            result.forEach((ticker) => {
                tickers.push(ticker);
            });
        }
    });

    tickers = [...new Set(tickers)];

    tickers = tickers.map((ticker) => {
        return ticker.substring(1);
    })

    return tickers;
}

function tickersToParamString(tickers) {
    let paramString = "";

    tickers.forEach((ticker) => {
        paramString += ticker + ",";
    })

    return paramString;
}

function getDay(timestamp) {
    let date = new Date(timestamp * 1000);

    date = new Date(date.toLocaleString("en-US", { timeZone: "EST" }));

    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let returnDay = "-" + months[date.getMonth()] + " ";

    returnDay += date.getDate().toString();

    let postfix = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];

    if (date.getDate() === 11) {
        returnDay += "th";
    }
    else if (date.getDate() === 12) {
        returnDay += "th";
    }
    else if (date.getDate() === 13) {
        returnDay += "th";
    }
    else {
        returnDay += postfix[date.getDate() % 10];
    }

    returnDay += ", " + date.getFullYear();

    return returnDay;
}

async function getList(id) {
    let response = "Trading Room Results\n";

    let tickers = alertsToTickers(id);

    let paramString = tickersToParamString(tickers);

    let data;
    try {
        data = await fetchData(paramString);
    }
    catch (error) {
        console.log(error);
    }

    data = data.data;

    response += getDay(data[0].regularMarketTime.timestamp) + "\n\n";

    let sortable = data.map((entry) => {
        return [entry.symbol, entry.regularMarketChangePercent];
    })

    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });

    let gainers = [];

    sortable.forEach((entry) => {
        if (entry[1] > 0) {
            gainers.push(entry);
        }
    });

    let losers = [];

    sortable.forEach((entry) => {
        if (entry[1] < 0) {
            losers.push(entry);
        }
    });

    if (gainers.length > 0) {
        response += "Top Gainers:" + "\n\n";

        gainers.forEach((entry) => {
            response += "$" + entry[0] + "\t\t" + parseFloat(entry[1].toFixed(2)) + "%";
            response += "\n";
        })
    }

    if (losers.length > 0) {
        response += "\n" + "Top Losers:" + "\n\n";

        losers.forEach((entry) => {
            response += "$" + entry[0] + "\t\t" + parseFloat(entry[1].toFixed(2)) + "%";
            response += "\n";
        })
    }

    return response;
}

module.exports = {
    alerts,
    appendAlert,
    emptyAlert,
    getList
}