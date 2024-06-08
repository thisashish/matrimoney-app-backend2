const express = require('express');
const router = express.Router();


const qualifications = [
    'High School Diploma/GED',
    'Open school',
    '12th',
    'B.A. (Bachelor of Arts)',
    'B.Sc. (Bachelor of Science)',
    'B.Tech (Bachelor of Technology)',
    'M.A. (Master of Arts)',
    'M.Sc. (Master of Science)',
    'M.Tech (Master of Technology)',
    'M.Com (Master of Commerce)',
    'MCA (Master of Computer Applications)',
    'BCA (Bachelor of Computer Applications)',
    'BBA (Bachelor of Business Administration)',
    'Bachelor of Science in Nursing (BSN)',
    'B.Sc Nursing',
    'Bachelor of Fine Arts (BFA)',
    'Bachelor of Applied Arts (BAA)',
    'Bachelor of Applied Science (BAS)',
    'Bachelor of Architecture (B.Arch.)',
    'PhD (Doctor of Philosophy)',
    'B.Pharm (Bachelor of Pharmacy)',
    'D.Pharm (Diploma in Pharmacy)',
    'MBBS',
    'M.D.',
    'BElEd',
    'DElEd',
    'Vocational Certificate',
    'Technical Diploma',
    'Trade School Certification',
    'Professional Certification',
    'Postgraduate Diploma',
    'Specialist Degree',
    'Juris Doctor (J.D.)',
    'Doctor of Dental Surgery (DDS)',
    'Doctor of Veterinary Medicine (DVM)',
    'Doctor of Business Administration (DBA)',
    'Doctor of Education (Ed.D.)',
    'Doctor of Science (Sc.D.)',
    'Doctor of Engineering (Eng.D.)',
    'Doctor of Theology (Th.D.)',
    'Doctor of Arts (D.A.)',
    'Doctor of Fine Arts (D.F.A.)',
    'Other'
];

// Mapping of search terms to qualification options
const searchTermsMap = {
    'ma': ['M.A. (Master of Arts)', 'M.Sc. (Master of Science)'],
    'ba': ['B.A. (Bachelor of Arts)', 'B.Sc. (Bachelor of Science)', 'B.Tech (Bachelor of Technology)', 'BBA (Bachelor of Business Administration)', 'BCA (Bachelor of Computer Applications)'],
    'bsc': ['B.Sc. (Bachelor of Science)'],
    'btech': ['B.Tech (Bachelor of Technology)'],
    'mca': ['MCA (Master of Computer Applications)'],
    'mba': ['MBA (Master of Business Administration)'],
    'phd': ['PhD (Doctor of Philosophy)'],
    'bpharm': ['B.Pharm (Bachelor of Pharmacy)'],
    'dpharm': ['D.Pharm (Diploma in Pharmacy)'],
    'mbbs': ['MBBS'],
    'md': ['M.D.'],
    'vocational': ['Vocational Certificate'],
    'diploma': ['Technical Diploma', 'Trade School Certification', 'Professional Certification', 'Postgraduate Diploma'],
    'juris': ['Juris Doctor (J.D.)'],
    'doctor': ['Doctor of Dental Surgery (DDS)', 'Doctor of Veterinary Medicine (DVM)', 'Doctor of Business Administration (DBA)', 'Doctor of Education (Ed.D.)', 'Doctor of Science (Sc.D.)', 'Doctor of Engineering (Eng.D.)', 'Doctor of Theology (Th.D.)', 'Doctor of Arts (D.A.)', 'Doctor of Fine Arts (D.F.A.)']
    // Add more common search terms and their mappings here
};

// GET route to retrieve available qualification options with search and filter
router.get('/data', (req, res) => {
    const query = req.query.q;
    if (query) {
        // If there is a query, attempt to map the query to qualification options
        const mappedQualifications = searchTermsMap[query.toLowerCase()];
        if (mappedQualifications) {
            // If mapped qualifications are found, send them as a response
            res.json(mappedQualifications);
        } else {
            // If no mapped qualifications are found, filter the qualifications list based on the query
            const filteredQualifications = qualifications.filter(qualification => qualification.toLowerCase().includes(query.toLowerCase()));
            res.json(filteredQualifications);
        }
    } else {
        // If no query is provided, return all qualifications
        res.json(qualifications);
    }
});

module.exports = router;