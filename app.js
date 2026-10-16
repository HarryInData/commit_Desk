/* ================================================================
   CommitDesk — Application Logic
   ================================================================ */

// ─── Constants ───────────────────────────────────────────────────
const STORAGE_KEY = 'commitdesk-data';
const API_KEY_STORAGE = 'commitdesk-api-key';
const STATUSES = ['To Do', 'In Progress', 'Done'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const EFFORTS = ['Small', 'Medium', 'Large'];
const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const EFFORT_ORDER = { Small: 0, Medium: 1, Large: 2 };

const ACTION_VERBS = [
  'review', 'send', 'draft', 'write', 'create', 'update', 'fix', 'prepare',
  'audit', 'schedule', 'follow up', 'set up', 'deploy', 'migrate', 'test',
  'implement', 'design', 'discuss', 'check', 'investigate', 'research',
  'build', 'refactor', 'document', 'configure', 'submit', 'approve', 'merge',
  'release', 'plan', 'organize', 'coordinate', 'arrange', 'complete', 'finish',
  'resolve', 'respond', 'reply', 'forward', 'share', 'notify', 'inform',
  'contact', 'call', 'meet', 'present', 'demo', 'address', 'onboard',
  'upgrade', 'patch', 'debug', 'analyze', 'evaluate', 'assess', 'prioritize',
  'estimate', 'scope', 'deliver', 'ship', 'launch', 'publish', 'close',
  'assign', 'delegate', 'escalate', 'follow-up', 'clean up', 'clean',
  'setup', 'set', 'add', 'remove', 'delete', 'rename', 'move', 'copy',
];

const NON_NAMES = new Set([
  'I', 'The', 'This', 'That', 'These', 'Those', 'It', 'Its', 'A', 'An',
  'We', 'They', 'He', 'She', 'My', 'Our', 'Your', 'Their', 'His', 'Her',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
  'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun',
  'PR', 'API', 'UI', 'UX', 'QA', 'Q1', 'Q2', 'Q3', 'Q4', 'ASAP', 'EOD', 'EOM',
  'EOW', 'TODO', 'WIP', 'MVP', 'POC', 'SLA', 'KPI', 'OKR', 'RFC',
  'Also', 'And', 'But', 'Or', 'Not', 'For', 'With', 'From', 'About', 'Into',
  'Then', 'Than', 'So', 'If', 'When', 'While', 'Before', 'After', 'During',
  'Review', 'Send', 'Draft', 'Write', 'Create', 'Update', 'Fix', 'Make',
  'Prepare', 'Audit', 'Schedule', 'Follow', 'Set', 'Deploy', 'Need', 'Needs',
  'URGENT', 'HIGH', 'LOW', 'MEDIUM', 'CRITICAL', 'IMPORTANT', 'BLOCKED',
  'Small', 'Medium', 'Large', 'Please', 'Note', 'Action', 'Item', 'Task',
  'Jira', 'Slack', 'Teams', 'Zoom', 'Google', 'GitHub', 'GitLab', 'AWS',
  'Today', 'Tomorrow', 'Yesterday', 'Next', 'Last', 'End', 'Start', 'Due',
  'Meeting', 'Standup', 'Sprint', 'Retro', 'Demo', 'Sync',
]);

// ─── State ───────────────────────────────────────────────────────
let state = {
  tasks: [],
  messages: [],
  activeFilter: 'all',
  activeSort: 'due-date',
  mobilePanel: 'chat',
};

// ─── Mock Data ───────────────────────────────────────────────────
function getMockTasks() {
  const now = new Date();
  return [
    {
      id: genId(),
      title: 'Migrate user authentication to OAuth 2.0',
      description: 'Replace the legacy session-based auth system with OAuth 2.0 + PKCE flow. Coordinate with the identity team for IdP configuration.',
      dueDate: fmtISO(addDays(now, 4)),
      requester: 'Sarah Chen',
      priority: 'High',
      effort: 'Large',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Review PR #847: Payment gateway integration',
      description: "Review Marcus's changes to the Stripe integration module. Focus on error handling and idempotency keys.",
      dueDate: fmtISO(now),
      requester: 'Marcus Rivera',
      priority: 'Critical',
      effort: 'Small',
      status: 'To Do',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Send Q3 performance metrics to stakeholders',
      description: 'Compile the Q3 engineering metrics dashboard and distribute to VP Engineering and product leads via email.',
      dueDate: fmtISO(addDays(now, -2)),
      requester: 'Janet Morrison',
      priority: 'High',
      effort: 'Small',
      status: 'To Do',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Draft API versioning strategy document',
      description: 'Write a proposal for API versioning (URL path vs. header-based) with migration guidelines for existing consumers.',
      dueDate: fmtISO(addDays(now, 7)),
      requester: 'David Park',
      priority: 'Medium',
      effort: 'Medium',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Fix timezone bug in scheduling module',
      description: 'Appointments created in PST are showing 3 hours offset for EST users. Investigate Day.js timezone plugin configuration.',
      dueDate: fmtISO(addDays(now, -1)),
      requester: 'Aisha Patel',
      priority: 'Critical',
      effort: 'Medium',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Update onboarding flow based on UX research',
      description: 'Implement the revised 3-step onboarding wizard per the usability study findings. Reduce form fields from 12 to 5.',
      dueDate: fmtISO(addDays(now, 12)),
      requester: 'Lisa Nguyen',
      priority: 'Medium',
      effort: 'Large',
      status: 'To Do',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Prepare demo environment for Meridian Corp presentation',
      description: 'Spin up a clean staging instance with sample data for the Meridian Corp demo. Ensure SSO is configured and performance is acceptable.',
      dueDate: fmtISO(addDays(now, 2)),
      requester: 'Tom Bradley',
      priority: 'High',
      effort: 'Medium',
      status: 'To Do',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Audit third-party dependencies for CVEs',
      description: 'Run Snyk/Dependabot scan across all services. Triage critical vulnerabilities and create upgrade tickets for anything above CVSS 7.0.',
      dueDate: fmtISO(addDays(now, 6)),
      requester: 'Carlos Mendez',
      priority: 'High',
      effort: 'Large',
      status: 'To Do',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Write integration tests for notification service',
      description: 'Add test coverage for email, SMS, and push notification delivery paths. Target 80% coverage on the notifications module.',
      dueDate: fmtISO(addDays(now, 14)),
      requester: 'Emma Dawson',
      priority: 'Low',
      effort: 'Medium',
      status: 'To Do',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Create runbook for database failover procedure',
      description: 'Document the step-by-step process for PostgreSQL primary failover, including validation checks and rollback steps.',
      dueDate: fmtISO(addDays(now, -4)),
      requester: 'Raj Kapoor',
      priority: 'Medium',
      effort: 'Medium',
      status: 'Done',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Follow up with design team on mobile navigation redesign',
      description: "Check in with Karen's team about the revised mobile navigation wireframes and confirm the bottom-tab pattern decision.",
      dueDate: fmtISO(now),
      requester: 'Karen Wu',
      priority: 'Medium',
      effort: 'Small',
      status: 'To Do',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
    {
      id: genId(),
      title: 'Schedule capacity planning review for Q4',
      description: 'Coordinate with engineering leads to set up the Q4 capacity and headcount planning session. Book a 90-minute slot.',
      dueDate: fmtISO(addDays(now, 3)),
      requester: 'Michael Torres',
      priority: 'Low',
      effort: 'Small',
      status: 'Done',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      source: 'preloaded',
      inferred: [],
    },
  ];
}

// ─── Utilities ───────────────────────────────────────────────────
function genId() {
  return 'task-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isOverdue(dateStr, status) {
  if (status === 'Done') return false;
  return dateStr < todayStr();
}

function isDueToday(dateStr) {
  return dateStr === todayStr();
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(dateStr) {
  if (!dateStr) return 'No date';
  const d = new Date(dateStr + 'T00:00:00');
  const opts = { month: 'short', day: 'numeric' };
  const today = todayStr();
  if (dateStr === today) return 'Today';
  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  if (dateStr === tomorrowStr) return 'Tomorrow';
  return d.toLocaleDateString('en-US', opts);
}

function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr) {
  const today = new Date(todayStr() + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

function escapeHtml(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

// ─── Persistence ─────────────────────────────────────────────────
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tasks: state.tasks,
      messages: state.messages,
    }));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.tasks && data.tasks.length > 0) state.tasks = data.tasks;
      if (data.messages) state.messages = data.messages;
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
}

function getApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

function setApiKey(key) {
  try {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch (e) {
    console.warn('Failed to save API key:', e);
  }
}

// ─── Date Parsing ────────────────────────────────────────────────
function parseDateFromText(text) {
  const lower = text.toLowerCase();
  const today = new Date();

  // "today"
  if (/\btoday\b/.test(lower)) return { value: todayStr(), found: true };

  // "tomorrow"
  if (/\btomorrow\b/.test(lower)) {
    const d = addDays(today, 1);
    return { value: fmtISO(d), found: true };
  }

  // "ASAP" / "immediately" / "right away"
  if (/\b(asap|immediately|right away|urgent)\b/.test(lower)) {
    const d = addDays(today, 1);
    return { value: fmtISO(d), found: true };
  }

  // "end of day" / "by eod" / "eod"
  if (/\b(end of day|by eod|eod)\b/.test(lower)) return { value: todayStr(), found: true };

  // "end of week" / "eow" / "this friday" / "by friday"
  if (/\b(end of week|eow)\b/.test(lower)) return { value: fmtISO(nextWeekday(5)), found: true };

  // "next week"
  if (/\bnext week\b/.test(lower)) {
    const d = addDays(today, 7);
    return { value: fmtISO(d), found: true };
  }

  // "end of month" / "eom"
  if (/\b(end of month|eom)\b/.test(lower)) {
    const d = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { value: fmtISO(d), found: true };
  }

  // "in X days"
  const inDays = lower.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDays) return { value: fmtISO(addDays(today, parseInt(inDays[1]))), found: true };

  // "in X weeks"
  const inWeeks = lower.match(/\bin\s+(\d+)\s+weeks?\b/);
  if (inWeeks) return { value: fmtISO(addDays(today, parseInt(inWeeks[1]) * 7)), found: true };

  // Day names: "by Friday", "next Monday", "this Wednesday"
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const byDay = lower.match(/\b(?:by|this|next|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (byDay) {
    const isNext = lower.includes('next ' + byDay[1]);
    const dayIdx = dayNames.indexOf(byDay[1]);
    const d = nextWeekday(dayIdx, isNext);
    return { value: fmtISO(d), found: true };
  }

  // Standalone day: just "Friday" or "Monday"
  const standaloneDay = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (standaloneDay) {
    const dayIdx = dayNames.indexOf(standaloneDay[1]);
    return { value: fmtISO(nextWeekday(dayIdx, false)), found: true };
  }

  // Specific dates: "Oct 20", "October 20", "10/20", "10/20/2026"
  const monthNames = { jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11 };
  const namedDate = lower.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?\b/);
  if (namedDate) {
    const month = monthNames[namedDate[1]];
    const day = parseInt(namedDate[2]);
    const year = namedDate[3] ? parseInt(namedDate[3]) : today.getFullYear();
    const d = new Date(year, month, day);
    return { value: fmtISO(d), found: true };
  }

  // "the Xth" / "the Xst" / "the Xnd" / "the Xrd"
  const theNth = lower.match(/\bthe\s+(\d{1,2})(?:st|nd|rd|th)\b/);
  if (theNth) {
    let d = new Date(today.getFullYear(), today.getMonth(), parseInt(theNth[1]));
    if (d < today) d.setMonth(d.getMonth() + 1);
    return { value: fmtISO(d), found: true };
  }

  // Slash dates: "10/20" or "10/20/2026"
  const slashDate = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slashDate) {
    const month = parseInt(slashDate[1]) - 1;
    const day = parseInt(slashDate[2]);
    let year = slashDate[3] ? parseInt(slashDate[3]) : today.getFullYear();
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return { value: fmtISO(d), found: true };
  }

  // Default: 7 days from now
  return { value: fmtISO(addDays(today, 7)), found: false };
}

