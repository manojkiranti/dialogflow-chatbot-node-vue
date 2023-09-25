const mongoose = require('mongoose');
const MongooseService = require( "../../foundation/services/MongooseService" ); 

const Enquiry = mongoose.model('enquiry')  

class EnquiryService {
    /**
     * @description Create an instance of PostService
     */
    constructor () {
      // Create instance of Data Access layer using our desired model
      this.MongooseServiceInstance = new MongooseService( Enquiry );
    }
  
    /**
     * @description Attempt to create a enquiry with the provided object
     * @param enquiryToCreate {object} Object containing all required fields to
     * create post
     * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
     */
    async create ( enquiryToCreate ) {
      try {
        const result = await this.MongooseServiceInstance.create( enquiryToCreate );
        return { success: true, body: result };
      } catch ( err ) {
        return { success: false, error: err };
      }
    }

    async get () {
        try {
            const result = await this.MongooseServiceInstance.find({}, { __v: 0 }, { id: -1 });
            return { success: true, body: result };
          } catch ( err ) {
            return { success: false, error: err };
          }
    }
  }
  
  module.exports = EnquiryService;