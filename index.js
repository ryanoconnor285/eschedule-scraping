const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true, slowMo: 1 });
  const page = await browser.newPage();

  await page.goto(`https://oces.myesched.com/schedule/logon.asp?sn=oces.emseschedule.com`);

  await page.type('[name=user_id]', '');
  await page.type('[name=password]', '');

  await page.click('[name=Submit4]');
  await page.goto(`https://oces.myesched.com/schedule/rptprintmyschedule.asp`);
  await page.click('#expand_btn');
  await page.select('#detailed_search > form > label:nth-child(2) > select', 'list');
  await page.waitForSelector('#main_table');
  await page.click('#expand_btn');
  const input = await page.$('#to_date');
  await input.click({ clickCount: 3 })
  await page.type('#to_date', '05/31/2025');
  await page.click('#refresh');

  await page.waitForSelector('#main_table', {
    visible: true
  });

  await page.screenshot({path: '3.png'});

  const data = await page.evaluate(() => {
    const tds = document.querySelectorAll('td');

    const titles = Array.from(tds).map(td => td.innerText);
    const tableData = {
      headers: [],
      body: []
    }
    const headers = document.querySelectorAll('#main_table > thead > tr > th');
    Array.from(headers).map(header => tableData.headers.push(header.innerText))

    const rows = document.querySelectorAll('#main_table > tbody > tr');
    Array.from(rows).map(row => {
      const rowData = row.innerText.split(`\t`)
      const obj = {}
      obj.date = rowData[0]
      obj.unit = rowData[4]
      obj.duration = rowData[1]
      tableData.body.push(obj)
    })
    return tableData;
  })
  
  await browser.close();

  console.table(data.body);

  return data;
})()
