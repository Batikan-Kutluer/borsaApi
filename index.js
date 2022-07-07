require('dotenv').config();

let express = require("express");
let app = express();
let http = require("http").createServer(app);

const TradingView = require('@mathieuc/tradingview');
const client = new TradingView.Client(); // Creates a websocket client

const adet = require('./adet.json');

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

    let birim = "USD";

    api[birim] = {
        birim: birim,
        alis: fix(data.open),
        satis: fix(data.close),
        adet: adet[birim],
        toplam: fix(adet[birim] * data.close)
    }
})

hisse("BINANCE:FETUSDT*BINANCE:USDTTRY", (data) => {
    let birim = "FET";

    api[birim] = {
        birim: birim,
        alis: data.open,
        satis: data.close,
        adet: adet[birim],
        toplam: fix(adet[birim] * data.close)
    }
})

hisse("BINANCE:BTCTRY", (data) => {
    let birim = "BTC";

    api[birim] = {
        birim: birim,
        alis: data.open,
        satis: data.close,
        adet: adet[birim],
        toplam: fix(adet[birim] * data.close)
    }
})

let hisseList = ["GSRAY", "BJKAS", "TTKOM", "TCELL"];

hisseList.forEach((birim) => {
    hisse(birim, (data) => {
        let tutar = adet[birim] || 0;

        api[birim] = {
            birim: birim,
            alis: fix(data.open),
            satis: fix(data.close),
            adet: adet[birim],
            toplam: fix(tutar * data.close)
        }
    })
})

http.listen(process.env.PORT || 80)