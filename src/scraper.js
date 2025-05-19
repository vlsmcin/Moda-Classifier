const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors()); // permite chamadas do frontend

app.get('/scrape', async (req, res) => {
  const query = req.query.query || 'camiseta branca';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.lojasrenner.com.br/c/masculino/-/N-1xeiyoy?s_icid=230228_MENU_MASC_GERAL`, {
    waitUntil: 'networkidle2',
  });

  const produtos = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.ProductBox_productBoxContent__DAUwH ')).slice(0, 3).map(card => ({
      name: card.querySelector('.ProductBox_title__x9UGh')?.innerText.trim(),
      price: card.querySelector('.ProductBox_price__d7hDK')?.innerText.trim(),
      link: 'https://www.lojasrenner.com.br' + card.querySelector('a')?.getAttribute('href'),
      image: card.querySelector('img')?.getAttribute('src'),
    }));
  });

  await browser.close();
  res.json(produtos);
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});