function nextWeekday(targetDay, forceNext = false) {
  const today = new Date();
  const current = today.getDay();
  let diff = targetDay - current;
  if (diff <= 0 || forceNext) diff += 7;
  return addDays(today, diff);
}

function fmtISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Name Extraction ─────────────────────────────────────────────
function extractRequesterFromText(text) {
  // Pattern: "Name asked/wants/mentioned/said/needs/reported/requested"
  const verbPattern = /\b([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\s+(?:asked|wants|mentioned|said|needs|reported|requested|assigned|suggested|told|emailed|pinged|flagged)\b/;
  let m = text.match(verbPattern);
  if (m && !NON_NAMES.has(m[1].split(' ')[0])) return { value: m[1], found: true };

  // Pattern: "from Name" / "per Name"
  const fromPattern = /\b(?:from|per|via|cc|@)\s+([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\b/;
  m = text.match(fromPattern);
  if (m && !NON_NAMES.has(m[1].split(' ')[0])) return { value: m[1], found: true };

  // Pattern: "assigned by Name"
  const assignedPattern = /\bassigned\s+(?:by|to)\s+([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\b/;
  m = text.match(assignedPattern);
  if (m && !NON_NAMES.has(m[1].split(' ')[0])) return { value: m[1], found: true };

  // Pattern: "Name's" (possessive)
  const possessivePattern = /\b([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)'s\b/;
  m = text.match(possessivePattern);
  if (m && !NON_NAMES.has(m[1].split(' ')[0])) return { value: m[1], found: true };

  // Pattern: "talk to/meet with/contact/email Name"
  const contactPattern = /\b(?:talk to|meet with|contact|email|notify|ping|tell|ask|check with)\s+([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15})?)\b/;
  m = text.match(contactPattern);
  if (m && !NON_NAMES.has(m[1].split(' ')[0])) return { value: m[1], found: true };

  return { value: 'Unspecified', found: false };
}

// ─── Priority Extraction ─────────────────────────────────────────
function extractPriorityFromText(text) {
  const lower = text.toLowerCase();
  if (/\b(critical|p0|sev\s*0|showstopper|blocker|blocking|production down)\b/.test(lower))
    return { value: 'Critical', found: true };
  if (/\b(urgent|asap|immediately|high\s*priority|high\s*pri|p1|important|right away)\b/.test(lower))
    return { value: 'High', found: true };
  if (/\b(low\s*priority|low\s*pri|p3|when you get a chance|nice to have|backlog|whenever|no rush)\b/.test(lower))
    return { value: 'Low', found: true };
  if (/\b(medium\s*priority|medium\s*pri|p2|normal)\b/.test(lower))
    return { value: 'Medium', found: true };
  return { value: 'Medium', found: false };
}

// ─── Effort Extraction ───────────────────────────────────────────
function extractEffortFromText(text) {
  const lower = text.toLowerCase();
  if (/\b(quick|simple|tiny|trivial|minor|small|easy|straightforward|5 min|ten min)\b/.test(lower))
    return { value: 'Small', found: true };
  if (/\b(complex|big|large|major|significant|extensive|multi-day|multi day|week-long|huge|epic)\b/.test(lower))
    return { value: 'Large', found: true };
  if (/\b(moderate|medium effort|a few hours|half.?day)\b/.test(lower))
    return { value: 'Medium', found: true };
  return { value: 'Medium', found: false };
}

// ─── Status Extraction ───────────────────────────────────────────
function extractStatusFromText(text) {
  const lower = text.toLowerCase();
  if (/\b(done|completed|finished|resolved|closed|shipped)\b/.test(lower))
    return { value: 'Done', found: true };
  if (/\b(in progress|started|working on|underway|ongoing|wip)\b/.test(lower))
    return { value: 'In Progress', found: true };
  return { value: 'To Do', found: false };
}

// ─── Text Segmentation ──────────────────────────────────────────
function splitIntoSegments(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Try bullet/numbered list splitting first
  const bulletPattern = /^[\s]*[-•*]\s+/m;
  const numberPattern = /^[\s]*\d+[.)]\s+/m;

  let segments = [];

  if (bulletPattern.test(trimmed) || numberPattern.test(trimmed)) {
    // Split by bullets or numbers
    const lines = trimmed.split('\n');
    let current = '';
    for (const line of lines) {
      const stripped = line.trim();
      if (!stripped) continue;
      if (/^[-•*]\s+/.test(stripped) || /^\d+[.)]\s+/.test(stripped)) {
        if (current) segments.push(current);
        current = stripped.replace(/^[-•*]\s+/, '').replace(/^\d+[.)]\s+/, '');
      } else {
        // Continuation of previous bullet or context line
        if (current) {
          current += ' ' + stripped;
        } else {
          // This is a header/context line (e.g., "From today's standup:")
          // Skip it but don't create a task from it
        }
      }
    }
    if (current) segments.push(current);
  } else {
    // Try splitting by newlines first
    const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 1) {
      segments = lines;
    } else {
      // Single block: split by sentences
      const sentences = trimmed
        .split(/(?<=[.!?;])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 5);

      if (sentences.length > 1) {
        // Filter to only sentences containing action verbs
        for (const sentence of sentences) {
          const lower = sentence.toLowerCase();
          const hasAction = ACTION_VERBS.some(v => lower.includes(v));
          if (hasAction) {
            segments.push(sentence);
          }
        }
        // If no action verbs found, treat the whole text as one task
        if (segments.length === 0) segments = [trimmed];
      } else {
        segments = [trimmed];
      }
    }
  }

  // Filter out very short segments and context-only lines
  return segments.filter(s => {
    const trimmedS = s.trim();
    if (trimmedS.length < 5) return false;
    // Skip lines that are just headers/context
    if (/^(from|notes from|meeting|standup|recap|summary|action items|agenda|attendees)/i.test(trimmedS) && trimmedS.length < 60) return false;
    return true;
  });
}

// ─── Title Extraction ────────────────────────────────────────────
function extractTitle(segment) {
  // Remove date/requester/priority hints for a cleaner title
  let title = segment
    .replace(/\b(?:by|before|due|until)\s+(?:end of (?:day|week|month)|eod|eow|eom|tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:\s*,?\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/gi, '')
    .replace(/\b(?:urgent|asap|critical|high priority|low priority|p[0-3]|immediately)\b/gi, '')
    .replace(/\b(?:from|per|via|cc)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g, '')
    .replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s+(?:asked|wants|mentioned|said|needs|reported|requested)\b/g, '')
    .replace(/[-–—]\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Remove trailing punctuation
  title = title.replace(/[.;,!]+$/, '').trim();

  // Limit length
  if (title.length > 100) {
    title = title.substring(0, 97) + '...';
  }

  return title || segment.substring(0, 80).trim();
}

// ─── Local Parser ────────────────────────────────────────────────
function parseLocally(text) {
  const segments = splitIntoSegments(text);

  if (segments.length === 0) {
    return { tasks: [], error: 'Could not identify any tasks in that input. Try using bullet points or more specific action items.' };
  }

  const tasks = segments.map(segment => {
    const dueDate = parseDateFromText(segment);
    const requester = extractRequesterFromText(segment);
    const priority = extractPriorityFromText(segment);
    const effort = extractEffortFromText(segment);
    const status = extractStatusFromText(segment);
    const title = extractTitle(segment);

    const inferred = [];
    if (!dueDate.found) inferred.push('due date (defaulted to 1 week)');
    if (!requester.found) inferred.push('requester');
    if (!priority.found) inferred.push('priority (defaulted to Medium)');
    if (!effort.found) inferred.push('effort (defaulted to Medium)');

    return {
      id: genId(),
      title,
      description: segment.trim(),
      dueDate: dueDate.value,
      requester: requester.value,
      priority: priority.value,
      effort: effort.value,
      status: status.value,
      inferred,
      createdAt: new Date().toISOString(),
      source: 'local',
    };
  });

  return { tasks, error: null };
}

// ─── Gemini API Parser ──────────────────────────────────────────
async function parseWithGemini(text) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key configured');

  const today = todayStr();
  const prompt = `You are a meeting notes parser for a task management tool. Extract actionable tasks from the following meeting notes and return them as a JSON array.

Each task object must have these fields:
- "title" (string): A clear, concise task title (max 100 chars)
- "description" (string): A brief 1-2 sentence description
- "dueDate" (string, ISO format YYYY-MM-DD): When the task is due. Today is ${today}. If not mentioned, estimate a reasonable date within the next 7-14 days.
- "requester" (string): Who requested or assigned the task. Use "Unspecified" if unclear.
- "priority" (string): One of "Critical", "High", "Medium", "Low"
- "effort" (string): One of "Small", "Medium", "Large"
- "status" (string): One of "To Do", "In Progress", "Done". Default to "To Do".
- "inferred" (array of strings): List any fields you had to guess/default (e.g., ["due date", "requester"])

Meeting notes:
"""
${text}
"""

Return ONLY a valid JSON array. No markdown fences, no explanations, just the JSON array.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.15,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Unexpected API response format');
  }

  const content = data.candidates[0].content.parts[0].text;

  // Parse JSON, stripping any markdown fences
  const jsonStr = content.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  if (!Array.isArray(parsed)) throw new Error('Expected array from Gemini');

  return {
    tasks: parsed.map(t => ({
      id: genId(),
      title: (t.title || 'Untitled Task').substring(0, 100),
      description: t.description || '',
      dueDate: t.dueDate || fmtISO(addDays(new Date(), 7)),
      requester: t.requester || 'Unspecified',
      priority: PRIORITIES.includes(t.priority) ? t.priority : 'Medium',
      effort: EFFORTS.includes(t.effort) ? t.effort : 'Medium',
      status: STATUSES.includes(t.status) ? t.status : 'To Do',
      inferred: Array.isArray(t.inferred) ? t.inferred : [],
      createdAt: new Date().toISOString(),
      source: 'gemini',
    })),
    error: null,
  };
}

// ─── Parse Notes (orchestrator) ──────────────────────────────────
async function parseNotes(text) {
  const apiKey = getApiKey();
  let usedGemini = false;
  let result;

  if (apiKey) {
    try {
      result = await parseWithGemini(text);
      usedGemini = true;
    } catch (e) {
      console.warn('Gemini parsing failed, using local fallback:', e.message);
      result = parseLocally(text);
      result.fallbackReason = e.message;
    }
  } else {
    result = parseLocally(text);
  }

  result.usedGemini = usedGemini;
  return result;
}

// ─── Computed Stats ──────────────────────────────────────────────
function getStats() {
  const today = todayStr();
  let open = 0, dueToday = 0, overdue = 0, done = 0, inProgress = 0;

  for (const t of state.tasks) {
    if (t.status === 'Done') {
      done++;
    } else {
      open++;
      if (t.status === 'In Progress') inProgress++;
      if (t.dueDate === today) dueToday++;
      if (t.dueDate < today) overdue++;
    }
  }

  return { open, dueToday, overdue, done, inProgress, total: state.tasks.length };
}

// ─── Filtering & Sorting ────────────────────────────────────────
function getFilteredTasks() {
  const today = todayStr();
  let filtered = [...state.tasks];

  switch (state.activeFilter) {
    case 'todo':
      filtered = filtered.filter(t => t.status === 'To Do');
      break;
    case 'in-progress':
      filtered = filtered.filter(t => t.status === 'In Progress');
      break;
    case 'done':
      filtered = filtered.filter(t => t.status === 'Done');
      break;
    case 'overdue':
      filtered = filtered.filter(t => t.status !== 'Done' && t.dueDate < today);
      break;
  }

  switch (state.activeSort) {
    case 'due-date':
      filtered.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      break;
    case 'priority':
      filtered.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));
      break;
    case 'effort':
      filtered.sort((a, b) => (EFFORT_ORDER[b.effort] ?? 1) - (EFFORT_ORDER[a.effort] ?? 1));
      break;
    case 'created':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  return filtered;
}

// ─── DOM References ──────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let chatMessagesEl, chatFormEl, chatInputEl, sendBtnEl;
let summaryStripEl, filterTabsEl, sortSelectEl, taskListEl;
let settingsModal, settingsCloseEl, apiKeyInputEl, toggleKeyVisEl;
let saveKeyBtnEl, removeKeyBtnEl, testKeyBtnEl, apiStatusEl, clearDataBtnEl;
let taskModal, taskModalCloseEl, taskModalBodyEl, deleteTaskBtnEl, saveTaskBtnEl;
let mobileTabsEl, mobileTaskBadgeEl;

let editingTaskId = null;

// ─── Render: Chat ────────────────────────────────────────────────
function renderChat() {
  chatMessagesEl.innerHTML = '';

  if (state.messages.length === 0) {
    renderWelcome();
    return;
  }

  for (const msg of state.messages) {
    appendMessageToDOM(msg);
  }

  scrollChatToBottom();
}

function renderWelcome() {
  const div = document.createElement('div');
  div.className = 'welcome-msg';
  div.innerHTML = `
    <div class="welcome-icon">✨</div>
    <h3>Welcome to CommitDesk</h3>
    <p>Paste your meeting notes, action items, or any text describing work that needs to be done. I'll parse it into structured tasks for your board.</p>
    <div class="examples">
      <div class="example-item" data-example="Sarah asked me to review PR #847 for the payment gateway by end of day. It's critical.">
        <span class="example-bullet">→</span>
        <span>Sarah asked me to review PR #847 for the payment gateway by end of day. It's critical.</span>
      </div>
      <div class="example-item" data-example="- Fix the timezone bug before Friday (urgent, from Aisha)\n- Send Q3 metrics report to stakeholders by tomorrow\n- Schedule a capacity planning session for Q4 (low priority)">
        <span class="example-bullet">→</span>
        <span>Paste a bullet list of action items from your meeting</span>
      </div>
      <div class="example-item" data-example="Tom needs the demo environment ready for the Meridian Corp presentation on Oct 22. It's high priority and will take about half a day. Also, Carlos mentioned we need to audit all third-party deps for security vulnerabilities by end of month.">
        <span class="example-bullet">→</span>
        <span>Paste a paragraph with multiple commitments mentioned</span>
      </div>
    </div>
  `;
  chatMessagesEl.appendChild(div);

  // Click to fill
  div.querySelectorAll('.example-item').forEach(el => {
    el.addEventListener('click', () => {
      chatInputEl.value = el.dataset.example;
      autoResize(chatInputEl);
      chatInputEl.focus();
    });
  });
}

function appendMessageToDOM(msg) {
  const div = document.createElement('div');
  div.className = `chat-msg ${msg.role}`;

  const avatar = msg.role === 'user' ? 'You' : 'CD';
  div.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-bubble">${msg.html || escapeHtml(msg.text)}</div>
  `;
  chatMessagesEl.appendChild(div);
}

function showTypingIndicator() {
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="msg-avatar" style="background:rgba(52,211,153,0.12);color:var(--success);border:1px solid rgba(52,211,153,0.2);width:32px;height:32px;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;">CD</div>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chatMessagesEl.appendChild(div);
  scrollChatToBottom();
}

function hideTypingIndicator() {
  const el = $('#typingIndicator');
  if (el) el.remove();
}

function scrollChatToBottom() {
  requestAnimationFrame(() => {
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  });
}

function buildAssistantMessage(result) {
  const { tasks, error, usedGemini, fallbackReason } = result;

  if (error) {
    return {
      role: 'assistant',
      text: error,
      html: `<strong>Hmm, I couldn't extract tasks from that.</strong><br><span style="color:var(--text-secondary)">${escapeHtml(error)}</span>`,
    };
  }

  let html = '';

  if (tasks.length === 1) {
    html += `<strong>Created 1 task</strong>`;
  } else {
    html += `<strong>Created ${tasks.length} tasks</strong>`;
  }

  if (usedGemini) {
    html += ` <span style="color:var(--accent);font-size:0.75rem;font-weight:600;">· AI-parsed</span>`;
  }

  if (fallbackReason) {
    html += `<br><span style="color:var(--warning);font-size:0.78rem;">⚠ Gemini unavailable — used local parsing instead</span>`;
  }

  html += `<div class="task-summary-inline">`;
  for (const task of tasks) {
    html += `<div class="task-line"><span class="task-check">✓</span> <span>${escapeHtml(task.title)}</span></div>`;
  }
  html += `</div>`;

  // Show inferred fields
  const allInferred = tasks.reduce((acc, t) => {
    if (t.inferred && t.inferred.length > 0) {
      acc.push({ title: t.title, fields: t.inferred });
    }
    return acc;
  }, []);

  if (allInferred.length > 0) {
    html += `<div class="inferred-note">`;
    html += `<strong>ℹ Defaults applied:</strong><br>`;
    for (const item of allInferred) {
      const shortTitle = item.title.length > 40 ? item.title.substring(0, 37) + '...' : item.title;
      html += `<span style="color:var(--text-secondary)">"${escapeHtml(shortTitle)}"</span> → ${item.fields.join(', ')}<br>`;
    }
    html += `<span style="opacity:0.8">Click any task on the board to edit these fields.</span>`;
    html += `</div>`;
  }

  return {
    role: 'assistant',
    text: `Created ${tasks.length} task(s)`,
    html,
  };
}

// ─── Render: Board ───────────────────────────────────────────────
function renderSummary() {
  const stats = getStats();
  summaryStripEl.innerHTML = `
    <div class="summary-card open">
      <span class="summary-label">Open</span>
      <span class="summary-value">${stats.open}</span>
    </div>
    <div class="summary-card today">
      <span class="summary-label">Due Today</span>
      <span class="summary-value">${stats.dueToday}</span>
    </div>
    <div class="summary-card overdue">
      <span class="summary-label">Overdue</span>
      <span class="summary-value">${stats.overdue}</span>
    </div>
    <div class="summary-card done">
      <span class="summary-label">Completed</span>
      <span class="summary-value">${stats.done}</span>
    </div>
  `;
}

function renderFilterTabs() {
  const stats = getStats();
  const counts = {
    all: stats.total,
    todo: state.tasks.filter(t => t.status === 'To Do').length,
    'in-progress': state.tasks.filter(t => t.status === 'In Progress').length,
    done: stats.done,
    overdue: stats.overdue,
  };

  filterTabsEl.querySelectorAll('.filter-tab').forEach(tab => {
    const filter = tab.dataset.filter;
    const countBadge = tab.querySelector('.count-badge');
    if (countBadge) countBadge.textContent = counts[filter] || 0;
    else {
      const badge = document.createElement('span');
      badge.className = 'count-badge';
      badge.textContent = counts[filter] || 0;
      tab.appendChild(badge);
    }
    tab.classList.toggle('active', filter === state.activeFilter);
  });
}

function renderTaskList() {
  const filtered = getFilteredTasks();
  taskListEl.innerHTML = '';

  if (filtered.length === 0) {
    const emptyMsg = state.activeFilter === 'all'
      ? 'No tasks yet. Add some meeting notes to get started!'
      : `No tasks match the "${state.activeFilter}" filter.`;
    taskListEl.innerHTML = `
      <div class="task-list-empty">
        <div class="empty-icon">📋</div>
        <h3>${state.activeFilter === 'all' ? 'No tasks yet' : 'No matching tasks'}</h3>
        <p>${emptyMsg}</p>
      </div>
    `;
    return;
  }

  const today = todayStr();

  filtered.forEach((task, index) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    card.style.animationDelay = `${index * 0.04}s`;

    // Date status classes
    if (task.status === 'Done') {
      card.classList.add('done-card');
    } else if (task.dueDate < today) {
      card.classList.add('overdue');
    } else if (task.dueDate === today) {
      card.classList.add('due-today');
    }

    // Priority badge class
    const priBadgeClass = `badge-${task.priority.toLowerCase()}`;
    // Effort badge class
    const effBadgeClass = task.effort === 'Small' ? 'badge-small' : task.effort === 'Large' ? 'badge-large' : 'badge-med';

    // Date indicator
    let dateIndicator = '';
    const days = daysUntil(task.dueDate);
    if (task.status !== 'Done' && task.dueDate < today) {
      const overdueDays = Math.abs(days);
      dateIndicator = `<span class="task-meta-item overdue-indicator"><span class="overdue-pulse"></span> ${overdueDays}d overdue</span>`;
    } else if (task.dueDate === today) {
      dateIndicator = `<span class="task-meta-item today-indicator"><span class="today-dot"></span> Due today</span>`;
    } else {
      dateIndicator = `<span class="task-meta-item">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="14" height="13" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>
        ${formatDate(task.dueDate)}</span>`;
    }

    // Status select class
    const statusClass = task.status === 'Done' ? 'status-done' : task.status === 'In Progress' ? 'status-in-progress' : 'status-todo';

    card.innerHTML = `
      <div class="task-card-header">
        <div class="task-card-badges">
          <span class="badge ${priBadgeClass}">${task.priority}</span>
          <span class="badge ${effBadgeClass}">${task.effort}</span>
        </div>
        ${dateIndicator}
      </div>
      <div class="task-card-title">${escapeHtml(task.title)}</div>
      <div class="task-card-desc">${escapeHtml(task.description)}</div>
      <div class="task-card-footer">
        <div class="task-card-meta">
          <span class="task-meta-item">
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="7" r="4"/><path d="M3 18c0-3.87 3.13-7 7-7s7 3.13 7 7"/></svg>
            ${escapeHtml(task.requester)}</span>
        </div>
        <select class="status-select ${statusClass}" data-task-id="${task.id}" aria-label="Change status for ${escapeHtml(task.title)}">
          ${STATUSES.map(s => `<option value="${s}" ${s === task.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    `;

    taskListEl.appendChild(card);
  });

  // Update mobile badge
  updateMobileBadge();
}

function renderBoard() {
  renderSummary();
  renderFilterTabs();
  renderTaskList();
}

function updateMobileBadge() {
  const stats = getStats();
  const badgeCount = stats.overdue + stats.dueToday;
  if (badgeCount > 0) {
    mobileTaskBadgeEl.textContent = badgeCount;
    mobileTaskBadgeEl.classList.add('visible');
  } else {
    mobileTaskBadgeEl.classList.remove('visible');
  }
}

// ─── Render: Task Modal ──────────────────────────────────────────
function openTaskModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  const body = taskModalBodyEl;

  body.innerHTML = `
    <div class="task-edit-group">
      <label class="task-edit-label" for="editTitle">Title</label>
      <input class="task-edit-input" id="editTitle" type="text" value="${escapeHtml(task.title)}" />
    </div>
    <div class="task-edit-group">
      <label class="task-edit-label" for="editDesc">Description</label>
      <textarea class="task-edit-textarea" id="editDesc">${escapeHtml(task.description)}</textarea>
    </div>
    <div class="task-edit-row">
      <div class="task-edit-group">
        <label class="task-edit-label" for="editDueDate">Due Date</label>
        <input class="task-edit-input" id="editDueDate" type="date" value="${task.dueDate}" />
      </div>
      <div class="task-edit-group">
        <label class="task-edit-label" for="editRequester">Requester</label>
        <input class="task-edit-input" id="editRequester" type="text" value="${escapeHtml(task.requester)}" />
      </div>
    </div>
    <div class="task-edit-row">
      <div class="task-edit-group">
        <label class="task-edit-label" for="editPriority">Priority</label>
        <select class="task-edit-select" id="editPriority">
          ${PRIORITIES.map(p => `<option value="${p}" ${p === task.priority ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="task-edit-group">
        <label class="task-edit-label" for="editEffort">Effort</label>
        <select class="task-edit-select" id="editEffort">
          ${EFFORTS.map(e => `<option value="${e}" ${e === task.effort ? 'selected' : ''}>${e}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="task-edit-group">
      <label class="task-edit-label" for="editStatus">Status</label>
      <select class="task-edit-select" id="editStatus">
        ${STATUSES.map(s => `<option value="${s}" ${s === task.status ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>
  `;

  taskModal.classList.add('visible');
}

function closeTaskModal() {
  taskModal.classList.remove('visible');
  editingTaskId = null;
}

function saveTaskEdits() {
  if (!editingTaskId) return;
  const task = state.tasks.find(t => t.id === editingTaskId);
  if (!task) return;

  task.title = $('#editTitle').value.trim() || task.title;
  task.description = $('#editDesc').value.trim();
  task.dueDate = $('#editDueDate').value || task.dueDate;
  task.requester = $('#editRequester').value.trim() || task.requester;
  task.priority = $('#editPriority').value;
  task.effort = $('#editEffort').value;
  task.status = $('#editStatus').value;

  saveState();
  renderBoard();
  closeTaskModal();
}

function deleteTask() {
  if (!editingTaskId) return;
  state.tasks = state.tasks.filter(t => t.id !== editingTaskId);
  saveState();
  renderBoard();
  closeTaskModal();
}

// ─── Render: Settings ────────────────────────────────────────────
function openSettings() {
  apiKeyInputEl.value = getApiKey();
  apiStatusEl.textContent = '';
  apiStatusEl.className = 'api-status';
  settingsModal.classList.add('visible');
}

function closeSettings() {
  settingsModal.classList.remove('visible');
}

// ─── Auto-resize Textarea ────────────────────────────────────────
function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 140) + 'px';
}

// ─── Handle Submit ───────────────────────────────────────────────
async function handleSubmit(text) {
  if (!text.trim()) return;

  // Remove welcome if it's the first message
  const welcome = chatMessagesEl.querySelector('.welcome-msg');
  if (welcome) welcome.remove();

  // Add user message
  const userMsg = { role: 'user', text: text.trim(), html: null };
  // Format user message HTML - preserve line breaks
  userMsg.html = escapeHtml(text.trim()).replace(/\n/g, '<br>');
  state.messages.push(userMsg);
  appendMessageToDOM(userMsg);
  scrollChatToBottom();

  // Disable input
  chatInputEl.value = '';
  chatInputEl.style.height = 'auto';
  sendBtnEl.disabled = true;

  // Show typing
  showTypingIndicator();

  // Parse
  let result;
  try {
    // Small delay for UX
    await new Promise(r => setTimeout(r, 600));
    result = await parseNotes(text.trim());
  } catch (e) {
    result = { tasks: [], error: e.message, usedGemini: false };
  }

  // Hide typing
  hideTypingIndicator();

  // Build and add assistant message
  const assistantMsg = buildAssistantMessage(result);
  state.messages.push(assistantMsg);
  appendMessageToDOM(assistantMsg);
  scrollChatToBottom();

  // Add tasks to board
  if (result.tasks && result.tasks.length > 0) {
    state.tasks.unshift(...result.tasks);
    renderBoard();
  }

  // Re-enable input
  sendBtnEl.disabled = false;
  chatInputEl.focus();

  // Save
  saveState();
}

// ─── Event Handlers ──────────────────────────────────────────────
function setupEventListeners() {
  // Chat form submit
  chatFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(chatInputEl.value);
  });

  // Ctrl+Enter to submit
  chatInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(chatInputEl.value);
    }
  });

  // Auto-resize textarea
  chatInputEl.addEventListener('input', () => autoResize(chatInputEl));

  // Filter tabs
  filterTabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    state.activeFilter = tab.dataset.filter;
    renderFilterTabs();
    renderTaskList();
  });

  // Sort select
  sortSelectEl.addEventListener('change', () => {
    state.activeSort = sortSelectEl.value;
    renderTaskList();
  });

  // Task card click (for modal) and status change
  taskListEl.addEventListener('click', (e) => {
    // If clicking the status select, don't open modal
    if (e.target.closest('.status-select')) return;
    const card = e.target.closest('.task-card');
    if (card) {
      openTaskModal(card.dataset.taskId);
    }
  });

  // Status change on card
  taskListEl.addEventListener('change', (e) => {
    if (e.target.classList.contains('status-select')) {
      e.stopPropagation();
      const taskId = e.target.dataset.taskId;
      const newStatus = e.target.value;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
        saveState();
        renderBoard();
      }
    }
  });

  // Settings
  $('#settingsBtn').addEventListener('click', openSettings);
  settingsCloseEl.addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  // API key actions
  saveKeyBtnEl.addEventListener('click', () => {
    const key = apiKeyInputEl.value.trim();
    if (!key) {
      apiStatusEl.textContent = 'Please enter a key first.';
      apiStatusEl.className = 'api-status error';
      return;
    }
    setApiKey(key);
    apiStatusEl.textContent = 'Key saved successfully.';
    apiStatusEl.className = 'api-status success';
  });

  removeKeyBtnEl.addEventListener('click', () => {
    setApiKey('');
    apiKeyInputEl.value = '';
    apiStatusEl.textContent = 'Key removed.';
    apiStatusEl.className = 'api-status info';
  });

  testKeyBtnEl.addEventListener('click', async () => {
    const key = apiKeyInputEl.value.trim();
    if (!key) {
      apiStatusEl.textContent = 'Enter a key to test.';
      apiStatusEl.className = 'api-status error';
      return;
    }
    apiStatusEl.textContent = 'Testing connection...';
    apiStatusEl.className = 'api-status info';

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say "ok" and nothing else.' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      if (response.ok) {
        apiStatusEl.textContent = '✓ Connection successful! Gemini API is working.';
        apiStatusEl.className = 'api-status success';
      } else {
        const errText = await response.text();
        apiStatusEl.textContent = `✗ API error (${response.status}). Check your key.`;
        apiStatusEl.className = 'api-status error';
      }
    } catch (e) {
      apiStatusEl.textContent = `✗ Network error: ${e.message}`;
      apiStatusEl.className = 'api-status error';
    }
  });

  toggleKeyVisEl.addEventListener('click', () => {
    const isPassword = apiKeyInputEl.type === 'password';
    apiKeyInputEl.type = isPassword ? 'text' : 'password';
  });

  // Clear data
  clearDataBtnEl.addEventListener('click', () => {
    if (confirm('This will delete all tasks and chat history. Are you sure?')) {
      localStorage.removeItem(STORAGE_KEY);
      state.tasks = getMockTasks();
      state.messages = [];
      renderChat();
      renderBoard();
      closeSettings();
    }
  });

  // Task modal
  taskModalCloseEl.addEventListener('click', closeTaskModal);
  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) closeTaskModal();
  });
  saveTaskBtnEl.addEventListener('click', saveTaskEdits);
  deleteTaskBtnEl.addEventListener('click', () => {
    if (confirm('Delete this task?')) deleteTask();
  });

  // Mobile tabs
  mobileTabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.mobile-tab');
    if (!tab) return;
    const panel = tab.dataset.panel;
    state.mobilePanel = panel;
    mobileTabsEl.querySelectorAll('.mobile-tab').forEach(t => t.classList.toggle('active', t.dataset.panel === panel));
    $('#chatPanel').classList.toggle('mobile-active', panel === 'chat');
    $('#boardPanel').classList.toggle('mobile-active', panel === 'board');
  });

  // Escape to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (taskModal.classList.contains('visible')) closeTaskModal();
      else if (settingsModal.classList.contains('visible')) closeSettings();
    }
  });

  // Handle responsive changes
  handleResponsive();
  window.addEventListener('resize', handleResponsive);
}

