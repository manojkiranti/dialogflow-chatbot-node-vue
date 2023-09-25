const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
const config = require("./config/keys");
const mongoose = require("mongoose");

mongoose
  .connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("db connection successful");
  })
  .catch((err) => {
    console.log("err", err);
  });

require("./models/Registration");

app.use(bodyParser.json());
require("./routes/dialogFlowRoutes")(app);
require("./routes/fulfillmentRoutes")(app);
// if(process.env.NODE_ENV === 'production') {
//   app.use(express.static('client/dist'));
//    // index.html for all page routes
//    const path = require('path');
//    app.get('*', (req, res) => {
//        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
//    });
// }

if (process.env.NODE_ENV === "production") {
  // Static folder
  app.use(express.static(__dirname + "/public"));

  // Handle SPA
  app.get(/.*/, (req, res) => res.sendFile(__dirname + "/public/index.html"));
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
