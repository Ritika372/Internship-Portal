const jwt = require('jsonwebtoken');
//import jwt from 'jsonwebtoken'; 

const generateToken = (res, id, firstname) => {
  const expiration =  604800000;
  const token = jwt.sign({ id, firstname }, "rohitMittalisthebest", {
    expiresIn:  '7d',
  });
  return res.cookie('studentLogin', token, {
    expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https
    httpOnly: true,
  });
};
module.exports = generateToken