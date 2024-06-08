const express = require('express');
const router = express.Router();
const fs = require("fs");

// Read the JSON file synchronously
const jsonData = JSON.parse(fs.readFileSync('./routes/user/list.json'));

// Route to get data from JSON file with search functionality
router.get('/api/data', (req, res) => {
    const { query } = req.query; 
    let filteredColleges = jsonData;
    if (query) {
        // Filter colleges based on the search query
        filteredColleges = jsonData.filter(college =>
            college['College Name'].toLowerCase().includes(query.toLowerCase())
        );
    }
    res.json(filteredColleges);
});


module.exports = router;
