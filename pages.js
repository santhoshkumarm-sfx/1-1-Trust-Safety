// ═══════════════════════════════════════════════
//  PAGES.JS  – All page renderers
// ═══════════════════════════════════════════════

// ──────────────────────────────────────────────
//  DASHBOARD
// ──────────────────────────────────────────────
function renderDashboard() {
  if (isManager()) return renderManagerDashboard();

  const email  = currentUser.email;
  const career = getCareerDetails(email);
  const score  = getCareerScore(email);
  const projs  = getUserProjects(email);
  const actions= getUserActions(email);
  const feedback=getUserFeedback(email);
  const notes  = getUserNotes(email);

  const activeProj   = projs.filter(p => p.status === 'In Progress').length;
  const pendingApproval = projs.filter(p => p.approval === 'Pending').length;
  const openActions  = actions.filter(a => a.status === 'Open' || a.status === 'In Progress').length;
  const lastNote     = notes[0];

  return `
  <div class="page-header">
    <h2>Welcome back, ${currentUser.name.split(' ')[0]} 👋</h2>
    <p>Here's your progress overview for this month</p>
  </div>

  <div class="stats-grid">
    ${statCard('Career Score', score + '%', 'blue', '📈', 'Updated ' + formatDate(career.updatedDate))}
    ${statCard('Active Projects', activeProj, 'teal', '🗂️', projs.length + ' total projects')}
    ${statCard('Pending Approvals', pendingApproval, 'amber', '⏳', 'Awaiting manager review')}
    ${statCard('Open Action Items', openActions, 'purple', '✅', actions.length + ' total tasks')}
    ${statCard('Feedback Submitted', feedback.length, 'green', '💬', 'All categories')}
  </div>

  <div class="two-col mt-4">
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Career Progress</div>
          <div class="card-subtitle">Score breakdown by category</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('career')">View Full →</button>
      </div>
      ${careerBreakdown(career)}
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Recent Projects</div>
          <div class="card-subtitle">${projs.length} total</div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('projects')">View All →</button>
      </div>
      ${projs.slice(0,3).map(p => `
        <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:.86rem;font-weight:600;color:var(--navy-900)">${p.title}</span>
            ${statusBadge(p.status)}
          </div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
          <span style="font-size:.74rem;color:var(--gray-400);margin-top:3px;display:block">${p.progress}% complete</span>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="two-col mt-4">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Action Items</div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('actions')">View All →</button>
      </div>
      ${actions.slice(0,4).map(a => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--gray-100)">
          <div style="width:8px;height:8px;border-radius:50%;background:${a.status==='Completed'?'var(--green-500)':isOverdue(a.dueDate)?'var(--red-500)':'var(--amber-500)'};flex-shrink:0"></div>
          <div style="flex:1">
            <div style="font-size:.84rem;font-weight:500;color:var(--gray-800)">${a.task}</div>
            <div style="font-size:.74rem;color:var(--gray-400)">Due ${formatDate(a.dueDate)}</div>
          </div>
          ${statusBadge(a.status)}
        </div>
      `).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Last 1:1 Meeting</div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('onenotes')">View All →</button>
      </div>
      ${lastNote ? `
        <div class="timeline-date">${formatDate(lastNote.date)}</div>
        <p style="font-size:.86rem;color:var(--gray-600);line-height:1.6;margin-top:8px">${lastNote.notes.substring(0,160)}...</p>
        <div class="alert alert-info mt-3" style="margin-bottom:0">
          📅 Next review: <strong>${formatDate(lastNote.nextReview)}</strong>
        </div>
      ` : `<div class="empty-state"><div class="empty-state-icon">📋</div><p>No meeting notes yet</p></div>`}
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-header">
      <div class="card-title">Weekly Pulse Check</div>
      <span style="font-size:.8rem;color:var(--gray-400)">How are you feeling this week?</span>
    </div>
    <div class="pulse-row" id="pulseRow">
      ${['😩','😔','😐','🙂','🤩'].map((e,i) => `
        <button class="pulse-btn" onclick="selectPulse(this,${i+1})" title="${['Struggling','Not great','Neutral','Good','Excellent'][i]}">${e}</button>
      `).join('')}
    </div>
    <p id="pulseMsg" style="font-size:.82rem;color:var(--gray-400);margin-top:10px;display:none"></p>
  </div>`;
}

function renderManagerDashboard() {
  const drs = getDRs();
  const allProjects = DEMO_PROJECTS;
  const allActions  = DEMO_ACTIONS;

  const avgScore = Math.round(drs.reduce((s,dr) => s + getCareerScore(dr.email), 0) / drs.length);
  const pendingApprovals = allProjects.filter(p => p.approval === 'Pending').length;
  const activeProjects   = allProjects.filter(p => p.status === 'In Progress').length;
  const openActions      = allActions.filter(a => a.status === 'Open').length;

  return `
  <div class="page-header">
    <h2>Team Dashboard</h2>
    <p>Trust &amp; Safety · ${drs.length} Direct Reporters</p>
  </div>

  <div class="stats-grid">
    ${statCard('Team Avg Score', avgScore + '%', 'blue', '📊', 'Across ' + drs.length + ' members')}
    ${statCard('Active Projects', activeProjects, 'teal', '🗂️', allProjects.length + ' total')}
    ${statCard('Pending Approvals', pendingApprovals, 'amber', '⏳', 'Awaiting your review')}
    ${statCard('Open Action Items', openActions, 'purple', '✅', 'Across team')}
    ${statCard('Total Feedback', DEMO_FEEDBACK.length, 'green', '💬', DEMO_FEEDBACK.filter(f=>f.status==='Submitted').length + ' unread')}
  </div>

  <div class="card mt-4">
    <div class="card-header">
      <div>
        <div class="card-title">Team Overview</div>
        <div class="card-subtitle">Click on any employee to view their full profile</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="navigateTo('team')">Full View →</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Career Score</th>
            <th>Projects</th>
            <th>Open Tasks</th>
            <th>Last 1:1</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${drs.map(dr => {
            const score = getCareerScore(dr.email);
            const projs = getUserProjects(dr.email);
            const tasks = getUserActions(dr.email).filter(a => a.status !== 'Completed').length;
            const lastNote = getUserNotes(dr.email)[0];
            return `<tr>
              <td>
                <div class="avatar-row">
                  <div class="mini-avatar">${initials(dr.name)}</div>
                  <span class="td-bold">${dr.name}</span>
                </div>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="progress-bar-wrap" style="width:80px;margin-top:0">
                    <div class="progress-bar-fill" style="width:${score}%"></div>
                  </div>
                  <span style="font-family:'JetBrains Mono',monospace;font-size:.8rem;font-weight:700">${score}%</span>
                </div>
              </td>
              <td>${projs.filter(p=>p.status==='In Progress').length} active / ${projs.length} total</td>
              <td><span class="badge ${tasks > 0 ? 'badge-amber' : 'badge-green'}">${tasks} open</span></td>
              <td style="font-size:.82rem;color:var(--gray-500)">${lastNote ? formatDate(lastNote.date) : '—'}</td>
              <td><button class="btn btn-secondary btn-sm" onclick="viewEmployeeProfile('${dr.email}')">View Profile</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="two-col mt-4">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Pending Approvals</div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('approvals')">View All →</button>
      </div>
      ${DEMO_PROJECTS.filter(p=>p.approval==='Pending').map(p => `
        <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:.86rem;font-weight:600;color:var(--navy-900)">${p.title}</div>
              <div style="font-size:.78rem;color:var(--gray-400)">${p.employeeName} · Due ${formatDate(p.targetDate)}</div>
            </div>
            <div style="display:flex;gap:6px;margin-left:8px">
              <button class="btn btn-success btn-sm" onclick="approveProject('${p.id}')">✓</button>
              <button class="btn btn-danger btn-sm" onclick="rejectProject('${p.id}')">✕</button>
            </div>
          </div>
        </div>
      `).join('') || '<div class="empty-state"><p>No pending approvals</p></div>'}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Recent Team Feedback</div>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('feedback')">View All →</button>
      </div>
      ${DEMO_FEEDBACK.slice(0,3).map(f => `
        <div style="padding:10px 0;border-bottom:1px solid var(--gray-100)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span class="badge badge-purple">${f.category}</span>
            ${statusBadge(f.status)}
          </div>
          <p style="font-size:.83rem;color:var(--gray-600)">${f.text.substring(0,100)}...</p>
          <div style="font-size:.74rem;color:var(--gray-400);margin-top:4px">${f.employeeName} · ${formatDate(f.date)}</div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ──────────────────────────────────────────────
//  CAREER PAGE
// ──────────────────────────────────────────────
function renderCareer(targetEmail) {
  const email  = targetEmail || currentUser.email;
  const user   = DEMO_USERS.find(u => u.email === email);
  const career = getCareerDetails(email);
  const score  = getCareerScore(email);

  const cats = [
    { label: 'Projects Completed',   key: 'projectsCompleted',   weight: 40, color: 'var(--blue-500)' },
    { label: 'Process Improvements', key: 'processImprovements', weight: 30, color: 'var(--teal-500)' },
    { label: 'Learning & Certs',      key: 'learningCerts',       weight: 20, color: 'var(--amber-500)' },
    { label: 'Manager Rating',        key: 'managerRating',       weight: 10, color: 'var(--purple-500)' },
  ];

  return `
  <div class="page-header-row">
    <div class="page-header" style="margin-bottom:0">
      <h2>Career Progress</h2>
      <p>${isManager() ? user?.name + "'s " : 'Your '}career score and growth trajectory</p>
    </div>
    ${isManager() ? `<button class="btn btn-primary" onclick="openUpdateCareerModal('${email}')">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
      Update Score
    </button>` : ''}
  </div>

  <div class="two-col mt-4">
    <div class="card">
      <div class="score-circle-wrap">
        ${scoreCircle(score)}
        <div style="margin-top:12px;text-align:center">
          <div style="font-size:.82rem;color:var(--gray-500);font-weight:500">Overall Career Score</div>
          <div style="font-size:.78rem;color:var(--gray-400);margin-top:2px">Last updated ${formatDate(career.updatedDate)}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title" style="margin-bottom:16px">Score Breakdown</div>
      ${cats.map(c => {
        const val = career[c.key] || 0;
        const contrib = Math.round(val * c.weight / 100);
        return `
        <div style="margin-bottom:16px">
          <div class="progress-label">
            <span>${c.label} <span style="color:var(--gray-400);font-size:.75rem">(${c.weight}% weight)</span></span>
            <span>${val}% → <strong>${contrib}pts</strong></span>
          </div>
          <div class="progress-bar-wrap">
            <div style="height:100%;border-radius:100px;background:${c.color};transition:width .6s;width:${val}%"></div>
          </div>
        </div>`;
      }).join('')}
      <div style="border-top:1px solid var(--gray-200);padding-top:12px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:.88rem;font-weight:600;color:var(--gray-600)">Total Score</span>
        <span style="font-size:1.2rem;font-weight:800;color:var(--navy-900);font-family:'JetBrains Mono',monospace">${score}%</span>
      </div>
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-title" style="margin-bottom:16px">Career Trend</div>
    <div class="chart-wrap">
      <canvas id="careerChart"></canvas>
    </div>
  </div>

  `;
}

function initCareerChart() {
  const ctx = document.getElementById('careerChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Career Score',
        data: [52, 58, 61, 65, 70, getCareerScore(currentUser.email)],
        fill: true,
        backgroundColor: 'rgba(15,155,119,.08)',
        borderColor: 'rgba(15,155,119,1)',
        borderWidth: 2.5,
        pointBackgroundColor: 'var(--white)',
        pointBorderColor: 'rgba(15,155,119,1)',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: v => v + '%' } },
        x: { grid: { display: false } },
      }
    }
  });
}

// ──────────────────────────────────────────────
//  PROJECTS PAGE
// ──────────────────────────────────────────────
function renderProjects(targetEmail) {
  const email = targetEmail || currentUser.email;
  const projs = isManager() && !targetEmail ? DEMO_PROJECTS : getUserProjects(email);

  return `
  <div class="page-header-row">
    <div class="page-header" style="margin-bottom:0">
      <h2>Projects</h2>
      <p>${projs.length} projects tracked</p>
    </div>
    <button class="btn btn-primary" onclick="openNewProjectModal()">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
      New Project
    </button>
  </div>

  <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
    ${['All','Draft','In Progress','Completed','Approved'].map(f => `
      <button class="btn btn-secondary btn-sm" onclick="filterProjects('${f}',this)" data-filter="${f}"
        style="${f==='All'?'background:var(--navy-600);color:white;border-color:var(--navy-600)':''}">
        ${f}
      </button>
    `).join('')}
  </div>

  <div id="projectsGrid">
    ${projs.map(p => projectCard(p)).join('') || `<div class="empty-state"><div class="empty-state-icon">🗂️</div><h3>No projects yet</h3><p>Create your first project to get started.</p></div>`}
  </div>`;
}

function projectCard(p) {
  const canApprove = isManager() && p.approval === 'Pending';
  return `
  <div class="card mt-4" data-project-id="${p.id}" data-status="${p.status}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px">
          <span style="font-size:1rem;font-weight:700;color:var(--navy-900)">${p.title}</span>
          ${statusBadge(p.status)}
          ${statusBadge(p.approval)}
        </div>
        ${isManager() ? `<div style="font-size:.78rem;color:var(--gray-400);margin-bottom:8px">👤 ${p.employeeName}</div>` : ''}
        <p style="font-size:.84rem;color:var(--gray-600);line-height:1.5;margin-bottom:12px">${p.problem}</p>
        <div class="progress-label">
          <span style="font-size:.8rem;font-weight:600">Progress</span>
          <span>${p.progress}%</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--gray-100)">
      <span style="font-size:.78rem;color:var(--gray-400)">🎯 Target: ${formatDate(p.targetDate)}</span>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="viewProject('${p.id}')">View Details</button>
        ${canApprove ? `
          <button class="btn btn-success btn-sm" onclick="approveProject('${p.id}')">Approve</button>
          <button class="btn btn-danger btn-sm" onclick="rejectProject('${p.id}')">Reject</button>
        ` : ''}
        ${!isManager() && p.status !== 'Completed' ? `<button class="btn btn-secondary btn-sm" onclick="openEditProjectModal('${p.id}')">Edit</button>` : ''}
        ${isAdminMode() ? `<button class="delete-btn" onclick="deleteProject('${p.id}')">🗑 Delete</button>` : ''}
      </div>
    </div>
  </div>`;
}

// ──────────────────────────────────────────────
//  1:1 NOTES PAGE
// ──────────────────────────────────────────────
function renderNotes(targetEmail) {
  const email = targetEmail || currentUser.email;
  const notes = isManager() && !targetEmail ? DEMO_ONENOTES.sort((a,b)=>new Date(b.date)-new Date(a.date)) : getUserNotes(email);

  return `
  <div class="page-header-row">
    <div class="page-header" style="margin-bottom:0">
      <h2>1:1 Meeting Notes</h2>
      <p>${notes.length} sessions recorded</p>
    </div>
    ${isManager() ? `<button class="btn btn-primary" onclick="openNewNoteModal()">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
      Add Note
    </button>` : ''}
  </div>

  ${isManager() ? `
  <div style="margin-bottom:20px">
    <label class="field-label">Filter by Employee</label>
    <select class="field-select" style="max-width:280px" onchange="filterNotesByEmployee(this.value)">
      <option value="">All Team Members</option>
      ${getDRs().map(dr => `<option value="${dr.email}">${dr.name}</option>`).join('')}
    </select>
  </div>` : ''}

  <div id="notesTimeline">
    ${notes.length === 0 ? `<div class="empty-state"><div class="empty-state-icon">📋</div><h3>No meeting notes yet</h3><p>Notes will appear here after your first 1:1.</p></div>` :
    `<div class="timeline" style="max-width:760px">
      ${notes.map(n => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-date">${formatDate(n.date)}${isManager()?` · ${n.employeeName}`:''}</div>
          <div class="timeline-content">
            <h4>Meeting Notes</h4>
            <p>${n.notes}</p>
            ${n.decisions ? `<div style="margin-top:10px;padding:10px;background:var(--blue-50);border-radius:var(--radius-sm);border-left:3px solid var(--blue-500)">
              <div style="font-size:.74rem;font-weight:700;color:var(--blue-500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Key Decisions</div>
              <div style="font-size:.84rem;color:var(--gray-700)">${n.decisions}</div>
            </div>` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
              <span style="font-size:.76rem;color:var(--gray-400)">📅 Next review: <strong>${formatDate(n.nextReview)}</strong></span>
              <div style="display:flex;gap:6px">
                ${isManager() ? `<button class="btn btn-secondary btn-sm" onclick="openEditNoteModal('${n.id}')">Edit</button>` : ''}
                ${isAdminMode() ? `<button class="delete-btn" onclick="deleteNote('${n.id}')">🗑</button>` : ''}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>`}
  </div>`;
}

// ──────────────────────────────────────────────
//  ACTION ITEMS PAGE
// ──────────────────────────────────────────────
function renderActions(targetEmail) {
  const email = targetEmail || currentUser.email;
  const actions = isManager() && !targetEmail ? DEMO_ACTIONS : getUserActions(email);
  const today = new Date();

  return `
  <div class="page-header-row">
    <div class="page-header" style="margin-bottom:0">
      <h2>Action Items</h2>
      <p>${actions.filter(a=>a.status!=='Completed').length} open · ${actions.filter(a=>a.status==='Completed').length} completed</p>
    </div>
    ${isManager() ? `<button class="btn btn-primary" onclick="openNewActionModal()">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
      New Action
    </button>` : ''}
  </div>

  <div class="card">
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            ${isManager() ? '<th>Assigned To</th>' : ''}
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${actions.map(a => {
            const overdue = isOverdue(a.dueDate) && a.status !== 'Completed';
            return `<tr class="${overdue ? 'row-overdue' : ''}">
              <td>
                <div style="font-weight:500;color:var(--navy-900)">${a.task}</div>
                ${overdue ? `<div style="font-size:.74rem;color:var(--red-500);font-weight:600;margin-top:2px">⚠ Overdue</div>` : ''}
              </td>
              ${isManager() ? `<td><div class="avatar-row"><div class="mini-avatar">${initials(a.ownerName)}</div>${a.ownerName}</div></td>` : ''}
              <td style="font-family:'JetBrains Mono',monospace;font-size:.82rem;color:${overdue?'var(--red-500)':'var(--gray-600)'}">${formatDate(a.dueDate)}</td>
              <td>${statusBadge(a.status)}</td>
              <td>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <select class="field-select" style="padding:5px 8px;font-size:.8rem;width:auto" onchange="updateActionStatus('${a.id}',this.value)">
                    <option ${a.status==='Open'?'selected':''}>Open</option>
                    <option ${a.status==='In Progress'?'selected':''}>In Progress</option>
                    <option ${a.status==='Completed'?'selected':''}>Completed</option>
                  </select>
                  ${isAdminMode() ? `<button class="delete-btn" onclick="deleteActionItem('${a.id}')">🗑 Delete</button>` : ''}
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ──────────────────────────────────────────────
//  FEEDBACK PAGE
// ──────────────────────────────────────────────
function renderFeedback(targetEmail) {
  const email    = targetEmail || currentUser.email;
  const feedback = isManager() && !targetEmail ? DEMO_FEEDBACK : getUserFeedback(email);

  return `
  <div class="page-header-row">
    <div class="page-header" style="margin-bottom:0">
      <h2>Feedback</h2>
      <p>${feedback.length} submissions · ${feedback.filter(f=>f.status==='Submitted').length} unread</p>
    </div>
    ${!isManager() ? `<button class="btn btn-primary" onclick="openNewFeedbackModal()">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
      Submit Feedback
    </button>` : ''}
  </div>

  ${isManager() ? `
  <div class="stats-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
    ${['Team','Process','Tool','Career','Suggestion'].map(cat => {
      const count = DEMO_FEEDBACK.filter(f=>f.category===cat).length;
      return `<div class="card" style="padding:14px;text-align:center">
        <div style="font-size:1.2rem;margin-bottom:4px">${{Team:'👥',Process:'⚙️',Tool:'🛠️',Career:'📈',Suggestion:'💡'}[cat]}</div>
        <div style="font-size:1.2rem;font-weight:800;font-family:'JetBrains Mono',monospace">${count}</div>
        <div style="font-size:.72rem;color:var(--gray-500);text-transform:uppercase;letter-spacing:.04em">${cat}</div>
      </div>`;
    }).join('')}
  </div>` : ''}

  <div style="display:flex;flex-direction:column;gap:14px" id="feedbackList">
    ${feedback.map(f => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
              <span class="badge badge-purple">${f.category}</span>
              ${statusBadge(f.status)}
              ${f.anonymous ? '<span class="badge badge-gray">Anonymous</span>' : ''}
            </div>
            <p style="font-size:.88rem;color:var(--gray-700);line-height:1.6">${f.text}</p>
            <div style="font-size:.76rem;color:var(--gray-400);margin-top:8px">
              ${f.anonymous ? '🔒 Anonymous' : '👤 ' + f.employeeName} · ${formatDate(f.date)}
            </div>
          </div>
          ${isManager() ? `
          <div style="display:flex;gap:6px;flex-shrink:0;flex-direction:column">
            ${f.status==='Submitted' ? `<button class="btn btn-secondary btn-sm" onclick="markFeedbackReviewed('${f.id}')">Mark Reviewed</button>` : ''}
            ${f.status==='Reviewed' ? `<button class="btn btn-secondary btn-sm" onclick="closeFeedback('${f.id}')">Close</button>` : ''}
            ${isAdminMode() ? `<button class="delete-btn" onclick="deleteFeedback('${f.id}')">🗑 Delete</button>` : ''}
          </div>` : ''}
        </div>
      </div>
    `).join('') || `<div class="empty-state"><div class="empty-state-icon">💬</div><h3>No feedback yet</h3><p>Your feedback will appear here.</p></div>`}
  </div>`;
}

// ──────────────────────────────────────────────
//  TEAM OVERVIEW PAGE (manager only)
// ──────────────────────────────────────────────
function renderTeam() {
  const drs = getDRs();

  return `
  <div class="page-header">
    <h2>Team Overview</h2>
    <p>All ${drs.length} Direct Reporters</p>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px">
    ${drs.map(dr => {
      const score   = getCareerScore(dr.email);
      const projs   = getUserProjects(dr.email);
      const actions = getUserActions(dr.email);
      const lastNote= getUserNotes(dr.email)[0];
      const open    = actions.filter(a => a.status !== 'Completed').length;

      return `
      <div class="card" style="cursor:pointer;transition:all .15s" onclick="viewEmployeeProfile('${dr.email}')" onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,var(--blue-500),var(--teal-500));display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;color:white;font-family:'JetBrains Mono',monospace;flex-shrink:0">${initials(dr.name)}</div>
          <div>
            <div style="font-size:.95rem;font-weight:700;color:var(--navy-900)">${dr.name}</div>
            <div style="font-size:.76rem;color:var(--gray-400)">${dr.email}</div>
          </div>
        </div>

        <div class="progress-label">
          <span style="font-size:.8rem">Career Score</span>
          <span>${score}%</span>
        </div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${score}%"></div></div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px">
          ${[
            { label:'Projects', val: projs.length, icon:'🗂️' },
            { label:'Open Tasks', val: open, icon:'✅' },
            { label:'Last 1:1', val: lastNote ? formatDate(lastNote.date).split(' ')[0] : '—', icon:'📅' },
          ].map(s => `
            <div style="text-align:center;background:var(--gray-50);border-radius:var(--radius-sm);padding:8px">
              <div style="font-size:.9rem">${s.icon}</div>
              <div style="font-size:.82rem;font-weight:700;color:var(--navy-900)">${s.val}</div>
              <div style="font-size:.68rem;color:var(--gray-400)">${s.label}</div>
            </div>
          `).join('')}
        </div>

        <button class="btn btn-secondary btn-sm w-full mt-3" style="margin-top:12px">View Full Profile →</button>
      </div>`;
    }).join('')}
  </div>`;
}

// ──────────────────────────────────────────────
//  APPROVALS PAGE (manager only)
// ──────────────────────────────────────────────
function renderApprovals() {
  const pending = DEMO_PROJECTS.filter(p => p.approval === 'Pending');

  return `
  <div class="page-header">
    <h2>Pending Approvals</h2>
    <p>${pending.length} projects awaiting review</p>
  </div>

  ${pending.length === 0 ? `<div class="empty-state" style="padding:80px"><div class="empty-state-icon">✅</div><h3>All caught up!</h3><p>No pending approvals right now.</p></div>` :
  pending.map(p => `
    <div class="card mt-4">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <div style="flex:1">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
            <span style="font-size:1rem;font-weight:700;color:var(--navy-900)">${p.title}</span>
            ${statusBadge(p.status)}
          </div>
          <div style="font-size:.8rem;color:var(--gray-400);margin-bottom:12px">Submitted by ${p.employeeName} · Target: ${formatDate(p.targetDate)}</div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.84rem">
            <div><strong style="color:var(--gray-600)">Problem:</strong><br>${p.problem}</div>
            <div><strong style="color:var(--gray-600)">Proposed Solution:</strong><br>${p.solution}</div>
            <div><strong style="color:var(--gray-600)">Current Situation:</strong><br>${p.current}</div>
            <div><strong style="color:var(--gray-600)">Expected Impact:</strong><br>${p.impact}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;min-width:120px">
          <button class="btn btn-success" onclick="approveProject('${p.id}')">✓ Approve</button>
          <button class="btn btn-danger" onclick="rejectProject('${p.id}')">✕ Reject</button>
        </div>
      </div>
    </div>
  `).join('')}`;
}

// ──────────────────────────────────────────────
//  EMPLOYEE PROFILE (manager view)
// ──────────────────────────────────────────────
function renderEmployeeProfile(email) {
  const user = DEMO_USERS.find(u => u.email === email);
  if (!user) return '<p>Employee not found.</p>';

  return `
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px">
    <button class="btn btn-secondary btn-sm" onclick="navigateTo('team')">← Back</button>
    <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--blue-500),var(--teal-500));display:flex;align-items:center;justify-content:center;font-size:.9rem;font-weight:700;color:white;font-family:'JetBrains Mono',monospace">${initials(user.name)}</div>
    <div>
      <h2 style="font-size:1.3rem;font-weight:700;color:var(--navy-900)">${user.name}</h2>
      <p style="font-size:.82rem;color:var(--gray-400)">${user.email}</p>
    </div>
  </div>

  <div class="tab-bar" id="profileTabBar">
    ${['Career','Projects','Notes','Actions','Feedback'].map((t,i) => `
      <button class="tab-btn ${i===0?'active':''}" onclick="switchProfileTab('${t.toLowerCase()}','${email}',this)">${t}</button>
    `).join('')}
  </div>

  <div id="profileTabContent">
    ${renderCareer(email)}
  </div>`;
}

// ──────────────────────────────────────────────
//  HELPER COMPONENTS
// ──────────────────────────────────────────────
function statCard(label, value, color, icon, sub) {
  return `
  <div class="stat-card ${color}">
    <div class="stat-icon ${color}">${icon}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
    ${sub ? `<div class="stat-trend trend-flat">${sub}</div>` : ''}
  </div>`;
}

function careerBreakdown(career) {
  const cats = [
    { label: 'Projects',    key: 'projectsCompleted',   w: 40 },
    { label: 'Process',     key: 'processImprovements', w: 30 },
    { label: 'Learning',    key: 'learningCerts',        w: 20 },
    { label: 'Rating',      key: 'managerRating',        w: 10 },
  ];
  return cats.map(c => `
    <div style="margin-bottom:12px">
      <div class="progress-label">
        <span>${c.label} <span style="font-size:.72rem;color:var(--gray-400)">${c.w}%</span></span>
        <span>${career[c.key] || 0}%</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${career[c.key]||0}%"></div>
      </div>
    </div>
  `).join('');
}

function scoreCircle(score) {
  const r = 58, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

  return `
  <div class="score-circle">
    <svg viewBox="0 0 140 140" width="140" height="140">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--gray-100)" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="10"
        stroke-dasharray="${circ}" stroke-dashoffset="${fill}" stroke-linecap="round"
        style="transition:stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)"/>
    </svg>
    <div class="score-circle-value">
      <span class="score-circle-number">${score}</span>
      <span class="score-circle-label">Score</span>
    </div>
  </div>`;
}

// ──────────────────────────────────────────────
//  USER MANAGEMENT PAGE (Admin/Manager only)
// ──────────────────────────────────────────────
function renderUserManagement() {
  const drs = getDRs();
  return `
  <div class="page-header-row">
    <div class="page-header" style="margin-bottom:0">
      <h2>User Management</h2>
      <p>Create and manage DR accounts · ${drs.length} members</p>
    </div>
    <button class="btn btn-primary" onclick="openCreateUserModal()">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg>
      Add New DR
    </button>
  </div>

  <div class="alert alert-yellow">
    <span>🔐</span>
    <span>As Admin, you create DR accounts and set their initial passwords. DRs will be prompted to change their password on first login.</span>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title">All Team Members</div>
    </div>
    <div id="userList">
      ${[...DEMO_USERS].map(u => `
        <div class="user-row-card">
          <div class="avatar-row" style="flex:1">
            <div class="mini-avatar" style="width:38px;height:38px;font-size:.82rem;border-radius:10px">${initials(u.name)}</div>
            <div>
              <div style="font-weight:700;color:var(--dark-900);font-size:.9rem">${u.name}</div>
              <div style="font-size:.78rem;color:var(--gray-400)">${u.email}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="badge ${u.role==='Manager'?'badge-yellow':'badge-teal'}">${u.role==='Manager'?'Admin/Manager':'DR'}</span>
            ${u.mustChangePassword ? '<span class="badge badge-amber">Must Change PW</span>' : '<span class="badge badge-green">Active</span>'}
            <button class="btn btn-secondary btn-sm" onclick="openEditCredentialsModal('${u.email}')">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
              Edit
            </button>
            ${u.role !== 'Manager' ? `<button class="btn btn-secondary btn-sm" onclick="openResetPasswordModal('${u.email}','${u.name}')">🔑 Reset PW</button>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

// ──────────────────────────────────────────────
//  MY ACCOUNT PAGE (all users)
// ──────────────────────────────────────────────
function renderMyAccount() {
  const u = currentUser;
  const career = getCareerDetails(u.email);
  const score  = getCareerScore(u.email);

  return `
  <div class="page-header">
    <h2>My Account</h2>
    <p>Manage your profile and credentials</p>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Profile Info</div>
        <button class="btn btn-secondary btn-sm" onclick="openEditMyProfileModal()">Edit</button>
      </div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
        <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,var(--sfx-teal),#0a6b52);display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:700;color:white;font-family:'JetBrains Mono',monospace;border:3px solid rgba(212,224,0,.3)">
          ${initials(u.name)}
        </div>
        <div>
          <div style="font-size:1.1rem;font-weight:800;color:var(--dark-900)">${u.name}</div>
          <div style="font-size:.82rem;color:var(--gray-400)">${u.email}</div>
          <span class="badge ${u.role==='Manager'?'badge-yellow':'badge-teal'}" style="margin-top:4px">${u.role==='Manager'?'Admin / Manager':'Direct Reporter'}</span>
        </div>
      </div>
      <div style="background:var(--gray-50);border-radius:var(--radius-md);padding:14px">
        <div style="font-size:.78rem;color:var(--gray-500);font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Account Details</div>
        <div style="font-size:.86rem;color:var(--gray-700)">
          <div style="margin-bottom:6px">📧 <strong>Email:</strong> ${u.email}</div>
          <div style="margin-bottom:6px">🏢 <strong>Team:</strong> Trust &amp; Safety</div>
          <div>🏷️ <strong>Role:</strong> ${u.role === 'Manager' ? 'Admin / Manager' : 'Direct Reporter'}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Change Password</div>
      </div>
      <div class="alert alert-info" style="font-size:.82rem">Choose a strong password with at least 8 characters.</div>
      <div class="field-group">
        <label class="field-label">Current Password</label>
        <input type="password" id="acCurrentPw" class="field-input" placeholder="Enter current password"/>
      </div>
      <div class="field-group">
        <label class="field-label">New Password</label>
        <input type="password" id="acNewPw1" class="field-input" placeholder="Min 8 characters"/>
      </div>
      <div class="field-group">
        <label class="field-label">Confirm New Password</label>
        <input type="password" id="acNewPw2" class="field-input" placeholder="Repeat new password"/>
      </div>
      <div id="acPwError" class="login-error hidden"></div>
      <button class="btn btn-primary" onclick="handleChangeMyPassword()">Update Password</button>
    </div>
  </div>

  ${!isManager() ? `
  <div class="card mt-4">
    <div class="card-header">
      <div class="card-title">My Career Snapshot</div>
      <button class="btn btn-secondary btn-sm" onclick="navigateTo('career')">Full View →</button>
    </div>
    <div class="two-col">
      <div style="text-align:center;padding:20px">
        ${scoreCircle(score)}
        <div style="font-size:.82rem;color:var(--gray-500);margin-top:8px">Overall Career Score</div>
      </div>
      <div style="padding:10px 0">
        ${careerBreakdown(career)}
      </div>
    </div>
  </div>` : ''}`;
}

// ──────────────────────────────────────────────
//  SETTINGS PAGE
// ──────────────────────────────────────────────
function renderSettings() {
  const adminOn = isAdminMode();

  return `
  <div class="page-header">
    <h2>Settings</h2>
    <p>Manage your preferences and account options</p>
  </div>

  ${isManager() ? `
  <div class="card" style="border:${adminOn ? '2px solid var(--sfx-yellow)' : '1px solid var(--gray-200)'}">
    <div class="card-header">
      <div>
        <div class="card-title">⚡ Admin Mode</div>
        <div class="card-subtitle">Unlock full delete and edit access across all modules</div>
      </div>
      <div class="toggle-switch ${adminOn ? 'on' : ''}" id="adminToggle" onclick="toggleAdminMode()"></div>
    </div>

    ${adminOn ? `
    <div class="alert alert-yellow" style="margin-bottom:0">
      <span>⚡</span>
      <span><strong>Admin Mode is ON.</strong> You can now delete action items, feedback, projects, notes and manage all users. Turn off when done.</span>
    </div>` : `
    <div class="alert alert-info" style="margin-bottom:0">
      <span>🔒</span>
      <span>Admin Mode is off. Turn it on to get full delete/edit access across all data.</span>
    </div>`}

    <div style="margin-top:16px">
      <div style="font-size:.78rem;font-weight:700;color:var(--gray-500);text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">When Admin Mode is ON you can:</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[
          '🗑 Delete any Action Item',
          '🗑 Delete any Feedback',
          '🗑 Delete any Project',
          '🗑 Delete any Meeting Note',
          '👤 Create / Edit / Delete Users',
          '🔑 Reset any DR password',
          '✏️ Edit your own email & password',
          '📊 Override any career score',
        ].map(item => `
          <div style="display:flex;align-items:center;gap:8px;font-size:.83rem;color:var(--gray-700);padding:6px 10px;background:var(--gray-50);border-radius:var(--radius-sm)">
            ${item}
          </div>
        `).join('')}
      </div>
    </div>
  </div>` : ''}

  <div class="card mt-4">
    <div class="card-title" style="margin-bottom:16px">My Profile</div>
    <div class="settings-toggle">
      <div>
        <div style="font-size:.88rem;font-weight:600;color:var(--dark-900)">Full Name</div>
        <div style="font-size:.8rem;color:var(--gray-400)">${currentUser.name}</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="openEditMyProfileModal()">Edit</button>
    </div>
    <div class="settings-toggle">
      <div>
        <div style="font-size:.88rem;font-weight:600;color:var(--dark-900)">Email Address</div>
        <div style="font-size:.8rem;color:var(--gray-400)">${currentUser.email}</div>
      </div>
      ${isManager() ? `<button class="btn btn-secondary btn-sm" onclick="openEditEmailModal()">Edit</button>` : '<span style="font-size:.78rem;color:var(--gray-300)">Contact admin</span>'}
    </div>
    <div class="settings-toggle" style="border-bottom:none">
      <div>
        <div style="font-size:.88rem;font-weight:600;color:var(--dark-900)">Password</div>
        <div style="font-size:.8rem;color:var(--gray-400)">••••••••</div>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="navigateTo('myaccount')">Change</button>
    </div>
  </div>

  <div class="card mt-4">
    <div class="card-title" style="margin-bottom:4px">App Info</div>
    <div style="font-size:.82rem;color:var(--gray-400);margin-bottom:14px">1:1 Trust &amp; Safety Portal</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.83rem">
      <div style="background:var(--gray-50);padding:10px;border-radius:var(--radius-sm)"><strong>Team:</strong> Trust &amp; Safety</div>
      <div style="background:var(--gray-50);padding:10px;border-radius:var(--radius-sm)"><strong>Company:</strong> Shadowfax</div>
      <div style="background:var(--gray-50);padding:10px;border-radius:var(--radius-sm)"><strong>Role:</strong> ${currentUser.role}</div>
      <div style="background:var(--gray-50);padding:10px;border-radius:var(--radius-sm)"><strong>Version:</strong> v2.0</div>
    </div>
  </div>`;
}
