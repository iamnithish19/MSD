// State Management
let state = {
  scholarships: [],
  applications: [],
  stats: {},
  currentTab: 'student',
  filters: {
    search: '',
    category: 'All',
    gpa: ''
  }
};

// Initial Datasets for Static Fallback (GitHub Pages)
const DEFAULT_SCHOLARSHIPS = [
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

const DEFAULT_APPLICATIONS = [
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

function getLocalScholarships() {
  const data = localStorage.getItem('sh_scholarships');
  if (!data) {
    localStorage.setItem('sh_scholarships', JSON.stringify(DEFAULT_SCHOLARSHIPS));
    return DEFAULT_SCHOLARSHIPS;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_SCHOLARSHIPS; }
}

function saveLocalScholarships(list) {
  localStorage.setItem('sh_scholarships', JSON.stringify(list));
}

function getLocalApplications() {
  const data = localStorage.getItem('sh_applications');
  if (!data) {
    localStorage.setItem('sh_applications', JSON.stringify(DEFAULT_APPLICATIONS));
    return DEFAULT_APPLICATIONS;
  }
  try { return JSON.parse(data); } catch (e) { return DEFAULT_APPLICATIONS; }
}

function saveLocalApplications(list) {
  localStorage.setItem('sh_applications', JSON.stringify(list));
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  fetchStats();
  fetchScholarships();
  fetchAdminApplications();
});

// --- TAB SWITCHING ---
function switchTab(tabName) {
  state.currentTab = tabName;
  
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active-view'));

  document.getElementById(`tab-btn-${tabName}`).classList.add('active');
  document.getElementById(`view-${tabName}`).classList.add('active-view');

  if (tabName === 'admin') {
    fetchAdminApplications();
    fetchStats();
  }
}

// --- FETCH DATA FROM REST API WITH FALLBACK ---
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (data.success) {
      state.stats = data.data;
      renderStats();
      return;
    }
  } catch (err) {
    // Static Fallback
    const scholarships = getLocalScholarships();
    const applications = getLocalApplications();
    state.stats = {
      totalScholarships: scholarships.length,
      totalApplications: applications.length,
      totalFundsAwarded: scholarships.reduce((acc, s) => acc + (s.amount * s.slots), 0),
      approvedCount: applications.filter(a => a.status === 'Approved').length,
      pendingCount: applications.filter(a => a.status === 'Pending').length,
      underReviewCount: applications.filter(a => a.status === 'Under Review').length,
      rejectedCount: applications.filter(a => a.status === 'Rejected').length
    };
    renderStats();
  }
}

function renderStats() {
  document.getElementById('stat-total-scholarships').textContent = state.stats.totalScholarships || 0;
  document.getElementById('stat-total-applications').textContent = state.stats.totalApplications || 0;
  document.getElementById('stat-total-funds').textContent = `$${(state.stats.totalFundsAwarded || 0).toLocaleString()}`;
  document.getElementById('stat-approved-count').textContent = state.stats.approvedCount || 0;
}

async function fetchScholarships() {
  const grid = document.getElementById('scholarships-grid');
  grid.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading Scholarships...</div>`;

  try {
    const queryParams = new URLSearchParams();
    if (state.filters.search) queryParams.append('search', state.filters.search);
    if (state.filters.category !== 'All') queryParams.append('category', state.filters.category);
    if (state.filters.gpa) queryParams.append('minGpa', state.filters.gpa);

    const res = await fetch(`/api/scholarships?${queryParams.toString()}`);
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();

    if (data.success) {
      state.scholarships = data.data;
      renderScholarships();
      return;
    }
  } catch (err) {
    // Static Fallback Filtering
    let filtered = getLocalScholarships();
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      );
    }
    if (state.filters.category && state.filters.category !== 'All') {
      filtered = filtered.filter(s => s.category.toLowerCase() === state.filters.category.toLowerCase());
    }
    if (state.filters.gpa) {
      const gpaVal = parseFloat(state.filters.gpa);
      if (!isNaN(gpaVal)) {
        filtered = filtered.filter(s => s.minGpa <= gpaVal);
      }
    }
    state.scholarships = filtered;
    renderScholarships();
  }
}

function renderScholarships() {
  const grid = document.getElementById('scholarships-grid');
  
  if (state.scholarships.length === 0) {
    grid.innerHTML = `
      <div class="empty-state glass-panel" style="grid-column: 1/-1; padding: 40px; text-align: center;">
        <i class="fa-solid fa-folder-open" style="font-size: 40px; color: var(--text-dim); margin-bottom: 12px;"></i>
        <h3>No Scholarships Found</h3>
        <p class="subtitle">Try adjusting your filters or search keywords.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.scholarships.map(s => `
    <div class="scholarship-card">
      <div>
        <div class="card-top">
          <span class="card-category">${escapeHTML(s.category)}</span>
          <span class="card-amount">$${s.amount.toLocaleString()}</span>
        </div>
        <h3 class="card-title">${escapeHTML(s.title)}</h3>
        <p class="card-description">${escapeHTML(s.description)}</p>
      </div>

      <div>
        <div class="card-meta">
          <div class="meta-item"><i class="fa-solid fa-star"></i> Min GPA: <strong>${s.minGpa}</strong></div>
          <div class="meta-item"><i class="fa-solid fa-calendar"></i> Deadline: ${s.deadline}</div>
        </div>

        <button class="btn btn-primary" style="width: 100%;" onclick="openApplicationModal('${s.id}', '${escapeHTML(s.title.replace(/'/g, "\\'"))}', ${s.minGpa})">
          <i class="fa-solid fa-paper-plane"></i> Apply Now
        </button>
      </div>
    </div>
  `).join('');
}

