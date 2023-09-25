const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const jwt = require('../src/helpers/jwt');
const errorHandler = require('../src/helpers/error-handler');

const { login } = require('../src/controllers/AdminController');

const { getUsers } = require('../src/controllers/UserController');
const { getEnquiries } = require('../src/controllers/EnquiryController');

module.exports = app => {

    // adding Helmet to enhance your API's security
    app.use(helmet());

    // enabling CORS for all requests
    app.use(cors());

    // adding morgan to log HTTP requests
    app.use(morgan('combined'));

    // use JWT auth to secure the api
    app.use(jwt());

    app.post('/api/login', async (req, res, next) => {
      return await login(req, res, next);
    }); 

    app.get('/api/users', async (req, res) => {
      return await getUsers(req, res);
    });

    app.get('/api/enquiries', async (req, res) => {
      return await getEnquiries(req, res);
    });

    // global error handler
    app.use(errorHandler);
} 