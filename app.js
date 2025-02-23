import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';


let uri;
if (process.env.PROD) {
  uri = Deno.env['MONGO'];
} else {
  dotenv.config();
  uri = process.env['MONGO'];
}

const client = new MongoClient(uri);
let db;
async function connectDB() {
  try {
    await client.connect();
    db = client.db("News_And_Legislation_Info")
    console.log("connected");
  } catch (e) {
    console.error("mongo error", e);
  }
}
await connectDB();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/news', async (req, res) => {
  const c = db.collection("News");
  let p = c.find().sort({"publishedAt": -1});
  if (req.query.n != null) {
    p = p.limit(Number(req.query.n));
  }
  const r = await p.toArray();
  res.json(r);
});

app.get('/laws', async (req, res) => {
  const c = db.collection("Legislation");
  let p = c.find().sort({"updateDate": -1});
  if (req.query.n != null) {
    p = p.limit(Number(req.query.n));
  }
  const r = await p.toArray();
  res.json(r);
});

app.get('/stocks', async (req, res) => {
  const c = db.collection("Stock_Time_Series")
  const r = await c.distinct("ticker")
  res.json(r);
})
app.post('/stocks', async (req, res) => {
  const c = db.collection("Stock_Time_Series")
  let match = {};
  if (req.body.ticker != null) match["ticker"] = req.body.ticker;
  if (req.body.from != null) match["date"] = { "$gt": req.body.from };
  let p = c.find(match).sort({"date": -1});
  const r = await p.toArray();
  res.json(r);
});

app.get('/holdings', async (req, res) => {
  const c = db.collection("Holdings")
  const r = await c.find().toArray();
  res.json(r);
});

app.post('/holdings', async(req, res) => {
  if (req.body.ticker == null) {
    res.sendStatus(500);
    return;
  }
  const c = db.collection("Holdings")
  let query = {};
  query["ticker"] = req.body.ticker;
  //if (req.body.count != null) match["count"] = req.body.count;
  let newVals = {$set: {"count": 100}};
  let options = {upsert: true };

  await c.updateOne(query, newVals, options);
  res.sendStatus(200);
})

app.get('/advice', async (req, res) => {
  const c = db.collection("Advice")
  const r = await c.find().sort({"date": -1}).limit(1).toArray();
  res.json(r);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
