const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {Course} = require('../models')


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

router.get('/courses', asyncHandler( async (req, res ) => {
    const Courses = await Course.findAll();
    res.json(Courses);
}));
router.get('/courses/:id', asyncHandler( async (req, res ) => {
    const id = req.params.id;
    const specificCourse = await Course.findOne({
        where: {
            id: id
        }
    });
    res.json(specificCourse);
}));

router.post('/courses', [
    // Course title must be present
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a title'),
    // Description
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a description'),
    // UserId
    check('UserId')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a UserId'),
    check('estimatedTime')
        .optional(),
    check('materailsNeeded')
        .optional()
    ], asyncHandler( async (req, res ) => {
        const errors = validationResult(req);
        console.log(req.body)
        // If there are errrors
        if(!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            // Return the validation errors to the client.
            res.status(400).json({ errors: errorMessages });
        } 
        // If there are no errors
        else{
            const course = req.body;
            const newCourse = await Course.create(course);
            const newCourseId = newCourse.id;
            res.setHeader("Location", `/api/course/${newCourseId}`);
            res.status(201).end();
        }
}));


router.put('/courses/:id',[
    // Course title must be present
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a title'),
    // Description
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a description'),
    // UserId
    check('UserId')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a UserId'),
    check('estimatedTime')
        .optional(),
    check('materailsNeeded')
        .optional()
    ] ,asyncHandler( async (req,res ) => {
        const errors = validationResult(req);
        // If there are errrors
        if(!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            // Return the validation errors to the client.
            res.status(400).json({ errors: errorMessages });
        } 
        // If there are no errors
        else{
            const updatedInfo = req.body;
            const id =  req.params.id;
            const targettedCourse =  await Course.findByPk(id);
            await targettedCourse.update(updatedInfo);
            res.status(204).end();
        }

}));

router.delete('/course/:id', asyncHandler (async (req, res) => {
    const id = req.params.id;
    const targettedCourse =  await Course.findByPk(id);
    await targettedCourse.destroy();
    res.status(204).end();

}))
module.exports = router;