const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const recommendations = await recommendationService.generateRecommendations(userId);
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch recommendations', error: error.message });
    }
};

// const { PythonShell } = require('python-shell');

// const getRecommendations = (user_id) => {
//     return new Promise((resolve, reject) => {
//         // Adjust the path to recommendationService.py as per your project structure
//         PythonShell.run('services/recommendationService.py', { args: [user_id] }, (err, results) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// };

// module.exports = {
//     getRecommendations
// };

