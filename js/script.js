// Prototype only: production authentication needs a backend, hashed passwords, secure sessions/tokens, and database storage.
const USER_KEY = "campusplan-users",
  SESSION_KEY = "campusplan-current-user";
const AUTH_TOKEN_KEY = "campusplan_auth_token";
const AUTH_API_BASE = "http://localhost:5000/api/auth";
const ASSIGNMENTS_API_BASE = "http://localhost:5000/api/assignments";
const TESTS_API_BASE = "http://localhost:5000/api/tests";
const PRESENTATIONS_API_BASE = "http://localhost:5000/api/presentations";
const TIMETABLE_API_BASE = "http://localhost:5000/api/timetable";
const CALENDAR_API_BASE = "http://localhost:5000/api/calendar";
const MESSAGES_API_BASE = "http://localhost:5000/api/messages";
const THEME_KEY = "campusplan_theme";
let assignmentStore = [];
let testStore = [];
let presentationStore = [];
let timetableStore = [];
let calendarPersonalStore = [];
let calendarAcademicStore = { assignments: null, tests: null, presentations: null };
let calendarDataLoaded = false;
function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  return nextTheme;
}
function setupTheme() {
  const currentTheme = applyTheme(localStorage.getItem(THEME_KEY) || "light");
  const existing = document.getElementById("theme-toggle");
  if (existing) return;
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.id = "theme-toggle";
  toggle.className = "theme-toggle";
  const renderToggle = (theme) => {
    const dark = theme === "dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.innerHTML = dark
      ? '<span class="theme-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M20.6 15.2A8.5 8.5 0 0 1 8.8 3.4 8.5 8.5 0 1 0 20.6 15.2Z"></path></svg></span>'
      : '<span class="theme-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg></span>';
  };
  renderToggle(currentTheme);
  const header = document.querySelector(".site-header");
  const authCard = document.querySelector(".auth-card");
  if (header) header.insertBefore(toggle, header.querySelector(".profile") || null);
  else if (authCard) authCard.appendChild(toggle);
  toggle.onclick = () => {
    const nextTheme = applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    renderToggle(nextTheme);
  };
}
function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}
function userKey(key) {
  const user = currentUser();
  return key + "_" + encodeURIComponent(user ? user.studentId : "guest");
}
async function authRequest(path, options = {}) {
  const response = await fetch(AUTH_API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || "Authentication request failed.");
  }
  return body;
}
async function assignmentRequest(path = "", options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(ASSIGNMENTS_API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html?notice=session-expired");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) throw new Error(body.message || "Assignment request failed.");
  return body;
}
async function testRequest(path = "", options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(TESTS_API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html?notice=session-expired");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) throw new Error(body.message || "Test request failed.");
  return body;
}
async function presentationRequest(path = "", options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(PRESENTATIONS_API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html?notice=session-expired");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) throw new Error(body.message || "Presentation request failed.");
  return body;
}
async function timetableRequest(path = "", options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(TIMETABLE_API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html?notice=session-expired");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) throw new Error(body.message || "Timetable request failed.");
  return body;
}
async function calendarRequest(path = "", options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(CALENDAR_API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html?notice=session-expired");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) throw new Error(body.message || "Calendar request failed.");
  return body;
}
async function messagesRequest(path = "", options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(MESSAGES_API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html?notice=session-expired");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) throw new Error(body.message || "Messages request failed.");
  return body;
}
function frontendUser(apiUser) {
  return {
    id: apiUser.id,
    name: apiUser.fullName,
    studentId: apiUser.studentId,
    email: apiUser.email,
    institution: apiUser.institution,
    program: apiUser.program,
    year: apiUser.yearOfStudy,
  };
}
if (
  !["login.html", "register.html"].includes(
    location.pathname.split("/").pop(),
  ) &&
  !currentUser()
)
  location.replace("login.html?notice=login");
const K = {
  assignments: "campusplan-assignments",
  tests: "campusplan-tests",
  presentations: "campusplan-presentations",
};
const future = (n) => {
  let d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const seed = {
  assignments: [
    {
      id: "a1",
      title: "Database ERD Assignment",
      course: "Database Design",
      description:
        "Create an entity relationship diagram for the campus library.",
      dueDate: future(1),
      priority: "High",
      status: "In Progress",
    },
    {
      id: "a2",
      title: "Network Topology Report",
      course: "Local Area Networking",
      description: "Compare star, bus and mesh network topologies.",
      dueDate: future(2),
      priority: "Medium",
      status: "Not Started",
    },
    {
      id: "a3",
      title: "Probability Problem Set",
      course: "Probability & Statistics",
      description: "Complete the Chapter 4 probability questions.",
      dueDate: future(6),
      priority: "Low",
      status: "Completed",
    },
  ],
  tests: [
    {
      id: "t1",
      title: "Database Test",
      course: "Database Design",
      date: future(4),
      time: "09:00",
      room: "B12",
    },
    {
      id: "t2",
      title: "Networking Quiz",
      course: "Local Area Networking",
      date: future(9),
      time: "10:00",
      room: "C04",
    },
  ],
  presentations: [
    {
      id: "p1",
      title: "Nutrition and Health",
      course: "Health and Wholeness",
      date: future(3),
      group: "Group 1",
      part: "Nutrition and BSIT",
      status: "Preparing",
    },
    {
      id: "p2",
      title: "Network Layer Presentation",
      course: "Local Area Networking",
      date: future(7),
      group: "Network Team",
      part: "Network layer protocols",
      status: "Not Started",
    },
  ],
};
function get(t) {
  let key = userKey(K[t]),
    x = localStorage.getItem(key);
  if (x) return JSON.parse(x);
  localStorage.setItem(key, JSON.stringify(seed[t]));
  return seed[t];
}
function put(t, x) {
  localStorage.setItem(userKey(K[t]), JSON.stringify(x));
}
function esc(x) {
  return String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}
function initials(name) {
  return String(name || "Student")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function getUserProfile(studentId) {
  const session = currentUser();
  if (session && session.studentId === studentId) return session;
  const users = JSON.parse(localStorage.getItem(USER_KEY) || "[]");
  const saved = users.find((user) => user.studentId === studentId);
  if (saved) return saved;
  return students.find((student) => student.studentId === studentId) || null;
}
function avatarMarkup(studentId, extraClass) {
  const profile = getUserProfile(studentId) || {};
  const className = ["avatar", extraClass || ""].filter(Boolean).join(" ");
  if (String(studentId).startsWith("group:")) {
    return '<span class="' + className + ' group-avatar" aria-label="Group">CP</span>';
  }
  return profile.photo
    ? '<img class="' +
        className +
        ' avatar-photo" src="' +
        esc(profile.photo) +
        '" alt="' +
        esc(profile.name || "Student") +
        ' profile photo">'
    : '<span class="' +
        className +
        '" aria-label="' +
        esc(profile.name || "Student") +
        '">' +
        esc(initials(profile.name)) +
        "</span>";
}
function profileAvatarMarkup(profile, extraClass) {
  const className = ["avatar", extraClass || ""].filter(Boolean).join(" ");
  if (profile && profile.photo) {
    return '<img class="' + className + ' avatar-photo" src="' + esc(profile.photo) + '" alt="' + esc(profile.name || profile.fullName || "Student") + ' profile photo">';
  }
  return '<span class="' + className + '" aria-label="' + esc(profile?.name || profile?.fullName || "Student") + '">' + esc(initials(profile?.name || profile?.fullName)) + "</span>";
}
function groupAvatarMarkup(group, extraClass) {
  const className = ["avatar", "group-avatar", extraClass || ""]
    .filter(Boolean)
    .join(" ");
  return group.photo
    ? '<img class="' +
        className +
        ' avatar-photo" src="' +
        esc(group.photo) +
        '" alt="' +
        esc(group.name) +
        ' group photo">'
    : '<span class="' + className + '" aria-label="Group">CP</span>';
}
function formatMessageTime(value) {
  const messageDate = new Date(value);
  if (Number.isNaN(messageDate.getTime())) return "";
  return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function date(x) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(x + "T12:00:00"));
}
function days(x) {
  let a = new Date(),
    b = new Date(x + "T00:00:00");
  a.setHours(0, 0, 0, 0);
  return Math.ceil((b - a) / 86400000);
}
function due(x) {
  let n = days(x);
  return n === 0
    ? "Due today"
    : n === 1
      ? "Due tomorrow"
      : n < 0
        ? Math.abs(n) + " days overdue"
        : "Due " + date(x);
}
function stat(x) {
  return x === "In Progress" || x === "Preparing"
    ? "in-progress"
    : "not-started";
}
function pri(x) {
  return "priority-" + x.toLowerCase();
}
function modal() {
  document.querySelectorAll("[data-open-modal]").forEach(
    (b) =>
      (b.onclick = () => {
        let m = document.getElementById(b.dataset.openModal);
        m.hidden = false;
        m.querySelector("input:not([type=hidden])").focus();
      }),
  );
  document
    .querySelectorAll("[data-close-modal]")
    .forEach((b) => (b.onclick = () => (b.closest(".modal").hidden = true)));
}
function renderAssignments() {
  let list = document.getElementById("assignment-list");
  if (!list) return;
  let all = assignmentStore,
    q = document.getElementById("assignment-search").value.toLowerCase(),
    c = document.getElementById("course-filter"),
    s = document.getElementById("status-filter").value,
    p = document.getElementById("priority-filter").value,
    old = c.value;
  c.innerHTML =
    '<option value="">All courses</option>' +
    [...new Set(all.map((x) => x.course))]
      .sort()
      .map((x) => "<option>" + esc(x) + "</option>")
      .join("");
  c.value = old;
  let rows = all.filter(
    (x) =>
      (!q || (x.title + " " + x.course).toLowerCase().includes(q)) &&
      (!c.value || x.course === c.value) &&
      (!s || x.status === s) &&
      (!p || x.priority === p),
  );
  document.getElementById("assignment-result-count").textContent =
    rows.length + " assignment" + (rows.length === 1 ? "" : "s");
  list.innerHTML = rows.length
    ? rows
        .map(
          (x) =>
            '<article class="assignment-card"><div class="card-top"><span class="course-tag blue-bg">' +
            esc(x.course) +
            '</span><span class="priority ' +
            pri(x.priority) +
            '">' +
            esc(x.priority) +
            " priority</span></div><h2>" +
            esc(x.title) +
            "</h2><p>" +
            esc(x.description) +
            '</p><div class="deadline">' +
            due(x.dueDate) +
            ' <span class="date-detail">' +
            date(x.dueDate) +
            '</span></div><div class="card-footer"><span class="status ' +
            stat(x.status) +
            '">' +
            esc(x.status) +
            '</span><div class="card-actions"><button class="text-button" data-edit="' +
            x.id +
            '">Edit</button><button class="text-button danger" data-delete="' +
            x.id +
            '">Delete</button></div></div>' +
            (x.status !== "Completed"
              ? '<button class="complete-action" data-complete="' +
                x.id +
                '">Mark as completed</button>'
              : "") +
            "</article>",
        )
        .join("")
    : '<p class="empty-state">No assignments match these filters.</p>';
}
function setupAssignments() {
  if (!document.getElementById("assignment-list")) return;
  const list = document.getElementById("assignment-list");
  const resultCount = document.getElementById("assignment-result-count");
  const legacyKey = userKey(K.assignments);
  const migrationKey = userKey("campusplan-assignments-migrated");
  const showError = (message) => {
    resultCount.textContent = "";
    list.innerHTML =
      '<p class="empty-state assignment-api-error">' +
      esc(message) +
      ' <button class="text-button" id="retry-assignments" type="button">Retry</button></p>';
    document.getElementById("retry-assignments").onclick = loadAssignments;
  };
  const migrateLegacyAssignments = async () => {
    if (localStorage.getItem(migrationKey)) return;
    const raw = localStorage.getItem(legacyKey);
    if (!raw) {
      localStorage.setItem(migrationKey, "true");
      return;
    }
    let legacyAssignments;
    try {
      legacyAssignments = JSON.parse(raw);
    } catch (error) {
      return;
    }
    if (!Array.isArray(legacyAssignments)) return;
    for (const assignment of legacyAssignments) {
      await assignmentRequest("", {
        method: "POST",
        body: JSON.stringify({
          title: assignment.title,
          course: assignment.course,
          description: assignment.description || "No description provided.",
          dueDate: assignment.dueDate,
          priority: assignment.priority,
          status: assignment.status,
        }),
      });
    }
    localStorage.removeItem(legacyKey);
    localStorage.setItem(migrationKey, "true");
  };
  async function loadAssignments() {
    list.innerHTML = '<p class="empty-state">Loading assignments...</p>';
    resultCount.textContent = "";
    try {
      await migrateLegacyAssignments();
      const result = await assignmentRequest();
      assignmentStore = result.assignments || [];
      renderAssignments();
    } catch (error) {
      showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
    }
  }
  loadAssignments();
  [
    "assignment-search",
    "course-filter",
    "status-filter",
    "priority-filter",
  ].forEach((id) =>
    document.getElementById(id).addEventListener("input", renderAssignments),
  );
  document.getElementById("assignment-form").onsubmit = async (e) => {
    e.preventDefault();
    let id = document.getElementById("assignment-id").value,
      x = {
        title: document.getElementById("assignment-title").value.trim(),
        course: document.getElementById("assignment-course").value.trim(),
        description: document
          .getElementById("assignment-description")
          .value.trim(),
        dueDate: document.getElementById("assignment-date").value,
        priority: document.getElementById("assignment-priority").value,
        status: document.getElementById("assignment-status").value,
      };
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await assignmentRequest(id ? "/" + encodeURIComponent(id) : "", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(x),
      });
      if (id) {
        assignmentStore = assignmentStore.map((assignment) =>
          String(assignment.id) === String(id) ? result.assignment : assignment,
        );
      } else {
        assignmentStore.push(result.assignment);
      }
      e.target.reset();
      document.getElementById("assignment-id").value = "";
      document.getElementById("assignment-modal").hidden = true;
      document.getElementById("assignment-modal-title").textContent = "Add assignment";
      renderAssignments();
    } catch (error) {
      showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
    } finally {
      submitButton.disabled = false;
    }
  };
  document.getElementById("assignment-list").onclick = async (e) => {
    let id = e.target.dataset.edit || e.target.dataset.delete || e.target.dataset.complete;
    if (!id) return;
    if (e.target.dataset.delete) {
      if (!confirm("Delete this assignment?")) return;
      try {
        await assignmentRequest("/" + encodeURIComponent(id), { method: "DELETE" });
        assignmentStore = assignmentStore.filter((assignment) => String(assignment.id) !== String(id));
        renderAssignments();
      } catch (error) {
        showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
      }
    } else if (e.target.dataset.complete) {
      const assignment = assignmentStore.find((item) => String(item.id) === String(id));
      if (!assignment) return;
      try {
        const result = await assignmentRequest("/" + encodeURIComponent(id), {
          method: "PUT",
          body: JSON.stringify({ ...assignment, status: "Completed" }),
        });
        assignmentStore = assignmentStore.map((item) =>
          String(item.id) === String(id) ? result.assignment : item,
        );
        renderAssignments();
      } catch (error) {
        showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
      }
    } else {
      let x = assignmentStore.find((assignment) => String(assignment.id) === String(id));
      if (!x) return;
      [
        "id",
        "title",
        "course",
        "description",
        "date",
        "priority",
        "status",
      ].forEach((k) => {
        let el = document.getElementById("assignment-" + k);
        if (el) el.value = x[k === "date" ? "dueDate" : k];
      });
      document.getElementById("assignment-modal-title").textContent =
        "Edit assignment";
      document.getElementById("assignment-modal").hidden = false;
    }
  };
}
function renderTests() {
  const list = document.getElementById("test-list");
  if (!list) return;
  const rows = testStore.slice().sort((a, b) => a.date.localeCompare(b.date));
  list.innerHTML = rows.length
    ? rows
        .map((test) => {
          const relativeDate =
            test.status === "Completed"
              ? "Completed"
              : test.status === "Missed"
                ? "Missed"
                : days(test.date) === 0
                  ? "Today"
                  : days(test.date) === 1
                    ? "Tomorrow"
                    : days(test.date) + " days remaining";
          return (
            '<article class="test-card"><div class="card-top"><span class="course-tag green-bg">' +
            esc(test.course) +
            '</span><div class="card-actions"><button class="text-button" data-edit-test="' +
            test.id +
            '">Edit</button><button class="text-button danger" data-delete-test="' +
            test.id +
            '">Delete</button></div></div><h2>' +
            esc(test.title) +
            "</h2><p>" +
            esc(test.description || "No description provided.") +
            "</p><dl><div><dt>Date</dt><dd>" +
            date(test.date) +
            "</dd></div><div><dt>Time</dt><dd>" +
            esc(test.time || "No time specified") +
            "</dd></div><div><dt>Room</dt><dd>" +
            esc(test.room || "No room specified") +
            "</dd></div><div><dt>Status</dt><dd>" +
            esc(test.status || "Upcoming") +
            '</dd></div></dl><p class="days-remaining">' +
            relativeDate +
            "</p></article>"
          );
        })
        .join("")
    : '<p class="empty-state">No tests yet.</p>';
}

function setupTests() {
  if (!document.getElementById("test-list")) return;
  const list = document.getElementById("test-list");
  const legacyKey = userKey(K.tests);
  const migrationKey = userKey("campusplan-tests-migrated");
  const migrationProgressKey = userKey("campusplan-tests-migration-progress");
  const showError = (message) => {
    list.innerHTML =
      '<p class="empty-state test-api-error">' +
      esc(message) +
      ' <button class="text-button" id="retry-tests" type="button">Retry</button></p>';
    document.getElementById("retry-tests").onclick = loadTests;
  };
  const migrateLegacyTests = async () => {
    if (localStorage.getItem(migrationKey)) return;
    const raw = localStorage.getItem(legacyKey);
    if (!raw) {
      localStorage.setItem(migrationKey, "true");
      return;
    }
    let legacyTests;
    try {
      legacyTests = JSON.parse(raw);
    } catch (error) {
      return;
    }
    if (!Array.isArray(legacyTests)) return;
    const importedIds = new Set(
      JSON.parse(localStorage.getItem(migrationProgressKey) || "[]"),
    );
    for (const test of legacyTests) {
      if (importedIds.has(String(test.id))) continue;
      await testRequest("", {
        method: "POST",
        body: JSON.stringify({
          title: test.title,
          course: test.course,
          description: test.description || "",
          date: test.date,
          time: test.time || "",
          room: test.room || "",
          status: test.status || "Upcoming",
        }),
      });
      importedIds.add(String(test.id));
      localStorage.setItem(
        migrationProgressKey,
        JSON.stringify([...importedIds]),
      );
    }
    localStorage.removeItem(legacyKey);
    localStorage.removeItem(migrationProgressKey);
    localStorage.setItem(migrationKey, "true");
  };
  async function loadTests() {
    list.innerHTML = '<p class="empty-state">Loading tests...</p>';
    try {
      await migrateLegacyTests();
      const result = await testRequest();
      testStore = result.tests || [];
      put("tests", testStore);
      renderTests();
    } catch (error) {
      showError(
        error.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : error.message,
      );
    }
  }
  loadTests();
  document.getElementById("test-form").onsubmit = async (event) => {
    event.preventDefault();
    const id = document.getElementById("test-id").value;
    const data = {
      title: document.getElementById("test-title").value.trim(),
      course: document.getElementById("test-course").value.trim(),
      description: document.getElementById("test-description").value.trim(),
      date: document.getElementById("test-date").value,
      time: document.getElementById("test-time").value,
      room: document.getElementById("test-room").value.trim(),
      status: document.getElementById("test-status").value,
    };
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await testRequest(id ? "/" + encodeURIComponent(id) : "", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(data),
      });
      testStore = id
        ? testStore.map((test) => String(test.id) === String(id) ? result.test : test)
        : [...testStore, result.test];
      put("tests", testStore);
      event.target.reset();
      document.getElementById("test-id").value = "";
      document.getElementById("test-modal-title").textContent = "Add test or exam";
      document.getElementById("test-modal").hidden = true;
      renderTests();
    } catch (error) {
      showError(
        error.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : error.message,
      );
    } finally {
      submitButton.disabled = false;
    }
  };
  list.onclick = async (event) => {
    const id = event.target.dataset.editTest || event.target.dataset.deleteTest;
    if (!id) return;
    if (event.target.dataset.deleteTest) {
      if (!confirm("Delete this test?")) return;
      try {
        await testRequest("/" + encodeURIComponent(id), { method: "DELETE" });
        testStore = testStore.filter((test) => String(test.id) !== String(id));
        put("tests", testStore);
        renderTests();
      } catch (error) {
        showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
      }
      return;
    }
    const test = testStore.find((item) => String(item.id) === String(id));
    if (!test) return;
    document.getElementById("test-id").value = test.id;
    document.getElementById("test-title").value = test.title;
    document.getElementById("test-course").value = test.course;
    document.getElementById("test-description").value = test.description || "";
    document.getElementById("test-date").value = test.date;
    document.getElementById("test-time").value = test.time || "";
    document.getElementById("test-room").value = test.room || "";
    document.getElementById("test-status").value = test.status || "Upcoming";
    document.getElementById("test-modal-title").textContent = "Edit test or exam";
    document.getElementById("test-modal").hidden = false;
  };
}
function renderPresentations() {
  let list = document.getElementById("presentation-list");
  if (!list) return;
  list.innerHTML = presentationStore
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (x) =>
        '<article class="assignment-card presentation-card"><div class="card-top"><span class="course-tag purple-bg">' +
        esc(x.course) +
        '</span><span class="status ' +
        stat(x.status) +
        '">' +
        esc(x.status) +
        "</span></div><h2>" +
        esc(x.title) +
        '</h2><dl class="presentation-details"><div><dt>Date</dt><dd>' +
        date(x.date) +
        "</dd></div><div><dt>Group</dt><dd>" +
        esc(x.group) +
        "</dd></div><div><dt>My part</dt><dd>" +
        esc(x.part) +
        '</dd></div></dl><div class="card-actions presentation-actions"><button class="text-button" data-edit-presentation="' +
        x.id +
        '">Edit</button><button class="text-button danger" data-delete-presentation="' +
        x.id +
        '">Delete</button></div><label class="status-update">Preparation status<select data-p-status="' +
        x.id +
        '">' +
        ["Not Started", "Preparing", "Ready", "Completed"]
          .map(
            (y) =>
              "<option " +
              (x.status === y ? "selected" : "") +
              ">" +
              y +
              "</option>",
          )
          .join("") +
        "</select></label></article>",
    )
    .join("");
}
function setupPresentations() {
  if (!document.getElementById("presentation-list")) return;
  const list = document.getElementById("presentation-list");
  const legacyKey = userKey(K.presentations);
  const migrationKey = userKey("campusplan-presentations-migrated");
  const showError = (message) => {
    list.innerHTML =
      '<p class="empty-state presentation-api-error">' +
      esc(message) +
      ' <button class="text-button" id="retry-presentations" type="button">Retry</button></p>';
    document.getElementById("retry-presentations").onclick = loadPresentations;
  };
  const migrateLegacyPresentations = async () => {
    if (localStorage.getItem(migrationKey)) return;
    const raw = localStorage.getItem(legacyKey);
    if (!raw) {
      localStorage.setItem(migrationKey, "true");
      return;
    }
    let legacyPresentations;
    try {
      legacyPresentations = JSON.parse(raw);
    } catch (error) {
      return;
    }
    if (!Array.isArray(legacyPresentations)) return;
    const importedIdsKey = userKey("campusplan-presentations-migration-progress");
    const importedIds = new Set(JSON.parse(localStorage.getItem(importedIdsKey) || "[]"));
    for (const presentation of legacyPresentations) {
      if (importedIds.has(String(presentation.id))) continue;
      await presentationRequest("", {
        method: "POST",
        body: JSON.stringify({
          title: presentation.title,
          course: presentation.course,
          description: presentation.description || "",
          date: presentation.date,
          group: presentation.group || "",
          part: presentation.part || "",
          status: presentation.status || "Not Started",
        }),
      });
      importedIds.add(String(presentation.id));
      localStorage.setItem(importedIdsKey, JSON.stringify([...importedIds]));
    }
    localStorage.removeItem(legacyKey);
    localStorage.removeItem(importedIdsKey);
    localStorage.setItem(migrationKey, "true");
  };
  async function loadPresentations() {
    list.innerHTML = '<p class="empty-state">Loading presentations...</p>';
    try {
      await migrateLegacyPresentations();
      const result = await presentationRequest();
      presentationStore = result.presentations || [];
      put("presentations", presentationStore);
      renderPresentations();
    } catch (error) {
      showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
    }
  }
  loadPresentations();
  document.getElementById("presentation-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("presentation-id").value;
    const data = {
      title: document.getElementById("presentation-title").value.trim(),
      course: document.getElementById("presentation-course").value.trim(),
      description: document.getElementById("presentation-description").value.trim(),
      date: document.getElementById("presentation-date").value,
      group: document.getElementById("presentation-group").value.trim(),
      part: document.getElementById("presentation-part").value.trim(),
      status: document.getElementById("presentation-status").value,
    };
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await presentationRequest(id ? "/" + encodeURIComponent(id) : "", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(data),
      });
      presentationStore = id
        ? presentationStore.map((presentation) => String(presentation.id) === String(id) ? result.presentation : presentation)
        : [...presentationStore, result.presentation];
      put("presentations", presentationStore);
      e.target.reset();
      document.getElementById("presentation-id").value = "";
      document.getElementById("presentation-modal-title").textContent = "Add presentation";
      document.getElementById("presentation-modal").hidden = true;
      renderPresentations();
    } catch (error) {
      showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
    } finally {
      submitButton.disabled = false;
    }
  };
  list.onclick = async (event) => {
    const id = event.target.dataset.editPresentation || event.target.dataset.deletePresentation;
    if (!id) return;
    if (event.target.dataset.deletePresentation) {
      if (!confirm("Delete this presentation?")) return;
      try {
        await presentationRequest("/" + encodeURIComponent(id), { method: "DELETE" });
        presentationStore = presentationStore.filter((presentation) => String(presentation.id) !== String(id));
        put("presentations", presentationStore);
        renderPresentations();
      } catch (error) {
        showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
      }
      return;
    }
    const presentation = presentationStore.find((item) => String(item.id) === String(id));
    if (!presentation) return;
    document.getElementById("presentation-id").value = presentation.id;
    document.getElementById("presentation-title").value = presentation.title;
    document.getElementById("presentation-course").value = presentation.course;
    document.getElementById("presentation-description").value = presentation.description || "";
    document.getElementById("presentation-date").value = presentation.date;
    document.getElementById("presentation-group").value = presentation.group || "";
    document.getElementById("presentation-part").value = presentation.part || "";
    document.getElementById("presentation-status").value = presentation.status || "Not Started";
    document.getElementById("presentation-modal-title").textContent = "Edit presentation";
    document.getElementById("presentation-modal").hidden = false;
  };
  list.onchange = async (event) => {
    const id = event.target.dataset.pStatus;
    if (!id) return;
    const presentation = presentationStore.find((item) => String(item.id) === String(id));
    if (!presentation) return;
    try {
      const result = await presentationRequest("/" + encodeURIComponent(id), {
        method: "PUT",
        body: JSON.stringify({ ...presentation, status: event.target.value }),
      });
      presentationStore = presentationStore.map((item) => String(item.id) === String(id) ? result.presentation : item);
      put("presentations", presentationStore);
      renderPresentations();
    } catch (error) {
      showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
    }
  };
}
async function dashboard() {
  if (document.body.dataset.page !== "dashboard") return;
  let a;
  if (localStorage.getItem(AUTH_TOKEN_KEY)) {
    try {
      const result = await assignmentRequest();
      a = result.assignments || [];
      assignmentStore = a;
    } catch (error) {
      a = get("assignments");
    }
  } else {
    a = get("assignments");
  }
  let t = get("tests"),
    p = get("presentations"),
    done = a.filter((x) => x.status === "Completed").length,
    pc = a.length ? Math.round((done / a.length) * 100) : 0,
    by = (id) => document.getElementById(id);
  const upcomingTests = t.filter((x) => days(x.date) >= 0);
  const upcomingPresentations = p.filter((x) => x.status !== "Completed");
  const student = currentUser();
  const conversations = JSON.parse(localStorage.getItem(userKey("campusplan-conversations")) || "[]");
  const groups = JSON.parse(localStorage.getItem(userKey("campusplan-groups")) || "[]");
  const unreadMessages = conversations.reduce(
    (count, conversation) => count + conversation.messages.filter((message) => message.senderId !== student.studentId && !message.read).length,
    0,
  );
  const unreadNotifications = getNotifications().filter((notification) => !notification.read).length;
  by("pending-count").textContent = a.length - done;
  by("test-count").textContent = upcomingTests.length;
  by("presentation-count").textContent = p.filter(
    (x) => x.status !== "Completed",
  ).length;
  by("completed-count").textContent = done;
  if (by("message-count")) by("message-count").textContent = unreadMessages;
  if (by("notification-dashboard-count")) by("notification-dashboard-count").textContent = unreadNotifications;
  if (by("deadline-count")) by("deadline-count").textContent = a.filter((item) => days(item.dueDate) >= 0).length + upcomingTests.length + upcomingPresentations.length;
  if (by("student-name") && student) by("student-name").textContent = student.name.split(" ")[0];
  if (by("classes-today")) by("classes-today").textContent = "3";
  by("progress-percent").textContent = pc + "%";
  by("progress-summary").textContent =
    done + " of " + a.length + " assignments completed";
  by("progress-fill").style.width = pc + "%";
  by("dashboard-upcoming").innerHTML = a
    .filter((x) => x.status !== "Completed")
    .sort((x, y) => x.dueDate.localeCompare(y.dueDate))
    .slice(0, 4)
    .map(
      (x) =>
        '<article class="task"><span class="task-icon blue" aria-hidden="true"></span><div><h3>' +
        esc(x.title) +
        "</h3><p>" +
        esc(x.course) +
        " &middot; " +
        due(x.dueDate) +
        '</p><span class="priority ' +
        pri(x.priority) +
        '">' +
        x.priority +
        ' priority</span></div><span class="status ' +
        stat(x.status) +
        '">' +
        x.status +
        "</span></article>",
    )
    .join("");
  let e = [
    ...t.map((x) => ({ ...x, type: "Test" })),
    ...p.map((x) => ({ ...x, type: "Presentation" })),
  ]
    .filter((x) => days(x.date) >= 0)
    .sort((x, y) => x.date.localeCompare(y.date))
    .slice(0, 3);
  by("dashboard-events").innerHTML = e
    .map(
      (x) =>
        '<article class="event"><span class="date"><b>' +
        new Date(x.date + "T12:00:00").getDate() +
        "</b>" +
        new Intl.DateTimeFormat("en", { month: "short" }).format(
          new Date(x.date + "T12:00:00"),
        ) +
        "</span><div><h3>" +
        esc(x.title) +
        "</h3><p>" +
        x.type +
        " &middot; In " +
        days(x.date) +
        " days</p></div></article>",
    )
    .join("");
  const recentMessages = conversations
    .slice()
    .sort((first, second) => new Date(second.messages.at(-1)?.timestamp || 0) - new Date(first.messages.at(-1)?.timestamp || 0))
    .slice(0, 2);
  const messageContainer = by("dashboard-recent-messages");
  if (messageContainer) {
    messageContainer.innerHTML = recentMessages.length
      ? recentMessages.map((conversation) => {
          const profile = getUserProfile(conversation.participantId) || {};
          const last = conversation.messages.at(-1);
          return '<a class="message-preview" href="messages.html">' + avatarMarkup(profile.studentId) + '<div><h3>' + esc(profile.name || "Student") + '</h3><p>' + esc(last?.text || "No messages yet") + '</p></div></a>';
        }).join("")
      : '<p class="empty-state">No recent conversations.</p>';
  }
  const groupContainer = by("dashboard-group-activity");
  if (groupContainer) {
    const activeGroups = groups
      .filter((group) => group.messages && group.messages.length)
      .sort((first, second) => new Date(second.messages.at(-1).timestamp) - new Date(first.messages.at(-1).timestamp))
      .slice(0, 2);
    groupContainer.innerHTML = activeGroups.length
      ? activeGroups.map((group) => '<a class="message-preview" href="groups.html"><span class="avatar group-avatar">CP</span><div><h3>' + esc(group.name) + '</h3><p>' + esc(group.messages.at(-1).text) + '</p></div></a>').join("")
      : '<p class="empty-state">No recent group activity.</p>';
  }
}
function commData(key, initial) {
  let storageKey = key === "campusplan-chats" ? userKey(key) : key,
    x = localStorage.getItem(storageKey);
  if (x) return JSON.parse(x);
  localStorage.setItem(storageKey, JSON.stringify(initial));
  return initial;
}
function commSave(key, x) {
  localStorage.setItem(
    key === "campusplan-chats" ? userKey(key) : key,
    JSON.stringify(x),
  );
}
const students = [
  {
    studentId: "sarah-m",
    name: "Sarah M.",
    email: "sarah@example.com",
    program: "BSIT",
    year: "Year 1",
  },
  {
    studentId: "john-k",
    name: "John K.",
    email: "john@example.com",
    program: "BSIT",
    year: "Year 1",
  },
  {
    studentId: "michael-o",
    name: "Michael O.",
    email: "michael@example.com",
    program: "BSIT",
    year: "Year 1",
  },
  {
    studentId: "grace-n",
    name: "Grace N.",
    email: "grace@example.com",
    program: "BSIT",
    year: "Year 1",
  },
];
function setupMessages() {
  if (document.body.dataset.page !== "messages") return;
  let chats = commData("campusplan-chats", [
      {
        id: "sarah",
        messages: [
          {
            from: "Sarah",
            text: "Have you started the Database assignment?",
            time: "10:32 AM",
          },
          {
            from: "David",
            text: "Yes, I am working on the ERD now.",
            time: "10:34 AM",
          },
        ],
        unread: 2,
      },
    ]),
    active = "sarah",
    list = document.getElementById("conversation-list"),
    render = () => {
      list.innerHTML = chats
        .map((c) => {
          let s = students.find((x) => x.id === c.id),
            last = c.messages[c.messages.length - 1];
          return (
            '<button class="conversation ' +
            (c.id === active ? "active" : "") +
            '" data-chat="' +
            c.id +
            '"><span class="avatar">' +
            s.avatar +
            "</span><div><h3>" +
            s.name +
            "</h3><p>" +
            esc(last.text) +
            "</p></div><time>" +
            last.time +
            (c.unread ? '<b class="unread">' + c.unread + "</b>" : "") +
            "</time></button>"
          );
        })
        .join("");
      let c = chats.find((x) => x.id === active),
        s = students.find((x) => x.id === active);
      document.getElementById("chat-name").textContent = s.name;
      document.getElementById("chat-avatar").textContent = s.avatar;
      document.getElementById("private-messages").innerHTML = c.messages
        .map(
          (m) =>
            '<div class="bubble ' +
            (m.from === "David" ? "sent" : "received") +
            '">' +
            esc(m.text) +
            "<time>" +
            m.time +
            "</time></div>",
        )
        .join("");
    };
  render();
  list.onclick = (e) => {
    let id = e.target.closest("[data-chat]")?.dataset.chat;
    if (id) {
      active = id;
      chats.find((x) => x.id === id).unread = 0;
      commSave("campusplan-chats", chats);
      render();
      document.getElementById("private-chat").classList.add("mobile-open");
    }
  };
  document.getElementById("student-search").oninput = (e) => {
    let q = e.target.value.toLowerCase();
    document.getElementById("student-results").innerHTML = students
      .filter((s) => s.name.toLowerCase().includes(q) && q)
      .map(
        (s) =>
          '<div class="student-result"><span class="avatar">' +
          s.avatar +
          "</span><div><b>" +
          s.name +
          "</b><small>" +
          s.course +
          '</small></div><button class="text-button" data-start="' +
          s.id +
          '">Message</button></div>',
      )
      .join("");
  };
  document.getElementById("student-results").onclick = (e) => {
    let id = e.target.dataset.start;
    if (id) {
      if (!chats.find((x) => x.id === id))
        chats.push({ id: id, messages: [], unread: 0 });
      active = id;
      commSave("campusplan-chats", chats);
      render();
    }
  };
  document.getElementById("new-message-student").innerHTML = students
    .map((s) => '<option value="' + s.id + '">' + s.name + "</option>")
    .join("");
  function send(text) {
    if (!text) return;
    let c = chats.find((x) => x.id === active);
    if (!c) {
      c = { id: active, messages: [], unread: 0 };
      chats.push(c);
    }
    c.messages.push({
      from: "David",
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    commSave("campusplan-chats", chats);
    render();
  }
  document.getElementById("private-form").onsubmit = (e) => {
    e.preventDefault();
    send(document.getElementById("private-input").value.trim());
    document.getElementById("private-input").value = "";
  };
  document.getElementById("new-message-form").onsubmit = (e) => {
    e.preventDefault();
    active = document.getElementById("new-message-student").value;
    send(document.getElementById("new-message-text").value.trim());
    document.getElementById("new-message-text").value = "";
    document.getElementById("new-message-modal").hidden = true;
  };
  document.getElementById("back-to-list").onclick = () =>
    document.getElementById("private-chat").classList.remove("mobile-open");
}
function syncCommunicationNotifications(conversations, groups) {
  const notifications = getNotifications();
  const existing = new Set(
    notifications.map((notification) => notification.eventKey),
  );
  const next = [...notifications];
  const add = (eventKey, title, message, type) => {
    if (existing.has(eventKey)) return;
    next.push({
      id: "notification-" + Date.now() + Math.random().toString(16).slice(2),
      eventKey,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    });
    existing.add(eventKey);
  };
  conversations.forEach((conversation) => {
    conversation.messages
      .filter((message) => message.senderId !== currentUser().studentId && !message.read)
      .forEach((message) => {
        const sender = getUserProfile(message.senderId);
        add(
          "message:" + conversation.id + ":" + message.id,
          sender ? sender.name : "New message",
          message.text,
          "Message",
        );
      });
  });
  groups.forEach((group) => {
    group.messages
      .filter((message) => message.senderId !== currentUser().studentId && !message.read)
      .forEach((message) => {
        add(
          "group:" + group.id + ":" + message.id,
          group.name,
          message.text,
          "Group message",
        );
      });
  });
  saveNotifications(next);
}
function markCommunicationNotificationsRead(eventKeys) {
  const keys = new Set(eventKeys);
  const notifications = getNotifications().map((notification) =>
    keys.has(notification.eventKey) ? { ...notification, read: true } : notification,
  );
  saveNotifications(notifications);
}

function setupMessagesV2() {
  if (document.body.dataset.page !== "messages") return;
  const me = currentUser();
  const list = document.getElementById("conversation-list");
  const search = document.getElementById("student-search");
  const results = document.getElementById("student-results");
  let conversations = [];
  let activeUserId = null;
  let activeUser = null;
  let activeMessages = [];
  const profiles = new Map();

  function rememberProfile(profile) {
    if (!profile) return;
    profiles.set(String(profile.id), profile);
    if (profile.studentId) profiles.set(String(profile.studentId), profile);
  }
  function profileFor(id) {
    return profiles.get(String(id)) || getUserProfile(id) || { name: "Student", studentId: id };
  }
  function avatarFor(profile, extraClass) {
    if (!profile || (!profile.id && !profile.studentId)) return avatarMarkup("unknown", extraClass);
    return profileAvatarMarkup(profile, extraClass);
  }
  function renderList() {
    list.innerHTML = conversations.length
      ? conversations.map((conversation) => {
          const profile = conversation.user;
          rememberProfile(profile);
          return '<article class="conversation ' +
            (String(profile.id) === String(activeUserId) ? "active" : "") +
            '" data-conversation-user="' + profile.id + '">' +
            avatarFor(profile) +
            '<div class="conversation-copy"><h3>' + esc(profile.fullName) + '</h3><p>' +
            esc(conversation.latestMessage || "No messages yet") +
            '</p></div><div class="conversation-meta"><time>' +
            (conversation.latestMessageAt ? formatMessageTime(conversation.latestMessageAt) : "") +
            '</time>' +
            (conversation.unreadCount ? '<b class="unread" aria-label="' + conversation.unreadCount + ' unread">' + conversation.unreadCount + "</b>" : "") +
            '</div></article>';
        }).join("")
      : '<p class="empty-state">No conversations yet.</p>';
  }
  function renderChat() {
    const chat = document.getElementById("private-chat");
    if (!activeUser) {
      chat.classList.remove("has-conversation");
      document.getElementById("private-messages").innerHTML = '<p class="empty-state chat-empty">Select a student to start messaging.</p>';
      return;
    }
    chat.classList.add("has-conversation");
    rememberProfile(activeUser);
    const chatAvatar = avatarFor(activeUser).replace(/<(img|span) /, '<$1 id="chat-avatar" ');
    document.getElementById("chat-avatar").outerHTML = chatAvatar;
    document.getElementById("chat-name").textContent = activeUser.fullName;
    document.getElementById("chat-status").textContent = "CampusPlan student";
    document.getElementById("private-messages").innerHTML = activeMessages.length
      ? activeMessages.map((message) => {
          const sender = String(message.senderId) === String(me.id) ? me : profileFor(message.senderId);
          return '<div class="message-row ' + (String(message.senderId) === String(me.id) ? "sent-row" : "received-row") + '">' +
            avatarFor(sender) + '<div class="bubble ' + (String(message.senderId) === String(me.id) ? "sent" : "received") + '"><span>' +
            esc(message.content) + '</span><time>' + formatMessageTime(message.createdAt) +
            (String(message.senderId) === String(me.id) ? (message.read ? " · Read" : " · Sent") : "") +
            "</time></div></div>";
        }).join("")
      : '<p class="empty-state chat-empty">No messages yet. Start the conversation.</p>';
  }
  async function loadConversations() {
    try {
      const result = await messagesRequest("/conversations");
      conversations = result.conversations || [];
      conversations.forEach((conversation) => rememberProfile(conversation.user));
      renderList();
    } catch (error) {
      list.innerHTML = '<p class="empty-state">' + esc(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message) + "</p>";
    }
  }
  async function openConversation(userId, profile) {
    activeUserId = Number(userId);
    activeUser = profile || profileFor(userId);
    rememberProfile(activeUser);
    try {
      const result = await messagesRequest("/" + encodeURIComponent(userId));
      activeUser = result.user;
      activeMessages = result.messages || [];
      rememberProfile(activeUser);
      await messagesRequest("/" + encodeURIComponent(userId) + "/read", { method: "PUT" });
      const summary = conversations.find((conversation) => String(conversation.user.id) === String(userId));
      if (summary) summary.unreadCount = 0;
      renderList();
      renderChat();
      document.getElementById("private-chat").classList.add("mobile-open");
    } catch (error) {
      document.getElementById("private-messages").innerHTML = '<p class="empty-state">' + esc(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message) + "</p>";
    }
  }
  async function renderSearchResults() {
    const query = search.value.trim();
    if (!query) {
      results.innerHTML = "";
      return;
    }
    try {
      const result = await messagesRequest("/students?search=" + encodeURIComponent(query));
      const people = result.students || [];
      people.forEach(rememberProfile);
      results.innerHTML = people.length
        ? people.map((student) => '<button class="student-result" type="button" data-start="' + student.id + '">' + avatarFor(student) + '<span><b>' + esc(student.fullName) + '</b><small>' + esc(student.studentId + " · " + student.program + " · " + student.yearOfStudy) + '</small></span></button>').join("")
        : '<p class="empty-state">No students found.</p>';
    } catch (error) {
      results.innerHTML = '<p class="empty-state">' + esc(error.message) + "</p>";
    }
  }
  async function loadStudentOptions() {
    try {
      const result = await messagesRequest("/students");
      const people = result.students || [];
      people.forEach(rememberProfile);
      document.getElementById("new-message-student").innerHTML = people.map((student) => '<option value="' + student.id + '">' + esc(student.fullName) + "</option>").join("");
    } catch (error) {
      document.getElementById("new-message-student").innerHTML = '<option value="">Unable to load students</option>';
    }
  }
  search.oninput = renderSearchResults;
  results.onclick = (event) => {
    const button = event.target.closest("[data-start]");
    if (button) openConversation(button.dataset.start, profileFor(button.dataset.start));
  };
  list.onclick = (event) => {
    const item = event.target.closest("[data-conversation-user]");
    if (item) openConversation(item.dataset.conversationUser, profileFor(item.dataset.conversationUser));
  };
  document.getElementById("private-form").onsubmit = async (event) => {
    event.preventDefault();
    const input = document.getElementById("private-input");
    const content = input.value.trim();
    if (!activeUserId || !content) return;
    if (content.length > 2000) {
      input.setCustomValidity("Messages must be 2000 characters or fewer.");
      input.reportValidity();
      return;
    }
    try {
      const result = await messagesRequest("/" + encodeURIComponent(activeUserId), { method: "POST", body: JSON.stringify({ content }) });
      activeMessages.push(result.message);
      input.value = "";
      renderChat();
      await loadConversations();
      activeUserId = activeUser.id;
    } catch (error) {
      input.setCustomValidity(error.message);
      input.reportValidity();
    }
  };
  document.getElementById("new-message-form").onsubmit = async (event) => {
    event.preventDefault();
    const userId = document.getElementById("new-message-student").value;
    const text = document.getElementById("new-message-text").value.trim();
    if (!userId || !text) return;
    document.getElementById("new-message-modal").hidden = true;
    document.getElementById("new-message-text").value = "";
    await openConversation(userId, profileFor(userId));
    document.getElementById("private-input").value = text;
    document.getElementById("private-form").requestSubmit();
  };
  document.getElementById("back-to-list").onclick = () => document.getElementById("private-chat").classList.remove("mobile-open");
  document.getElementById("clear-conversation").onclick = () => {
    document.getElementById("private-messages").innerHTML = '<p class="empty-state">Conversation history is stored on the server.</p>';
  };
  loadStudentOptions();
  loadConversations();
  renderChat();
}

function setupGroupsV2() {
  if (document.body.dataset.page !== "groups") return;
  const me = currentUser();
  const storageKey = userKey("campusplan-groups");
  let groups = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (!groups) {
    groups = [
      { id: "g1", name: "Database Study Group", course: "Database Design", type: "Study Group", description: "Revision and assignment support.", createdBy: me.studentId, members: [me.studentId, "sarah-m", "john-k"], messages: [{ id: "gm1", senderId: "sarah-m", text: "Who is preparing the ERD?", timestamp: new Date().toISOString(), read: false }] },
      { id: "g2", name: "Networking Presentation", course: "Local Area Networking", type: "Presentation Group", description: "Planning the network layer presentation.", createdBy: me.studentId, members: [me.studentId, "sarah-m", "michael-o"], messages: [] },
      { id: "g3", name: "Statistics Study Group", course: "Probability & Statistics", type: "Study Group", description: "Weekly practice and test revision.", createdBy: me.studentId, members: [me.studentId, "grace-n"], messages: [] },
    ];
  }
  groups = groups.map((group) => ({
    ...group,
    createdBy: group.createdBy || me.studentId,
    members: (group.members || []).map((member) => typeof member === "string" && member.includes("—") ? me.studentId : member),
    messages: (group.messages || []).map((message, index) => typeof message === "string" ? { id: "legacy-group-message-" + index, senderId: "sarah-m", text: message, timestamp: new Date().toISOString(), read: false } : message),
  }));
  let activeId = groups[0] ? groups[0].id : null;
  function save() { localStorage.setItem(storageKey, JSON.stringify(groups)); }
  function renderCards() {
    ["private-groups", "communities"].forEach((id) => {
      const community = id === "communities";
      document.getElementById(id).innerHTML = groups
        .filter((group) => (group.type === "Course Community") === community)
        .map((group) => {
          const last = group.messages[group.messages.length - 1];
          const unread = group.messages.filter((message) => message.senderId !== me.studentId && !message.read).length;
          return '<article class="group-card"><div class="group-card-top">' + groupAvatarMarkup(group) + '<div><h2>' + esc(group.name) + '</h2><p>' + esc(group.description) + '</p></div></div><div class="group-card-meta"><span>' + esc(group.course) + " · " + group.members.length + " members</span><span>" + (last ? esc(formatMessageTime(last.timestamp)) : "No messages") + (unread ? ' <b class="unread">' + unread + "</b>" : "") + '</span></div><p class="group-last-message">' + esc(last ? last.text : "Start collaborating with your group") + '</p><button class="button small" data-group="' + group.id + '">Open group</button></article>';
        }).join("") || '<p class="empty-state">No groups yet.</p>';
    });
  }
  function renderGroup() {
    const group = groups.find((item) => item.id === activeId);
    if (!group) return;
    document.querySelector("#group-chat .group-avatar").outerHTML = groupAvatarMarkup(group).replace(
      /<(img|span) /,
      '<$1 class="avatar group-avatar" ',
    );
    document.getElementById("group-name").textContent = group.name;
    document.getElementById("group-description").textContent = group.description;
    document.getElementById("group-member-count").textContent = group.members.length + " members";
    document.getElementById("group-edit-name").value = group.name;
    document.getElementById("group-edit-description").value = group.description;
    document.getElementById("group-add-member").innerHTML = students
      .filter((student) => !group.members.includes(student.studentId))
      .map((student) => '<option value="' + student.studentId + '">' + esc(student.name) + "</option>")
      .join("");
    document.getElementById("group-messages").innerHTML = group.messages.length ? group.messages.map((message) => '<div class="message-row ' + (message.senderId === me.studentId ? "sent-row" : "received-row") + '">' + avatarMarkup(message.senderId) + '<div class="bubble ' + (message.senderId === me.studentId ? "sent" : "received") + '"><b class="message-sender">' + esc((getUserProfile(message.senderId) || {}).name || "Student") + '</b><span>' + esc(message.text) + '</span><time>' + formatMessageTime(message.timestamp) + '</time></div></div>').join("") : '<p class="empty-state chat-empty">No group messages yet.</p>';
    const readKeys = group.messages
      .filter((message) => message.senderId !== me.studentId && !message.read)
      .map((message) => "group:" + group.id + ":" + message.id);
    group.messages.forEach((message) => { if (message.senderId !== me.studentId) message.read = true; });
    markCommunicationNotificationsRead(readKeys);
    document.getElementById("member-list").innerHTML = group.members.map((memberId) => '<div class="member">' + avatarMarkup(memberId) + '<span>' + esc((getUserProfile(memberId) || {}).name || memberId) + '</span><small>' + (memberId === group.createdBy ? "Admin" : "Member") + '</small>' + (group.createdBy === me.studentId && memberId !== me.studentId ? '<button class="text-button danger" data-remove-member="' + memberId + '">Remove</button>' : "") + '</div>').join("");
    save();
    renderCards();
    renderNotificationList();
  }
  ["private-groups", "communities"].forEach((id) => {
    document.getElementById(id).onclick = (event) => {
      const button = event.target.closest("[data-group]");
      if (!button) return;
      activeId = button.dataset.group;
      document.getElementById("group-chat").hidden = false;
      renderGroup();
      document.getElementById("group-chat").scrollIntoView({ behavior: "smooth" });
    };
  });
  document.getElementById("group-form").onsubmit = (event) => { event.preventDefault(); const input = document.getElementById("group-input"); const text = input.value.trim(); const group = groups.find((item) => item.id === activeId); if (!group || !text) return; group.messages.push({ id: "group-message-" + Date.now(), senderId: me.studentId, text, timestamp: new Date().toISOString(), read: true }); input.value = ""; renderGroup(); };
  document.getElementById("group-info-toggle").onclick = () => document.getElementById("group-info").hidden = !document.getElementById("group-info").hidden;
  document.getElementById("group-back").onclick = () => document.getElementById("group-chat").hidden = true;
  document.getElementById("group-save-info").onclick = () => {
    const group = groups.find((item) => item.id === activeId);
    if (!group || group.createdBy !== me.studentId) return;
    group.name = document.getElementById("group-edit-name").value.trim() || group.name;
    group.description = document.getElementById("group-edit-description").value.trim() || group.description;
    save();
    renderGroup();
  };
  document.getElementById("group-photo-input").onchange = () => {
    const group = groups.find((item) => item.id === activeId);
    const file = document.getElementById("group-photo-input").files[0];
    if (!group || group.createdBy !== me.studentId || !file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      document.getElementById("group-photo-input").value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      group.photo = reader.result;
      save();
      renderGroup();
    };
    reader.readAsDataURL(file);
  };
  document.getElementById("group-add-member-button").onclick = () => {
    const group = groups.find((item) => item.id === activeId);
    const memberId = document.getElementById("group-add-member").value;
    if (!group || group.createdBy !== me.studentId || !memberId) return;
    group.members.push(memberId);
    save();
    renderGroup();
  };
  document.getElementById("group-leave").onclick = () => {
    const group = groups.find((item) => item.id === activeId);
    if (!group || group.createdBy === me.studentId) return;
    group.members = group.members.filter((member) => member !== me.studentId);
    save();
    document.getElementById("group-chat").hidden = true;
    renderCards();
  };
  document.getElementById("member-list").onclick = (event) => { const button = event.target.closest("[data-remove-member]"); if (!button) return; const group = groups.find((item) => item.id === activeId); group.members = group.members.filter((member) => member !== button.dataset.removeMember); renderGroup(); };
  document.getElementById("group-create-form").onsubmit = (event) => { event.preventDefault(); groups.push({ id: "g" + Date.now(), name: document.getElementById("group-title").value.trim(), course: document.getElementById("group-course").value.trim(), type: document.getElementById("group-type").value, description: document.getElementById("group-description-input").value.trim(), createdBy: me.studentId, members: [me.studentId], messages: [] }); save(); event.target.reset(); document.getElementById("group-modal").hidden = true; renderCards(); };
  syncCommunicationNotifications([], groups);
  renderCards();
}

function setupGroups() {
  if (document.body.dataset.page !== "groups") return;
  let groups = commData("campusplan-groups", [
      {
        id: "g1",
        name: "Database Study Group",
        course: "Database Design",
        type: "Study Group",
        description: "Revision and assignment support.",
        members: ["David — Admin", "Sarah — Member", "John — Member"],
        messages: [
          "John: Who is preparing the ERD?",
          "David: I will prepare the logical model.",
        ],
      },
      {
        id: "g2",
        name: "Networking Presentation",
        course: "Local Area Networking",
        type: "Presentation Group",
        description: "Planning the network layer presentation.",
        members: ["David — Admin", "Sarah — Member", "Michael — Member"],
        messages: [
          "John: Who is preparing the Network Layer section?",
          "David: I will prepare the logical addressing part.",
          "Sarah: I can work on routing.",
        ],
      },
      {
        id: "g3",
        name: "Statistics Study Group",
        course: "Probability & Statistics",
        type: "Study Group",
        description: "Weekly practice and test revision.",
        members: ["David — Admin", "Grace — Member"],
        messages: [],
      },
      {
        id: "g4",
        name: "Database Design",
        course: "Database Design",
        type: "Course Community",
        description: "Course announcements and questions.",
        members: [
          "David — Admin",
          "Sarah — Member",
          "John — Member",
          "Michael — Member",
        ],
        messages: [],
      },
      {
        id: "g5",
        name: "Local Area Networking",
        course: "Local Area Networking",
        type: "Course Community",
        description: "A shared space for networking students.",
        members: ["David — Admin", "Grace — Member"],
        messages: [],
      },
    ]),
    active;
  function cards() {
    ["private-groups", "communities"].forEach((id) => {
      let community = id === "communities";
      document.getElementById(id).innerHTML = groups
        .filter((g) => (g.type === "Course Community") === community)
        .map(
          (g) =>
            '<article class="group-card"><span class="group-icon blue">CP</span><h2>' +
            esc(g.name) +
            "</h2><p>" +
            esc(g.description) +
            '</p><div><span class="member-count">' +
            g.members.length +
            " members · " +
            esc(g.course) +
            '</span><button class="button small" data-group="' +
            g.id +
            '">Open group</button></div></article>',
        )
        .join("");
    });
  }
  function open(id) {
    active = groups.find((g) => g.id === id);
    document.getElementById("group-chat").hidden = false;
    document.getElementById("group-name").textContent = active.name;
    document.getElementById("group-description").textContent =
      active.description;
    document.getElementById("group-messages").innerHTML = active.messages
      .map((m) => '<div class="bubble received">' + esc(m) + "</div>")
      .join("");
    document.getElementById("member-list").innerHTML = active.members
      .map(
        (m, i) =>
          '<div class="member">' +
          esc(m) +
          (i
            ? '<button data-remove="' +
              i +
              '" class="text-button danger">Remove</button>'
            : "") +
          "</div>",
      )
      .join("");
    document
      .getElementById("group-chat")
      .scrollIntoView({ behavior: "smooth" });
  }
  cards();
  document.getElementById("private-groups").onclick = document.getElementById(
    "communities",
  ).onclick = (e) => {
    let id = e.target.dataset.group;
    if (id) open(id);
  };
  document.getElementById("group-form").onsubmit = (e) => {
    e.preventDefault();
    let text = document.getElementById("group-input").value.trim();
    if (text) {
      active.messages.push("David: " + text);
      commSave("campusplan-groups", groups);
      open(active.id);
      document.getElementById("group-input").value = "";
    }
  };
  document.getElementById("member-list").onclick = (e) => {
    let i = e.target.dataset.remove;
    if (i !== undefined) {
      active.members.splice(i, 1);
      commSave("campusplan-groups", groups);
      open(active.id);
      cards();
    }
  };
  document.getElementById("group-create-form").onsubmit = (e) => {
    e.preventDefault();
    groups.push({
      id: "g" + Date.now(),
      name: document.getElementById("group-title").value,
      course: document.getElementById("group-course").value,
      type: document.getElementById("group-type").value,
      description: document.getElementById("group-description-input").value,
      members: ["David — Admin"],
      messages: [],
    });
    commSave("campusplan-groups", groups);
    e.target.reset();
    document.getElementById("group-modal").hidden = true;
    cards();
  };
}
function setupAuth() {
  const login = document.getElementById("login-form"),
    register = document.getElementById("register-form"),
    user = currentUser();

  if (login) {
    document.getElementById("login-notice").textContent = new URLSearchParams(
      location.search,
    ).get("notice")
      ? "Please log in to access CampusPlan."
      : "";
    login.onsubmit = async (e) => {
      e.preventDefault();
      let id = document
          .getElementById("login-identity")
          .value.trim()
          .toLowerCase(),
        pass = document.getElementById("login-password").value,
        found = JSON.parse(localStorage.getItem(USER_KEY) || "[]").find(
          (x) =>
            (x.email.toLowerCase() === id ||
              x.studentId.toLowerCase() === id) &&
            x.password === pass,
        );
      try {
        const result = await authRequest("/login", {
          method: "POST",
          body: JSON.stringify({ identity: id, password: pass }),
        });
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        location.href = "index.html";
      } catch (error) {
        if (error instanceof TypeError && found) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.setItem(SESSION_KEY, JSON.stringify(found));
          location.href = "index.html";
          return;
        }
        document.getElementById("login-error").textContent = error.message;
      }
    };
    document.querySelector(".forgot-password").onclick = () =>
      alert("Password recovery will be implemented later.");
  }

  if (register) {
    register.onsubmit = async (e) => {
      e.preventDefault();
      let f = (id) => document.getElementById(id),
        valid =
          f("reg-name").value &&
          f("reg-id").value &&
          f("reg-institution").value &&
          f("reg-program").value &&
          f("reg-year").value &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f("reg-email").value) &&
          f("reg-password").value.length >= 6 &&
          f("reg-password").value === f("reg-confirm").value;
      if (!valid) {
        document.getElementById("register-success").textContent =
          "Please complete every field, use a valid email, and ensure passwords match (6+ characters).";
        return;
      }
      const registration = {
        fullName: f("reg-name").value.trim(),
        studentId: f("reg-id").value.trim(),
        email: f("reg-email").value.trim(),
        institution: f("reg-institution").value.trim(),
        program: f("reg-program").value.trim(),
        yearOfStudy: f("reg-year").value,
        password: f("reg-password").value,
      };
      try {
        const result = await authRequest("/register", {
          method: "POST",
          body: JSON.stringify(registration),
        });
        document.getElementById("register-success").textContent = result.message;
        setTimeout(() => (location.href = "login.html"), 800);
      } catch (error) {
        if (!(error instanceof TypeError)) {
          document.getElementById("register-success").textContent = error.message;
          return;
        }
        const users = JSON.parse(localStorage.getItem(USER_KEY) || "[]");
        if (users.some((userRecord) => userRecord.email === registration.email || userRecord.studentId === registration.studentId)) {
          document.getElementById("register-success").textContent =
            "An account with this email or Student ID already exists.";
          return;
        }
        users.push({
          name: registration.fullName,
          studentId: registration.studentId,
          email: registration.email,
          institution: registration.institution,
          program: registration.program,
          year: registration.yearOfStudy,
          password: registration.password,
        });
        localStorage.setItem(USER_KEY, JSON.stringify(users));
        document.getElementById("register-success").textContent =
          "Account created successfully! Redirecting to login...";
        setTimeout(() => (location.href = "login.html"), 800);
      }
    };
  }

  if (user) {
    document.querySelectorAll(".profile").forEach((button) => {
      button.innerHTML =
        avatarMarkup(user.studentId) +
        '<span class="profile-name">' +
        esc(user.name) +
        " &#8964;</span>";
      button.onclick = () => {
        let menu = document.querySelector(".profile-menu");
        if (menu) {
          menu.remove();
          return;
        }
        menu = document.createElement("div");
        menu.className = "profile-menu";
        menu.innerHTML =
          '<a href="profile.html">Profile</a><a href="profile.html">Settings</a><button id="logout">Logout</button>';
        button.parentElement.appendChild(menu);
        menu.querySelector("#logout").onclick = () => {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(SESSION_KEY);
          location.href = "login.html";
        };
      };
    });

    let name = document.getElementById("student-name");
    if (name) name.textContent = user.name.split(" ")[0];
  }

  if (document.body.dataset.page === "profile") {
    const profilePhoto = document.getElementById("profile-photo");
    const photoInput = document.getElementById("profile-photo-input");
    const removePhoto = document.getElementById("remove-profile-photo");
    const setPhotoPreview = (photo) => {
      profilePhoto.innerHTML = avatarMarkup(user.studentId, "profile-avatar");
      if (photo) profilePhoto.dataset.hasPhoto = "true";
      else delete profilePhoto.dataset.hasPhoto;
    };
    setPhotoPreview(user.photo);
    if (photoInput) {
      photoInput.onchange = () => {
        const file = photoInput.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
          document.getElementById("profile-notice").textContent =
            "Choose an image file smaller than 2 MB.";
          photoInput.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          user.photo = reader.result;
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          const users = JSON.parse(localStorage.getItem(USER_KEY) || "[]").map(
            (savedUser) => savedUser.studentId === user.studentId ? user : savedUser,
          );
          localStorage.setItem(USER_KEY, JSON.stringify(users));
          setPhotoPreview(user.photo);
          document.getElementById("profile-notice").textContent =
            "Profile photo updated.";
        };
        reader.readAsDataURL(file);
      };
    }
    if (removePhoto) {
      removePhoto.onclick = () => {
        delete user.photo;
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        const users = JSON.parse(localStorage.getItem(USER_KEY) || "[]").map(
          (savedUser) => savedUser.studentId === user.studentId ? user : savedUser,
        );
        localStorage.setItem(USER_KEY, JSON.stringify(users));
        setPhotoPreview();
        if (photoInput) photoInput.value = "";
        document.getElementById("profile-notice").textContent =
          "Profile photo removed.";
      };
    }
    ["name", "email", "institution", "program", "year"].forEach(
      (k) => (document.getElementById("profile-" + k).value = user[k]),
    );
    document.getElementById("profile-id").value = user.studentId;
    document.getElementById("profile-form").onsubmit = (e) => {
      e.preventDefault();
      let updated = {
          ...user,
          name: document.getElementById("profile-name").value,
          email: document.getElementById("profile-email").value,
          institution: document.getElementById("profile-institution").value,
          program: document.getElementById("profile-program").value,
          year: document.getElementById("profile-year").value,
        },
        users = JSON.parse(localStorage.getItem(USER_KEY) || "[]").map((x) =>
          x.studentId === user.studentId ? updated : x,
        );
      localStorage.setItem(USER_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      document.getElementById("profile-notice").textContent =
        "Profile saved successfully.";
    };
  }
}

