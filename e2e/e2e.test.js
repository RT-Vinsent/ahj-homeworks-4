import puppetteer from 'puppeteer';
import { fork } from 'child_process';

jest.setTimeout(30000); // default puppeteer timeout

describe('Credit Card Validator form', () => {
  let browser = null;
  let page = null;
  let server = null;
  const baseUrl = 'http://localhost:8888';

  beforeAll(async () => {
    server = fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', reject);
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });

    browser = await puppetteer.launch({
      headless: false, // show gui
      slowMo: 100,
      devtools: false, // show devTools
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    server.kill();
  });

  test('test Credit Card', async () => {
    await page.goto(baseUrl);
    const form = await page.$('[data-id=validator-form]');
    const input = await form.$('[data-id=validator-card]');
    await input.type('4024007143634649');
    const submit = await form.$('[data-id=validate-btn]');
    await submit.click();
    const label = await form.$('[data-id=validator-label]');
    await label.textContent === 'Visa';
  });
});
