// ═══════════════════════════════════════════
//  DATA.JS – Demo data & utilities
// ═══════════════════════════════════════════

const DEMO_USERS = [
  { email: 'pushkar.verma@shadowfax.in',   name: 'Pushkar Verma',   role: 'Manager', password: 'SFX@11',     mustChangePassword: false },
  { email: 'arjun.mehta@shadowfax.in',     name: 'Arjun Mehta',     role: 'DR',      password: 'dr123',      mustChangePassword: false },
  { email: 'divya.nair@shadowfax.in',      name: 'Divya Nair',      role: 'DR',      password: 'dr123',      mustChangePassword: false },
  { email: 'karthik.rao@shadowfax.in',     name: 'Karthik Rao',     role: 'DR',      password: 'dr123',      mustChangePassword: false },
  { email: 'sneha.krishnan@shadowfax.in',  name: 'Sneha Krishnan',  role: 'DR',      password: 'dr123',      mustChangePassword: false },
  { email: 'rahul.gupta@shadowfax.in',     name: 'Rahul Gupta',     role: 'DR',      password: 'dr123',      mustChangePassword: false },
];

const DEMO_CAREER = {
  'arjun.mehta@shadowfax.in':    { projectsCompleted: 38, processImprovements: 28, learningCerts: 18, managerRating: 9,  updatedDate: '2025-06-01' },
  'divya.nair@shadowfax.in':     { projectsCompleted: 32, processImprovements: 24, learningCerts: 16, managerRating: 8,  updatedDate: '2025-06-01' },
  'karthik.rao@shadowfax.in':    { projectsCompleted: 40, processImprovements: 30, learningCerts: 20, managerRating: 10, updatedDate: '2025-06-01' },
  'sneha.krishnan@shadowfax.in': { projectsCompleted: 25, processImprovements: 18, learningCerts: 14, managerRating: 7,  updatedDate: '2025-06-01' },
  'rahul.gupta@shadowfax.in':    { projectsCompleted: 30, processImprovements: 22, learningCerts: 12, managerRating: 8,  updatedDate: '2025-06-01' },
};

const DEMO_PROJECTS = [
  { id:'P001', employee:'arjun.mehta@shadowfax.in', employeeName:'Arjun Mehta', title:'Fraud Pattern Detection – COD Abuse', problem:'High rate of COD fraud in Tier-2 cities causing ₹8L/month losses.', current:'Manual review taking 4-6 hours per analyst.', solution:'Rule-based scoring engine using velocity and address clustering.', impact:'Reduce COD fraud by 40%.', targetDate:'2025-07-30', status:'In Progress', progress:65, approval:'Approved', createdDate:'2025-05-10' },
  { id:'P002', employee:'divya.nair@shadowfax.in', employeeName:'Divya Nair', title:'Return Fraud SOP Update', problem:'Inconsistent handling of suspicious return requests across zones.', current:'No standardised escalation matrix.', solution:'Decision tree + SOP documentation.', impact:'Standardise 100% of return fraud cases.', targetDate:'2025-07-15', status:'Completed', progress:100, approval:'Approved', createdDate:'2025-04-22' },
  { id:'P003', employee:'karthik.rao@shadowfax.in', employeeName:'Karthik Rao', title:'Seller Collusion Detection Model', problem:'Suspected seller-delivery partner collusion in 3 major hubs.', current:'No systematic monitoring.', solution:'Graph-based anomaly detection.', impact:'Identify top 5% high-risk seller-DP pairs.', targetDate:'2025-08-15', status:'Draft', progress:10, approval:'Pending', createdDate:'2025-06-01' },
  { id:'P004', employee:'sneha.krishnan@shadowfax.in', employeeName:'Sneha Krishnan', title:'Fake Delivery Attempt Monitoring', problem:'Rise in fake attempt delivery fraud.', current:'Only reactive detection.', solution:'GPS + timestamp cross-validation.', impact:'Reduce fake attempts by 60%.', targetDate:'2025-08-01', status:'In Progress', progress:45, approval:'Approved', createdDate:'2025-05-20' },
  { id:'P005', employee:'rahul.gupta@shadowfax.in', employeeName:'Rahul Gupta', title:'Loss Prevention Dashboard v2', problem:'Current dashboard lacks real-time visibility.', current:'Static weekly reports with 3-day lag.', solution:'Live data feeds with drill-down by hub.', impact:'Enable same-day fraud intervention.', targetDate:'2025-09-01', status:'Draft', progress:5, approval:'Pending', createdDate:'2025-06-05' },
];

const DEMO_ONENOTES = [
  { id:'N001', employee:'arjun.mehta@shadowfax.in', employeeName:'Arjun Mehta', date:'2025-06-05', decisions:'Prioritise COD fraud scoring engine; get data eng support by June 15.', notes:'Arjun is making strong progress on the COD fraud project. Agreed to set up weekly check-ins with data team.', nextReview:'2025-06-19' },
  { id:'N002', employee:'arjun.mehta@shadowfax.in', employeeName:'Arjun Mehta', date:'2025-05-22', decisions:'Complete initial rule set draft by June 1.', notes:'Covered Q2 targets and addressed data access concern. I will escalate BI tool access to IT.', nextReview:'2025-06-05' },
  { id:'N003', employee:'divya.nair@shadowfax.in', employeeName:'Divya Nair', date:'2025-06-03', decisions:'SOP to be submitted to compliance by June 10.', notes:'Return fraud SOP is complete. Discussed Divya\'s interest in analytics certification pathway.', nextReview:'2025-06-17' },
  { id:'N004', employee:'karthik.rao@shadowfax.in', employeeName:'Karthik Rao', date:'2025-06-01', decisions:'Greenlit seller collusion project. Review data model by June 14.', notes:'Karthik proposed a graph-based approach. Arranging 2 weeks of data science support.', nextReview:'2025-06-15' },
  { id:'N005', employee:'sneha.krishnan@shadowfax.in', employeeName:'Sneha Krishnan', date:'2025-05-28', decisions:'Finalise GPS validation logic by June 5. Pilot in Hyderabad hub.', notes:'Raised valid concern about GPS accuracy in dense areas. Decided to use hybrid time+GPS threshold.', nextReview:'2025-06-11' },
];