function addCalendarNavLink() {
  document.querySelectorAll(".main-nav").forEach((nav) => {
    const hasCalendar = Array.from(nav.querySelectorAll("a")).some(
      (link) => link.getAttribute("href") === "calendar.html",
    );
    if (hasCalendar) return;

    const calendarLink = document.createElement("a");
    calendarLink.href = "calendar.html";
    calendarLink.textContent = "Calendar";
    if (document.body.dataset.page === "calendar") {
      calendarLink.classList.add("active");
    }

    const timetableLink = nav.querySelector('a[href="timetable.html"]');
    if (timetableLink) {
      nav.insertBefore(calendarLink, timetableLink.nextSibling);
    } else {
      nav.appendChild(calendarLink);
    }
  });
}

function getReminderLevel(daysLeft) {
  if (daysLeft > 7) return { label: "Upcoming", className: "upcoming" };
  if (daysLeft >= 3) return { label: "Coming Soon", className: "coming-soon" };
  if (daysLeft >= 1) return { label: "Due Soon", className: "due-soon" };
  if (daysLeft === 0) return { label: "Due Today", className: "due-today" };
  return { label: "Overdue", className: "overdue" };
}

function getDayDifference(targetDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate + "T12:00:00");
  return Math.ceil((target - today) / 86400000);
}

