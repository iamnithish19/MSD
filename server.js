const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory database with realistic initial seed data
let scholarships = [
  {
    id: 'SCH-101',
    title: 'Global STEM Leaders Scholarship',
    category: 'STEM',
    amount: 5000,
    minGpa: 3.5,
    deadline: '2026-10-15',
    description: 'Designed for outstanding undergraduate students pursuing Computer Science, Engineering, or Mathematics degrees.',
    eligibility: 'Minimum 3.5 GPA, enrollment in accredited STEM program.',
    slots: 10
  },
  {
    id: 'SCH-102',
    title: 'Merit Academic Excellence Grant',
    category: 'Merit',
    amount: 3500,
    minGpa: 3.8,
    deadline: '2026-11-01',
    description: 'Awarded to students displaying top-tier academic achievements across all disciplines.',
    eligibility: 'Minimum 3.8 GPA, high school senior or undergraduate.',
    slots: 15
  },
  {
    id: 'SCH-103',
    title: 'Community Empowerment Financial Aid',
    category: 'Need-based',
    amount: 4000,
    minGpa: 3.0,
    deadline: '2026-09-30',
    description: 'Financial support for dedicated students actively engaged in local community leadership and volunteer service.',
    eligibility: 'Minimum 3.0 GPA, demonstrated financial need and community service hours.',
    slots: 8
  },
  {
    id: 'SCH-104',
    title: 'Women in Technology Fellowship',
    category: 'Diversity',
    amount: 6000,
    minGpa: 3.4,
    deadline: '2026-12-01',
    description: 'Empowering female tech innovators to advance artificial intelligence, cybersecurity, and software engineering.',
    eligibility: 'Identify as female, enrolled in IT/CS program, minimum 3.4 GPA.',
    slots: 5
  }
];

let applications = [
  {
    id: 'APP-2001',
    scholarshipId: 'SCH-101',
    scholarshipTitle: 'Global STEM Leaders Scholarship',
    applicantName: 'Nithish Sankara Narayanan S',
    email: 'nithish@example.com',
    gpa: 3.85,
    major: 'Computer Science & Engineering',
    statement: 'Passionate about build automation, DevOps, and cloud architecture.',
    appliedDate: '2026-08-01',
    status: 'Approved'
  },
  {
    id: 'APP-2002',
    scholarshipId: 'SCH-102',
    scholarshipTitle: 'Merit Academic Excellence Grant',
    applicantName: 'Aarav Patel',
    email: 'aarav.patel@example.com',
    gpa: 3.92,
    major: 'Data Science',
    statement: 'Aspiring researcher working on machine learning algorithms.',
    appliedDate: '2026-08-03',
    status: 'Pending'
  },
  {
    id: 'APP-2003',
    scholarshipId: 'SCH-104',
    scholarshipTitle: 'Women in Technology Fellowship',
    applicantName: 'Sophia Chen',
    email: 'sophia.c@example.com',
    gpa: 3.75,
    major: 'Cybersecurity',
    statement: 'Dedicated to building secure digital infrastructure and network defenses.',
    appliedDate: '2026-08-04',
    status: 'Under Review'
  }
];

// --- REST API ENDPOINTS ---

// 1. GET /api/scholarships - Fetch scholarships with search & filters
app.get('/api/scholarships', (req, res) => {
  const { search, category, minGpa } = req.query;
  let filtered = [...scholarships];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All') {
    filtered = filtered.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (minGpa) {
    const gpaVal = parseFloat(minGpa);
    if (!isNaN(gpaVal)) {
      filtered = filtered.filter(s => s.minGpa <= gpaVal);
    }
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

// 2. GET /api/scholarships/:id - Single scholarship details
app.get('/api/scholarships/:id', (req, res) => {
  const scholarship = scholarships.find(s => s.id === req.params.id);
  if (!scholarship) {
    return res.status(404).json({ success: false, message: 'Scholarship not found' });
  }
  res.json({ success: true, data: scholarship });
});

// 3. POST /api/scholarships - Create new scholarship (Admin)
app.post('/api/scholarships', (req, res) => {
  const { title, category, amount, minGpa, deadline, description, eligibility, slots } = req.body;

  if (!title || !category || !amount || !minGpa || !deadline) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const newScholarship = {
    id: `SCH-${100 + scholarships.length + 1}`,
    title,
    category,
    amount: parseFloat(amount),
    minGpa: parseFloat(minGpa),
    deadline,
    description: description || '',
    eligibility: eligibility || '',
    slots: parseInt(slots) || 5
  };

  scholarships.unshift(newScholarship);
  res.status(201).json({ success: true, message: 'Scholarship created successfully', data: newScholarship });
});

// 4. GET /api/applications - List student applications (Admin)
app.get('/api/applications', (req, res) => {
  const { status, search } = req.query;
  let filtered = [...applications];

  if (status && status !== 'All') {
    filtered = filtered.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a => 
      a.applicantName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.scholarshipTitle.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

// 5. POST /api/applications - Submit application (Student)
app.post('/api/applications', (req, res) => {
  const { scholarshipId, applicantName, email, gpa, major, statement } = req.body;

  if (!scholarshipId || !applicantName || !email || !gpa || !major) {
    return res.status(400).json({ success: false, message: 'Missing required application fields' });
  }

  const scholarship = scholarships.find(s => s.id === scholarshipId);
  if (!scholarship) {
    return res.status(404).json({ success: false, message: 'Selected scholarship does not exist' });
  }

  const userGpa = parseFloat(gpa);
  if (userGpa < scholarship.minGpa) {
    return res.status(400).json({ 
      success: false, 
      message: `Applicant GPA (${userGpa}) is lower than minimum requirement (${scholarship.minGpa})` 
    });
  }

  const newApp = {
    id: `APP-${2000 + applications.length + 1}`,
    scholarshipId,
    scholarshipTitle: scholarship.title,
    applicantName,
    email,
    gpa: userGpa,
    major,
    statement: statement || '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Pending'
  };

  applications.unshift(newApp);
  res.status(201).json({ success: true, message: 'Application submitted successfully', data: newApp });
});

// 6. PATCH /api/applications/:id - Update application status (Admin)
app.patch('/api/applications/:id', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const appItem = applications.find(a => a.id === req.params.id);
  if (!appItem) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  appItem.status = status;
  res.json({ success: true, message: `Status updated to ${status}`, data: appItem });
});

// 7. GET /api/stats - Dynamic Analytics Dashboard Statistics
app.get('/api/stats', (req, res) => {
  const totalScholarships = scholarships.length;
  const totalApplications = applications.length;
  const totalFundsAwarded = scholarships.reduce((acc, s) => acc + (s.amount * s.slots), 0);

  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const underReviewCount = applications.filter(a => a.status === 'Under Review').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

  res.json({
    success: true,
    data: {
      totalScholarships,
      totalApplications,
      totalFundsAwarded,
      approvedCount,
      pendingCount,
      underReviewCount,
      rejectedCount
    }
  });
});

// Fallback route to serve SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export app instance for test runner & start server if directly executed
if (require.main === module) {
  const startServer = (port) => {
    const serverInstance = app.listen(port, () => {
      console.log(`====================================================`);
      console.log(`🎓 Scholarship Management System backend running!`);
      console.log(`📡 URL: http://localhost:${port}`);
      console.log(`====================================================`);
    });

    serverInstance.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} is currently in use, trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer(PORT);
}

module.exports = app;
