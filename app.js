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
  let p = c.find().sort({"date": -1});
  if (req.query.n != null) {
    p = p.limit(Number(req.query.n));
  }
  const r = await p.toArray();
  res.json(r);
});

app.get('/holdings', async (req, res) => {
  const c = db.collection("Holdings")
  const r = await c.find().toArray();
  res.json(r);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