const DEMO_ACTIONS = [
  { id:'A001', task:'Share COD fraud scoring model v1 with data team', owner:'arjun.mehta@shadowfax.in', ownerName:'Arjun Mehta', dueDate:'2025-06-15', status:'In Progress' },
  { id:'A002', task:'Submit Return Fraud SOP to compliance', owner:'divya.nair@shadowfax.in', ownerName:'Divya Nair', dueDate:'2025-06-10', status:'Completed' },
  { id:'A003', task:'Escalate BI tool access request to IT', owner:'pushkar.verma@shadowfax.in', ownerName:'Pushkar Verma', dueDate:'2025-06-06', status:'Completed' },
  { id:'A004', task:'Review seller collusion data model proposal', owner:'karthik.rao@shadowfax.in', ownerName:'Karthik Rao', dueDate:'2025-06-14', status:'Open' },
  { id:'A005', task:'Complete SQL basics module (L&D)', owner:'sneha.krishnan@shadowfax.in', ownerName:'Sneha Krishnan', dueDate:'2025-06-20', status:'Open' },
  { id:'A006', task:'Pilot GPS validation in Hyderabad hub', owner:'sneha.krishnan@shadowfax.in', ownerName:'Sneha Krishnan', dueDate:'2025-06-05', status:'In Progress' },
  { id:'A007', task:'Draft Loss Prevention Dashboard requirements', owner:'rahul.gupta@shadowfax.in', ownerName:'Rahul Gupta', dueDate:'2025-06-01', status:'Open' },
  { id:'A008', task:'Certify in Fraud Analytics (Coursera)', owner:'arjun.mehta@shadowfax.in', ownerName:'Arjun Mehta', dueDate:'2025-07-01', status:'Open' },
];

const DEMO_FEEDBACK = [
  { id:'F001', employee:'arjun.mehta@shadowfax.in', employeeName:'Arjun Mehta', category:'Tool', text:'The current fraud detection dashboard is slow and does not support drill-down by region.', anonymous:false, status:'Reviewed', date:'2025-06-01' },
  { id:'F002', employee:'divya.nair@shadowfax.in', employeeName:'Anonymous', category:'Process', text:'Escalation paths for high-risk cases are unclear. No SLA defined for manager response time.', anonymous:true, status:'Submitted', date:'2025-06-03' },
  { id:'F003', employee:'karthik.rao@shadowfax.in', employeeName:'Karthik Rao', category:'Career', text:'Would love a defined growth path from Senior Analyst to Lead. The band structure is opaque.', anonymous:false, status:'Reviewed', date:'2025-05-28' },
  { id:'F004', employee:'sneha.krishnan@shadowfax.in', employeeName:'Anonymous', category:'Team', text:'Cross-team collaboration with Operations is improving, but we lack a shared playbook for joint investigations.', anonymous:true, status:'Closed', date:'2025-05-20' },
  { id:'F005', employee:'rahul.gupta@shadowfax.in', employeeName:'Rahul Gupta', category:'Suggestion', text:'Suggest a monthly "Fraud Trends" session where the whole team shares new patterns.', anonymous:false, status:'Submitted', date:'2025-06-05' },
];

// ─── Utility Functions ───────────────────────
function getCareerScore(email) {
  const c = DEMO_CAREER[email];
  if (!c) return 0;
  return Math.round((c.projectsCompleted * 0.4) + (c.processImprovements * 0.3) + (c.learningCerts * 0.2) + (c.managerRating * 0.1) * 10);
}
function getCareerDetails(email) { return DEMO_CAREER[email] || { projectsCompleted:0, processImprovements:0, learningCerts:0, managerRating:0 }; }
function getUserProjects(email)  { return DEMO_PROJECTS.filter(p => p.employee === email); }
function getUserNotes(email)     { return DEMO_ONENOTES.filter(n => n.employee === email).sort((a,b) => new Date(b.date)-new Date(a.date)); }
function getUserActions(email)   { return DEMO_ACTIONS.filter(a => a.owner === email); }
function getUserFeedback(email)  { return DEMO_FEEDBACK.filter(f => f.employee === email); }
function getDRs()                { return DEMO_USERS.filter(u => u.role === 'DR'); }
function isOverdue(d)            { return d && new Date(d) < new Date(); }
function initials(name)          { return name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase(); }
function formatDate(d)           { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}); }

function statusBadge(status) {
  const map = { 'Draft':'badge-gray','In Progress':'badge-teal','Completed':'badge-green','Approved':'badge-green','Pending':'badge-amber','Open':'badge-amber','Closed':'badge-gray','Submitted':'badge-teal','Reviewed':'badge-purple','Rejected':'badge-red','Active':'badge-teal' };
  return `<span class="badge ${map[status]||'badge-gray'}">${status}</span>`;
}
