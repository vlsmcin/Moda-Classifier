const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/scrape', async (req, res) => {
  const query = req.query.query || 'camiseta branca';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Definindo user-agent para evitar bloqueios simples
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' + 
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  await page.goto(`https://www.lojasrenner.com.br/b?Ntt=${encodeURIComponent(query)}`, {
    waitUntil: 'networkidle2',
  });

  // Espera o seletor aparecer (timeout padrão 30s)
  await page.waitForSelector('[data-product-id]', { timeout: 30000 });

  const produtos = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-product-id]'));
    return cards.slice(0, 3).map(card => ({
      name: card.querySelector('h3[class*="ProductBox_title"]')?.innerText.trim(),
      price: card.querySelector('div[class*="ProductBox_price"]')?.innerText.trim(),
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