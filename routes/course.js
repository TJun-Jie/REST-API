const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {Course} = require('../models')
const { asyncHandler, authenticateUser} = require('./helper');

// List every single course available
router.get('/courses', asyncHandler( async (req, res ) => {
    const Courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt' , 'updatedAt']
        }     
    });
    res.json(Courses);
}));
// List the course with the id that is same as the params
router.get('/courses/:id', asyncHandler( async (req, res , next) => {
    const id = req.params.id;
    const specificCourse = await Course.findOne({
        where: {
            id: id
        },
        attributes: {
            exclude: ['createdAt' , 'updatedAt']
        }     
    });
    // If the course exists
    if(specificCourse){
        res.json(specificCourse);
    // If the course does not exist
    } else {
        const error = new Error('Course does not exist')
        error.status = 404;
        next(error);
    }
}));

// Creating courses
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
    check('userId')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a userId'),
    check('estimatedTime')
        .optional(),
    check('materailsNeeded')
        .optional()
    ],authenticateUser,  asyncHandler( async (req, res, next ) => {
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
            try {
                const course = req.body;
                const newCourse = await Course.create(course);
                const newCourseId = newCourse.id;
                res.setHeader("Location", `/api/courses/${newCourseId}`);
                res.status(201).end();
                
            } catch (error) {
                error.status = 400;
                next(error);
            }
        }
}));

// Updating courses
router.put('/courses/:id',[
    // Course title must be present
    check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a title'),
    // Description is required
    check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a description'),
    // UserId is required
    check('userId')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please Provide a userId'),
    // Estimated time is optional
    check('estimatedTime')
        .optional(),
    // Materials needed is optional
    check('materailsNeeded')
        .optional()
    ] ,authenticateUser,  asyncHandler( async (req,res, next ) => {
        const errors = validationResult(req);
        // If there are errrors
        if(!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            // Return the validation errors to the client.
            res.status(400).json({ errors: errorMessages });
        } 
        // If there are no errors
        else{
            try {
                const updatedInfo = req.body;
                const id =  req.params.id;
                const targettedCourse =  await Course.findByPk(id);
                // if course exists
                if(targettedCourse){
                    // if the user that owns the course is updating the course
                    if(req.currentUser.id == targettedCourse.userId){
                        await targettedCourse.update(updatedInfo);
                        res.status(204).end();
                    } 
                    // User does not own the course
                    else{
                        const error = new Error('Unable to update as you do not have ownership of the course');
                        error.status=  403;
                        next(error)
                    }           
                }
                // Course does not exists
                else{
                    const error = new Error('The course you are updating does not exist')
                    error.status = 404;
                    next(error);
                }
            } catch (error) {
                error.status = 400;
                next(error);
            }
        }

}));

// Deleting of courses
router.delete('/courses/:id',authenticateUser,  asyncHandler (async (req, res, next) => {
    try {
        const id = req.params.id;
        const targettedCourse =  await Course.findByPk(id);
        // if course exists
        if(targettedCourse){
            // if the user that owns the course is updating the course
            if(req.currentUser.id == targettedCourse.userId){
                await targettedCourse.destroy();
                res.status(204).end();
            } 
            // User does not own the course
            else{
                const error = new Error('Unable to delete as you do not have ownership of the course');
                error.status=  403;
                next(error)
            }           
        }
        // Course does not exists
        else{
            const error = new Error('The course you are deleting does not exist')
            error.status = 404;
            next(error);
        }
    } catch (error) {
        error.status = 400;
        next(error);
    }

}))
module.exports = router;