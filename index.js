require("dotenv").config();
const puppeteer = require("puppeteer");
const moment = require("moment");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: true, slowMo: 1 });
  const page = await browser.newPage();

  await page.goto(
    `https://oces.myesched.com/schedule/logon.asp?sn=oces.emseschedule.com`
  );

  await page.type("[name=user_id]", process.env.USERNAME);
  await page.type("[name=password]", process.env.PASSWORD);

  await page.click("[name=Submit4]");
  await page.goto(`https://oces.myesched.com/schedule/rptprintmyschedule.asp`);
  await page.click("#expand_btn");
  await page.select(
    "#detailed_search > form > label:nth-child(2) > select",
    "list"
  );
  await page.waitForSelector("#main_table");
  await page.click("#expand_btn");
  const input = await page.$("#to_date");
  await input.click({ clickCount: 3 });
  await page.type("#to_date", "05/31/2025");
  await page.click("#refresh");

  await page.waitForSelector("#main_table", {
    visible: true,
  });

  const data = await page.evaluate(() => {
    const tds = document.querySelectorAll("td");

    const titles = Array.from(tds).map((td) => td.innerText);

    const tableData = [];

    // const headers = document.querySelectorAll('#main_table > thead > tr > th');
    // Array.from(headers).map(header => tableData.headers.push(header.innerText))

    const rows = document.querySelectorAll("#main_table > tbody > tr");
    Array.from(rows).map((row) => {
      const rowData = row.innerText.split(`\t`);
      const times = rowData[1].split("-");
      const start = times[0].trim();
      const end = times[1].trim();
      const obj = {};
      obj.startDate = rowData[0];
      obj.endDate = "";
      obj.title = rowData[4].trim();
      obj.start = start;
      obj.end = end;
      obj.position = rowData[3].trim();
      tableData.push(obj);
    });
    return tableData;
  });

  await browser.close();

  data.map((obj) =>
    obj.start === obj.end
      ? (obj.endDate = moment(obj.startDate).add(1, "d").format("MM/DD/YYYY"))
      : (obj.endDate = obj.startDate)
  );

  const jsonString = JSON.stringify(data);
  fs.writeFileSync("./scheduleList.json", jsonString);

  console.table(data);

  return data;
})();
