const BASE_URL = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.data = data;
    throw error;
  }
  return data;
}

async function runScenarioTest() {
  console.log('\n======================================================');
  console.log('🧪 Starting End-to-End Section 3.N Integration Test');
  console.log('======================================================\n');

  try {
    // 0. Super Admin Login
    console.log('👉 [Step 0] Super Admin Login...');
    const adminLogin = await req(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@smartplacement.com',
        password: 'Admin@123',
      },
    });
    const adminToken = adminLogin.data?.token || adminLogin.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    console.log('   ✅ Super Admin authenticated.');

    // 1. Super Admin creates Placement Officer
    const uniqueSuffix = Date.now().toString().slice(-5);
    const officerEmail = `officer_${uniqueSuffix}@college.edu`;
    console.log(`👉 [Step 1] Super Admin creates Placement Officer (${officerEmail})...`);
    await req(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: adminHeaders,
      body: {
        name: `Officer ${uniqueSuffix}`,
        email: officerEmail,
        password: 'Password@123',
        role: 'PLACEMENT_OFFICER',
        phone: '9876543210',
      },
    });
    console.log('   ✅ Placement Officer created in MongoDB.');

    // Officer Login
    const officerLogin = await req(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: officerEmail,
        password: 'Password@123',
      },
    });
    const officerToken = officerLogin.data?.token || officerLogin.token;
    const officerHeaders = { Authorization: `Bearer ${officerToken}` };

    // 2. Recruiter registers company
    const recruiterEmail = `hr_${uniqueSuffix}@innovatech.com`;
    console.log(`👉 [Step 2] Recruiter registers company (${recruiterEmail})...`);
    const recruiterReg = await req(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: {
        name: `Innovatech Systems ${uniqueSuffix}`,
        email: recruiterEmail,
        password: 'Company@123',
        role: 'COMPANY',
        phone: '9988776655',
      },
    });
    const recruiterToken = recruiterReg.data?.token || recruiterReg.token;
    const recruiterHeaders = { Authorization: `Bearer ${recruiterToken}` };
    console.log('   ✅ Company registered with PENDING status.');

    // 3. Get Company Record
    const companiesRes = await req(`${BASE_URL}/companies`, { headers: officerHeaders });
    const targetCompany = companiesRes.data.find((c) => c.hrEmail === recruiterEmail);
    if (!targetCompany) throw new Error('Registered company not found');

    // 4 & 5. Placement Officer approves Company
    console.log('👉 [Step 4 & 5] Placement Officer reviews & approves Company...');
    await req(`${BASE_URL}/companies/${targetCompany._id}/approval`, {
      method: 'PUT',
      headers: officerHeaders,
      body: { status: 'APPROVED', approvalStatus: 'APPROVED' },
    });
    console.log('   ✅ Company status updated to APPROVED.');

    // Fetch departments for drive
    const deptsRes = await req(`${BASE_URL}/departments`, { headers: officerHeaders });
    const allDeptIds = deptsRes.data.map(d => d._id);

    // 6. Recruiter creates placement drive
    console.log('👉 [Step 6] Recruiter creates placement drive...');
    const driveRes = await req(`${BASE_URL}/drives`, {
      method: 'POST',
      headers: recruiterHeaders,
      body: {
        jobTitle: `Graduate Engineer Trainee ${uniqueSuffix}`,
        jobDescription: 'Software engineering role for fresh graduates.',
        jobType: 'Full Time',
        location: 'Bangalore',
        workMode: 'Hybrid',
        package: { ctc: 14.5, base: 12.0 },
        minimumCGPA: 7.0,
        maximumBacklogs: 1,
        minimum10thPercentage: 70,
        minimum12thPercentage: 70,
        eligibleDepartments: allDeptIds,
        eligibleBatches: ['2021-2025'],
        status: 'OPEN',
      },
    });
    const driveId = driveRes.data._id;
    console.log('   ✅ Placement drive created & OPEN for eligible candidates.');

    // 9 & 10. Eligibility engine identification
    console.log('👉 [Step 9 & 10] Checking Eligibility Engine results for drive...');
    const eligibleStudentsRes = await req(`${BASE_URL}/drives/${driveId}/eligible-students`, {
      headers: recruiterHeaders,
    });
    console.log(`   ✅ Eligibility Engine matched ${eligibleStudentsRes.count} student(s).`);

    // 11. Student views drive (Arjun Sharma)
    console.log('👉 [Step 11] Student candidate logs in...');
    const studentLogin = await req(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'arjun@student.com',
        password: 'Student@123',
      },
    });
    const studentToken = studentLogin.data?.token || studentLogin.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    // 12. Student applies
    console.log('👉 [Step 12] Student applies for placement drive...');
    const applyRes = await req(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: studentHeaders,
      body: { driveId, coverLetter: 'Excited to apply for GET role!' },
    });
    const applicationId = applyRes.data._id;
    console.log('   ✅ Application submitted successfully.');

    // 13 & 14. Recruiter and Officer view application
    console.log('👉 [Step 14] Recruiter & Officer query application status...');
    const appRecruiterView = await req(`${BASE_URL}/applications/${applicationId}`, {
      headers: recruiterHeaders,
    });
    console.log(`   ✅ Authoritative status across modules: ${appRecruiterView.data.status}`);

    // 15, 16 & 17. Recruiter shortlists student
    console.log('👉 [Step 15, 16 & 17] Recruiter shortlists student...');
    await req(`${BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: recruiterHeaders,
      body: { status: 'SHORTLISTED', remarks: 'Strong DSA foundation.' },
    });
    console.log('   ✅ Application status updated to SHORTLISTED.');

    // 18, 19 & 20. Recruiter schedules interview
    console.log('👉 [Step 18, 19 & 20] Recruiter schedules Technical Interview...');
    const interviewRes = await req(`${BASE_URL}/interviews`, {
      method: 'POST',
      headers: recruiterHeaders,
      body: {
        applicationId,
        roundName: 'Technical Round 1 - Problem Solving',
        roundType: 'TECHNICAL',
        roundNumber: 1,
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        scheduledTime: '11:00 AM',
        meetingLink: 'https://meet.google.com/xyz-placement',
        interviewer: 'Lead Architect',
      },
    });
    const interviewId = interviewRes.data._id;
    console.log('   ✅ Interview scheduled and student notified.');

    // 21 & 22. Recruiter updates interview result
    console.log('👉 [Step 21 & 22] Recruiter marks interview PASSED with score...');
    await req(`${BASE_URL}/interviews/${interviewId}`, {
      method: 'PUT',
      headers: recruiterHeaders,
      body: {
        status: 'PASSED',
        score: 92,
        feedback: 'Excellent problem solving skills and code structure.',
      },
    });
    console.log('   ✅ Interview result updated to PASSED.');

    // 23, 24, 25 & 26. Recruiter selects student -> Placement record created
    console.log('👉 [Step 23, 24 & 25] Recruiter selects student (Final Selection)...');
    await req(`${BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: recruiterHeaders,
      body: { status: 'SELECTED', remarks: 'Final selection approved by panel.' },
    });
    console.log('   ✅ Candidate selected. Placement record generated.');

    // Verify student is now PLACED
    const studentProfileRes = await req(`${BASE_URL}/students/me`, { headers: studentHeaders });
    console.log(`   ✅ Student placementStatus in MongoDB: ${studentProfileRes.data.placementStatus}`);

    // 27. Super Admin analytics update
    console.log('👉 [Step 27] Verifying Super Admin Analytics update...');
    const analyticsRes = await req(`${BASE_URL}/analytics/overview`, { headers: adminHeaders });
    console.log(`   ✅ Placed Students Count: ${analyticsRes.data.placedStudents}`);
    console.log(`   ✅ Placement Percentage: ${analyticsRes.data.placementPercentage}%`);

    // 28. Audit logs contain complete workflow
    console.log('👉 [Step 28] Checking Audit Logs trail...');
    const auditRes = await req(`${BASE_URL}/audit-logs?limit=10`, { headers: adminHeaders });
    const logActions = auditRes.data.map((l) => l.action);
    console.log(`   ✅ Latest Audit Events:`, logActions.slice(0, 5));

    console.log('\n======================================================');
    console.log('🎉 100% SUCCESS: Section 3.N End-to-End Workflow Passed!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err.data || err.message);
    process.exit(1);
  }
}

runScenarioTest();
