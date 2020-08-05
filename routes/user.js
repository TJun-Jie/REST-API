const express = require('express');
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const router = express.Router();
const {User} = require('../models');
const { asyncHandler, authenticateUser} = require('./helper');



router.get('/users',authenticateUser, asyncHandler( async (req, res ) => {
    const user = req.currentUser;
    if(user){
        res.json(user);
    } else {
        res.status(400).end();
    }
    // res.json(user);


}));

router.post('/users',[
    check('firstName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a firstName'),
    check('lastName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a lastName'),
    check('emailAddress')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a email'),
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