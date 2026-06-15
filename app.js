// ═══════════════════════════════════════════════
//  APP.JS  – Navigation, Modals, Interactions
// ═══════════════════════════════════════════════

// ──────────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────────
function initApp() {
  const u = currentUser;

  // Set user info in sidebar
  document.getElementById('userName').textContent    = u.name;
  document.getElementById('userAvatar').textContent  = initials(u.name);
  const roleBadge = document.getElementById('userRoleBadge');
  roleBadge.textContent  = u.role;
  roleBadge.className    = 'user-role ' + (u.role === 'Manager' ? 'role-manager' : 'role-dr');

  // Show manager-only nav items
  if (isManager()) {
    document.querySelectorAll('.manager-only').forEach(el => el.classList.remove('hidden'));
  }

  // Show notification dot if there are pending approvals (manager)
  if (isManager()) {
    const pending = DEMO_PROJECTS.filter(p => p.approval === 'Pending').length;
    if (pending > 0) document.getElementById('notifDot').style.display = 'block';
  }

  navigateTo('dashboard');
}

// ──────────────────────────────────────────────
//  NAVIGATION
// ──────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  career:    'Career Progress',
  projects:  'Projects',
  onenotes:  '1:1 Meeting Notes',
  actions:   'Action Items',
  feedback:  'Feedback',
  team:      'Team Overview',
  approvals: 'Pending Approvals',
};

function navigateTo(page, targetEmail) {
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  document.getElementById('topbarTitle').textContent = PAGE_TITLES[page] || page;

  const content = document.getElementById('pageContent');
  let html = '';

  switch (page) {
    case 'dashboard':  html = renderDashboard();              break;
    case 'career':     html = renderCareer(targetEmail);      break;
    case 'projects':   html = renderProjects(targetEmail);    break;
    case 'onenotes':   html = renderNotes(targetEmail);       break;
    case 'actions':    html = renderActions(targetEmail);     break;
    case 'feedback':   html = renderFeedback(targetEmail);    break;
    case 'team':       html = renderTeam();                   break;
    case 'approvals':  html = renderApprovals();              break;
    case 'usermgmt':   html = renderUserManagement();         break;
    case 'myaccount':  html = renderMyAccount();              break;
    case 'settings':   html = renderSettings();               break;
    default:           html = '<p>Page not found.</p>';
  }

  content.innerHTML = html;

  // Post-render hooks
  if (page === 'career') setTimeout(() => initCareerChart(), 50);

  // Close sidebar on mobile
  if (window.innerWidth < 768) closeSidebar();

  // Scroll to top
  window.scrollTo(0, 0);
}

function viewEmployeeProfile(email) {
  document.getElementById('topbarTitle').textContent = DEMO_USERS.find(u=>u.email===email)?.name + ' — Profile';
  document.getElementById('pageContent').innerHTML = renderEmployeeProfile(email);
  setTimeout(() => initCareerChart(), 50);
}

