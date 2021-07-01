import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pluginLoader from './lib/plugin.loader';
import responseHandler from './lib/response.handler';

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Server port number
const serverPort = process.env.PORT || 9090;

// Register respond handler
app.use((req, res, next) => {
  req.handleResponse = responseHandler;
  next();
});

// Set root route of the API
app.route('/').get((req, res) => {
  res.send("WELCOME TO CONFERENCE API BY <b>2021S1_REG_WE_14</b>");
});

// Start the server
app.listen(serverPort, () => {
  console.log(`Server start running on PORT ${serverPort}`);
});

/* Start the plugin loader
  This plugin loader will establish the connection with the mongodb
  database and load API routes to provide API endpoints to the user
*/
pluginLoader(app);