function getReminders() {
  const storageKey = userKey("campusplan-reminders");
  const value = localStorage.getItem(storageKey);
  if (value) return JSON.parse(value);
  localStorage.setItem(storageKey, JSON.stringify([]));
  return [];
}

function saveReminders(reminders) {
  localStorage.setItem(
    userKey("campusplan-reminders"),
    JSON.stringify(reminders),
  );
}
function getPersonalCalendarEvents() {
  if (calendarDataLoaded) return calendarPersonalStore;
  const storageKey = userKey("campusplan-calendar-events");
  const value = localStorage.getItem(storageKey);
  if (value) return JSON.parse(value);
  localStorage.setItem(storageKey, JSON.stringify([]));
  return [];
}

function savePersonalCalendarEvents(events) {
  calendarPersonalStore = events;
  localStorage.setItem(
    userKey("campusplan-calendar-events"),
    JSON.stringify(events),
  );
}

async function loadCalendarData() {
  if (document.body.dataset.page !== "calendar") return;
  const legacyKey = userKey("campusplan-calendar-events");
  const migrationKey = userKey("campusplan-calendar-events-migrated");
  const progressKey = userKey("campusplan-calendar-events-migration-progress");
  try {
    if (!localStorage.getItem(migrationKey)) {
      const raw = localStorage.getItem(legacyKey);
      if (raw) {
        const legacyEvents = JSON.parse(raw);
        const importedIds = new Set(JSON.parse(localStorage.getItem(progressKey) || "[]"));
        for (const event of Array.isArray(legacyEvents) ? legacyEvents : []) {
          if (importedIds.has(String(event.id))) continue;
          await calendarRequest("", {
            method: "POST",
            body: JSON.stringify({
              title: event.title,
              date: event.date,
              startTime: event.startTime || "",
              endTime: event.endTime || "",
              description: event.description || "",
              priority: event.priority || "Medium",
              type: event.type || "Personal",
            }),
          });
          importedIds.add(String(event.id));
          localStorage.setItem(progressKey, JSON.stringify([...importedIds]));
        }
        localStorage.removeItem(progressKey);
      }
      localStorage.setItem(migrationKey, "true");
    }
    const [assignments, tests, presentations, personal] = await Promise.all([
      assignmentRequest(),
      testRequest(),
      presentationRequest(),
      calendarRequest(),
    ]);
    calendarAcademicStore.assignments = assignments.assignments || [];
    calendarAcademicStore.tests = tests.tests || [];
    calendarAcademicStore.presentations = presentations.presentations || [];
    calendarPersonalStore = personal.events || [];
    calendarDataLoaded = true;
    localStorage.setItem(legacyKey, JSON.stringify(calendarPersonalStore));
    renderCalendarPage();
    renderDashboardReminders();
    renderCalendarPreview();
  } catch (error) {
    calendarDataLoaded = false;
    const grid = document.getElementById("calendar-grid");
    if (grid) grid.setAttribute("aria-busy", "false");
    if (error.message !== "Failed to fetch") {
      const notice = document.getElementById("calendar-load-error");
      if (notice) notice.textContent = error.message;
    }
  }
}