function handleResponsive() {
  const isMobile = window.innerWidth <= 700;
  if (isMobile) {
    // Set mobile-active based on current selection
    $('#chatPanel').classList.toggle('mobile-active', state.mobilePanel === 'chat');
    $('#boardPanel').classList.toggle('mobile-active', state.mobilePanel === 'board');
  } else {
    // Desktop: remove mobile-active classes
    $('#chatPanel').classList.remove('mobile-active');
    $('#boardPanel').classList.remove('mobile-active');
  }
}

// ─── Init ────────────────────────────────────────────────────────
function init() {
  // Cache DOM refs
  chatMessagesEl = $('#chatMessages');
  chatFormEl = $('#chatForm');
  chatInputEl = $('#chatInput');
  sendBtnEl = $('#sendBtn');
  summaryStripEl = $('#summaryStrip');
  filterTabsEl = $('#filterTabs');
  sortSelectEl = $('#sortSelect');
  taskListEl = $('#taskList');
  settingsModal = $('#settingsModal');
  settingsCloseEl = $('#settingsClose');
  apiKeyInputEl = $('#apiKeyInput');
  toggleKeyVisEl = $('#toggleKeyVis');
  saveKeyBtnEl = $('#saveKeyBtn');
  removeKeyBtnEl = $('#removeKeyBtn');
  testKeyBtnEl = $('#testKeyBtn');
  apiStatusEl = $('#apiStatus');
  clearDataBtnEl = $('#clearDataBtn');
  taskModal = $('#taskModal');
  taskModalCloseEl = $('#taskModalClose');
  taskModalBodyEl = $('#taskModalBody');
  deleteTaskBtnEl = $('#deleteTaskBtn');
  saveTaskBtnEl = $('#saveTaskBtn');
  mobileTabsEl = $('#mobileTabs');
  mobileTaskBadgeEl = $('#mobileTaskBadge');

  // Load persisted state
  loadState();

  // If no tasks, load mock data
  if (state.tasks.length === 0) {
    state.tasks = getMockTasks();
    saveState();
  }

  // Render
  renderChat();
  renderBoard();

  // Bind events
  setupEventListeners();

  // Set initial mobile state
  handleResponsive();
}

// Boot
document.addEventListener('DOMContentLoaded', init);
