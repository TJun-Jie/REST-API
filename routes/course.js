const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {Course} = require('../models')
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

// router.post('/courses', [
//     // Course title must be present
//     check('title')
//         .not().isEmpty()
//         .withMessage('Please Provide a title'),
//     check('description')
//         .exists({ checkNull: true, checkFalsy: true })
//         .withMessage('Please Provide a description')
//     ], bodyParser, asyncHandler( async (req, res ) => {
//         const errors = validationResult(req);
//         console.log(req.body)
//         // If there are errrors
//         if(!errors.isEmpty()) {
//             const errorMessages = errors.array().map(error => error.msg);
//             // Return the validation errors to the client.
//             res.status(400).json({ errors: errorMessages });
//         } 
//         // If there are no errors
//         else{
//             const course = req.body;
//             const newCourse = await Course.create(course);
//             const newCourseId = newCourse.id;
//             res.setHeader("Location", `/api/course/${newCourseId}`);
//             res.status(201).end();
//         }
// }));
router.post('/courses', [
    check("name")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "name"'),
  ], (req, res) => {
    // Attempt to get the validation result from the Request object.
    const errors = validationResult(req);
  
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);
  
      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else {
      // Get the user from the request body.
      const user = req.body;
  
      // Add the user to the `users` array.
      console.log('good')
  
      // Set the status to 201 Created and end the response.
      res.status(201).end();
    }
  });
  

router.put('/courses/:id', bodyParser, asyncHandler( async (req,res ) => {
    const updatedInfo = req.body;
    const id =  req.params.id;
    const targettedCourse =  await Course.findByPk(id);
    await targettedCourse.update(req.body);
    res.status(204).end();
}));

router.delete('/course/:id', asyncHandler (async (req, res) => {
    const id = req.params.id;
    const targettedCourse =  await Course.findByPk(id);
    await targettedCourse.destroy();
    res.status(204).end();

}))
module.exports = router;