const assert = require('assert');
const http = require('http');
const app = require('../server');

let server;
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Jenkins CI API Test Suite...');
  
  // Start server on test port
  server = app.listen(PORT);

  try {
    // Test 1: GET /api/scholarships
    console.log('▶ Test 1: GET /api/scholarships');
    const scholarshipsRes = await makeRequest('/api/scholarships');
    assert.strictEqual(scholarshipsRes.status, 200, 'Expected status 200 for scholarships list');
    assert.strictEqual(scholarshipsRes.body.success, true);
    assert(Array.isArray(scholarshipsRes.body.data), 'Data should be an array');
    console.log(`  ✓ Passed: Found ${scholarshipsRes.body.count} active scholarships.`);

    // Test 2: GET /api/stats
    console.log('▶ Test 2: GET /api/stats');
    const statsRes = await makeRequest('/api/stats');
    assert.strictEqual(statsRes.status, 200, 'Expected status 200 for stats');
    assert.strictEqual(statsRes.body.success, true);
    assert(statsRes.body.data.totalScholarships > 0, 'Should have positive scholarship count');
    console.log(`  ✓ Passed: Stats fetched successfully (Total Funds: $${statsRes.body.data.totalFundsAwarded}).`);

    // Test 3: POST /api/scholarships (Create New Scholarship)
    console.log('▶ Test 3: POST /api/scholarships (Admin Create)');
    const newScholarship = {
      title: 'Jenkins CI/CD Automation Award',
      category: 'STEM',
      amount: 4500,
      minGpa: 3.2,
      deadline: '2026-11-30',
      description: 'Award for students mastering continuous integration and automated deployment.',
      eligibility: 'DevOps & Software Engineering students',
      slots: 5
    };
    const createSchRes = await makeRequest('/api/scholarships', 'POST', newScholarship);
    assert.strictEqual(createSchRes.status, 201, 'Expected status 201 for creation');
    assert.strictEqual(createSchRes.body.success, true);
    assert.strictEqual(createSchRes.body.data.title, 'Jenkins CI/CD Automation Award');
    console.log(`  ✓ Passed: Created scholarship ${createSchRes.body.data.id}.`);

    // Test 4: POST /api/applications (Submit Application)
    console.log('▶ Test 4: POST /api/applications (Student Submission)');
    const newApp = {
      scholarshipId: createSchRes.body.data.id,
      applicantName: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      gpa: 3.6,
      major: 'Cloud Engineering',
      statement: 'Building resilient automated build pipelines.'
    };
    const appRes = await makeRequest('/api/applications', 'POST', newApp);
    assert.strictEqual(appRes.status, 201, 'Expected status 201 for app submission');
    assert.strictEqual(appRes.body.success, true);
    console.log(`  ✓ Passed: Submitted application ${appRes.body.data.id}.`);

    // Test 5: PATCH /api/applications/:id (Admin Status Update)
    console.log('▶ Test 5: PATCH /api/applications/:id (Status Approval)');
    const patchRes = await makeRequest(`/api/applications/${appRes.body.data.id}`, 'PATCH', { status: 'Approved' });
    assert.strictEqual(patchRes.status, 200, 'Expected status 200 for status patch');
    assert.strictEqual(patchRes.body.data.status, 'Approved');
    console.log(`  ✓ Passed: Application status successfully updated to Approved.`);

    console.log('\n====================================================');
    console.log('🎉 ALL JENKINS CI API TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('====================================================');
    process.exitCode = 0;
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
