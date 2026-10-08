const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// በሜሞሪ ላይ የሚቀመጥ ጊዜያዊ ዳታቤዝ (ማስመሰያ)
let assignments = [];

// የተመደቡ ስራዎችን ማግኛ
app.get('/api/assignments', (req, res) => {
    res.json(assignments);
});

// አዲስ ስራ መመደቢያ እና የ30 ደቂቃ Buffer Check
app.post('/api/assign-task', (req, res) => {
    const { title, location, cameraman, start_time, end_time } = req.body;

    const newStart = new Date(start_time);
    const newEnd = new Date(end_time);
    const buffer = 30 * 60 * 1000; // 30 ደቂቃ በ milliseconds

    // የተደራረበ ሰዓት ወይም የ30 ደቂቃ ልዩነት አለመኖሩን ማረጋገጥ
    const conflict = assignments.find(item => {
        if (item.cameraman !== cameraman) return false;
        
        const existingStart = new Date(item.start_time).getTime() - buffer;
        const existingEnd = new Date(item.end_time).getTime() + buffer;

        return (newStart.getTime() < existingEnd && newEnd.getTime() > existingStart);
    });

    if (conflict) {
        return res.status(400).json({ 
            success: false, 
            message: "ተደራራቢ ሰዓት አለ! የካሜራ ባለሙያው ሌላ ስራ አለው ወይም በስራዎች መካከል የ30 ደቂቃ ልዩነት የለውም።" 
        });
    }

    const newTask = { id: Date.now(), title, location, cameraman, start_time, end_time };
    assignments.push(newTask);

    res.json({ success: true, message: "ስራው በተሳካ ሁኔታ ተመድቧል!", task: newTask });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));