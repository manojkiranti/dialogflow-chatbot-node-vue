const AdminService = require( "../services/AdminService" );
const AdminServiceInstance = new AdminService();

module.exports = { login };

async function login ( req, res, next ) {
    AdminServiceInstance.authenticate( req.body )
        .then(user => res.json(user))
        .catch(next);
}
