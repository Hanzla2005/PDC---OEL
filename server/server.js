const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

app.use('/solr', async (req, res) => {
  const solrUrl = `http://localhost:8983/solr${req.url}`;
  try {
    const response = await fetch(solrUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log('✅ Proxy running at http://localhost:4000');
});

process.stdin.resume();
