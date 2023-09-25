const UserService = require( "../services/UserService" );
const UserServiceInstance = new UserService();

module.exports = { createUser, getUsers };

/**
 * @description Create a user with the provided body
 * @param req {object} Express req object 
 * @param res {object} Express res object
 * @returns {Promise<*>}
 */
async function createUser ( req, res ) {
  try {
    // We only pass the body object, never the req object
    const user = await UserServiceInstance.create( req.body );
    return res.send( user );
  } catch ( err ) {
    res.status( 500 ).send( err );
  }
}

async function getUsers ( req, res ) {
    try {
      const users = await UserServiceInstance.get( );
    //   console.log(users)
      return res.send( users );
    } catch ( err ) {
      return res.status( 500 ).send( err );
    }
  }