// --- FILTER CONTROLS ---
function handleFilterChange() {
  state.filters.search = document.getElementById('filter-search').value.trim();
  state.filters.category = document.getElementById('filter-category').value;
  state.filters.gpa = document.getElementById('filter-gpa').value;

  fetchScholarships();
}

// --- STUDENT APPLICATION MODAL & SUBMISSION ---
function openApplicationModal(schId, schTitle, minGpa) {
  document.getElementById('app-scholarship-id').value = schId;
  document.getElementById('app-sch-display').value = `${schTitle} (Min GPA: ${minGpa})`;
  document.getElementById('modal-sch-title').textContent = `Apply for: ${schTitle}`;
  openModal('modal-application');
}

async function submitApplication(e) {
  e.preventDefault();

  const scholarshipId = document.getElementById('app-scholarship-id').value;
  const applicantName = document.getElementById('app-name').value.trim();
  const email = document.getElementById('app-email').value.trim();
  const gpa = parseFloat(document.getElementById('app-gpa').value);
  const major = document.getElementById('app-major').value.trim();
  const statement = document.getElementById('app-statement').value.trim();

  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scholarshipId, applicantName, email, gpa, major, statement })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        showToast('Application submitted successfully! Tracking ID: ' + data.data.id, 'success');
        closeModal('modal-application');
        document.getElementById('form-application').reset();
        fetchStats();
        return;
      }
    }
    throw new Error('API submission fallback');
  } catch (err) {
    // Static Fallback Handling
    const scholarships = getLocalScholarships();
    const sch = scholarships.find(s => s.id === scholarshipId);
    if (!sch) {
      showToast('Selected scholarship not found', 'error');
      return;
    }
    if (gpa < sch.minGpa) {
      showToast(`GPA (${gpa}) is below required minimum (${sch.minGpa})`, 'error');
      return;
    }

    const apps = getLocalApplications();
    const newApp = {
      id: `APP-${2000 + apps.length + 1}`,
      scholarshipId,
      scholarshipTitle: sch.title,
      applicantName,
      email,
      gpa,
      major,
      statement: statement || '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };

    apps.unshift(newApp);
    saveLocalApplications(apps);

    showToast('Application submitted successfully! Tracking ID: ' + newApp.id, 'success');
    closeModal('modal-application');
    document.getElementById('form-application').reset();
    fetchStats();
    if (state.currentTab === 'admin') fetchAdminApplications();
  }
}

