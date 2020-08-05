const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const router = express.Router();
const {User} = require('../models');
const { asyncHandler, authenticateUser} = require('./helper');


// Get the currently authenicated user
router.get('/users',authenticateUser, asyncHandler( async (req, res ) => {
    const user = req.currentUser;
    if(user){
        const findUser = await User.findOne({
            where: {
                emailAddress: user.emailAddress
            },
            attributes: {
                exclude: ['password', 'createdAt' , 'updatedAt']
            }       
        })
        res.json(findUser)
    } else {
        res.status(400).end();
    }
    
}));

// Creating user
router.post('/users',[
    // First name is required
    check('firstName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a firstName'),
    // Last name is required
    check('lastName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a lastName'),
    // Email address is required
    check('emailAddress')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a email'),
    //  Password is required
    check('password')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a password'),
    ],asyncHandler(  async (req, res, next)  => {
        const errors = validationResult(req);
          // If there are validation errors...
        if (!errors.isEmpty()) {
            // Use the Array `map()` method to get a list of error messages.
            const errorMessages = errors.array().map(error => error.msg);
            // Return the validation errors to the client.
            res.status(400).json({ errors: errorMessages });
        } else {      
            try {
                const user  = req.body;
                user.password = bcryptjs.hashSync(user.password);
                await User.create(user);
                res.setHeader("Location", "/");
                res.status(201).end();       
                
            } catch (error) {
                console.log('wrong')
                error.status = 400;
                next(error);
            }
        }    
}));


module.exports = router;