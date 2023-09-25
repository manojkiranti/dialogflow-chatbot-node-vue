const mongoose = require('mongoose');
const { Schema } = mongoose;

const enquirySchema = new Schema({
    fb_id: String,
    name: String,
    loan_type: String,
    occupation: String,
    gender: String,
    phone_number: String,
    is_loan_taken_prev: String,
    // is_loan_taken_prev:{
    //     type: Boolean,
    //     default: false
    // },
    registerDate: Date
});

mongoose.model('enquiry', enquirySchema);