const EnquiryService = require( "../services/EnquiryService" );
const EnquiryServiceInstance = new EnquiryService();

module.exports = { createEnquiry, getEnquiries };

/**
 * @description Create a enquiry with the provided body
 * @param req {object} Express req object 
 * @param res {object} Express res object
 * @returns {Promise<*>}
 */
async function createEnquiry ( req, res ) {
  try {
    const enquiry = await EnquiryServiceInstance.create( req.body );
    return res.send( enquiry );
  } catch ( err ) {
    res.status( 500 ).send( err );
  }
}

async function getEnquiries ( req, res ) {
    try {
      const enquiries = await EnquiryServiceInstance.get();
      return res.send( enquiries );
    } catch ( err ) {
      return res.status( 500 ).send( err );
    }
  }