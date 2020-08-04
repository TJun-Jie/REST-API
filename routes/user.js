const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {User} = require('../models')


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

router.get('/users', asyncHandler( async (req, res ) => {
    const user = req.currentUser;
    if(user){
        res.json(user);
    } else {
        res.status(400).end();
    }
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
    ],asyncHandler(  async (req, res)  => {
        const errors = validationResult(req);
          // If there are validation errors...
        if (!errors.isEmpty()) {
            // Use the Array `map()` method to get a list of error messages.
            const errorMessages = errors.array().map(error => error.msg);
            // Return the validation errors to the client.
            res.status(400).json({ errors: errorMessages });
        } else {      
            await User.create(req.body);
            res.setHeader("Location", "/");
            res.status(201).end();       
        }    
}));


module.exports = router;