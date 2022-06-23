let express = require("express");
let app = express();
let http = require("http").createServer(app);

const fetch = require('isomorphic-unfetch')

let api = []

let waitTime = 20;

let turkBorsasi = async () => await ((await fetch("https://api.genelpara.com/embed/borsa.json")).json());

let binance = async (symbol = '["FETUSDT"]') => {
    let data = await ((await fetch("https://api.binance.com/api/v3/ticker/price?symbols=" + symbol)).json())
    return data.map(item => {
        return {
            birim: item.symbol,
            satis: item.price,
            alis: item.price
        }
    })

};

let hisse = async (_hisse = "GSRAY") => {
    let data = (await ((await fetch("https://bigpara.hurriyet.com.tr/api/v1/borsa/hisseyuzeysel/" + _hisse)).json())).data.hisseYuzeysel;
    return {
        birim: data.sembol,
        alis: data.alis,
        satis: data.satis,
    }
};

app.get("/", (req, res) => {
    res.send({ data: api })
})

async function sleep(time = 1) {
    return await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time * 1000)
    })
}

async function interval(resolve, reject) {
    //There is where code starts.

    try {

        let turkBorsasiData = await turkBorsasi();

        let dolar = {
            birim: "USD"
        };

        dolar.satis = Number((turkBorsasiData.USD.satis.match(/(span>).+/)[0].replace(/(span>)/, "") * 1).toFixed(2));
        dolar.alis = Number((turkBorsasiData.USD.alis * 1).toFixed(2));

        console.log("Dolar: ", dolar)

        let [BTCUSDT, FETUSDT] = (await binance('["FETUSDT","BTCUSDT"]'));

        let FET = {
            birim: "FET",
            alis: Number((FETUSDT.alis * dolar.alis).toFixed(2)),
            satis: Number((FETUSDT.satis * dolar.satis).toFixed(2)),
        }
        console.log("FET: ", FET)

        let BTC = {
            birim: "BTC",
            alis: Number((BTCUSDT.alis * dolar.alis).toFixed(2)),
            satis: Number((BTCUSDT.satis * dolar.satis).toFixed(2)),
        }
        console.log("BTC: ", BTC)

        let GSRAY = await hisse("GSRAY");
        console.log("GSRAY: ", GSRAY)
    /* api - waitTime sec */ await sleep(waitTime);
        let BJKAS = await hisse("BJKAS");
        console.log("BJKAS: ", BJKAS)
    /* api - waitTime sec */ await sleep(waitTime);
        let TTKOM = await hisse("TTKOM");
        console.log("TTKOM: ", TTKOM)
    /* api - waitTime sec */ await sleep(waitTime);
        let TCELL = await hisse("TCELL");
        console.log("TCELL: ", TCELL)

        let borsaIstanbul = [
            GSRAY,
            BJKAS,
            TTKOM,
            TCELL
        ]

        api = [dolar, ...borsaIstanbul, FET, BTC]

    } catch (error) {
        console.warn(error)
    }

    console.log(`Api: `, api)
    resolve(start())
}

async function start() {
    return await new Promise((resolve, reject) => {
        setTimeout(() => interval(resolve, reject), waitTime * 1000)
    })
}

start();

http.listen(80)