const Cryptr = require('cryptr');
require('dotenv').config();
const cryptr = new Cryptr(process.env.asdf);


console.log(cryptr.encrypt('asdf'))