function getNotifications() {
  const storageKey = userKey("campusplan-notifications");
  const value = localStorage.getItem(storageKey);
  if (value) return JSON.parse(value);
  localStorage.setItem(storageKey, JSON.stringify([]));
  return [];
}

function saveNotifications(notifications) {
  localStorage.setItem(
    userKey("campusplan-notifications"),
    JSON.stringify(notifications),
  );
}

function buildAcademicEventList() {
  const assignmentEvents = (calendarAcademicStore.assignments || get("assignments")).map((item) => ({
    id: "assignment-" + item.id,
    title: item.title,
    type: "Assignment",
    course: item.course,
    date: item.dueDate,
    time: "",
    description: item.description,
    status: item.status,
    priority: item.priority,
    eventType: "assignment",
  }));

  const testEvents = (calendarAcademicStore.tests || get("tests")).map((item) => ({
    id: "test-" + item.id,
    title: item.title,
    type: "Test",
    course: item.course,
    date: item.date,
    time: item.time,
    description: item.room ? "Test in room " + item.room : "Academic test",
    status: "Scheduled",
    priority: "Medium",
    eventType: "test",
  }));

  const presentationEvents = (calendarAcademicStore.presentations || get("presentations")).map((item) => ({
    id: "presentation-" + item.id,
    title: item.title,
    type: "Presentation",
    course: item.course,
    date: item.date,
    time: "",
    description: item.part + " — " + item.group,
    status: item.status,
    priority: "Medium",
    eventType: "presentation",
  }));

  const reminderEvents = getReminders().map((item) => ({
    id: "reminder-" + item.id,
    title: item.title,
    type: "Reminder",
    course: item.course || "Personal Reminder",
    date: item.date,
    time: item.time || "",
    description: item.description || "Custom reminder",
    status: "Reminder",
    priority: item.priority || "Medium",
    eventType: "reminder",
  }));
  const personalEvents = getPersonalCalendarEvents().map((item) => ({
    id: "personal-" + item.id,
    title: item.title,
    type: item.type || "Personal",
    course: "Personal event",
    date: item.date,
    time: [item.startTime, item.endTime].filter(Boolean).join(" - "),
    description: item.description || "Personal calendar event",
    status: "Personal",
    priority: item.priority || "Medium",
    eventType: "personal",
    personalEventId: item.id,
  }));

  return [...assignmentEvents, ...testEvents, ...presentationEvents, ...reminderEvents, ...personalEvents].sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}