function switchProfileTab(tab, email, btn) {
  document.querySelectorAll('#profileTabBar .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const content = document.getElementById('profileTabContent');
  switch (tab) {
    case 'career':   content.innerHTML = renderCareer(email);   setTimeout(()=>initCareerChart(),50); break;
    case 'projects': content.innerHTML = renderProjects(email); break;
    case 'notes':    content.innerHTML = renderNotes(email);    break;
    case 'actions':  content.innerHTML = renderActions(email);  break;
    case 'feedback': content.innerHTML = renderFeedback(email); break;
  }
}

// ──────────────────────────────────────────────
//  SIDEBAR
// ──────────────────────────────────────────────
function toggleSidebar() {
  const sb      = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const isOpen  = sb.classList.contains('open');
  if (isOpen) closeSidebar();
  else {
    sb.classList.add('open');
    overlay.classList.remove('hidden');
    overlay.classList.add('open');
  }
}

function closeSidebar() {
  const sb      = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sb.classList.remove('open');
  overlay.classList.remove('open');
  overlay.classList.add('hidden');
}

// ──────────────────────────────────────────────
//  MODALS
// ──────────────────────────────────────────────
function openModal(title, bodyHtml, footerHtml) {
  const container = document.getElementById('modalContainer');
  const overlay   = document.getElementById('modalOverlay');
  container.innerHTML = `
    <div class="modal-header">
      <h3>${title}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
    ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
  `;
  container.classList.remove('hidden');
  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalContainer').classList.add('hidden');
  document.getElementById('modalOverlay').classList.add('hidden');
}

// ── NEW PROJECT MODAL ──
function openNewProjectModal() {
  const drOptions = isManager() ? getDRs().map(dr=>`<option value="${dr.email}">${dr.name}</option>`).join('') : '';

  openModal('New Project', `
    ${isManager() ? `<div class="field-group">
      <label class="field-label">Assign To</label>
      <select class="field-select" id="pEmployee">${drOptions}</select>
    </div>` : ''}
    <div class="field-group">
      <label class="field-label">Project Title *</label>
      <input class="field-input" id="pTitle" placeholder="e.g. COD Fraud Detection System"/>
    </div>
    <div class="field-group">
      <label class="field-label">Problem Statement *</label>
      <textarea class="field-textarea" id="pProblem" placeholder="What problem are you solving?"></textarea>
    </div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Current Situation</label>
        <textarea class="field-textarea" id="pCurrent" placeholder="What is happening now?" style="min-height:70px"></textarea>
      </div>
      <div class="field-group">
        <label class="field-label">Proposed Solution</label>
        <textarea class="field-textarea" id="pSolution" placeholder="Your approach..." style="min-height:70px"></textarea>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Expected Impact</label>
        <input class="field-input" id="pImpact" placeholder="e.g. Reduce fraud by 40%"/>
      </div>
      <div class="field-group">
        <label class="field-label">Target Date *</label>
        <input class="field-input" id="pDate" type="date"/>
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveNewProject()">Submit for Approval</button>`);
}

function saveNewProject() {
  const title   = document.getElementById('pTitle')?.value.trim();
  const problem = document.getElementById('pProblem')?.value.trim();
  const date    = document.getElementById('pDate')?.value;

  if (!title || !problem || !date) { showToast('Please fill in required fields.', 'error'); return; }

  const email  = isManager() ? (document.getElementById('pEmployee')?.value || currentUser.email) : currentUser.email;
  const drUser = DEMO_USERS.find(u => u.email === email);

  const newProj = {
    id: 'P' + Date.now(),
    employee: email,
    employeeName: drUser?.name || currentUser.name,
    title, problem,
    current:  document.getElementById('pCurrent')?.value || '',
    solution: document.getElementById('pSolution')?.value || '',
    impact:   document.getElementById('pImpact')?.value || '',
    targetDate: date,
    status: 'Draft',
    progress: 0,
    approval: 'Pending',
    createdDate: new Date().toISOString().split('T')[0],
  };

  DEMO_PROJECTS.push(newProj);
  closeModal();
  navigateTo('projects');
  showToast('Project submitted for approval!', 'success');
}

// ── EDIT PROJECT MODAL ──
function openEditProjectModal(id) {
  const p = DEMO_PROJECTS.find(x => x.id === id);
  if (!p) return;

  openModal('Edit Project', `
    <div class="field-group">
      <label class="field-label">Project Title</label>
      <input class="field-input" id="epTitle" value="${p.title}"/>
    </div>
    <div class="field-group">
      <label class="field-label">Problem Statement</label>
      <textarea class="field-textarea" id="epProblem">${p.problem}</textarea>
    </div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Current Situation</label>
        <textarea class="field-textarea" id="epCurrent" style="min-height:70px">${p.current}</textarea>
      </div>
      <div class="field-group">
        <label class="field-label">Proposed Solution</label>
        <textarea class="field-textarea" id="epSolution" style="min-height:70px">${p.solution}</textarea>
      </div>
    </div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Status</label>
        <select class="field-select" id="epStatus">
          ${['Draft','In Progress','Completed'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Progress %</label>
        <input class="field-input" id="epProgress" type="number" min="0" max="100" value="${p.progress}"/>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Target Date</label>
      <input class="field-input" id="epDate" type="date" value="${p.targetDate}"/>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveEditProject('${id}')">Save Changes</button>`);
}

function saveEditProject(id) {
  const p = DEMO_PROJECTS.find(x => x.id === id);
  if (!p) return;
  p.title      = document.getElementById('epTitle').value;
  p.problem    = document.getElementById('epProblem').value;
  p.current    = document.getElementById('epCurrent').value;
  p.solution   = document.getElementById('epSolution').value;
  p.status     = document.getElementById('epStatus').value;
  p.progress   = parseInt(document.getElementById('epProgress').value) || 0;
  p.targetDate = document.getElementById('epDate').value;
  closeModal();
  navigateTo('projects');
  showToast('Project updated!', 'success');
}

// ── VIEW PROJECT MODAL ──
function viewProject(id) {
  const p = DEMO_PROJECTS.find(x => x.id === id);
  if (!p) return;
  openModal(p.title, `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${statusBadge(p.status)} ${statusBadge(p.approval)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;font-size:.87rem">
      <div><strong style="color:var(--gray-500);display:block;margin-bottom:3px;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em">Problem Statement</strong>${p.problem}</div>
      <div><strong style="color:var(--gray-500);display:block;margin-bottom:3px;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em">Current Situation</strong>${p.current}</div>
      <div><strong style="color:var(--gray-500);display:block;margin-bottom:3px;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em">Proposed Solution</strong>${p.solution}</div>
      <div><strong style="color:var(--gray-500);display:block;margin-bottom:3px;font-size:.75rem;text-transform:uppercase;letter-spacing:.04em">Expected Impact</strong>${p.impact}</div>
    </div>
    <div style="margin-top:14px">
      <div class="progress-label"><span>Progress</span><span>${p.progress}%</span></div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${p.progress}%"></div></div>
    </div>
    <div style="margin-top:10px;font-size:.82rem;color:var(--gray-400)">Target: ${formatDate(p.targetDate)}</div>
  `, `<button class="btn btn-secondary" onclick="closeModal()">Close</button>`);
}

// ── NEW NOTE MODAL ──
function openNewNoteModal() {
  const drOptions = getDRs().map(dr=>`<option value="${dr.email}">${dr.name}</option>`).join('');
  openModal('Add 1:1 Meeting Notes', `
    <div class="field-group">
      <label class="field-label">Employee</label>
      <select class="field-select" id="nEmployee">${drOptions}</select>
    </div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Meeting Date *</label>
        <input class="field-input" id="nDate" type="date" value="${new Date().toISOString().split('T')[0]}"/>
      </div>
      <div class="field-group">
        <label class="field-label">Next Review Date</label>
        <input class="field-input" id="nNext" type="date"/>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Discussion Notes *</label>
      <textarea class="field-textarea" id="nNotes" style="min-height:110px" placeholder="What was discussed?"></textarea>
    </div>
    <div class="field-group">
      <label class="field-label">Key Decisions</label>
      <textarea class="field-textarea" id="nDecisions" style="min-height:70px" placeholder="Action items, commitments made..."></textarea>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveNewNote()">Save Note</button>`);
}

function saveNewNote() {
  const email = document.getElementById('nEmployee')?.value;
  const date  = document.getElementById('nDate')?.value;
  const notes = document.getElementById('nNotes')?.value.trim();

  if (!notes || !date) { showToast('Date and notes are required.', 'error'); return; }

  const dr = DEMO_USERS.find(u => u.email === email);
  DEMO_ONENOTES.push({
    id: 'N' + Date.now(),
    employee: email,
    employeeName: dr?.name || '',
    date,
    notes,
    decisions: document.getElementById('nDecisions')?.value || '',
    nextReview: document.getElementById('nNext')?.value || '',
  });

  closeModal();
  navigateTo('onenotes');
  showToast('Meeting note saved!', 'success');
}

// ── EDIT NOTE MODAL ──
function openEditNoteModal(id) {
  const n = DEMO_ONENOTES.find(x => x.id === id);
  if (!n) return;
  openModal('Edit Meeting Note', `
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Meeting Date</label>
        <input class="field-input" id="enDate" type="date" value="${n.date}"/>
      </div>
      <div class="field-group">
        <label class="field-label">Next Review</label>
        <input class="field-input" id="enNext" type="date" value="${n.nextReview}"/>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Discussion Notes</label>
      <textarea class="field-textarea" id="enNotes" style="min-height:110px">${n.notes}</textarea>
    </div>
    <div class="field-group">
      <label class="field-label">Key Decisions</label>
      <textarea class="field-textarea" id="enDecisions" style="min-height:70px">${n.decisions}</textarea>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveEditNote('${id}')">Save Changes</button>`);
}

function saveEditNote(id) {
  const n = DEMO_ONENOTES.find(x => x.id === id);
  if (!n) return;
  n.date       = document.getElementById('enDate').value;
  n.nextReview = document.getElementById('enNext').value;
  n.notes      = document.getElementById('enNotes').value;
  n.decisions  = document.getElementById('enDecisions').value;
  closeModal();
  navigateTo('onenotes');
  showToast('Note updated!', 'success');
}

// ── NEW ACTION MODAL ──
function openNewActionModal() {
  const drOptions = getDRs().map(dr=>`<option value="${dr.email}">${dr.name}</option>`).join('');
  openModal('New Action Item', `
    <div class="field-group">
      <label class="field-label">Task Description *</label>
      <input class="field-input" id="atTask" placeholder="e.g. Complete fraud model v1"/>
    </div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Assigned To</label>
        <select class="field-select" id="atOwner">${drOptions}</select>
      </div>
      <div class="field-group">
        <label class="field-label">Due Date *</label>
        <input class="field-input" id="atDue" type="date"/>
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveNewAction()">Create Task</button>`);
}

function saveNewAction() {
  const task = document.getElementById('atTask')?.value.trim();
  const due  = document.getElementById('atDue')?.value;
  if (!task || !due) { showToast('Task and due date are required.', 'error'); return; }

  const email = document.getElementById('atOwner')?.value;
  const dr    = DEMO_USERS.find(u => u.email === email);

  DEMO_ACTIONS.push({
    id: 'A' + Date.now(),
    task,
    owner: email,
    ownerName: dr?.name || '',
    dueDate: due,
    status: 'Open',
  });

  closeModal();
  navigateTo('actions');
  showToast('Action item created!', 'success');
}

// ── NEW FEEDBACK MODAL ──
function openNewFeedbackModal() {
  openModal('Submit Feedback', `
    <div class="alert alert-info" style="margin-bottom:16px">Your feedback helps improve our team and processes.</div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Category *</label>
        <select class="field-select" id="fbCat">
          <option>Team</option><option>Process</option><option>Tool</option><option>Career</option><option>Suggestion</option>
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Visibility</label>
        <select class="field-select" id="fbAnon">
          <option value="false">Named (with my name)</option>
          <option value="true">Anonymous</option>
        </select>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Your Feedback *</label>
      <textarea class="field-textarea" id="fbText" style="min-height:120px" placeholder="Share your thoughts, concerns, or suggestions..."></textarea>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveNewFeedback()">Submit Feedback</button>`);
}

function saveNewFeedback() {
  const text = document.getElementById('fbText')?.value.trim();
  if (!text) { showToast('Please write your feedback.', 'error'); return; }

  const anon = document.getElementById('fbAnon')?.value === 'true';

  DEMO_FEEDBACK.push({
    id: 'F' + Date.now(),
    employee: currentUser.email,
    employeeName: anon ? 'Anonymous' : currentUser.name,
    category: document.getElementById('fbCat')?.value,
    text,
    anonymous: anon,
    status: 'Submitted',
    date: new Date().toISOString().split('T')[0],
  });

  closeModal();
  navigateTo('feedback');
  showToast('Feedback submitted!', 'success');
}

// ── UPDATE CAREER MODAL ──
function openUpdateCareerModal(email) {
  const c = getCareerDetails(email);
  openModal('Update Career Score', `
    <p style="font-size:.84rem;color:var(--gray-500);margin-bottom:16px">Update the career score components for this employee.</p>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Projects Completed % (40 wt)</label>
        <input class="field-input" id="ucProjects" type="number" min="0" max="100" value="${c.projectsCompleted}"/>
      </div>
      <div class="field-group">
        <label class="field-label">Process Improvements % (30 wt)</label>
        <input class="field-input" id="ucProcess" type="number" min="0" max="100" value="${c.processImprovements}"/>
      </div>
      <div class="field-group">
        <label class="field-label">Learning & Certs % (20 wt)</label>
        <input class="field-input" id="ucLearning" type="number" min="0" max="100" value="${c.learningCerts}"/>
      </div>
      <div class="field-group">
        <label class="field-label">Manager Rating % (10 wt)</label>
        <input class="field-input" id="ucRating" type="number" min="0" max="100" value="${c.managerRating}"/>
      </div>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveCareerUpdate('${email}')">Save Score</button>`);
}

function saveCareerUpdate(email) {
  DEMO_CAREER[email] = {
    projectsCompleted:   parseInt(document.getElementById('ucProjects').value) || 0,
    processImprovements: parseInt(document.getElementById('ucProcess').value)  || 0,
    learningCerts:        parseInt(document.getElementById('ucLearning').value) || 0,
    managerRating:        parseInt(document.getElementById('ucRating').value)  || 0,
    updatedDate: new Date().toISOString().split('T')[0],
  };
  closeModal();
  navigateTo('career');
  showToast('Career score updated!', 'success');
}

// ──────────────────────────────────────────────
//  PROJECT ACTIONS
// ──────────────────────────────────────────────
function approveProject(id) {
  const p = DEMO_PROJECTS.find(x => x.id === id);
  if (!p) return;
  p.approval = 'Approved';
  p.status   = 'In Progress';
  // Refresh current page
  const currentPage = document.querySelector('.nav-item.active')?.dataset.page || 'dashboard';
  navigateTo(currentPage);
  showToast('Project approved!', 'success');
}

function rejectProject(id) {
  const p = DEMO_PROJECTS.find(x => x.id === id);
  if (!p) return;
  p.approval = 'Rejected';
  const currentPage = document.querySelector('.nav-item.active')?.dataset.page || 'dashboard';
  navigateTo(currentPage);
  showToast('Project rejected.', 'error');
}

// ──────────────────────────────────────────────
//  ACTION ITEM STATUS
// ──────────────────────────────────────────────
function updateActionStatus(id, status) {
  const a = DEMO_ACTIONS.find(x => x.id === id);
  if (!a) return;
  a.status = status;
  showToast('Task updated to: ' + status, 'success');
}

// ──────────────────────────────────────────────
//  FEEDBACK ACTIONS
// ──────────────────────────────────────────────
function markFeedbackReviewed(id) {
  const f = DEMO_FEEDBACK.find(x => x.id === id);
  if (!f) return;
  f.status = 'Reviewed';
  navigateTo('feedback');
  showToast('Feedback marked as reviewed.', 'success');
}

function closeFeedback(id) {
  const f = DEMO_FEEDBACK.find(x => x.id === id);
  if (!f) return;
  f.status = 'Closed';
  navigateTo('feedback');
  showToast('Feedback closed.', 'success');
}

// ──────────────────────────────────────────────
//  PROJECT FILTERS
// ──────────────────────────────────────────────
function filterProjects(filter, btn) {
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.style.background = '';
    b.style.color = '';
    b.style.borderColor = '';
  });
  btn.style.background   = 'var(--navy-600)';
  btn.style.color        = 'white';
  btn.style.borderColor  = 'var(--navy-600)';

  const cards = document.querySelectorAll('[data-project-id]');
  cards.forEach(card => {
    const show = filter === 'All' || card.dataset.status === filter;
    card.style.display = show ? '' : 'none';
  });
}

