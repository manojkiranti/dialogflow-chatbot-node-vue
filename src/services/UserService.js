const mongoose = require('mongoose');
const MongooseService = require( "../../foundation/services/MongooseService" ); 

const User = mongoose.model('user')  

class UserService {
    /**
     * @description Create an instance of PostService
     */
    constructor () {
      // Create instance of Data Access layer using our desired model
      this.MongooseServiceInstance = new MongooseService( User );
    }
  
    /**
     * @description Attempt to create a user with the provided object
     * @param userToCreate {object} Object containing all required fields to
     * create post
     * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
     */
    async create ( userToCreate ) {
      try {
        const result = await this.MongooseServiceInstance.create( userToCreate );
        return { success: true, body: result };
      } catch ( err ) {
        return { success: false, error: err };
      }
    }

    async get () {
        try {
            const result = await this.MongooseServiceInstance.find({});
            return { success: true, body: result };
          } catch ( err ) {
            return { success: false, error: err };
          }
    }
  }
  
  module.exports = UserService;