function generateAcademicNotifications() {
  const notifications = getNotifications();
  const seenKeys = new Set(notifications.map((item) => item.eventKey || item.id));
  const next = [...notifications];
  const events = buildAcademicEventList();

  events.forEach((event) => {
    const daysRemaining = getDayDifference(event.date);
    if (daysRemaining < 0) return;

    let message = "";

    if (event.type === "Assignment") {
      if (daysRemaining === 0) {
        message = event.title + " is due today.";
      } else if (daysRemaining === 1) {
        message = event.title + " is due tomorrow.";
      } else if (daysRemaining <= 7) {
        message = event.title + " is due in " + daysRemaining + " days.";
      }
    }

    if (event.type === "Test") {
      if (daysRemaining === 0) {
        message = event.title + " is today.";
      } else if (daysRemaining === 1) {
        message = event.title + " is tomorrow.";
      } else if (daysRemaining <= 7) {
        message = event.title + " is in " + daysRemaining + " days.";
      }
    }

    if (event.type === "Presentation") {
      if (daysRemaining === 0) {
        message = event.title + " is scheduled for today.";
      } else if (daysRemaining === 1) {
        message = event.title + " is due tomorrow.";
      } else if (daysRemaining <= 7) {
        message = event.title + " is coming soon.";
      }
    }

    if (event.type === "Reminder") {
      if (daysRemaining === 0) {
        message = event.title + " is scheduled for today.";
      } else if (daysRemaining === 1) {
        message = event.title + " is due tomorrow.";
      } else if (daysRemaining <= 7) {
        message = event.title + " is in " + daysRemaining + " days.";
      }
    }
    if (["Personal", "Study", "Meeting", "Other"].includes(event.type)) {
      if (daysRemaining === 0) {
        message = event.title + " is scheduled for today.";
      } else if (daysRemaining === 1) {
        message = event.title + " is tomorrow.";
      } else if (daysRemaining <= 7) {
        message = event.title + " is in " + daysRemaining + " days.";
      }
    }

    if (!message) return;

    const key = event.id;
    if (seenKeys.has(key)) return;

    next.push({
      id: "notification-" + Date.now() + Math.random().toString(16).slice(2),
      eventKey: key,
      title: event.title,
      type: event.type,
      message: message,
      read: false,
      createdAt: new Date().toISOString(),
    });
    seenKeys.add(key);
  });

  saveNotifications(next);
}

