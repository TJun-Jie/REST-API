const express = require('express');
const router = express.Router();
const {User} = require('../models')
const bodyParser = require('body-parser').json();


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


router.post('/users',bodyParser,asyncHandler(  async (req, res)  => {
    const user = req.body;
    await User.create(user);
    res.setHeader("Location", "/");
    res.status(201).end();


    
}))


module.exports = router;