function filterNotesByEmployee(email) {
  const items = document.querySelectorAll('.timeline-item');
  items.forEach(item => {
    if (!email) { item.style.display = ''; return; }
    const visible = item.innerHTML.includes(DEMO_USERS.find(u=>u.email===email)?.name || '');
    item.style.display = visible ? '' : 'none';
  });
}

// ──────────────────────────────────────────────
//  PULSE CHECK
// ──────────────────────────────────────────────
function selectPulse(btn, score) {
  document.querySelectorAll('.pulse-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const labels = ['Struggling','Not great','Neutral','Good','Excellent'];
  const msg = document.getElementById('pulseMsg');
  msg.textContent = `You selected: ${labels[score-1]} — Thanks for sharing!`;
  msg.style.display = 'block';
  showToast('Pulse check recorded!', 'success');
}

// ──────────────────────────────────────────────
//  NOTIFICATIONS
// ──────────────────────────────────────────────
function toggleNotifications() {
  if (!isManager()) return;
  const pending = DEMO_PROJECTS.filter(p => p.approval === 'Pending');
  const unread  = DEMO_FEEDBACK.filter(f => f.status === 'Submitted');
  showToast(`${pending.length} pending approvals · ${unread.length} unread feedback`, 'success');
}

// ──────────────────────────────────────────────
//  TOAST
// ──────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = type;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ──────────────────────────────────────────────
//  KEYBOARD ESCAPE
// ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ══════════════════════════════════════════════
//  EXTENDED PAGE TITLES
// ══════════════════════════════════════════════
PAGE_TITLES['usermgmt']  = 'User Management';
PAGE_TITLES['myaccount'] = 'My Account';
PAGE_TITLES['settings']  = 'Settings';

// ── CREATE USER MODAL ──
function openCreateUserModal() {
  openModal('Add New DR Account', `
    <div class="alert alert-yellow">The DR will be asked to change their password on first login.</div>
    <div class="form-grid-2">
      <div class="field-group">
        <label class="field-label">Full Name *</label>
        <input class="field-input" id="nuName" placeholder="e.g. Rahul Verma"/>
      </div>
      <div class="field-group">
        <label class="field-label">Work Email *</label>
        <input class="field-input" id="nuEmail" placeholder="name@shadowfax.in"/>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Initial Password * <span style="font-size:.75rem;color:var(--gray-400)">(DR must change on first login)</span></label>
      <input class="field-input" id="nuPassword" type="password" placeholder="Set a temporary password"/>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveNewUser()">Create Account</button>`);
}

function saveNewUser() {
  const name     = document.getElementById('nuName')?.value.trim();
  const email    = document.getElementById('nuEmail')?.value.trim().toLowerCase();
  const password = document.getElementById('nuPassword')?.value;

  if (!name || !email || !password) { showToast('All fields are required.', 'error'); return; }
  if (!email.endsWith('@' + CONFIG.ALLOWED_DOMAIN)) { showToast('Email must be @' + CONFIG.ALLOWED_DOMAIN, 'error'); return; }
  if (DEMO_USERS.find(u => u.email === email)) { showToast('This email already exists.', 'error'); return; }
  if (password.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }

  DEMO_USERS.push({ email, name, role: 'DR', password, mustChangePassword: true });
  DEMO_CAREER[email] = { projectsCompleted: 0, processImprovements: 0, learningCerts: 0, managerRating: 0, updatedDate: new Date().toISOString().split('T')[0] };

  closeModal();
  document.getElementById('pageContent').innerHTML = renderUserManagement();
  showToast(`Account created for ${name}. They must change password on first login.`, 'success');

  if (!CONFIG.DEMO_MODE) {
    callAPI('createUser', { name, email, password, role: 'DR', mustChangePassword: true });
  }
}

// ── EDIT CREDENTIALS MODAL ──
function openEditCredentialsModal(email) {
  const user = DEMO_USERS.find(u => u.email === email);
  if (!user) return;
  openModal(`Edit: ${user.name}`, `
    <div class="field-group">
      <label class="field-label">Full Name</label>
      <input class="field-input" id="ecName" value="${user.name}"/>
    </div>
    <div class="field-group">
      <label class="field-label">Email</label>
      <input class="field-input" id="ecEmail" value="${user.email}" ${user.role==='Manager'?'readonly style="background:var(--gray-100)"':''}/>
    </div>
    ${isManager() ? `
    <div class="field-group">
      <label class="field-label">Role</label>
      <select class="field-select" id="ecRole">
        <option ${user.role==='Manager'?'selected':''}>Manager</option>
        <option ${user.role==='DR'?'selected':''}>DR</option>
      </select>
    </div>` : ''}
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveEditCredentials('${email}')">Save Changes</button>`);
}

function saveEditCredentials(originalEmail) {
  const user = DEMO_USERS.find(u => u.email === originalEmail);
  if (!user) return;
  user.name  = document.getElementById('ecName').value.trim() || user.name;
  if (user.role !== 'Manager') {
    user.email = document.getElementById('ecEmail').value.trim().toLowerCase() || user.email;
  }
  if (isManager() && document.getElementById('ecRole')) {
    user.role = document.getElementById('ecRole').value;
  }
  closeModal();
  document.getElementById('pageContent').innerHTML = renderUserManagement();
  showToast('User updated!', 'success');
}

// ── RESET PASSWORD MODAL (manager resets DR's password) ──
function openResetPasswordModal(email, name) {
  openModal(`Reset Password: ${name}`, `
    <div class="alert alert-yellow">The DR will be required to change this password on their next login.</div>
    <div class="field-group">
      <label class="field-label">New Temporary Password *</label>
      <input class="field-input" id="rpPassword" type="password" placeholder="Set a temporary password"/>
    </div>
    <div class="field-group">
      <label class="field-label">Confirm Password *</label>
      <input class="field-input" id="rpPassword2" type="password" placeholder="Repeat password"/>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveResetPassword('${email}','${name}')">Reset Password</button>`);
}

function saveResetPassword(email, name) {
  const p1 = document.getElementById('rpPassword')?.value;
  const p2 = document.getElementById('rpPassword2')?.value;
  if (!p1 || p1.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
  if (p1 !== p2) { showToast('Passwords do not match.', 'error'); return; }

  const user = DEMO_USERS.find(u => u.email === email);
  if (user) { user.password = p1; user.mustChangePassword = true; }

  closeModal();
  document.getElementById('pageContent').innerHTML = renderUserManagement();
  showToast(`Password reset for ${name}. They must change it on next login.`, 'success');

  if (!CONFIG.DEMO_MODE) {
    callAPI('resetPassword', { email, password: p1, mustChangePassword: true });
  }
}

// ── CHANGE MY OWN PASSWORD ──
function handleChangeMyPassword() {
  const current = document.getElementById('acCurrentPw')?.value;
  const p1      = document.getElementById('acNewPw1')?.value;
  const p2      = document.getElementById('acNewPw2')?.value;
  const errEl   = document.getElementById('acPwError');
  errEl.classList.add('hidden');

  const user = DEMO_USERS.find(u => u.email === currentUser.email);
  if (CONFIG.DEMO_MODE && user && user.password !== current) {
    errEl.textContent = 'Current password is incorrect.';
    errEl.classList.remove('hidden'); return;
  }
  if (!p1 || p1.length < 8) {
    errEl.textContent = 'New password must be at least 8 characters.';
    errEl.classList.remove('hidden'); return;
  }
  if (p1 !== p2) {
    errEl.textContent = 'Passwords do not match.';
    errEl.classList.remove('hidden'); return;
  }

  // Update DEMO_USERS — this is what login checks against
  if (user) {
    user.password = p1;
    user.mustChangePassword = false;
  }

  document.getElementById('acCurrentPw').value = '';
  document.getElementById('acNewPw1').value = '';
  document.getElementById('acNewPw2').value = '';
  showToast('Password changed! Use the new password on next login.', 'success');

  if (!CONFIG.DEMO_MODE) {
    callAPI('changePassword', { email: currentUser.email, currentPassword: current, newPassword: p1 });
  }
}

// ── EDIT MY PROFILE MODAL ──
function openEditMyProfileModal() {
  const u = currentUser;
  openModal('Edit Profile', `
    <div class="field-group">
      <label class="field-label">Full Name</label>
      <input class="field-input" id="mpName" value="${u.name}"/>
    </div>
    <div class="field-group">
      <label class="field-label">Email</label>
      <input class="field-input" value="${u.email}" readonly style="background:var(--gray-100);color:var(--gray-400)"/>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveMyProfile()">Save</button>`);
}

function saveMyProfile() {
  const name = document.getElementById('mpName')?.value.trim();
  if (!name) { showToast('Name cannot be empty.', 'error'); return; }
  const user = DEMO_USERS.find(u => u.email === currentUser.email);
  if (user) user.name = name;
  currentUser.name = name;
  sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(currentUser));
  document.getElementById('userName').textContent = name;
  document.getElementById('userAvatar').textContent = initials(name);
  closeModal();
  document.getElementById('pageContent').innerHTML = renderMyAccount();
  showToast('Profile updated!', 'success');
}

// ══════════════════════════════════════════════
//  ADMIN MODE SYSTEM
// ══════════════════════════════════════════════

let _adminModeOn = false;

function isAdminMode() { return _adminModeOn && isManager(); }

function toggleAdminMode() {
  if (!isManager()) { showToast('Only managers can use Admin Mode.', 'error'); return; }
  _adminModeOn = !_adminModeOn;

  // Banner
  const banner = document.getElementById('adminModeBanner');
  if (banner) banner.classList.toggle('hidden', !_adminModeOn);

  // Top badge
  const badge = document.getElementById('adminModeTopBadge');
  if (badge) badge.classList.toggle('hidden', !_adminModeOn);

  // Show/hide admin nav items
  document.querySelectorAll('.admin-only').forEach(el => {
    el.classList.toggle('hidden', !_adminModeOn);
  });

  // Sidebar border glow
  const sidebar = document.getElementById('sidebar');
  if (_adminModeOn) sidebar.style.borderRight = '2px solid var(--sfx-yellow)';
  else sidebar.style.borderRight = '';

  // Refresh current page to show/hide delete buttons
  const currentPage = document.querySelector('.nav-item.active')?.dataset.page || 'dashboard';
  if (['actions','feedback','projects','onenotes','usermgmt','settings'].includes(currentPage)) {
    navigateTo(currentPage);
  } else {
    navigateTo('settings');
  }

  showToast(_adminModeOn ? '⚡ Admin Mode ON — Full access enabled' : '🔒 Admin Mode OFF', _adminModeOn ? 'success' : 'success');
}

// ── DELETE FUNCTIONS (admin only) ──
function deleteActionItem(id) {
  if (!isAdminMode()) { showToast('Enable Admin Mode first.', 'error'); return; }
  if (!confirm('Delete this action item? This cannot be undone.')) return;
  const idx = DEMO_ACTIONS.findIndex(a => a.id === id);
  if (idx > -1) DEMO_ACTIONS.splice(idx, 1);
  navigateTo('actions');
  showToast('Action item deleted.', 'success');
}

function deleteFeedback(id) {
  if (!isAdminMode()) { showToast('Enable Admin Mode first.', 'error'); return; }
  if (!confirm('Delete this feedback? This cannot be undone.')) return;
  const idx = DEMO_FEEDBACK.findIndex(f => f.id === id);
  if (idx > -1) DEMO_FEEDBACK.splice(idx, 1);
  navigateTo('feedback');
  showToast('Feedback deleted.', 'success');
}

function deleteProject(id) {
  if (!isAdminMode()) { showToast('Enable Admin Mode first.', 'error'); return; }
  if (!confirm('Delete this project? This cannot be undone.')) return;
  const idx = DEMO_PROJECTS.findIndex(p => p.id === id);
  if (idx > -1) DEMO_PROJECTS.splice(idx, 1);
  navigateTo('projects');
  showToast('Project deleted.', 'success');
}

function deleteNote(id) {
  if (!isAdminMode()) { showToast('Enable Admin Mode first.', 'error'); return; }
  if (!confirm('Delete this meeting note? This cannot be undone.')) return;
  const idx = DEMO_ONENOTES.findIndex(n => n.id === id);
  if (idx > -1) DEMO_ONENOTES.splice(idx, 1);
  navigateTo('onenotes');
  showToast('Note deleted.', 'success');
}

function deleteUser(email) {
  if (!isAdminMode()) { showToast('Enable Admin Mode first.', 'error'); return; }
  if (email === currentUser.email) { showToast('You cannot delete your own account.', 'error'); return; }
  if (!confirm('Delete this user account? This cannot be undone.')) return;
  const idx = DEMO_USERS.findIndex(u => u.email === email);
  if (idx > -1) DEMO_USERS.splice(idx, 1);
  document.getElementById('pageContent').innerHTML = renderUserManagement();
  showToast('User deleted.', 'success');
}

// ── EDIT MANAGER EMAIL MODAL ──
function openEditEmailModal() {
  if (!isManager()) { showToast('Only managers can edit email.', 'error'); return; }
  openModal('Edit Email Address', `
    <div class="alert alert-warn">Changing your email will log you out. You will need to log in with the new email.</div>
    <div class="field-group">
      <label class="field-label">New Email Address</label>
      <input class="field-input" id="newEmailInput" value="${currentUser.email}" placeholder="name@shadowfax.in"/>
    </div>
    <div class="field-group">
      <label class="field-label">Confirm with Password</label>
      <input class="field-input" type="password" id="emailChangePw" placeholder="Enter your password"/>
    </div>
  `,
  `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
   <button class="btn btn-primary" onclick="saveEmailChange()">Update Email</button>`);
}

function saveEmailChange() {
  const newEmail = document.getElementById('newEmailInput')?.value.trim().toLowerCase();
  const pw       = document.getElementById('emailChangePw')?.value;

  if (!newEmail || !newEmail.endsWith('@' + CONFIG.ALLOWED_DOMAIN)) {
    showToast('Must be a valid @' + CONFIG.ALLOWED_DOMAIN + ' email.', 'error'); return;
  }

  // Check password
  const user = DEMO_USERS.find(u => u.email === currentUser.email);
  if (CONFIG.DEMO_MODE && user && user.password !== pw) {
    showToast('Incorrect password.', 'error'); return;
  }

  // Check new email not already taken
  const conflict = DEMO_USERS.find(u => u.email === newEmail && u.email !== currentUser.email);
  if (conflict) { showToast('That email is already in use.', 'error'); return; }

  const oldEmail = currentUser.email;

  // Update DEMO_USERS — login checks this
  if (user) user.email = newEmail;

  // Update career data key
  if (DEMO_CAREER[oldEmail]) {
    DEMO_CAREER[newEmail] = DEMO_CAREER[oldEmail];
    delete DEMO_CAREER[oldEmail];
  }

  closeModal();
  showToast('✅ Email updated to ' + newEmail + '. Please log in with new email.', 'success');

  // Log out after short delay so user sees the toast
  setTimeout(() => handleLogout(), 2000);
}


