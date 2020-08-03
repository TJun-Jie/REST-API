const express = require('express');
const router = express.Router();

router.get('/users', (req, res ) => {
    res.send('hi');
})


module.exports = router;