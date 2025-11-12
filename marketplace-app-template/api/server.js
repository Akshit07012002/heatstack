/*This is just for developing purpose only.
The production deployment will be done on AWS Lambda.
Hence the lambda will call the handler function in ./index.js directly
without any server requirement.
As this is only for development, keep only one API always with empty route,
and handle all the functionality in that API. Don't add multiple APIs.*/

const express = require("express");
const cors = require("cors");
const handler = require("./index");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const PORT = 8080;

app.use("/", async (req, res) => {
  const response = await handler.handler({
    queryStringParameters: req.query,
    body: req.body,
  });
  res.set(response?.headers);
  res.status(response?.statusCode).json(JSON.parse(response?.body));
});

app.use((err, _req, res, _next) => {
  console.error(`Express Error in localhost:${PORT}`);
  console.error(err);
  res.status(500).send("Something went wrong!");
});

app.listen(PORT, () => {
  console.info(`Server listening at port ${PORT}`);
});
