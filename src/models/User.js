const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    fb_id: String,
    address: String,
    first_name: String,
    last_name: String,
    profile_pic: String,
    locale: String,
    gender: String,
    timezone: String,
    registerDate: Date
});

mongoose.model('user', userSchema);