const {User} = require('../models');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');



const authenticateUser = async(req, res, next) => {
    
    let message = null;
  
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
  
    // If the user's credentials are available...
    if (credentials) {
      // Attempt to retrieve the user from the data store
        const user = await User.findOne({
            where: {
                emailAddress: credentials.name
            }
        })
      // If a user was successfully retrieved from the data store...
      if (user) {
        // Use the bcryptjs npm package to compare the user's password of the database and the one in the auth
        const authenticated = bcryptjs
          .compareSync(credentials.pass, user.password);
        // If the passwords match...
        if (authenticated) {
          console.log(`Authentication successful for username: ${user.emailAddress}`);
          // Then store the retrieved user object on the request object
          // so any middleware functions that follow this middleware function
          // will have access to the user's information.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.emailAddress}`;
        }
      } else {
        message = `User not found for username: ${credentials.emailAddress}`;
      }
    } else {
      message = 'Auth header not found';
    }
    // If user authentication failed...
    if (message) {
      console.warn(message);
  
      // Return a response with a 401 Unauthorized HTTP status code.
      res.status(401).json({ message: 'Access Denied. Please login' });
    } else {
      // Or if user authentication succeeded...
      // Call the next() method.
      next();
    }
  };

// Route handler
const asyncHandler = (cb) =>  {
    return async(req, res, next) => {
        try {
            await cb(req, res, next)
        } catch (error) {
            next(error);
        }
    }
}


exports.asyncHandler = asyncHandler;
exports.authenticateUser = authenticateUser;