// --- ADMIN APPLICATIONS & STATUS UPDATES ---
async function fetchAdminApplications() {
  const search = document.getElementById('admin-search-input').value.trim();
  const status = document.getElementById('admin-status-filter').value;

  try {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (status !== 'All') queryParams.append('status', status);

    const res = await fetch(`/api/applications?${queryParams.toString()}`);
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();

    if (data.success) {
      state.applications = data.data;
      renderAdminTable();
      return;
    }
  } catch (err) {
    // Static Fallback
    let apps = getLocalApplications();
    if (status && status !== 'All') {
      apps = apps.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(a => 
        a.applicantName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.scholarshipTitle.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }
    state.applications = apps;
    renderAdminTable();
  }
}

function renderAdminTable() {
  const tbody = document.getElementById('applications-table-body');
  
  if (state.applications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No student applications match the selected criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = state.applications.map(app => `
    <tr>
      <td><strong>${app.id}</strong></td>
      <td>
        <div><strong>${escapeHTML(app.applicantName)}</strong></div>
        <div style="font-size: 12px; color: var(--text-dim);">${escapeHTML(app.email)}</div>
      </td>
      <td>${escapeHTML(app.scholarshipTitle)}</td>
      <td>
        <div>GPA: <strong>${app.gpa}</strong></div>
        <div style="font-size: 12px; color: var(--text-dim);">${escapeHTML(app.major)}</div>
      </td>
      <td>${app.appliedDate}</td>
      <td>${getStatusBadge(app.status)}</td>
      <td>
        <div class="action-menu">
          <button class="btn btn-sm btn-success" title="Approve" onclick="updateAppStatus('${app.id}', 'Approved')">
            <i class="fa-solid fa-check"></i>
          </button>
          <button class="btn btn-sm btn-warning" title="Under Review" onclick="updateAppStatus('${app.id}', 'Under Review')">
            <i class="fa-solid fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger" title="Reject" onclick="updateAppStatus('${app.id}', 'Rejected')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getStatusBadge(status) {
  switch (status) {
    case 'Approved': return `<span class="badge badge-status badge-approved"><i class="fa-solid fa-circle-check"></i> Approved</span>`;
    case 'Under Review': return `<span class="badge badge-status badge-review"><i class="fa-solid fa-clock"></i> Under Review</span>`;
    case 'Rejected': return `<span class="badge badge-status badge-rejected"><i class="fa-solid fa-circle-xmark"></i> Rejected</span>`;
    default: return `<span class="badge badge-status badge-pending"><i class="fa-solid fa-hourglass-half"></i> Pending</span>`;
  }
}

async function updateAppStatus(appId, newStatus) {
  try {
    const res = await fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        showToast(`Application ${appId} marked as ${newStatus}`, 'success');
        fetchAdminApplications();
        fetchStats();
        return;
      }
    }
    throw new Error('API patch fallback');
  } catch (err) {
    // Static Fallback
    const apps = getLocalApplications();
    const item = apps.find(a => a.id === appId);
    if (item) {
      item.status = newStatus;
      saveLocalApplications(apps);
      showToast(`Application ${appId} marked as ${newStatus}`, 'success');
      fetchAdminApplications();
      fetchStats();
    }
  }
}

// --- CREATE SCHOLARSHIP (ADMIN) ---
function openCreateScholarshipModal() {
  openModal('modal-create-scholarship');
}

async function submitCreateScholarship(e) {
  e.preventDefault();

  const title = document.getElementById('new-title').value.trim();
  const category = document.getElementById('new-category').value;
  const amount = parseFloat(document.getElementById('new-amount').value);
  const minGpa = parseFloat(document.getElementById('new-minGpa').value);
  const deadline = document.getElementById('new-deadline').value;
  const description = document.getElementById('new-description').value.trim();
  const eligibility = document.getElementById('new-eligibility').value.trim();

  try {
    const res = await fetch('/api/scholarships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, amount, minGpa, deadline, description, eligibility })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        showToast('Published new scholarship listing!', 'success');
        closeModal('modal-create-scholarship');
        document.getElementById('form-create-scholarship').reset();
        fetchScholarships();
        fetchStats();
        return;
      }
    }
    throw new Error('API create scholarship fallback');
  } catch (err) {
    // Static Fallback
    const scholarships = getLocalScholarships();
    const newSch = {
      id: `SCH-${100 + scholarships.length + 1}`,
      title,
      category,
      amount,
      minGpa,
      deadline,
      description: description || '',
      eligibility: eligibility || '',
      slots: 5
    };
    scholarships.unshift(newSch);
    saveLocalScholarships(scholarships);

    showToast('Published new scholarship listing!', 'success');
    closeModal('modal-create-scholarship');
    document.getElementById('form-create-scholarship').reset();
    fetchScholarships();
    fetchStats();
  }
}

// --- APPLICATION TRACKER MODAL ---
function openTrackerModal() {
  openModal('modal-tracker');
}

async function searchApplicationStatus() {
  const query = document.getElementById('tracker-query').value.trim();
  const resultsDiv = document.getElementById('tracker-results');
  
  if (!query) {
    resultsDiv.innerHTML = `<p style="color: var(--color-rose); margin-top: 10px;">Please enter an email or application ID.</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/applications?search=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('API search fallback');
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderTrackerResults(data.data, resultsDiv);
      return;
    } else {
      resultsDiv.innerHTML = `<p style="color: var(--text-muted); margin-top: 12px;">No applications found for "${escapeHTML(query)}".</p>`;
      return;
    }
  } catch (err) {
    // Static Fallback
    const q = query.toLowerCase();
    const apps = getLocalApplications().filter(a => 
      a.applicantName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );

    if (apps.length > 0) {
      renderTrackerResults(apps, resultsDiv);
    } else {
      resultsDiv.innerHTML = `<p style="color: var(--text-muted); margin-top: 12px;">No applications found for "${escapeHTML(query)}".</p>`;
    }
  }
}

function renderTrackerResults(apps, resultsDiv) {
  resultsDiv.innerHTML = apps.map(a => `
    <div class="tracker-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>${a.id}</strong>
        ${getStatusBadge(a.status)}
      </div>
      <div style="margin-top: 8px;"><strong>Scholarship:</strong> ${escapeHTML(a.scholarshipTitle)}</div>
      <div><strong>Applicant:</strong> ${escapeHTML(a.applicantName)}</div>
      <div style="font-size: 12px; color: var(--text-dim); margin-top: 4px;">Applied on ${a.appliedDate}</div>
    </div>
  `).join('');
}

// --- UTILITY FUNCTIONS ---
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHTML(message)}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function escapeHTML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