function updateNotificationBadge() {
  const count = document.getElementById("notification-count");
  if (!count) return;

  const unread = getNotifications().filter((item) => !item.read).length;
  count.textContent = unread;
  count.style.display = unread ? "grid" : "none";
}

function renderNotificationList() {
  const notificationList = document.getElementById("notification-list");
  const dashboardNotifications = document.getElementById("dashboard-notifications");
  const notifications = getNotifications()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const html = notifications.length
    ? notifications
        .map(
          (item) =>
            '<button class="notification-item ' +
            (item.read ? "" : "unread") +
            '" data-notification-id="' +
            item.id +
            '" type="button"><strong>' +
            esc(item.title) +
            "</strong><span>" +
            esc(item.message) +
            "</span><small>" +
            esc(item.type) +
            "</small></button>",
        )
        .join("")
    : '<p class="empty-state">No notifications yet.</p>';

  if (notificationList) notificationList.innerHTML = html;
  if (dashboardNotifications) dashboardNotifications.innerHTML = html;
  updateNotificationBadge();
}

function markAllNotificationsRead() {
  const notifications = getNotifications().map((item) => ({ ...item, read: true }));
  saveNotifications(notifications);
  renderNotificationList();
}

function setupNotifications() {
  if (!document.querySelector(".site-header")) return;

  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("notification-toggle");
  const panel = document.getElementById("notification-panel");

  if (!toggle) {
    const button = document.createElement("button");
    button.type = "button";
    button.id = "notification-toggle";
    button.className = "notification-button";
    button.setAttribute("aria-label", "Open notifications");
    button.innerHTML =
      '<span class="notification-icon" aria-hidden="true"></span><span class="notification-count" id="notification-count">0</span>';
    header.appendChild(button);
  }

  if (!panel) {
    const newPanel = document.createElement("div");
    newPanel.id = "notification-panel";
    newPanel.className = "notification-panel";
    newPanel.hidden = true;
    newPanel.innerHTML =
      '<div class="panel-top"><h3>Notifications</h3><button class="text-button" id="mark-all-read" type="button">Mark all as read</button></div><div id="notification-list"></div>';
    header.appendChild(newPanel);
  }

  const activeToggle = document.getElementById("notification-toggle");
  const activePanel = document.getElementById("notification-panel");

  if (activeToggle) {
    activeToggle.onclick = (event) => {
      event.stopPropagation();
      if (activePanel) activePanel.hidden = !activePanel.hidden;
    };
  }

  document.addEventListener("click", (event) => {
    if (
      activePanel &&
      !activePanel.hidden &&
      !activePanel.contains(event.target) &&
      !activeToggle.contains(event.target)
    ) {
      activePanel.hidden = true;
    }
  });

  const markAllRead = document.getElementById("mark-all-read");
  if (markAllRead) {
    markAllRead.onclick = () => markAllNotificationsRead();
  }

  const dashboardMarkRead = document.getElementById("dashboard-mark-read");
  if (dashboardMarkRead) {
    dashboardMarkRead.onclick = () => markAllNotificationsRead();
  }

  const list = document.getElementById("notification-list");
  if (list) {
    list.onclick = (event) => {
      const item = event.target.closest("[data-notification-id]");
      if (!item) return;
      const id = item.dataset.notificationId;
      const updated = getNotifications().map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      );
      saveNotifications(updated);
      renderNotificationList();
    };
  }

  const dashboardList = document.getElementById("dashboard-notifications");
  if (dashboardList) {
    dashboardList.onclick = (event) => {
      const item = event.target.closest("[data-notification-id]");
      if (!item) return;
      const id = item.dataset.notificationId;
      const updated = getNotifications().map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      );
      saveNotifications(updated);
      renderNotificationList();
    };
  }

  renderNotificationList();
}

