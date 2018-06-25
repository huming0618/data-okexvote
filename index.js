const puppeteer = require('puppeteer');
const pg = require('pg');

const createTableSQL = require('./createtable.sql');

const pgConfig = "pg://postgres:nhn!23nhn@localhost:5432/liuda";
const pgClient = new pg.Client(pgConfig);
const TABLE_NAME = 'okexvote';


const main = async () => {

    await pgClient.connect();

    console.log(createTableSQL);
    const result = await pgClient.query(createTableSQL);
    console.log(result);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('response', async (resp)=>{
        const url = resp.url();
        if (url.indexOf('vote/rankingList') > 0){
            const content = await resp.text();
            const ts = new Date();
            const insertQuery = `INSERT INTO ${TABLE_NAME}(detail,ts) VALUES('${content}', NOW())`;
            //console.log(insertQuery)
            //Array.from(document.querySelectorAll('#voteTime>span:nth-child(odd)')).map(x=>x.innerText).join('').replace(/\s/g,'')
            pgClient.query(insertQuery);
        }
    });

    await page.goto('https://www.okex.com/vote/index');

    setInterval(()=>{
        page.reload()
    }, 30 * 1000);
    // setTimeout(async ()=>{
    //     await page.screenshot({path: 'example.png'});
    // }, 5000);
    
    // await browser.close();
}

main();


