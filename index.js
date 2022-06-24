require('dotenv').config();

let express = require("express");
let app = express();
let http = require("http").createServer(app);

const TradingView = require('@mathieuc/tradingview');
const client = new TradingView.Client(); // Creates a websocket client

let api = {};
let dolar = 0;

app.get("/", (req, res) => {

    let _api = []

    for (a in api) { _api.push(api[a]) }

    res.send({ data: _api })
})

let fix = (num) => Number(String(num).match(/.+\.../) + "") || num

function hisse(_hisse = "GSRAY", callback) {
    const chart = new client.Session.Chart(); // Init a Chart session

    chart.setMarket(_hisse, { // Set the market
        timeframe: '1',
    });

    chart.onError((...err) => { // Listen for errors (can avoid crash)
        console.error('Chart error:', ...err, _hisse);
        // Do something...
    });

    chart.onUpdate(() => { // When price changes
        if (!chart.periods[0]) return;
        callback(chart.periods[0])
        // Do something...
    });
}

hisse("FX:USDTRY", (data) => {
    dolar = data.close
    api["USD"] = {
        birim: "USD",
        alis: fix(data.open),
        satis: fix(data.close),
        toplam: fix(290 * data.close)
    }
})

hisse("BINANCE:FETUSDT", (data) => {
    if (dolar == 0) return;

    api["FET"] = {
        birim: "FET",
        alis: fix(data.open * dolar),
        satis: fix(data.close * dolar),
        toplam: fix(0 * data.close)
    }
})

hisse("BINANCE:BTCTRY", (data) => {
    api["BTC"] = {
        birim: "BTC",
        alis: data.open,
        satis: data.close,
        toplam: fix(0.02449323 * data.close)
    }
})

let hisseList = ["GSRAY", "BJKAS", "TTKOM", "TCELL"];

hisseList.forEach((item) => {
    hisse(item, (data) => {
        let tutar = 0;

        switch (item) {
            case "GSRAY":
                tutar = 902;
                break
            case "BJKAS":
                tutar = 943;
                break
            case "TTKOM":
                tutar = 196;
                break
            case "TCELL":
                tutar = 165;
                break
        }

        api[item] = {
            birim: item,
            alis: fix(data.open),
            satis: fix(data.close),
            toplam: fix(tutar * data.close)
        }
    })
})

http.listen(process.env.PORT || 80)