function renderDashboardReminders() {
  const container = document.getElementById("dashboard-reminders");
  if (!container) return;

  const items = buildAcademicEventList().slice(0, 5);
  container.innerHTML = items.length
    ? '<div class="reminder-stack">' +
        items
          .map((event) => {
            const daysLeft = getDayDifference(event.date);
            const level = getReminderLevel(daysLeft);
            const label =
              daysLeft === 0
                ? "Due today"
                : daysLeft === 1
                  ? "Due tomorrow"
                  : daysLeft > 0
                    ? "Due in " + daysLeft + " days"
                    : Math.abs(daysLeft) + " days overdue";

            return (
              '<div class="reminder-item"><strong>' +
              esc(event.title) +
              '</strong><small>' +
              esc(event.type) +
              " • " +
              esc(event.course) +
              "</small><span class=\"reminder-status " +
              level.className +
              "\">" +
              level.label +
              "</span><small>" +
              label +
              "</small></div>"
            );
          })
          .join("") +
        "</div>"
    : '<p class="empty-state">No reminders yet.</p>';
}

function renderCalendarPreview() {
  const container = document.getElementById("dashboard-calendar-preview");
  if (!container) return;

  const items = buildAcademicEventList().slice(0, 4);
  container.innerHTML = items.length
    ? '<div class="dashboard-mini-list">' +
        items
          .map((item) => {
            const date = new Date(item.date + "T12:00:00");
            return (
              '<div class="dashboard-mini-item"><div class="dashboard-mini-date"><b>' +
              date.getDate() +
              "</b>" +
              new Intl.DateTimeFormat("en", { month: "short" }).format(date) +
              '</div><div class="dashboard-mini-copy"><h3>' +
              esc(item.title) +
              '</h3><p>' +
              esc(item.type) +
              " • " +
              esc(item.course) +
              "</p></div></div>"
            );
          })
          .join("") +
        "</div>"
    : '<p class="empty-state">No events yet.</p>';
}

function setupReminderForm() {
  const form = document.getElementById("reminder-form");
  if (!form) return;

  form.onsubmit = (event) => {
    event.preventDefault();

    const reminder = {
      id: "reminder-custom-" + Date.now(),
      title: document.getElementById("reminder-title").value.trim(),
      date: document.getElementById("reminder-date").value,
      time: document.getElementById("reminder-time").value,
      description: document.getElementById("reminder-description").value.trim(),
      priority: document.getElementById("reminder-priority").value,
      course: "Personal Reminder",
    };

    const reminders = getReminders();
    reminders.push(reminder);
    saveReminders(reminders);
    generateAcademicNotifications();
    renderDashboardReminders();
    renderCalendarPreview();
    if (document.body.dataset.page === "calendar") renderCalendarPage();
    form.reset();
    document.getElementById("reminder-modal").hidden = true;
  };
}

function renderCalendarPage() {
  if (document.body.dataset.page !== "calendar") return;

  const monthLabel = document.getElementById("calendar-month-label");
  const grid = document.getElementById("calendar-grid");
  if (!monthLabel || !grid) return;

  const currentMonth = document.getElementById("calendar-current-month");
  const monthValue = currentMonth && currentMonth.dataset.month
    ? new Date(currentMonth.dataset.month)
    : new Date();
  const monthStart = new Date(monthValue.getFullYear(), monthValue.getMonth(), 1);
  const monthEnd = new Date(monthValue.getFullYear(), monthValue.getMonth() + 1, 0);
  const startingIndex = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const eventsByDate = buildAcademicEventList().reduce((map, item) => {
    const date = item.date;
    if (!map[date]) map[date] = [];
    map[date].push(item);
    return map;
  }, {});

  monthLabel.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(monthStart);

  const days = [];
  for (let offset = startingIndex; offset > 0; offset--) {
    const date = new Date(monthStart);
    date.setDate(monthStart.getDate() - offset);
    days.push({ date, otherMonth: true });
  }

  for (let day = 1; day <= monthEnd.getDate(); day++) {
    const date = new Date(monthValue.getFullYear(), monthValue.getMonth(), day);
    days.push({ date, otherMonth: false });
  }

  while (days.length % 7 !== 0) {
    const date = new Date(
      monthValue.getFullYear(),
      monthValue.getMonth() + 1,
      days.length - startingIndex - monthEnd.getDate() + 1,
    );
    days.push({ date, otherMonth: true });
  }

  grid.innerHTML = days
    .map((entry) => {
      const isoDate = entry.date.toISOString().slice(0, 10);
      const events = eventsByDate[isoDate] || [];
      const classes = ["calendar-day"];
      if (entry.otherMonth) classes.push("other-month");
      if (isoDate === new Date().toISOString().slice(0, 10)) classes.push("today");
      if (events.length) classes.push("calendar-day-has-events");

      return (
        '<button type="button" class="' +
        classes.join(" ") +
        '" data-date="' +
        isoDate +
        '" aria-label="' +
        isoDate +
        (events.length ? ": " + events.length + " events" : "") +
        '"><span class="calendar-day-number">' +
        entry.date.getDate() +
        '</span>' +
        (events.length
          ? '<div class="calendar-event-list">' +
            events
              .slice(0, 3)
              .map(
                (event) =>
                  '<span class="calendar-event-pill ' +
                  event.eventType +
                  '" data-event-id="' +
                  event.id +
                  '">' +
                  esc(event.title) +
                  "</span>",
              )
              .join("") +
            "</div>"
          : "") +
        "</button>"
      );
    })
    .join("");

  const dayButtons = document.querySelectorAll(".calendar-day");
  dayButtons.forEach((button) => {
    button.onclick = (event) => {
      const target = event.target.closest("[data-event-id]");
      const dateValue = button.dataset.date;

      if (target) {
        const eventId = target.dataset.eventId;
        const event = buildAcademicEventList().find((item) => item.id === eventId);
        if (event) openEventModal(event);
        return;
      }

      const dateEvents = buildAcademicEventList().filter(
        (item) => item.date === dateValue,
      );
      if (dateEvents.length) openEventModal(dateEvents[0]);
    };
  });
}

