require("dotenv").config();
const puppeteer = require("puppeteer");
const moment = require("moment");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true, slowMo: 100 });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });

    await page.goto(`https://mytime.orangecountync.gov/wfc/logon`);

    await page.type("#username", process.env.KRONOS_USERNAME);
    await page.type("#passInput", process.env.KRONOS_PASSWORD);
    await Promise.all([
      await page.click("#loginSubmit"),
      page.waitForNavigation({ waitUntil: "networkidle0" }),
    ]);

    // Click 'My Reports' button
    await page.click(
      "body > krn-app > krn-navigator-container > ui-view > krn-workspace-manager-container > krn-workspace > krn-related-items > div > ul > li:nth-child(4) > div > div"
    );

    // Everything on this page is deeply nested in tables.
    // It is not accessible with selectors but can be accessed with keyboard press

    // Wait for form to finish rendering.
    await page.waitFor(100);

    // Set Option to Time Detail, default is Schedule
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");

    // Click the View Report button
    await page.keyboard.down("Shift");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.up("Shift");
    await page.keyboard.press("Enter");

    // Take Screenshort of Current Pay Report
    await page.screenshot({
      path: "./currentPayPeriod.jpg",
      type: "jpeg",
      fullPage: true,
    });

    // Exit the form
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    // Set Option to Time Detail, default is Schedule
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowDown");

    // Set Dropdown menu to 'Previous Pay Period'
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");

    // Click the View Report button
    await page.keyboard.down("Shift");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.up("Shift");
    await page.keyboard.press("Enter");

    // Take Screenshort of Current Pay Report
    await page.screenshot({
      path: "./previousPayPeriod.jpg",
      type: "jpeg",
      fullPage: true,
    });
    await browser.close();
  } catch (err) {
    console.error(err.msg);
  }
  return 0;
})();