function openEventModal(event) {
  const modal = document.getElementById("calendar-event-modal");
  if (!modal) return;

  const title = document.getElementById("calendar-event-title");
  const type = document.getElementById("calendar-event-type");
  const course = document.getElementById("calendar-event-course");
  const date = document.getElementById("calendar-event-date");
  const time = document.getElementById("calendar-event-time");
  const description = document.getElementById("calendar-event-description");
  const status = document.getElementById("calendar-event-status");
  const priority = document.getElementById("calendar-event-priority");

  if (title) title.textContent = event.title;
  if (type) type.textContent = event.type;
  if (course) course.textContent = event.course;
  if (date) {
    date.textContent = event.date
      ? new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(event.date + "T12:00:00"))
      : "No date";
  }
  if (time) time.textContent = event.time || "No time specified";
  if (description)
    description.textContent = event.description || "No description available.";
  if (status) status.textContent = event.status || "Scheduled";
  if (priority) priority.textContent = event.priority || "Medium";
  const actions = document.getElementById("calendar-event-actions");
  if (actions) {
    actions.innerHTML = event.eventType === "personal"
      ? '<button class="button secondary" type="button" id="calendar-event-edit">Edit</button><button class="button danger-button" type="button" id="calendar-event-delete">Delete</button>'
      : '<span class="event-source-note">Managed from ' + esc(event.type === "Assignment" ? "Assignments" : event.type === "Test" ? "Tests" : event.type === "Presentation" ? "Presentations" : "Reminders") + "</span>";
    if (event.eventType === "personal") {
      document.getElementById("calendar-event-edit").onclick = () => openPersonalEventForm(event.personalEventId);
      document.getElementById("calendar-event-delete").onclick = () => {
        if (!confirm("Delete this personal event?")) return;
        calendarRequest("/" + encodeURIComponent(event.personalEventId), { method: "DELETE" })
          .then(() => {
            savePersonalCalendarEvents(getPersonalCalendarEvents().filter((item) => String(item.id) !== String(event.personalEventId)));
            modal.hidden = true;
            renderCalendarPage();
            generateAcademicNotifications();
          })
          .catch((error) => {
            const notice = document.getElementById("calendar-event-description");
            if (notice) notice.textContent = error.message;
          });
      };
    }
  }

  modal.hidden = false;
}

function openPersonalEventForm(eventId) {
  const event = getPersonalCalendarEvents().find((item) => item.id === eventId);
  const form = document.getElementById("calendar-event-form");
  if (!form) return;
  document.getElementById("calendar-event-form-title").textContent = event ? "Edit personal event" : "Add personal event";
  document.getElementById("calendar-personal-id").value = event ? event.id : "";
  document.getElementById("calendar-personal-title").value = event ? event.title : "";
  document.getElementById("calendar-personal-date").value = event ? event.date : "";
  document.getElementById("calendar-personal-start").value = event ? event.startTime || "" : "";
  document.getElementById("calendar-personal-end").value = event ? event.endTime || "" : "";
  document.getElementById("calendar-personal-type").value = event ? event.type || "Personal" : "Personal";
  document.getElementById("calendar-personal-priority").value = event ? event.priority || "Medium" : "Medium";
  document.getElementById("calendar-personal-description").value = event ? event.description || "" : "";
  document.getElementById("calendar-personal-error").textContent = "";
  if (eventId) document.getElementById("calendar-event-modal").hidden = true;
  document.getElementById("calendar-event-form-modal").hidden = false;
  document.getElementById("calendar-personal-title").focus();
}

function setupPersonalCalendarEvents() {
  const form = document.getElementById("calendar-event-form");
  if (!form) return;
  document.querySelector('[data-open-modal="calendar-event-form-modal"]').onclick = () => openPersonalEventForm();
  form.onsubmit = async (event) => {
    event.preventDefault();
    const startTime = document.getElementById("calendar-personal-start").value;
    const endTime = document.getElementById("calendar-personal-end").value;
    const error = document.getElementById("calendar-personal-error");
    if (endTime && !startTime) {
      error.textContent = "Add a start time before setting an end time.";
      return;
    }
    if (startTime && endTime && endTime <= startTime) {
      error.textContent = "End time must be after the start time.";
      return;
    }
    const id = document.getElementById("calendar-personal-id").value;
    const item = {
      title: document.getElementById("calendar-personal-title").value.trim(),
      date: document.getElementById("calendar-personal-date").value,
      startTime,
      endTime,
      type: document.getElementById("calendar-personal-type").value,
      priority: document.getElementById("calendar-personal-priority").value,
      description: document.getElementById("calendar-personal-description").value.trim(),
    };
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await calendarRequest(id ? "/" + encodeURIComponent(id) : "", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(item),
      });
      const events = getPersonalCalendarEvents().slice();
      const index = events.findIndex((savedEvent) => String(savedEvent.id) === String(id));
      if (index === -1) events.push(result.event);
      else events[index] = result.event;
      savePersonalCalendarEvents(events);
      generateAcademicNotifications();
      form.reset();
      document.getElementById("calendar-event-form-modal").hidden = true;
      renderCalendarPage();
    } catch (requestError) {
      error.textContent = requestError.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : requestError.message;
    } finally {
      submitButton.disabled = false;
    }
  };
}

function setupTimetable() {
  if (document.body.dataset.page !== "timetable") return;
  const list = document.getElementById("timetable-list");
  const form = document.getElementById("timetable-form");
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const fields = ["course", "code", "day", "start", "end", "room", "lecturer", "notes"];
  const legacyKey = userKey("campusplan-timetable");
  const migrationKey = userKey("campusplan-timetable-migrated");
  const progressKey = userKey("campusplan-timetable-migration-progress");
  const showError = (message) => {
    list.innerHTML = '<p class="empty-state timetable-api-error">' + esc(message) + ' <button class="text-button" id="retry-timetable" type="button">Retry</button></p>';
    document.getElementById("retry-timetable").onclick = loadTimetable;
  };
  const saveCache = () => localStorage.setItem(legacyKey, JSON.stringify(timetableStore));
  const migrateLegacyTimetable = async () => {
    if (localStorage.getItem(migrationKey)) return;
    const raw = localStorage.getItem(legacyKey);
    if (!raw) {
      localStorage.setItem(migrationKey, "true");
      return;
    }
    let legacyEntries;
    try {
      legacyEntries = JSON.parse(raw);
    } catch (error) {
      return;
    }
    if (!Array.isArray(legacyEntries)) return;
    const importedIds = new Set(JSON.parse(localStorage.getItem(progressKey) || "[]"));
    for (const entry of legacyEntries) {
      if (importedIds.has(String(entry.id))) continue;
      await timetableRequest("", {
        method: "POST",
        body: JSON.stringify(entry),
      });
      importedIds.add(String(entry.id));
      localStorage.setItem(progressKey, JSON.stringify([...importedIds]));
    }
    localStorage.removeItem(progressKey);
    localStorage.setItem(migrationKey, "true");
  };
  async function loadTimetable() {
    list.innerHTML = '<p class="empty-state">Loading timetable...</p>';
    try {
      await migrateLegacyTimetable();
      const result = await timetableRequest();
      timetableStore = result.timetable || [];
      saveCache();
      render();
    } catch (error) {
      showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message);
    }
  }
  function render() {
    const entries = timetableStore.slice().sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day) || a.startTime.localeCompare(b.startTime));
    list.innerHTML = entries.length ? daysOfWeek.map((day) => {
      const dayEntries = entries.filter((entry) => entry.day === day);
      if (!dayEntries.length) return "";
      return '<section class="timetable-day"><h2>' + day + '</h2><div class="timetable-day-entries">' + dayEntries.map((entry) => '<article class="timetable-class"><div><time>' + entry.startTime + " - " + entry.endTime + '</time><h3>' + esc(entry.courseName) + '</h3><p>' + esc([entry.courseCode, entry.room].filter(Boolean).join(" · ") || "No room specified") + '</p>' + (entry.lecturer ? '<small>Lecturer: ' + esc(entry.lecturer) + '</small>' : "") + '</div><div class="card-actions"><button class="text-button" data-edit-class="' + entry.id + '">Edit</button><button class="text-button danger" data-delete-class="' + entry.id + '">Delete</button></div></article>').join("") + '</div></section>';
    }).join("") : '<div class="panel timetable-empty"><h2>No classes added yet.</h2><p>Add your weekly classes to build your timetable.</p><button class="button" type="button" data-open-modal="timetable-modal">Add Class</button></div>';
    modal();
  }
  function editEntry(entry) {
    document.getElementById("timetable-modal-title").textContent = "Edit class";
    document.getElementById("timetable-id").value = entry.id;
    ["courseName", "courseCode", "day", "startTime", "endTime", "room", "lecturer", "notes"].forEach((key, index) => document.getElementById("timetable-" + fields[index]).value = entry[key] || "");
    document.getElementById("timetable-error").textContent = "";
    document.getElementById("timetable-modal").hidden = false;
  }
  list.onclick = (event) => {
    const editId = event.target.dataset.editClass;
    const deleteId = event.target.dataset.deleteClass;
    if (editId) editEntry(timetableStore.find((entry) => String(entry.id) === String(editId)));
    if (deleteId && confirm("Delete this class from your timetable?")) {
      timetableRequest("/" + encodeURIComponent(deleteId), { method: "DELETE" })
        .then(() => {
          timetableStore = timetableStore.filter((entry) => String(entry.id) !== String(deleteId));
          saveCache();
          render();
        })
        .catch((error) => showError(error.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : error.message));
    }
  };
  form.onsubmit = async (event) => {
    event.preventDefault();
    const startTime = document.getElementById("timetable-start").value;
    const endTime = document.getElementById("timetable-end").value;
    const error = document.getElementById("timetable-error");
    if (!document.getElementById("timetable-course").value.trim()) { error.textContent = "Course or module name is required."; return; }
    if (!startTime || !endTime || endTime <= startTime) { error.textContent = "End time must be after the start time."; return; }
    const id = document.getElementById("timetable-id").value;
    const item = { courseName: document.getElementById("timetable-course").value.trim(), courseCode: document.getElementById("timetable-code").value.trim(), day: document.getElementById("timetable-day").value, startTime, endTime, room: document.getElementById("timetable-room").value.trim(), lecturer: document.getElementById("timetable-lecturer").value.trim(), notes: document.getElementById("timetable-notes").value.trim() };
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await timetableRequest(id ? "/" + encodeURIComponent(id) : "", { method: id ? "PUT" : "POST", body: JSON.stringify(item) });
      timetableStore = id ? timetableStore.map((entry) => String(entry.id) === String(id) ? result.timetableEntry : entry) : [...timetableStore, result.timetableEntry];
      saveCache();
      form.reset();
      document.getElementById("timetable-id").value = "";
      document.getElementById("timetable-modal-title").textContent = "Add class";
      document.getElementById("timetable-modal").hidden = true;
      render();
    } catch (requestError) {
      error.textContent = requestError.message === "Failed to fetch" ? "Unable to connect to CampusPlan server." : requestError.message;
    } finally {
      submitButton.disabled = false;
    }
  };
  loadTimetable();
}

function setupCalendarPage() {
  if (document.body.dataset.page !== "calendar") return;

  const currentValue = document.getElementById("calendar-current-month");
  if (!currentValue) return;

  const today = new Date();
  currentValue.dataset.month = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  ).toISOString();

  document.getElementById("calendar-prev").onclick = () => {
    const view = new Date(currentValue.dataset.month);
    view.setMonth(view.getMonth() - 1);
    currentValue.dataset.month = view.toISOString();
    renderCalendarPage();
  };

  document.getElementById("calendar-next").onclick = () => {
    const view = new Date(currentValue.dataset.month);
    view.setMonth(view.getMonth() + 1);
    currentValue.dataset.month = view.toISOString();
    renderCalendarPage();
  };

  document.getElementById("calendar-today").onclick = () => {
    const todayDate = new Date();
    currentValue.dataset.month = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      1,
    ).toISOString();
    renderCalendarPage();
  };

  renderCalendarPage();
}

function setupReminderAndCalendar() {
  generateAcademicNotifications();
  setupNotifications();
  setupReminderForm();
  setupPersonalCalendarEvents();
  setupCalendarPage();
  loadCalendarData();
  renderDashboardReminders();
  renderCalendarPreview();
}

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupAuth();

  let b = document.querySelector(".menu-toggle"),
    n = document.querySelector(".main-nav");
  if (b) b.onclick = () => n.classList.toggle("open");

  modal();
  addCalendarNavLink();
  setupAssignments();
  setupTests();
  setupPresentations();
  dashboard();
  setupMessagesV2();
  setupGroupsV2();
  setupTimetable();
  setupReminderAndCalendar();
});
