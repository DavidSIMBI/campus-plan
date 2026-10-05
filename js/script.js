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
const GROUPS_API_BASE = "http://localhost:5000/api/groups";
const THEME_KEY = "campusplan_theme";
let assignmentStore = [];
let testStore = [];
let presentationStore = [];
let assignmentDataLoaded = false;
let testDataLoaded = false;
let presentationDataLoaded = false;
let timetableStore = [];
let calendarPersonalStore = [];
let calendarAcademicStore = {
  assignments: null,
  tests: null,
  presentations: null,
};
let calendarDataLoaded = false;
let activeCalendarEvent = null;
let activePersonalEventFormId = "";
function t(key, values) {
  return window.CampusPlanI18n
    ? window.CampusPlanI18n.t(key, values)
    : String(key);
}
function appErrorMessage(error) {
  const message = error && error.message ? error.message : String(error);
  return message === "Failed to fetch"
    ? t("connection_error")
    : t(message);
}
function setLocalizedText(element, key) {
  if (!element) return;
  element.dataset.i18n = key;
  element.textContent = t(key);
}
function appLocale() {
  return window.CampusPlanI18n
    ? window.CampusPlanI18n.formatLocale()
    : "en-GB";
}
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
    toggle.setAttribute(
      "aria-label",
      dark ? t("switch_to_light") : t("switch_to_dark"),
    );
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.innerHTML = dark
      ? '<span class="theme-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M20.6 15.2A8.5 8.5 0 0 1 8.8 3.4 8.5 8.5 0 1 0 20.6 15.2Z"></path></svg></span>'
      : '<span class="theme-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg></span>';
  };
  renderToggle(currentTheme);
  const header = document.querySelector(".site-header");
  const authCard = document.querySelector(".auth-card");
  if (header)
    header.insertBefore(toggle, header.querySelector(".profile") || null);
  else if (authCard) authCard.appendChild(toggle);
  toggle.onclick = () => {
    const nextTheme = applyTheme(
      document.documentElement.dataset.theme === "dark" ? "light" : "dark",
    );
    renderToggle(nextTheme);
  };
  document.addEventListener("campusplan-language-change", () =>
    renderToggle(document.documentElement.dataset.theme),
  );
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
function normalizeAuthenticatedUser(user, existingUser) {
  const merged = { ...(existingUser || {}), ...(user || {}) };
  merged.name = merged.fullName || merged.name || "";
  merged.fullName = merged.fullName || merged.name;
  merged.year = merged.yearOfStudy || merged.year || "";
  merged.yearOfStudy = merged.yearOfStudy || merged.year;
  return merged;
}
async function profileRequest(options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(AUTH_API_BASE + "/me", {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    location.replace("login.html?notice=session-expired");
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) {
    throw new Error(body.message || "Unable to load the student profile.");
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
  if (!response.ok)
    throw new Error(body.message || "Assignment request failed.");
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
  if (!response.ok)
    throw new Error(body.message || "Presentation request failed.");
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
  if (!response.ok)
    throw new Error(body.message || "Timetable request failed.");
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
async function groupsRequest(path = "", options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(GROUPS_API_BASE + path, {
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
  if (!response.ok) throw new Error(body.message || "Groups request failed.");
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
const isAuthPage = ["login.html", "register.html"].includes(
  location.pathname.split("/").pop(),
);
if (
  !isAuthPage &&
  (!currentUser() || !localStorage.getItem(AUTH_TOKEN_KEY))
) {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  location.replace("login.html?notice=login");
}
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
    return (
      '<span class="' +
      className +
      ' group-avatar" aria-label="Group">CP</span>'
    );
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
    return (
      '<img class="' +
      className +
      ' avatar-photo" src="' +
      esc(profile.photo) +
      '" alt="' +
      esc(
      (profile.name || profile.fullName
        ? (profile.name || profile.fullName) + " "
        : "") + t("profile_photo"),
      ) +
      '">'
    );
  }
  return (
    '<span class="' +
    className +
    '" aria-label="' +
    esc(profile?.name || profile?.fullName || "Student") +
    '">' +
    esc(initials(profile?.name || profile?.fullName)) +
    "</span>"
  );
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
      " " +
      esc(t("group_photo")) +
      '">'
    : '<span class="' +
      className +
      '" aria-label="' +
      esc(t("group")) +
      '">CP</span>';
}
function formatMessageTime(value) {
  const messageDate = new Date(value);
  if (Number.isNaN(messageDate.getTime())) return "";
  return messageDate.toLocaleTimeString(appLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function date(x) {
  return new Intl.DateTimeFormat(appLocale(), {
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
    ? t("due_today")
    : n === 1
      ? t("due_tomorrow")
      : n < 0
        ? t("days_due", { count: Math.abs(n) })
        : t("due_in_days", { count: n }) + " (" + date(x) + ")";
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
    '<option value="">' +
    t("all_courses") +
    "</option>" +
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
  document.getElementById("assignment-result-count").textContent = t(
    rows.length === 1 ? "assignment_count_one" : "assignment_count_other",
    { count: rows.length },
  );
  list.innerHTML = rows.length
    ? rows
        .map(
          (x) =>
            '<article class="assignment-card"><div class="card-top"><span class="course-tag blue-bg">' +
            esc(x.course) +
            '</span><span class="priority ' +
            pri(x.priority) +
            '">' +
            t(x.priority) +
            " " +
            t("priority_suffix") +
            "</span></div><h2>" +
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
            t(x.status) +
            '</span><div class="card-actions"><button class="text-button" data-edit="' +
            x.id +
            '">Edit</button><button class="text-button danger" data-delete="' +
            x.id +
            '">Delete</button></div></div>' +
            (x.status !== "Completed"
              ? '<button class="complete-action" data-complete="' +
                x.id +
                '">' +
                t("mark_completed") +
                "</button>"
              : "") +
            "</article>",
        )
        .join("")
    : '<p class="empty-state">' + t("no_assignments_match") + "</p>";
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
      ' <button class="text-button" id="retry-assignments" type="button">' +
      t("retry") +
      "</button></p>";
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
    list.innerHTML = '<p class="empty-state">' + t("loading_assignments") + "</p>";
    resultCount.textContent = "";
    try {
      await migrateLegacyAssignments();
      const result = await assignmentRequest();
      assignmentStore = result.assignments || [];
      assignmentDataLoaded = true;
      renderAssignments();
      refreshAcademicNotifications();
    } catch (error) {
      showError(
        error.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : error.message,
      );
    }
  }
  loadAssignments();
  document.addEventListener("campusplan-language-change", renderAssignments);
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
      const result = await assignmentRequest(
        id ? "/" + encodeURIComponent(id) : "",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(x),
        },
      );
      if (id) {
        assignmentStore = assignmentStore.map((assignment) =>
          String(assignment.id) === String(id) ? result.assignment : assignment,
        );
      } else {
        assignmentStore.push(result.assignment);
      }
      assignmentDataLoaded = true;
      refreshAcademicNotifications();
      e.target.reset();
      document.getElementById("assignment-id").value = "";
      document.getElementById("assignment-modal").hidden = true;
      document.getElementById("assignment-modal-title").textContent =
        t("add_assignment");
      renderAssignments();
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
  document.getElementById("assignment-list").onclick = async (e) => {
    let id =
      e.target.dataset.edit ||
      e.target.dataset.delete ||
      e.target.dataset.complete;
    if (!id) return;
    if (e.target.dataset.delete) {
      if (!confirm(t("delete_assignment_question"))) return;
      try {
        await assignmentRequest("/" + encodeURIComponent(id), {
          method: "DELETE",
        });
        assignmentStore = assignmentStore.filter(
          (assignment) => String(assignment.id) !== String(id),
        );
        refreshAcademicNotifications();
        renderAssignments();
      } catch (error) {
        showError(
          error.message === "Failed to fetch"
            ? "Unable to connect to CampusPlan server."
            : error.message,
        );
      }
    } else if (e.target.dataset.complete) {
      const assignment = assignmentStore.find(
        (item) => String(item.id) === String(id),
      );
      if (!assignment) return;
      try {
        const result = await assignmentRequest("/" + encodeURIComponent(id), {
          method: "PUT",
          body: JSON.stringify({ ...assignment, status: "Completed" }),
        });
        assignmentStore = assignmentStore.map((item) =>
          String(item.id) === String(id) ? result.assignment : item,
        );
        refreshAcademicNotifications();
        renderAssignments();
      } catch (error) {
        showError(
          error.message === "Failed to fetch"
            ? "Unable to connect to CampusPlan server."
            : error.message,
        );
      }
    } else {
      let x = assignmentStore.find(
        (assignment) => String(assignment.id) === String(id),
      );
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
        t("edit_assignment");
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
              ? t("completed_status")
              : test.status === "Missed"
                ? t("missed")
                : days(test.date) === 0
                  ? t("today_short")
                  : days(test.date) === 1
                    ? t("tomorrow")
                    : t("days_remaining", { count: days(test.date) });
          return (
            '<article class="test-card"><div class="card-top"><span class="course-tag green-bg">' +
            esc(test.course) +
            '</span><div class="card-actions"><button class="text-button" data-edit-test="' +
            test.id +
            '">' +
            t("edit") +
            '</button><button class="text-button danger" data-delete-test="' +
            test.id +
            '">' +
            t("delete") +
            '</button></div></div><h2>' +
            esc(test.title) +
            "</h2><p>" +
            esc(test.description || t("no_description_provided")) +
            '</p><dl><div><dt>' +
            t("date") +
            "</dt><dd>" +
            date(test.date) +
            "</dd></div><div><dt>" +
            t("time") +
            "</dt><dd>" +
            esc(test.time || t("no_time_specified")) +
            "</dd></div><div><dt>" +
            t("room") +
            "</dt><dd>" +
            esc(test.room || t("no_room")) +
            "</dd></div><div><dt>" +
            t("status") +
            "</dt><dd>" +
            esc(t(test.status || "Upcoming")) +
            '</dd></div></dl><p class="days-remaining">' +
            relativeDate +
            "</p></article>"
          );
        })
        .join("")
    : '<p class="empty-state">' + t("no_test_items") + "</p>";
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
      ' <button class="text-button" id="retry-tests" type="button">' +
      t("retry") +
      "</button></p>";
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
    list.innerHTML = '<p class="empty-state">' + t("loading_tests") + "</p>";
    try {
      await migrateLegacyTests();
      const result = await testRequest();
      testStore = result.tests || [];
      testDataLoaded = true;
      put("tests", testStore);
      renderTests();
      refreshAcademicNotifications();
    } catch (error) {
      showError(
        error.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : error.message,
      );
    }
  }
  loadTests();
  document.addEventListener("campusplan-language-change", renderTests);
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
        ? testStore.map((test) =>
            String(test.id) === String(id) ? result.test : test,
          )
        : [...testStore, result.test];
      testDataLoaded = true;
      put("tests", testStore);
      refreshAcademicNotifications();
      event.target.reset();
      document.getElementById("test-id").value = "";
      document.getElementById("test-modal-title").textContent =
        t("add_test_exam");
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
      if (!confirm(t("delete_test_question"))) return;
      try {
        await testRequest("/" + encodeURIComponent(id), { method: "DELETE" });
        testStore = testStore.filter((test) => String(test.id) !== String(id));
        put("tests", testStore);
        refreshAcademicNotifications();
        renderTests();
      } catch (error) {
        showError(
          error.message === "Failed to fetch"
            ? "Unable to connect to CampusPlan server."
            : error.message,
        );
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
    document.getElementById("test-modal-title").textContent =
      t("edit_test_exam");
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
        t(x.status) +
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
              '<option value="' +
              esc(y) +
              '" ' +
              (x.status === y ? "selected" : "") +
              ">" +
              t(y) +
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
      ' <button class="text-button" id="retry-presentations" type="button">' +
      t("retry") +
      "</button></p>";
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
    const importedIdsKey = userKey(
      "campusplan-presentations-migration-progress",
    );
    const importedIds = new Set(
      JSON.parse(localStorage.getItem(importedIdsKey) || "[]"),
    );
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
    list.innerHTML =
      '<p class="empty-state">' + t("loading_presentations") + "</p>";
    try {
      await migrateLegacyPresentations();
      const result = await presentationRequest();
      presentationStore = result.presentations || [];
      presentationDataLoaded = true;
      put("presentations", presentationStore);
      renderPresentations();
      refreshAcademicNotifications();
    } catch (error) {
      showError(
        error.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : error.message,
      );
    }
  }
  loadPresentations();
  document.addEventListener("campusplan-language-change", renderPresentations);
  document.getElementById("presentation-form").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("presentation-id").value;
    const data = {
      title: document.getElementById("presentation-title").value.trim(),
      course: document.getElementById("presentation-course").value.trim(),
      description: document
        .getElementById("presentation-description")
        .value.trim(),
      date: document.getElementById("presentation-date").value,
      group: document.getElementById("presentation-group").value.trim(),
      part: document.getElementById("presentation-part").value.trim(),
      status: document.getElementById("presentation-status").value,
    };
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await presentationRequest(
        id ? "/" + encodeURIComponent(id) : "",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(data),
        },
      );
      presentationStore = id
        ? presentationStore.map((presentation) =>
            String(presentation.id) === String(id)
              ? result.presentation
              : presentation,
          )
        : [...presentationStore, result.presentation];
      presentationDataLoaded = true;
      put("presentations", presentationStore);
      refreshAcademicNotifications();
      e.target.reset();
      document.getElementById("presentation-id").value = "";
      document.getElementById("presentation-modal-title").textContent =
        t("add_presentation");
      document.getElementById("presentation-modal").hidden = true;
      renderPresentations();
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
    const id =
      event.target.dataset.editPresentation ||
      event.target.dataset.deletePresentation;
    if (!id) return;
    if (event.target.dataset.deletePresentation) {
      if (!confirm(t("delete_presentation_question"))) return;
      try {
        await presentationRequest("/" + encodeURIComponent(id), {
          method: "DELETE",
        });
        presentationStore = presentationStore.filter(
          (presentation) => String(presentation.id) !== String(id),
        );
        put("presentations", presentationStore);
        refreshAcademicNotifications();
        renderPresentations();
      } catch (error) {
        showError(
          error.message === "Failed to fetch"
            ? "Unable to connect to CampusPlan server."
            : error.message,
        );
      }
      return;
    }
    const presentation = presentationStore.find(
      (item) => String(item.id) === String(id),
    );
    if (!presentation) return;
    document.getElementById("presentation-id").value = presentation.id;
    document.getElementById("presentation-title").value = presentation.title;
    document.getElementById("presentation-course").value = presentation.course;
    document.getElementById("presentation-description").value =
      presentation.description || "";
    document.getElementById("presentation-date").value = presentation.date;
    document.getElementById("presentation-group").value =
      presentation.group || "";
    document.getElementById("presentation-part").value =
      presentation.part || "";
    document.getElementById("presentation-status").value =
      presentation.status || "Not Started";
    document.getElementById("presentation-modal-title").textContent =
      "Edit presentation";
    document.getElementById("presentation-modal").hidden = false;
  };
  list.onchange = async (event) => {
    const id = event.target.dataset.pStatus;
    if (!id) return;
    const presentation = presentationStore.find(
      (item) => String(item.id) === String(id),
    );
    if (!presentation) return;
    try {
      const result = await presentationRequest("/" + encodeURIComponent(id), {
        method: "PUT",
        body: JSON.stringify({ ...presentation, status: event.target.value }),
      });
      presentationStore = presentationStore.map((item) =>
        String(item.id) === String(id) ? result.presentation : item,
      );
      put("presentations", presentationStore);
      refreshAcademicNotifications();
      renderPresentations();
    } catch (error) {
      showError(
        error.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : error.message,
      );
    }
  };
}
async function dashboard(refresh = true) {
  if (document.body.dataset.page !== "dashboard") return;
  let a;
  if (refresh && localStorage.getItem(AUTH_TOKEN_KEY)) {
    try {
      const result = await assignmentRequest();
      a = result.assignments || [];
      assignmentStore = a;
      assignmentDataLoaded = true;
      refreshAcademicNotifications();
    } catch (error) {
      a = get("assignments");
    }
  } else {
    a = assignmentStore.length ? assignmentStore : get("assignments");
  }
  let testsData = get("tests"),
    p = get("presentations"),
    done = a.filter((x) => x.status === "Completed").length,
    pc = a.length ? Math.round((done / a.length) * 100) : 0,
    by = (id) => document.getElementById(id);
  const upcomingTests = testsData.filter((x) => days(x.date) >= 0);
  const upcomingPresentations = p.filter((x) => x.status !== "Completed");
  const student = currentUser();
  const conversations = JSON.parse(
    localStorage.getItem(userKey("campusplan-conversations")) || "[]",
  );
  const groups = JSON.parse(
    localStorage.getItem(userKey("campusplan-groups")) || "[]",
  );
  const unreadMessages = conversations.reduce(
    (count, conversation) =>
      count +
      conversation.messages.filter(
        (message) => message.senderId !== student.studentId && !message.read,
      ).length,
    0,
  );
  const unreadNotifications = getNotifications().filter(
    (notification) => !notification.read,
  ).length;
  by("pending-count").textContent = a.length - done;
  by("test-count").textContent = upcomingTests.length;
  by("presentation-count").textContent = p.filter(
    (x) => x.status !== "Completed",
  ).length;
  by("completed-count").textContent = done;
  if (by("message-count")) by("message-count").textContent = unreadMessages;
  if (by("notification-dashboard-count"))
    by("notification-dashboard-count").textContent = unreadNotifications;
  if (by("deadline-count"))
    by("deadline-count").textContent =
      a.filter((item) => days(item.dueDate) >= 0).length +
      upcomingTests.length +
      upcomingPresentations.length;
  if (by("student-name") && student)
    by("student-name").textContent = student.name.split(" ")[0];
  if (by("classes-today")) by("classes-today").textContent = "3";
  by("progress-percent").textContent = pc + "%";
  by("progress-summary").textContent = t(
    a.length === 1 ? "progress_summary_one" : "progress_summary_other",
    { done, total: a.length },
  );
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
        t(x.priority) +
        " " +
        t("priority_suffix") +
        '</span></div><span class="status ' +
        stat(x.status) +
        '">' +
        t(x.status) +
        "</span></article>",
    )
    .join("");
  let e = [
    ...testsData.map((x) => ({ ...x, type: "Test" })),
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
        new Intl.DateTimeFormat(appLocale(), { month: "short" }).format(
          new Date(x.date + "T12:00:00"),
        ) +
        "</span><div><h3>" +
        esc(x.title) +
        "</h3><p>" +
        t(x.type) +
        " &middot; " +
        t("days_remaining", { count: days(x.date) }) +
        "</p></div></article>",
    )
    .join("");
  const recentMessages = conversations
    .slice()
    .sort(
      (first, second) =>
        new Date(second.messages.at(-1)?.timestamp || 0) -
        new Date(first.messages.at(-1)?.timestamp || 0),
    )
    .slice(0, 2);
  const messageContainer = by("dashboard-recent-messages");
  if (messageContainer) {
    messageContainer.innerHTML = recentMessages.length
      ? recentMessages
          .map((conversation) => {
            const profile = getUserProfile(conversation.participantId) || {};
            const last = conversation.messages.at(-1);
            return (
              '<a class="message-preview" href="messages.html">' +
              avatarMarkup(profile.studentId) +
              "<div><h3>" +
              esc(profile.name || "Student") +
              "</h3><p>" +
              esc(last?.text || "No messages yet") +
              "</p></div></a>"
            );
          })
          .join("")
      : '<p class="empty-state">' + t("no_recent_conversations") + "</p>";
  }
  const groupContainer = by("dashboard-group-activity");
  if (groupContainer) {
    const activeGroups = groups
      .filter((group) => group.messages && group.messages.length)
      .sort(
        (first, second) =>
          new Date(second.messages.at(-1).timestamp) -
          new Date(first.messages.at(-1).timestamp),
      )
      .slice(0, 2);
    groupContainer.innerHTML = activeGroups.length
      ? activeGroups
          .map(
            (group) =>
              '<a class="message-preview" href="groups.html"><span class="avatar group-avatar">CP</span><div><h3>' +
              esc(group.name) +
              "</h3><p>" +
              esc(group.messages.at(-1).text) +
              "</p></div></a>",
          )
          .join("")
      : '<p class="empty-state">' + t("no_recent_group_activity") + "</p>";
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
      time: new Date().toLocaleTimeString(appLocale(), {
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
      .filter(
        (message) =>
          message.senderId !== currentUser().studentId && !message.read,
      )
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
      .filter(
        (message) =>
          message.senderId !== currentUser().studentId && !message.read,
      )
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
    keys.has(notification.eventKey)
      ? { ...notification, read: true }
      : notification,
  );
  saveNotifications(notifications);
}

function setupMessagesLegacy() {
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
    return (
      profiles.get(String(id)) ||
      getUserProfile(id) || { name: "Student", studentId: id }
    );
  }
  function avatarFor(profile, extraClass) {
    if (!profile || (!profile.id && !profile.studentId))
      return avatarMarkup("unknown", extraClass);
    return profileAvatarMarkup(profile, extraClass);
  }
  function renderList() {
    list.innerHTML = conversations.length
      ? conversations
          .map((conversation) => {
            const profile = conversation.user;
            rememberProfile(profile);
            return (
              '<article class="conversation ' +
              (String(profile.id) === String(activeUserId) ? "active" : "") +
              '" data-conversation-user="' +
              profile.id +
              '">' +
              avatarFor(profile) +
              '<div class="conversation-copy"><h3>' +
              esc(profile.fullName) +
              "</h3><p>" +
              esc(conversation.latestMessage || "No messages yet") +
              '</p></div><div class="conversation-meta"><time>' +
              (conversation.latestMessageAt
                ? formatMessageTime(conversation.latestMessageAt)
                : "") +
              "</time>" +
              (conversation.unreadCount
                ? '<b class="unread" aria-label="' +
                  conversation.unreadCount +
                  ' unread">' +
                  conversation.unreadCount +
                  "</b>"
                : "") +
              "</div></article>"
            );
          })
          .join("")
      : '<p class="empty-state">No conversations yet.</p>';
  }
  function renderChat() {
    const chat = document.getElementById("private-chat");
    if (!activeUser) {
      chat.classList.remove("has-conversation");
      document.getElementById("private-messages").innerHTML =
        '<p class="empty-state chat-empty">Select a student to start messaging.</p>';
      return;
    }
    chat.classList.add("has-conversation");
    rememberProfile(activeUser);
    const chatAvatar = avatarFor(activeUser).replace(
      /<(img|span) /,
      '<$1 id="chat-avatar" ',
    );
    document.getElementById("chat-avatar").outerHTML = chatAvatar;
    document.getElementById("chat-name").textContent = activeUser.fullName;
    document.getElementById("chat-status").textContent = t("campusplan_student");
    document.getElementById("private-messages").innerHTML =
      activeMessages.length
        ? activeMessages
            .map((message) => {
              const sender =
                String(message.senderId) === String(me.id)
                  ? me
                  : profileFor(message.senderId);
              return (
                '<div class="message-row ' +
                (String(message.senderId) === String(me.id)
                  ? "sent-row"
                  : "received-row") +
                '">' +
                avatarFor(sender) +
                '<div class="bubble ' +
                (String(message.senderId) === String(me.id)
                  ? "sent"
                  : "received") +
                '"><span>' +
                esc(message.content) +
                "</span><time>" +
                formatMessageTime(message.createdAt) +
                (String(message.senderId) === String(me.id)
                  ? message.read
                    ? " · Read"
                    : " · Sent"
                  : "") +
                "</time></div></div>"
              );
            })
            .join("")
        : '<p class="empty-state chat-empty">' +
          t("no_messages_yet") +
          " " +
          t("start_conversation") +
          "</p>";
  }
  async function loadConversations() {
    try {
      const result = await messagesRequest("/conversations");
      conversations = result.conversations || [];
      conversations.forEach((conversation) =>
        rememberProfile(conversation.user),
      );
      renderList();
    } catch (error) {
      list.innerHTML =
        '<p class="empty-state">' +
        esc(
          error.message === "Failed to fetch"
            ? "Unable to connect to CampusPlan server."
            : error.message,
        ) +
        "</p>";
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
      await messagesRequest("/" + encodeURIComponent(userId) + "/read", {
        method: "PUT",
      });
      const summary = conversations.find(
        (conversation) => String(conversation.user.id) === String(userId),
      );
      if (summary) summary.unreadCount = 0;
      renderList();
      renderChat();
      document.getElementById("private-chat").classList.add("mobile-open");
    } catch (error) {
      document.getElementById("private-messages").innerHTML =
        '<p class="empty-state">' +
        esc(
          error.message === "Failed to fetch"
            ? "Unable to connect to CampusPlan server."
            : error.message,
        ) +
        "</p>";
    }
  }
  async function renderSearchResults() {
    const query = search.value.trim();
    if (!query) {
      results.innerHTML = "";
      return;
    }
    try {
      const result = await messagesRequest(
        "/students?search=" + encodeURIComponent(query),
      );
      const people = result.students || [];
      people.forEach(rememberProfile);
      results.innerHTML = people.length
        ? people
            .map(
              (student) =>
                '<button class="student-result" type="button" data-start="' +
                student.id +
                '">' +
                avatarFor(student) +
                "<span><b>" +
                esc(student.fullName) +
                "</b><small>" +
                esc(
                  student.studentId +
                    " · " +
                    student.program +
                    " · " +
                    student.yearOfStudy,
                ) +
                "</small></span></button>",
            )
            .join("")
        : '<p class="empty-state">No students found.</p>';
    } catch (error) {
      results.innerHTML =
        '<p class="empty-state">' + esc(error.message) + "</p>";
    }
  }
  async function loadStudentOptions() {
    try {
      const result = await messagesRequest("/students");
      const people = result.students || [];
      people.forEach(rememberProfile);
      document.getElementById("new-message-student").innerHTML = people
        .map(
          (student) =>
            '<option value="' +
            student.id +
            '">' +
            esc(student.fullName) +
            "</option>",
        )
        .join("");
    } catch (error) {
      document.getElementById("new-message-student").innerHTML =
        '<option value="">Unable to load students</option>';
    }
  }
  search.oninput = renderSearchResults;
  results.onclick = (event) => {
    const button = event.target.closest("[data-start]");
    if (button)
      openConversation(button.dataset.start, profileFor(button.dataset.start));
  };
  list.onclick = (event) => {
    const item = event.target.closest("[data-conversation-user]");
    if (item)
      openConversation(
        item.dataset.conversationUser,
        profileFor(item.dataset.conversationUser),
      );
  };
  document.getElementById("private-form").onsubmit = async (event) => {
    event.preventDefault();
    const input = document.getElementById("private-input");
    const content = input.value.trim();
    if (!activeUserId || !content) return;
    if (content.length > 2000) {
      input.setCustomValidity(t("messages_length_error"));
      input.reportValidity();
      return;
    }
    try {
      const result = await messagesRequest(
        "/" + encodeURIComponent(activeUserId),
        { method: "POST", body: JSON.stringify({ content }) },
      );
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
  document.getElementById("back-to-list").onclick = () =>
    document.getElementById("private-chat").classList.remove("mobile-open");
  document.getElementById("clear-conversation").onclick = () => {
    document.getElementById("private-messages").innerHTML =
      '<p class="empty-state">Conversation history is stored on the server.</p>';
  };
  loadStudentOptions();
  loadConversations();
  renderChat();
}

function setupMessagesV2() {
  if (document.body.dataset.page !== "messages") return;

  const me = currentUser();
  const conversationList = document.getElementById("conversation-list");
  const contactList = document.getElementById("contact-list");
  const conversationSearch = document.getElementById("conversation-search");
  const contactSearch = document.getElementById("contact-search");
  const chatsView = document.getElementById("chats-view");
  const contactsView = document.getElementById("contacts-view");
  const chatsTab = document.getElementById("chats-tab");
  const contactsTab = document.getElementById("contacts-tab");
  const backToList = document.getElementById("back-to-list");
  const profiles = new Map();
  let conversations = [];
  let contacts = [];
  let activeUser = null;
  let activeUserId = null;
  let activeMessages = [];

  backToList.setAttribute("aria-label", t("back_to_messages"));
  backToList.textContent = "←";

  function rememberProfile(profile) {
    if (!profile) return;
    profiles.set(String(profile.id), profile);
    if (profile.studentId) profiles.set(String(profile.studentId), profile);
  }

  function profileFor(id) {
    return profiles.get(String(id)) || getUserProfile(id) || null;
  }

  function avatarFor(profile, extraClass) {
    const savedProfile = profile && profile.studentId
      ? getUserProfile(profile.studentId) || {}
      : {};
    return profileAvatarMarkup(
      { ...profile, photo: savedProfile.photo || profile?.photo },
      extraClass,
    );
  }

  function friendlyError(error) {
    return error.message === "Failed to fetch"
      ? t("connection_error")
      : error.message;
  }

  function setView(view, focusSearch = false) {
    const contactsActive = view === "contacts";
    chatsView.hidden = contactsActive;
    contactsView.hidden = !contactsActive;
    chatsTab.classList.toggle("active", !contactsActive);
    contactsTab.classList.toggle("active", contactsActive);
    chatsTab.setAttribute("aria-selected", String(!contactsActive));
    contactsTab.setAttribute("aria-selected", String(contactsActive));
    conversationSearch.closest("label").hidden = contactsActive;
    if (contactsActive) {
      loadContacts(contactSearch.value.trim());
      if (focusSearch) contactSearch.focus();
    } else if (focusSearch) {
      conversationSearch.focus();
    }
  }

  function renderConversations() {
    const query = conversationSearch.value.trim().toLowerCase();
    const matching = conversations.filter((conversation) => {
      const user = conversation.user;
      return [user.fullName, user.studentId, conversation.latestMessage]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
    conversationList.innerHTML = matching.length
      ? matching
          .map((conversation) => {
            const profile = conversation.user;
            rememberProfile(profile);
            const unread = Number(conversation.unreadCount || 0);
            return (
              '<button class="conversation ' +
              (String(profile.id) === String(activeUserId) ? "active" : "") +
              '" type="button" data-conversation-user="' +
              profile.id +
              '" aria-current="' +
              (String(profile.id) === String(activeUserId) ? "true" : "false") +
              '">' +
              avatarFor(profile) +
              '<span class="conversation-copy"><h3>' +
              esc(profile.fullName) +
              "</h3><p>" +
              esc(conversation.latestMessage || t("no_messages_yet")) +
              '</p></span><span class="conversation-meta"><time>' +
              (conversation.latestMessageAt
                ? esc(formatMessageTime(conversation.latestMessageAt))
                : "") +
              "</time>" +
              (unread
                ? '<b class="unread" aria-label="' +
                  t("unread_messages_aria", { count: unread }) +
                  '">' +
                  unread +
                  "</b>"
                : "") +
              "</span></button>"
            );
          })
          .join("")
      : '<p class="empty-state">' +
        t("no_conversations") +
        " " +
        t("start_conversation") +
        "</p>";
  }

  function renderContacts() {
    contactList.innerHTML = contacts.length
      ? contacts
          .map((student) => {
            rememberProfile(student);
            const details = [student.program, student.yearOfStudy]
              .filter(Boolean)
              .join(" â€¢ ");
            return (
              '<button class="contact-item" type="button" data-contact-user="' +
              student.id +
              '">' +
              avatarFor(student) +
              '<span class="contact-copy"><b>' +
              esc(student.fullName) +
              "</b><small>" +
              esc(details || t("campusplan_student")) +
              "</small><small>" +
              t("student_id_colon") +
              esc(student.studentId) +
              "</small></span></button>"
            );
          })
          .join("")
      : '<p class="empty-state">' + t("no_contacts_found") + "</p>";
  }

  function renderChat() {
    const chat = document.getElementById("private-chat");
    const input = document.getElementById("private-input");
    if (!activeUser) {
      chat.classList.remove("has-conversation");
      input.disabled = true;
      document.getElementById("private-messages").innerHTML =
        '<p class="empty-state chat-empty">' + t("select_chat_prompt") + "</p>";
      return;
    }
    chat.classList.add("has-conversation");
    input.disabled = false;
    rememberProfile(activeUser);
    document.getElementById("chat-avatar").outerHTML = avatarFor(activeUser).replace(
      /<(img|span) /,
      '<$1 id="chat-avatar" ',
    );
    document.getElementById("chat-name").textContent = activeUser.fullName;
    document.getElementById("chat-status").textContent = t("campusplan_student");
    document.getElementById("private-messages").innerHTML = activeMessages.length
      ? activeMessages
          .map((message) => {
            const sent = String(message.senderId) === String(me.id);
            const sender = sent ? me : activeUser;
            return (
              '<div class="message-row ' +
              (sent ? "sent-row" : "received-row") +
              '">' +
              avatarFor(sender) +
              '<div class="bubble ' +
              (sent ? "sent" : "received") +
              '"><span>' +
              esc(message.content) +
              "</span><time>" +
              esc(formatMessageTime(message.createdAt)) +
              (sent ? " • " + (message.read ? t("read") : t("sent")) : "") +
              "</time></div></div>"
            );
          })
          .join("")
      : '<p class="empty-state chat-empty">' +
        t("no_messages_yet") +
        "<br>" +
        t("start_conversation_prompt") +
        esc(activeUser.fullName) +
        ".</p>";
  }

  async function loadConversations() {
    try {
      const result = await messagesRequest("/conversations");
      conversations = result.conversations || [];
      conversations.forEach((conversation) => rememberProfile(conversation.user));
      renderConversations();
    } catch (error) {
      conversationList.innerHTML =
        '<p class="empty-state">' + esc(friendlyError(error)) + "</p>";
    }
  }

  async function loadContacts(query = "") {
    contactList.innerHTML =
      '<p class="empty-state">' + t("loading_contacts") + "</p>";
    try {
      const result = await messagesRequest(
        "/students?search=" + encodeURIComponent(query),
      );
      contacts = result.students || [];
      contacts.forEach(rememberProfile);
      renderContacts();
    } catch (error) {
      contactList.innerHTML =
        '<p class="empty-state">' + esc(friendlyError(error)) + "</p>";
    }
  }

  async function openConversation(userId, profile) {
    activeUserId = Number(userId);
    activeUser = profile || profileFor(userId);
    activeMessages = [];
    renderChat();
    try {
      const result = await messagesRequest("/" + encodeURIComponent(userId));
      activeUser = result.user;
      activeMessages = result.messages || [];
      rememberProfile(activeUser);
      const summary = conversations.find(
        (conversation) => String(conversation.user.id) === String(userId),
      );
      if (summary) summary.unreadCount = 0;
      renderConversations();
      renderChat();
      document.getElementById("private-chat").classList.add("mobile-open");
      messagesRequest("/" + encodeURIComponent(userId) + "/read", {
        method: "PUT",
      }).catch(() => {});
    } catch (error) {
      document.getElementById("private-messages").innerHTML =
        '<p class="empty-state">' + esc(friendlyError(error)) + "</p>";
    }
  }

  chatsTab.onclick = () => setView("chats");
  contactsTab.onclick = () => setView("contacts");
  document.getElementById("new-chat-button").onclick = () =>
    setView("contacts", true);
  conversationSearch.oninput = renderConversations;
  contactSearch.oninput = () => loadContacts(contactSearch.value.trim());
  conversationList.onclick = (event) => {
    const item = event.target.closest("[data-conversation-user]");
    if (item) openConversation(item.dataset.conversationUser, profileFor(item.dataset.conversationUser));
  };
  contactList.onclick = (event) => {
    const item = event.target.closest("[data-contact-user]");
    if (item) openConversation(item.dataset.contactUser, profileFor(item.dataset.contactUser));
  };

  document.getElementById("private-form").onsubmit = async (event) => {
    event.preventDefault();
    const input = document.getElementById("private-input");
    const content = input.value.trim();
    if (!activeUserId || !content) return;
    input.setCustomValidity("");
    if (content.length > 2000) {
      input.setCustomValidity(t("messages_length_error"));
      input.reportValidity();
      return;
    }
    try {
      const result = await messagesRequest(
        "/" + encodeURIComponent(activeUserId),
        { method: "POST", body: JSON.stringify({ content }) },
      );
      activeMessages.push(result.message);
      input.value = "";
      renderChat();
      await loadConversations();
      setView("chats");
    } catch (error) {
      input.setCustomValidity(friendlyError(error));
      input.reportValidity();
    }
  };

  backToList.onclick = () =>
    document.getElementById("private-chat").classList.remove("mobile-open");

  document.addEventListener("campusplan-language-change", () => {
    renderConversations();
    renderContacts();
    renderChat();
  });

  renderChat();
  loadConversations();
}

function setupGroupsLocalPrototype() {
  if (document.body.dataset.page !== "groups") return;
  const me = currentUser();
  const storageKey = userKey("campusplan-groups");
  let groups = JSON.parse(localStorage.getItem(storageKey) || "null");
  if (!groups) {
    groups = [
      {
        id: "g1",
        name: "Database Study Group",
        course: "Database Design",
        type: "Study Group",
        description: "Revision and assignment support.",
        createdBy: me.studentId,
        members: [me.studentId, "sarah-m", "john-k"],
        messages: [
          {
            id: "gm1",
            senderId: "sarah-m",
            text: "Who is preparing the ERD?",
            timestamp: new Date().toISOString(),
            read: false,
          },
        ],
      },
      {
        id: "g2",
        name: "Networking Presentation",
        course: "Local Area Networking",
        type: "Presentation Group",
        description: "Planning the network layer presentation.",
        createdBy: me.studentId,
        members: [me.studentId, "sarah-m", "michael-o"],
        messages: [],
      },
      {
        id: "g3",
        name: "Statistics Study Group",
        course: "Probability & Statistics",
        type: "Study Group",
        description: "Weekly practice and test revision.",
        createdBy: me.studentId,
        members: [me.studentId, "grace-n"],
        messages: [],
      },
    ];
  }
  groups = groups.map((group) => ({
    ...group,
    createdBy: group.createdBy || me.studentId,
    members: (group.members || []).map((member) =>
      typeof member === "string" && member.includes("—")
        ? me.studentId
        : member,
    ),
    messages: (group.messages || []).map((message, index) =>
      typeof message === "string"
        ? {
            id: "legacy-group-message-" + index,
            senderId: "sarah-m",
            text: message,
            timestamp: new Date().toISOString(),
            read: false,
          }
        : message,
    ),
  }));
  let activeId = groups[0] ? groups[0].id : null;
  function save() {
    localStorage.setItem(storageKey, JSON.stringify(groups));
  }
  function renderCards() {
    ["private-groups", "communities"].forEach((id) => {
      const community = id === "communities";
      document.getElementById(id).innerHTML =
        groups
          .filter((group) => (group.type === "Course Community") === community)
          .map((group) => {
            const last = group.messages[group.messages.length - 1];
            const unread = group.messages.filter(
              (message) => message.senderId !== me.studentId && !message.read,
            ).length;
            return (
              '<article class="group-card"><div class="group-card-top">' +
              groupAvatarMarkup(group) +
              "<div><h2>" +
              esc(group.name) +
              "</h2><p>" +
              esc(group.description) +
              '</p></div></div><div class="group-card-meta"><span>' +
              esc(group.course) +
              " · " +
              group.members.length +
              " members</span><span>" +
              (last ? esc(formatMessageTime(last.timestamp)) : "No messages") +
              (unread ? ' <b class="unread">' + unread + "</b>" : "") +
              '</span></div><p class="group-last-message">' +
              esc(last ? last.text : "Start collaborating with your group") +
              '</p><button class="button small" data-group="' +
              group.id +
              '">Open group</button></article>'
            );
          })
          .join("") || '<p class="empty-state">No groups yet.</p>';
    });
  }
  function renderGroup() {
    const group = groups.find((item) => item.id === activeId);
    if (!group) return;
    document.querySelector("#group-chat .group-avatar").outerHTML =
      groupAvatarMarkup(group).replace(
        /<(img|span) /,
        '<$1 class="avatar group-avatar" ',
      );
    document.getElementById("group-name").textContent = group.name;
    document.getElementById("group-description").textContent =
      group.description;
    document.getElementById("group-member-count").textContent =
      group.members.length + " members";
    document.getElementById("group-edit-name").value = group.name;
    document.getElementById("group-edit-description").value = group.description;
    document.getElementById("group-add-member").innerHTML = students
      .filter((student) => !group.members.includes(student.studentId))
      .map(
        (student) =>
          '<option value="' +
          student.studentId +
          '">' +
          esc(student.name) +
          "</option>",
      )
      .join("");
    document.getElementById("group-messages").innerHTML = group.messages.length
      ? group.messages
          .map(
            (message) =>
              '<div class="message-row ' +
              (message.senderId === me.studentId
                ? "sent-row"
                : "received-row") +
              '">' +
              avatarMarkup(message.senderId) +
              '<div class="bubble ' +
              (message.senderId === me.studentId ? "sent" : "received") +
              '"><b class="message-sender">' +
              esc((getUserProfile(message.senderId) || {}).name || "Student") +
              "</b><span>" +
              esc(message.text) +
              "</span><time>" +
              formatMessageTime(message.timestamp) +
              "</time></div></div>",
          )
          .join("")
      : '<p class="empty-state chat-empty">No group messages yet.</p>';
    const readKeys = group.messages
      .filter((message) => message.senderId !== me.studentId && !message.read)
      .map((message) => "group:" + group.id + ":" + message.id);
    group.messages.forEach((message) => {
      if (message.senderId !== me.studentId) message.read = true;
    });
    markCommunicationNotificationsRead(readKeys);
    document.getElementById("member-list").innerHTML = group.members
      .map(
        (memberId) =>
          '<div class="member">' +
          avatarMarkup(memberId) +
          "<span>" +
          esc((getUserProfile(memberId) || {}).name || memberId) +
          "</span><small>" +
          (memberId === group.createdBy ? "Admin" : "Member") +
          "</small>" +
          (group.createdBy === me.studentId && memberId !== me.studentId
            ? '<button class="text-button danger" data-remove-member="' +
              memberId +
              '">Remove</button>'
            : "") +
          "</div>",
      )
      .join("");
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
      document
        .getElementById("group-chat")
        .scrollIntoView({ behavior: "smooth" });
    };
  });
  document.getElementById("group-form").onsubmit = (event) => {
    event.preventDefault();
    const input = document.getElementById("group-input");
    const text = input.value.trim();
    const group = groups.find((item) => item.id === activeId);
    if (!group || !text) return;
    group.messages.push({
      id: "group-message-" + Date.now(),
      senderId: me.studentId,
      text,
      timestamp: new Date().toISOString(),
      read: true,
    });
    input.value = "";
    renderGroup();
  };
  document.getElementById("group-info-toggle").onclick = () =>
    (document.getElementById("group-info").hidden =
      !document.getElementById("group-info").hidden);
  document.getElementById("group-back").onclick = () =>
    (document.getElementById("group-chat").hidden = true);
  document.getElementById("group-save-info").onclick = () => {
    const group = groups.find((item) => item.id === activeId);
    if (!group || group.createdBy !== me.studentId) return;
    group.name =
      document.getElementById("group-edit-name").value.trim() || group.name;
    group.description =
      document.getElementById("group-edit-description").value.trim() ||
      group.description;
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
  document.getElementById("member-list").onclick = (event) => {
    const button = event.target.closest("[data-remove-member]");
    if (!button) return;
    const group = groups.find((item) => item.id === activeId);
    group.members = group.members.filter(
      (member) => member !== button.dataset.removeMember,
    );
    renderGroup();
  };
  document.getElementById("group-create-form").onsubmit = (event) => {
    event.preventDefault();
    groups.push({
      id: "g" + Date.now(),
      name: document.getElementById("group-title").value.trim(),
      course: document.getElementById("group-course").value.trim(),
      type: document.getElementById("group-type").value,
      description: document
        .getElementById("group-description-input")
        .value.trim(),
      createdBy: me.studentId,
      members: [me.studentId],
      messages: [],
    });
    save();
    event.target.reset();
    document.getElementById("group-modal").hidden = true;
    renderCards();
  };
  syncCommunicationNotifications([], groups);
  renderCards();
}

function setupGroupsV2() {
  if (document.body.dataset.page !== "groups") return;

  const layout = document.getElementById("groups-layout");
  const myGroupsContainer = document.getElementById("my-groups");
  const discoverContainer = document.getElementById("discover-groups");
  const searchInput = document.getElementById("group-search");
  const discoverSearchInput = document.getElementById("discover-search");
  const tabs = [
    { name: "my-groups", button: document.getElementById("my-groups-tab"), panel: document.getElementById("my-groups-view") },
    { name: "discover", button: document.getElementById("discover-tab"), panel: document.getElementById("discover-view") },
  ];
  const photoStorageKey = userKey("campusplan-group-photos");
  let groupPhotos = {};
  let groups = [];
  let studentsForGroups = [];
  let studentsError = "";
  let activeGroup = null;
  let discoverRequestId = 0;
  let openRequestId = 0;
  let discoverTimer;

  try {
    groupPhotos = JSON.parse(localStorage.getItem(photoStorageKey) || "{}") || {};
  } catch (error) {
    groupPhotos = {};
  }

  function saveGroupPhotos() {
    localStorage.setItem(photoStorageKey, JSON.stringify(groupPhotos));
  }

  function withLocalPhoto(group) {
    return { ...group, photo: groupPhotos[group.id] || "" };
  }

  function memberAvatar(member) {
    const savedProfile = getUserProfile(member.studentId) || {};
    return profileAvatarMarkup({
      fullName: member.fullName,
      photo: savedProfile.photo,
    });
  }

  function renderMyGroups() {
    const search = searchInput.value.trim().toLocaleLowerCase();
    const matchingGroups = groups.filter((group) =>
      [group.name, group.course, group.description]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search),
    );
    myGroupsContainer.innerHTML = matchingGroups.length
      ? matchingGroups
          .map((group) => {
            const unread = Number(group.unreadCount || 0);
            const time = group.latestMessageAt
              ? formatMessageTime(group.latestMessageAt)
              : "";
            return (
              '<article class="group-card group-list-card">' +
              '<div class="group-card-top">' +
              groupAvatarMarkup(group) +
              "<div><h2>" +
              esc(group.name) +
              "</h2><p>" +
              esc(group.course) +
              '</p></div></div><p class="group-last-message">' +
              esc(group.latestMessage || t("no_messages_yet")) +
              '</p><div class="group-card-meta"><span>' +
              esc(time || t(group.type)) +
              "</span>" +
              (unread
                ? '<span class="unread" aria-label="' +
                  t("unread_messages_aria", { count: unread }) +
                  '">' +
                  unread +
                  "</span>"
                : "") +
              '</div><button class="group-open-button" type="button" data-group="' +
              esc(group.id) +
              '" aria-label="' +
              esc(t("open_group_aria", { name: group.name })) +
              '">' +
              (activeGroup && String(activeGroup.id) === String(group.id)
                ? t("open_conversation")
                : t("open_group")) +
              "</button></article>"
            );
          })
          .join("")
      : '<p class="empty-state">' +
        (groups.length ? t("no_groups_match") : t("no_groups_joined")) +
        "</p>";
  }

  function renderDiscoverGroups(discoverable, searching) {
    if (searching) {
      discoverContainer.innerHTML =
        '<p class="empty-state" role="status">' +
        t("searching_groups") +
        "</p>";
      return;
    }
    discoverContainer.innerHTML = discoverable.length
      ? discoverable
          .map(
            (group) =>
              '<article class="group-card discover-group-card"><div class="group-card-top">' +
              groupAvatarMarkup(group) +
              "<div><h2>" +
              esc(group.name) +
              "</h2><p>" +
              esc(group.course) +
              '</p></div></div><p class="discover-group-description">' +
              esc(group.description) +
              '</p><div class="group-card-meta"><span>' +
              esc(t(group.type)) +
              "</span><span>" +
              t("group_member_count", {
                count: Number(group.memberCount || 0),
              }) +
              "</span></div><button class=\"button small\" type=\"button\" data-join-group=\"" +
              esc(group.id) +
              '">' +
              t("join") +
              "</button></article>",
          )
          .join("")
      : '<p class="empty-state">' + t("no_course_communities") + "</p>";
  }

  function renderGroup() {
    if (!activeGroup) return;
    const currentUserId = currentUser()?.id;
    const canAdmin = activeGroup.currentUserRole === "admin";
    const chat = document.getElementById("group-chat");
    chat.querySelector(".group-avatar").outerHTML = groupAvatarMarkup(activeGroup);
    document.getElementById("group-name").textContent = activeGroup.name;
    document.getElementById("group-description").textContent = activeGroup.description;
    document.getElementById("group-course").textContent = activeGroup.course;
    document.getElementById("group-member-count").textContent = t(
      "group_member_count",
      { count: activeGroup.memberCount },
    );
    document.getElementById("group-info-course").textContent = activeGroup.course;
    document.getElementById("group-info-type").textContent = t(activeGroup.type);
    document.getElementById("group-edit-name").value = activeGroup.name;
    document.getElementById("group-edit-description").value = activeGroup.description;
    document.getElementById("group-save-info").hidden = !canAdmin;
    document.getElementById("group-photo-input").closest("label").hidden = !canAdmin;
    document.getElementById("group-edit-name").disabled = !canAdmin;
    document.getElementById("group-edit-description").disabled = !canAdmin;
    document.querySelector(".group-member-tools").hidden = !canAdmin;

    const memberIds = new Set(activeGroup.members.map((member) => String(member.id)));
    document.getElementById("group-add-member").innerHTML = studentsForGroups
      .filter((student) => !memberIds.has(String(student.id)))
      .map(
        (student) =>
          '<option value="' + esc(student.id) + '">' + esc(student.fullName) + "</option>",
      )
      .join("");
    const studentStatus = document.getElementById("group-students-status");
    studentStatus.textContent = studentsError;
    studentStatus.hidden = !studentsError;

    document.getElementById("group-messages").innerHTML = activeGroup.messages.length
      ? activeGroup.messages
          .map((message) => {
            const sent = String(message.senderId) === String(currentUserId);
            return (
              '<div class="message-row ' +
              (sent ? "sent-row" : "received-row") +
              '">' +
              memberAvatar({
                fullName: message.senderName,
                studentId: message.senderStudentId,
              }) +
              '<div class="bubble ' +
              (sent ? "sent" : "received") +
              '"><b class="message-sender">' +
              esc(message.senderName) +
              "</b><span>" +
              esc(message.content) +
              "</span><time>" +
              esc(formatMessageTime(message.createdAt)) +
              "</time></div></div>"
            );
          })
          .join("")
      : '<p class="empty-state chat-empty">' + t("no_group_messages") + "</p>";

    document.getElementById("member-list").innerHTML = activeGroup.members
      .map(
        (member) =>
          '<div class="member">' +
          memberAvatar(member) +
          "<span>" +
          esc(member.fullName) +
          "</span><small>" +
          (member.role === "admin" ? t("admin") : t("member")) +
          "</small>" +
          (canAdmin &&
          String(member.id) !== String(currentUserId) &&
          String(member.id) !== String(activeGroup.createdBy)
            ? '<button class="text-button danger" type="button" data-remove-member="' +
              esc(member.id) +
              '" aria-label="' +
              esc(t("remove_member_aria", { name: member.fullName })) +
              '">' +
              t("remove") +
              "</button>"
            : "") +
          "</div>",
      )
      .join("");
  }

  function switchTab(name) {
    tabs.forEach(({ name: tabName, button, panel }) => {
      const selected = name === tabName;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
      panel.hidden = !selected;
    });
  }

  async function loadGroups() {
    try {
      const result = await groupsRequest();
      groups = (result.groups || []).map(withLocalPhoto);
      renderMyGroups();
      return true;
    } catch (error) {
      myGroupsContainer.innerHTML =
        '<p class="empty-state" role="alert">' +
        esc(appErrorMessage(error)) +
        "</p>";
      return false;
    }
  }

  async function loadDiscoverGroups() {
    const requestId = ++discoverRequestId;
    const search = discoverSearchInput.value.trim();
    renderDiscoverGroups([], true);
    try {
      const result = await groupsRequest(
        "/discover?search=" + encodeURIComponent(search),
      );
      if (requestId !== discoverRequestId) return;
      const memberIds = new Set(groups.map((group) => String(group.id)));
      const discoverable = (result.groups || [])
        .filter(
          (group) =>
            group.type === "Course Community" &&
            !memberIds.has(String(group.id)),
        )
        .map(withLocalPhoto);
      renderDiscoverGroups(discoverable, false);
    } catch (error) {
      if (requestId !== discoverRequestId) return;
      discoverContainer.innerHTML =
        '<p class="empty-state" role="alert">' +
        esc(appErrorMessage(error)) +
        "</p>";
    }
  }

  async function loadStudents() {
    try {
      const result = await groupsRequest("/students/search");
      studentsForGroups = result.students || [];
      studentsError = "";
    } catch (error) {
      studentsForGroups = [];
      studentsError = t("unable_load_students") + ": " + appErrorMessage(error);
    }
    if (activeGroup) renderGroup();
  }

  async function openGroup(id) {
    const requestId = ++openRequestId;
    activeGroup = null;
    document.getElementById("group-info").hidden = true;
    document
      .getElementById("group-info-toggle")
      .setAttribute("aria-expanded", "false");
    document.getElementById("group-chat").classList.remove("info-open");
    try {
      const [details, messageResult] = await Promise.all([
        groupsRequest("/" + encodeURIComponent(id)),
        groupsRequest("/" + encodeURIComponent(id) + "/messages"),
      ]);
      if (requestId !== openRequestId) return;
      activeGroup = withLocalPhoto({
        ...details.group,
        members: details.members || [],
        messages: messageResult.messages || [],
      });
      activeGroup.unreadCount = 0;
      const info = document.getElementById("group-info");
      info.hidden = true;
      document
        .getElementById("group-info-toggle")
        .setAttribute("aria-expanded", "false");
      document.getElementById("group-chat").classList.remove("info-open");
      groups = groups.map((group) =>
        String(group.id) === String(activeGroup.id)
          ? { ...group, ...activeGroup }
          : group,
      );
      document.getElementById("group-chat").hidden = false;
      layout.classList.add("has-selected-group", "mobile-chat-open");
      renderGroup();
      renderMyGroups();
      try {
        await groupsRequest(
          "/" + encodeURIComponent(id) + "/messages/read",
          { method: "PUT" },
        );
      } catch (error) {
        alert(appErrorMessage(error));
      }
    } catch (error) {
      if (requestId !== openRequestId) return;
      document.getElementById("group-chat").hidden = false;
      document.getElementById("group-messages").innerHTML =
        '<p class="empty-state chat-empty" role="alert">' +
        esc(appErrorMessage(error)) +
        "</p>";
      layout.classList.add("has-selected-group", "mobile-chat-open");
    }
  }

  myGroupsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("[data-group]");
    if (button) openGroup(button.dataset.group);
  });

  discoverContainer.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-join-group]");
    if (!button) return;
    const id = button.dataset.joinGroup;
    button.disabled = true;
    button.textContent = t("joining");
    try {
      await groupsRequest("/" + encodeURIComponent(id) + "/join", {
        method: "POST",
      });
      const loaded = await loadGroups();
      await loadDiscoverGroups();
      if (loaded) {
        switchTab("my-groups");
        await openGroup(id);
      }
    } catch (error) {
      alert(appErrorMessage(error));
      button.disabled = false;
      button.textContent = t("join");
    }
  });

  searchInput.addEventListener("input", renderMyGroups);
  discoverSearchInput.addEventListener("input", () => {
    window.clearTimeout(discoverTimer);
    discoverTimer = window.setTimeout(loadDiscoverGroups, 250);
  });
  tabs.forEach(({ name, button }, index) => {
    button.addEventListener("click", () => {
      switchTab(name);
      if (name === "discover") loadDiscoverGroups();
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      next.button.focus();
      next.button.click();
    });
  });

  document.getElementById("group-form").onsubmit = async (event) => {
    event.preventDefault();
    if (!activeGroup) return;
    const input = document.getElementById("group-input");
    const content = input.value.trim();
    if (!content) return;
    const submit = event.submitter;
    if (submit) submit.disabled = true;
    try {
      const result = await groupsRequest(
        "/" + encodeURIComponent(activeGroup.id) + "/messages",
        { method: "POST", body: JSON.stringify({ content }) },
      );
      activeGroup.messages.push(result.message);
      activeGroup.latestMessage = result.message.content;
      activeGroup.latestMessageAt = result.message.createdAt;
      input.value = "";
      renderGroup();
      renderMyGroups();
    } catch (error) {
      alert(appErrorMessage(error));
    } finally {
      if (submit) submit.disabled = false;
    }
  };

  document.getElementById("group-info-toggle").onclick = (event) => {
    const info = document.getElementById("group-info");
    info.hidden = !info.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!info.hidden));
    document.getElementById("group-chat").classList.toggle("info-open", !info.hidden);
  };
  document.getElementById("group-back").onclick = () => {
    layout.classList.remove("mobile-chat-open");
  };

  document.getElementById("group-save-info").onclick = async () => {
    if (!activeGroup || activeGroup.currentUserRole !== "admin") return;
    const name = document.getElementById("group-edit-name").value.trim();
    const description = document.getElementById("group-edit-description").value.trim();
    try {
      const result = await groupsRequest("/" + encodeURIComponent(activeGroup.id), {
        method: "PUT",
        body: JSON.stringify({
          name,
          description,
          course: activeGroup.course,
          type: activeGroup.type,
        }),
      });
      activeGroup = withLocalPhoto({
        ...result.group,
        members: result.members || activeGroup.members,
        messages: activeGroup.messages,
      });
      groups = groups.map((group) =>
        String(group.id) === String(activeGroup.id)
          ? { ...group, ...activeGroup }
          : group,
      );
      renderGroup();
      renderMyGroups();
    } catch (error) {
      alert(appErrorMessage(error));
    }
  };

  document.getElementById("group-photo-input").onchange = () => {
    if (!activeGroup || activeGroup.currentUserRole !== "admin") return;
    const input = document.getElementById("group-photo-input");
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      input.value = "";
      alert(t("group_photo_invalid"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      groupPhotos[activeGroup.id] = reader.result;
      try {
        saveGroupPhotos();
        activeGroup.photo = reader.result;
        groups = groups.map((group) =>
          String(group.id) === String(activeGroup.id)
            ? { ...group, photo: reader.result }
            : group,
        );
        renderGroup();
        renderMyGroups();
      } catch (error) {
        alert(t("group_photo_save_error"));
      }
    };
    reader.onerror = () => alert(t("group_photo_read_error"));
    reader.readAsDataURL(file);
  };

  document.getElementById("group-add-member-button").onclick = async () => {
    if (!activeGroup || activeGroup.currentUserRole !== "admin") return;
    const userId = Number(document.getElementById("group-add-member").value);
    if (!Number.isInteger(userId) || userId <= 0) return;
    try {
      await groupsRequest("/" + encodeURIComponent(activeGroup.id) + "/members", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      await openGroup(activeGroup.id);
      await loadGroups();
    } catch (error) {
      alert(appErrorMessage(error));
    }
  };

  document.getElementById("group-leave").onclick = async () => {
    if (!activeGroup) return;
    try {
      await groupsRequest("/" + encodeURIComponent(activeGroup.id) + "/leave", {
        method: "POST",
      });
      activeGroup = null;
      document.getElementById("group-chat").hidden = true;
      layout.classList.remove("has-selected-group", "mobile-chat-open", "info-open");
      await loadGroups();
      await loadDiscoverGroups();
    } catch (error) {
      alert(appErrorMessage(error));
    }
  };

  document.getElementById("member-list").onclick = async (event) => {
    const button = event.target.closest("[data-remove-member]");
    if (!button || !activeGroup || activeGroup.currentUserRole !== "admin") return;
    try {
      await groupsRequest(
        "/" +
          encodeURIComponent(activeGroup.id) +
          "/members/" +
          encodeURIComponent(button.dataset.removeMember),
        { method: "DELETE" },
      );
      await openGroup(activeGroup.id);
      await loadGroups();
    } catch (error) {
      alert(appErrorMessage(error));
    }
  };

  document.getElementById("group-create-form").onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const result = await groupsRequest("", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("group-title").value.trim(),
          course: document.getElementById("group-course").value.trim(),
          description: document.getElementById("group-description-input").value.trim(),
          type: document.getElementById("group-type").value,
        }),
      });
      form.reset();
      document.getElementById("group-modal").hidden = true;
      await loadGroups();
      switchTab("my-groups");
      await openGroup(result.group.id);
    } catch (error) {
      alert(appErrorMessage(error));
    } finally {
      submit.disabled = false;
    }
  };

  document.addEventListener("campusplan-language-change", () => {
    renderMyGroups();
    if (activeGroup) {
      const editName = document.getElementById("group-edit-name");
      const editDescription = document.getElementById("group-edit-description");
      const addMember = document.getElementById("group-add-member");
      const pendingName = editName.value;
      const pendingDescription = editDescription.value;
      const selectedMember = addMember.value;
      renderGroup();
      editName.value = pendingName;
      editDescription.value = pendingDescription;
      addMember.value = selectedMember;
    }
    if (!document.getElementById("discover-view").hidden) loadDiscoverGroups();
  });

  Promise.all([loadGroups(), loadStudents()]);
}

function setupGroupsV2Legacy() {
  if (document.body.dataset.page !== "groups") return;

  const photoStorageKey = userKey("campusplan-group-photos");
  let groupPhotos = {};
  let groups = [];
  let studentsForGroups = [];
  let activeGroup = null;

  try {
    groupPhotos = JSON.parse(localStorage.getItem(photoStorageKey) || "{}") || {};
  } catch (error) {
    groupPhotos = {};
  }

  function saveGroupPhotos() {
    localStorage.setItem(photoStorageKey, JSON.stringify(groupPhotos));
  }

  function withLocalPhoto(group) {
    return { ...group, photo: groupPhotos[group.id] || "" };
  }

  function memberAvatar(member) {
    const savedProfile = getUserProfile(member.studentId) || {};
    return profileAvatarMarkup({
      fullName: member.fullName,
      photo: savedProfile.photo,
    });
  }

  function renderCards() {
    ["private-groups", "communities"].forEach((id) => {
      const community = id === "communities";
      const container = document.getElementById(id);
      const matchingGroups = groups.filter(
        (group) => (group.type === "Course Community") === community,
      );
      container.innerHTML = matchingGroups.length
        ? matchingGroups
            .map((group) => {
              const unread = Number(group.unreadCount || 0);
              return (
                '<article class="group-card"><div class="group-card-top">' +
                groupAvatarMarkup(group) +
                "<div><h2>" +
                esc(group.name) +
                "</h2><p>" +
                esc(group.description) +
                '</p></div></div><div class="group-card-meta"><span>' +
                esc(group.course) +
                " Â· " +
                group.memberCount +
                " members</span><span>" +
                (group.latestMessageAt
                  ? esc(formatMessageTime(group.latestMessageAt))
                  : "No messages") +
                (unread ? ' <b class="unread">' + unread + "</b>" : "") +
                '</span></div><p class="group-last-message">' +
                esc(group.latestMessage || "Start collaborating with your group") +
                '</p><button class="button small" data-group="' +
                group.id +
                '">Open group</button></article>'
              );
            })
            .join("")
        : '<p class="empty-state">No groups yet.</p>';
    });
  }

  function renderGroup() {
    if (!activeGroup) return;
    const canAdmin = activeGroup.currentUserRole === "admin";
    document.querySelector("#group-chat .group-avatar").outerHTML =
      groupAvatarMarkup(activeGroup);
    document.getElementById("group-name").textContent = activeGroup.name;
    document.getElementById("group-description").textContent = activeGroup.description;
    document.getElementById("group-member-count").textContent =
      activeGroup.memberCount + " members";
    document.getElementById("group-edit-name").value = activeGroup.name;
    document.getElementById("group-edit-description").value = activeGroup.description;
    document.getElementById("group-save-info").hidden = !canAdmin;
    document.getElementById("group-photo-input").closest("label").hidden = !canAdmin;
    document.getElementById("group-edit-name").disabled = !canAdmin;
    document.getElementById("group-edit-description").disabled = !canAdmin;
    document.querySelector(".group-member-tools").hidden = !canAdmin;

    const memberIds = new Set(activeGroup.members.map((member) => member.id));
    document.getElementById("group-add-member").innerHTML = studentsForGroups
      .filter((student) => !memberIds.has(student.id))
      .map(
        (student) =>
          '<option value="' + student.id + '">' + esc(student.fullName) + "</option>",
      )
      .join("");

    document.getElementById("group-messages").innerHTML = activeGroup.messages.length
      ? activeGroup.messages
          .map(
            (message) =>
              '<div class="message-row ' +
              (message.senderId === currentUser().id ? "sent-row" : "received-row") +
              '">' +
              memberAvatar({
                fullName: message.senderName,
                studentId: message.senderStudentId,
              }) +
              '<div class="bubble ' +
              (message.senderId === currentUser().id ? "sent" : "received") +
              '"><b class="message-sender">' +
              esc(message.senderName) +
              "</b><span>" +
              esc(message.content) +
              "</span><time>" +
              esc(formatMessageTime(message.createdAt)) +
              "</time></div></div>",
          )
          .join("")
      : '<p class="empty-state chat-empty">No group messages yet.</p>';

    document.getElementById("member-list").innerHTML = activeGroup.members
      .map(
        (member) =>
          '<div class="member">' +
          memberAvatar(member) +
          "<span>" +
          esc(member.fullName) +
          "</span><small>" +
          (member.role === "admin" ? "Admin" : "Member") +
          "</small>" +
          (canAdmin && member.id !== currentUser().id
            ? '<button class="text-button danger" data-remove-member="' +
              member.id +
              '">Remove</button>'
            : "") +
          "</div>",
      )
      .join("");
  }

  async function loadGroups() {
    try {
      const result = await groupsRequest();
      groups = (result.groups || []).map(withLocalPhoto);
      renderCards();
    } catch (error) {
      const message = '<p class="empty-state">' + esc(error.message) + "</p>";
      document.getElementById("private-groups").innerHTML = message;
      document.getElementById("communities").innerHTML = message;
    }
  }

  async function loadStudents() {
    try {
      const result = await groupsRequest("/students/search");
      studentsForGroups = result.students || [];
    } catch (error) {
      studentsForGroups = [];
    }
  }

  async function openGroup(id) {
    try {
      const [details, messageResult] = await Promise.all([
        groupsRequest("/" + encodeURIComponent(id)),
        groupsRequest("/" + encodeURIComponent(id) + "/messages"),
      ]);
      activeGroup = withLocalPhoto({
        ...details.group,
        members: details.members || [],
        messages: messageResult.messages || [],
      });
      activeGroup.unreadCount = 0;
      groups = groups.map((group) =>
        group.id === activeGroup.id ? { ...group, ...activeGroup } : group,
      );
      document.getElementById("group-chat").hidden = false;
      renderGroup();
      renderCards();
      groupsRequest("/" + encodeURIComponent(id) + "/messages/read", {
        method: "PUT",
      }).catch(() => {});
      document.getElementById("group-chat").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      document.getElementById("group-messages").innerHTML =
        '<p class="empty-state chat-empty">' + esc(error.message) + "</p>";
    }
  }

  ["private-groups", "communities"].forEach((id) => {
    document.getElementById(id).onclick = (event) => {
      const button = event.target.closest("[data-group]");
      if (button) openGroup(button.dataset.group);
    };
  });

  document.getElementById("group-form").onsubmit = async (event) => {
    event.preventDefault();
    if (!activeGroup) return;
    const input = document.getElementById("group-input");
    const content = input.value.trim();
    if (!content) return;
    try {
      const result = await groupsRequest(
        "/" + encodeURIComponent(activeGroup.id) + "/messages",
        { method: "POST", body: JSON.stringify({ content }) },
      );
      activeGroup.messages.push(result.message);
      activeGroup.latestMessage = result.message.content;
      activeGroup.latestMessageAt = result.message.createdAt;
      input.value = "";
      renderGroup();
      renderCards();
    } catch (error) {
      alert(error.message);
    }
  };

  document.getElementById("group-info-toggle").onclick = () => {
    const info = document.getElementById("group-info");
    info.hidden = !info.hidden;
  };
  document.getElementById("group-back").onclick = () => {
    document.getElementById("group-chat").hidden = true;
  };

  document.getElementById("group-save-info").onclick = async () => {
    if (!activeGroup) return;
    const name = document.getElementById("group-edit-name").value.trim();
    const description = document.getElementById("group-edit-description").value.trim();
    try {
      const result = await groupsRequest("/" + encodeURIComponent(activeGroup.id), {
        method: "PUT",
        body: JSON.stringify({
          name,
          description,
          course: activeGroup.course,
          type: activeGroup.type,
        }),
      });
      activeGroup = withLocalPhoto({
        ...result.group,
        members: result.members || activeGroup.members,
        messages: activeGroup.messages,
      });
      groups = groups.map((group) =>
        group.id === activeGroup.id ? { ...group, ...activeGroup } : group,
      );
      renderGroup();
      renderCards();
    } catch (error) {
      alert(error.message);
    }
  };

  document.getElementById("group-photo-input").onchange = () => {
    if (!activeGroup) return;
    const input = document.getElementById("group-photo-input");
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      input.value = "";
      alert("Please choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      groupPhotos[activeGroup.id] = reader.result;
      saveGroupPhotos();
      activeGroup.photo = reader.result;
      groups = groups.map((group) =>
        group.id === activeGroup.id ? { ...group, photo: reader.result } : group,
      );
      renderGroup();
      renderCards();
    };
    reader.readAsDataURL(file);
  };

  document.getElementById("group-add-member-button").onclick = async () => {
    if (!activeGroup) return;
    const userId = Number(document.getElementById("group-add-member").value);
    if (!Number.isInteger(userId) || userId <= 0) return;
    try {
      await groupsRequest("/" + encodeURIComponent(activeGroup.id) + "/members", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      await openGroup(activeGroup.id);
      await loadGroups();
    } catch (error) {
      alert(error.message);
    }
  };

  document.getElementById("group-leave").onclick = async () => {
    if (!activeGroup) return;
    try {
      await groupsRequest("/" + encodeURIComponent(activeGroup.id) + "/leave", {
        method: "POST",
      });
      activeGroup = null;
      document.getElementById("group-chat").hidden = true;
      await loadGroups();
    } catch (error) {
      alert(error.message);
    }
  };

  document.getElementById("member-list").onclick = async (event) => {
    const button = event.target.closest("[data-remove-member]");
    if (!button || !activeGroup) return;
    try {
      await groupsRequest(
        "/" +
          encodeURIComponent(activeGroup.id) +
          "/members/" +
          encodeURIComponent(button.dataset.removeMember),
        { method: "DELETE" },
      );
      await openGroup(activeGroup.id);
      await loadGroups();
    } catch (error) {
      alert(error.message);
    }
  };

  document.getElementById("group-create-form").onsubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    try {
      const result = await groupsRequest("", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("group-title").value.trim(),
          course: document.getElementById("group-course").value.trim(),
          description: document.getElementById("group-description-input").value.trim(),
          type: document.getElementById("group-type").value,
        }),
      });
      form.reset();
      document.getElementById("group-modal").hidden = true;
      groups.unshift(withLocalPhoto(result.group));
      renderCards();
    } catch (error) {
      alert(error.message);
    }
  };

  Promise.all([loadStudents(), loadGroups()]);
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
  const login = document.getElementById("login-form");
  const register = document.getElementById("register-form");
  const savedUsers = JSON.parse(localStorage.getItem(USER_KEY) || "[]");
  let removedLocalPasswords = false;
  savedUsers.forEach((savedUser) => {
    if (savedUser && typeof savedUser === "object") {
      ["password", "passwordHash", "password_hash"].forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(savedUser, key)) {
          delete savedUser[key];
          removedLocalPasswords = true;
        }
      });
    }
  });
  if (removedLocalPasswords) {
    localStorage.setItem(USER_KEY, JSON.stringify(savedUsers));
  }
  let user = currentUser();
  if (user) {
    delete user.password;
    delete user.passwordHash;
    delete user.password_hash;
    user = normalizeAuthenticatedUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  if (login) {
    const noticeKey = new URLSearchParams(location.search).get("notice")
      ? "please_log_in"
      : "";
    if (noticeKey) {
      setLocalizedText(document.getElementById("login-notice"), noticeKey);
    }
    login.onsubmit = async (e) => {
      e.preventDefault();
      const identity = document
        .getElementById("login-identity")
        .value.trim()
        .toLowerCase();
      const password = document.getElementById("login-password").value;
      try {
        const result = await authRequest("/login", {
          method: "POST",
          body: JSON.stringify({ identity, password }),
        });
        const authenticatedUser = normalizeAuthenticatedUser(result.user);
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser));
        location.href = "index.html";
      } catch (error) {
        setLocalizedText(
          document.getElementById("login-error"),
          appErrorMessage(error),
        );
      }
    };
    document.querySelector(".forgot-password").onclick = () =>
      alert(t("password_recovery_later"));
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
        setLocalizedText(
          document.getElementById("register-success"),
          "complete_registration",
        );
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
        setLocalizedText(
          document.getElementById("register-success"),
          result.message,
        );
        setTimeout(() => (location.href = "login.html"), 800);
      } catch (error) {
        setLocalizedText(
          document.getElementById("register-success"),
          appErrorMessage(error),
        );
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
          '<a href="profile.html">' +
          t("profile") +
          '</a><a href="profile.html">' +
          t("settings") +
          '</a><button id="logout">' +
          t("logout") +
          "</button>";
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

  document.addEventListener("campusplan-language-change", () => {
    const menu = document.querySelector(".profile-menu");
    if (!menu) return;
    const links = menu.querySelectorAll("a");
    if (links[0]) links[0].textContent = t("profile");
    if (links[1]) links[1].textContent = t("settings");
    const logout = menu.querySelector("#logout");
    if (logout) logout.textContent = t("logout");
  });

  if (document.body.dataset.page === "profile" && user) setupProfile(user);
}

function setupProfile(initialUser) {
  const profilePhoto = document.getElementById("profile-photo");
  const photoInput = document.getElementById("profile-photo-input");
  const removePhoto = document.getElementById("remove-profile-photo");
  const profileForm = document.getElementById("profile-form");
  const editProfile = document.getElementById("edit-profile");
  const cancelEdit = document.getElementById("cancel-profile-edit");
  const profileNotice = document.getElementById("profile-notice");
  const editNotice = document.getElementById("profile-edit-notice");
  let profileUser = normalizeAuthenticatedUser(initialUser);

  function cacheProfile(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem(USER_KEY) || "[]");
    const existingIndex = users.findIndex(
      (savedUser) => savedUser.studentId === user.studentId,
    );
    if (existingIndex === -1) users.push(user);
    else users[existingIndex] = { ...users[existingIndex], ...user };
    localStorage.setItem(USER_KEY, JSON.stringify(users));
  }

  function fillProfileForm() {
    document.getElementById("profile-name").value = profileUser.name || "";
    document.getElementById("profile-id").value =
      profileUser.studentId || "";
    document.getElementById("profile-email").value = profileUser.email || "";
    document.getElementById("profile-institution").value =
      profileUser.institution || "";
    document.getElementById("profile-program").value =
      profileUser.program || "";
    document.getElementById("profile-year").value =
      profileUser.yearOfStudy || "";
  }

  function localizedStudyYear() {
    const yearKeys = {
      "Year 1": "year_1",
      "Year 2": "year_2",
      "Year 3": "year_3",
      "Year 4": "year_4",
    };
    return yearKeys[profileUser.yearOfStudy]
      ? t(yearKeys[profileUser.yearOfStudy])
      : profileUser.yearOfStudy || "—";
  }

  function renderProfile() {
    const fields = [
      ["profile-display-name", profileUser.name],
      ["profile-display-id", profileUser.studentId],
      ["profile-info-name", profileUser.name],
      ["profile-info-email", profileUser.email],
      ["profile-info-institution", profileUser.institution],
      ["profile-info-program", profileUser.program],
      ["profile-info-year", localizedStudyYear()],
    ];
    fields.forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value || "—";
    });
    profilePhoto.innerHTML = profileAvatarMarkup(
      profileUser,
      "profile-avatar",
    );
    const completionFields = [
      profileUser.name,
      profileUser.studentId,
      profileUser.email,
      profileUser.institution,
      profileUser.program,
      profileUser.yearOfStudy,
    ];
    const completion = Math.round(
      (completionFields.filter((value) => String(value || "").trim()).length /
        completionFields.length) *
        100,
    );
    document.getElementById("profile-completion-value").textContent =
      completion + "%";
    const completionBar = document.getElementById("profile-completion-bar");
    completionBar.setAttribute("aria-valuenow", completion);
    completionBar.querySelector("span").style.width = completion + "%";
    fillProfileForm();
    document.querySelectorAll(".site-header .profile").forEach((button) => {
      button.innerHTML =
        avatarMarkup(profileUser.studentId) +
        '<span class="profile-name">' +
        esc(profileUser.name || "") +
        " &#8964;</span>";
    });
  }

  function setEditing(isEditing) {
    profileForm.hidden = !isEditing;
    editProfile.hidden = isEditing;
    if (isEditing) {
      fillProfileForm();
      editNotice.textContent = "";
      document.getElementById("profile-name").focus();
    } else {
      editProfile.focus();
    }
  }

  function showProfileError(target, error) {
    const key =
      error.message === "Failed to fetch"
        ? "connection_error"
        : t(error.message) === error.message
          ? "profile_update_error"
          : error.message;
    setLocalizedText(target, key);
  }

  function savePhoto(photo) {
    const updatedUser = { ...profileUser };
    if (photo) updatedUser.photo = photo;
    else delete updatedUser.photo;
    cacheProfile(updatedUser);
    profileUser = updatedUser;
    renderProfile();
  }

  renderProfile();
  editProfile.onclick = () => setEditing(true);
  cancelEdit.onclick = () => {
    fillProfileForm();
    editNotice.textContent = "";
    setEditing(false);
  };

  if (photoInput) {
    photoInput.onchange = () => {
      const file = photoInput.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
        setLocalizedText(profileNotice, "invalid_photo");
        photoInput.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          savePhoto(reader.result);
          setLocalizedText(profileNotice, "photo_updated");
        } catch {
          setLocalizedText(profileNotice, "photo_storage_error");
        }
      };
      reader.onerror = () => {
        setLocalizedText(profileNotice, "unable_read_photo");
      };
      reader.readAsDataURL(file);
    };
  }

  if (removePhoto) {
    removePhoto.onclick = () => {
      try {
        savePhoto("");
        if (photoInput) photoInput.value = "";
        setLocalizedText(profileNotice, "photo_removed");
      } catch {
        setLocalizedText(profileNotice, "photo_storage_error");
      }
    };
  }

  profileForm.onsubmit = async (event) => {
    event.preventDefault();
    const profileData = {
      fullName: document.getElementById("profile-name").value.trim(),
      email: document.getElementById("profile-email").value.trim(),
      institution: document.getElementById("profile-institution").value.trim(),
      program: document.getElementById("profile-program").value.trim(),
      yearOfStudy: document.getElementById("profile-year").value,
    };
    const saveButton = profileForm.querySelector('button[type="submit"]');
    saveButton.disabled = true;
    editNotice.textContent = "";
    profileNotice.textContent = "";
    try {
      let savedUser;
      if (localStorage.getItem(AUTH_TOKEN_KEY)) {
        const result = await profileRequest({
          method: "PUT",
          body: JSON.stringify(profileData),
        });
        savedUser = normalizeAuthenticatedUser(result.user, profileUser);
      } else {
        savedUser = normalizeAuthenticatedUser(
          { ...profileUser, ...profileData },
          profileUser,
        );
      }
      cacheProfile(savedUser);
      profileUser = savedUser;
      renderProfile();
      setEditing(false);
      setLocalizedText(
        profileNotice,
        localStorage.getItem(AUTH_TOKEN_KEY)
          ? "profile_updated"
          : "profile_saved_local",
      );
    } catch (error) {
      showProfileError(editNotice, error);
    } finally {
      saveButton.disabled = false;
    }
  };

  if (localStorage.getItem(AUTH_TOKEN_KEY)) {
    profileRequest()
      .then((result) => {
        profileUser = normalizeAuthenticatedUser(result.user, profileUser);
        cacheProfile(profileUser);
        renderProfile();
      })
      .catch((error) => showProfileError(profileNotice, error));
  }

  document.addEventListener("campusplan-language-change", () => {
    document.getElementById("profile-info-year").textContent =
      localizedStudyYear();
    profilePhoto.innerHTML = profileAvatarMarkup(
      profileUser,
      "profile-avatar",
    );
    if (profileNotice.dataset.i18n) {
      profileNotice.textContent = t(profileNotice.dataset.i18n);
    }
    if (editNotice.dataset.i18n) {
      editNotice.textContent = t(editNotice.dataset.i18n);
    }
  });
}

function setupPasswordVisibility() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const input = document.getElementById(button.getAttribute("aria-controls"));
    if (!input) return;

    const eye = button.querySelector(".password-eye");
    const eyeOff = button.querySelector(".password-eye-off");
    const updateLabel = () => {
      const visible = input.type === "text";
      button.setAttribute(
        "aria-label",
        visible ? t("hide_password") : t("show_password"),
      );
      button.setAttribute("aria-pressed", String(visible));
      eye.hidden = visible;
      eyeOff.hidden = !visible;
    };
    button.addEventListener("click", () => {
      const visible = input.type === "password";
      input.type = visible ? "text" : "password";
      updateLabel();
    });
    updateLabel();
    document.addEventListener("campusplan-language-change", updateLabel);
  });
}

function addCalendarNavLink() {
  document.querySelectorAll(".main-nav").forEach((nav) => {
    const hasCalendar = Array.from(nav.querySelectorAll("a")).some(
      (link) => link.getAttribute("href") === "calendar.html",
    );
    if (hasCalendar) return;

    const calendarLink = document.createElement("a");
    calendarLink.href = "calendar.html";
    calendarLink.textContent = t("calendar");
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
  const target = new Date(targetDate + "T00:00:00");
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
        const importedIds = new Set(
          JSON.parse(localStorage.getItem(progressKey) || "[]"),
        );
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
    refreshAcademicNotifications();
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
  const assignmentItems =
    calendarAcademicStore.assignments !== null
      ? calendarAcademicStore.assignments
      : assignmentDataLoaded
        ? assignmentStore
        : get("assignments");
  const testItems =
    calendarAcademicStore.tests !== null
      ? calendarAcademicStore.tests
      : testDataLoaded
        ? testStore
        : get("tests");
  const presentationItems =
    calendarAcademicStore.presentations !== null
      ? calendarAcademicStore.presentations
      : presentationDataLoaded
        ? presentationStore
        : get("presentations");
  const assignmentEvents = assignmentItems.map((item) => ({
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

  const testEvents = testItems.map((item) => ({
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

  const presentationEvents = presentationItems.map((item) => ({
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
    course:
      item.course && item.course !== "Personal Reminder" ? item.course : "",
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
    course: "",
    date: item.date,
    time: [item.startTime, item.endTime].filter(Boolean).join(" - "),
    description: item.description || "Personal calendar event",
    status: "Personal",
    priority: item.priority || "Medium",
    eventType: "personal",
    personalEventId: item.id,
  }));

  return [
    ...assignmentEvents,
    ...testEvents,
    ...presentationEvents,
    ...reminderEvents,
    ...personalEvents,
  ].sort((a, b) => a.date.localeCompare(b.date));
}

function generateAcademicNotifications() {
  const events = buildAcademicEventList();
  const eventsByKey = new Map(events.map((event) => [event.id, event]));
  const notificationKeys = new Set();
  const notifications = getNotifications();
  const next = [];

  function getNotificationMessageKey(event, daysRemaining) {
    if (daysRemaining < 0 || daysRemaining > 7) return "";
    const time =
      daysRemaining === 0
        ? "today"
        : daysRemaining === 1
          ? "tomorrow"
          : "in_days";
    const eventType =
      event.type === "Assignment"
        ? "assignment"
        : event.type === "Test"
          ? "test"
          : event.type === "Presentation"
            ? "presentation"
            : "personal";
    return "notification_" + eventType + "_" + time;
  }

  notifications.forEach((notification) => {
    const event = eventsByKey.get(notification.eventKey);
    if (!event) {
      if (
        !/^(assignment|test|presentation|reminder|personal)-/.test(
          String(notification.eventKey || ""),
        )
      ) {
        next.push(notification);
      }
      return;
    }

    const messageKey = getNotificationMessageKey(
      event,
      getDayDifference(event.date),
    );
    if (!messageKey || notificationKeys.has(event.id)) return;
    notificationKeys.add(event.id);
    next.push({
      ...notification,
      message: undefined,
      title: event.title,
      type: event.type,
      course: event.course,
      date: event.date,
      time: event.time,
      messageKey,
      messageValues: {
        title: event.title,
        count: getDayDifference(event.date),
      },
    });
  });

  events.forEach((event) => {
    if (notificationKeys.has(event.id)) return;
    const daysRemaining = getDayDifference(event.date);
    const messageKey = getNotificationMessageKey(event, daysRemaining);
    if (!messageKey) return;
    notificationKeys.add(event.id);
    next.push({
      id: "notification-" + Date.now() + Math.random().toString(16).slice(2),
      eventKey: event.id,
      title: event.title,
      type: event.type,
      course: event.course,
      date: event.date,
      time: event.time,
      messageKey,
      messageValues: { title: event.title, count: daysRemaining },
      read: false,
      createdAt: new Date().toISOString(),
    });
  });

  saveNotifications(next);
}

function refreshAcademicNotifications() {
  generateAcademicNotifications();
  renderNotificationList();
}

function updateNotificationBadge() {
  const count = document.getElementById("notification-count");
  const unread = getNotifications().filter((item) => !item.read).length;
  if (count) {
    count.textContent = unread;
    count.style.display = unread ? "grid" : "none";
    count.setAttribute(
      "aria-label",
      t(
        unread === 1
          ? "unread_notifications_count_one"
          : "unread_notifications_count_other",
        { count: unread },
      ),
    );
  }
  const dashboardCount = document.getElementById(
    "notification-dashboard-count",
  );
  if (dashboardCount) dashboardCount.textContent = unread;
  const toggle = document.getElementById("notification-toggle");
  if (toggle) {
    toggle.setAttribute(
      "aria-label",
      unread
        ? t(
            unread === 1
              ? "notification_toggle_unread_one"
              : "notification_toggle_unread_other",
            { count: unread },
          )
        : t("open_notifications"),
    );
  }
}

function renderNotificationList() {
  const notificationList = document.getElementById("notification-list");
  const dashboardNotifications = document.getElementById(
    "dashboard-notifications",
  );
  const notifications = getNotifications()
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const html = notifications.length
    ? notifications
        .map((item) => {
          const message = item.messageKey
            ? t(item.messageKey, item.messageValues)
            : item.message;
          const metadata = [
            t(item.type),
            item.course ? t("notification_course") + ": " + item.course : "",
            item.date ? t("notification_date") + ": " + date(item.date) : "",
            item.time ? t("notification_time") + ": " + item.time : "",
          ]
            .filter(Boolean)
            .map((value) => esc(value))
            .join(' <span aria-hidden="true">&bull;</span> ');
          const isAcademicNotification = Boolean(item.messageKey);
          const accessibleText = isAcademicNotification
            ? message
            : item.title + ". " + message;
          return (
            '<button class="notification-item ' +
            (item.read ? "" : "unread") +
            '" data-notification-id="' +
            esc(item.id) +
            '" type="button" aria-label="' +
            esc(
              (item.read ? "" : t("unread_notification_prefix") + " ") +
                accessibleText,
            ) +
            '"><strong>' +
            esc(isAcademicNotification ? message : item.title) +
            "</strong>" +
            (isAcademicNotification ? "" : "<span>" + esc(message) + "</span>") +
            '<small class="notification-meta">' +
            metadata +
            "</small></button>"
          );
        })
        .join("")
    : '<p class="empty-state">' + t("no_notifications") + "</p>";

  if (notificationList) notificationList.innerHTML = html;
  if (dashboardNotifications) dashboardNotifications.innerHTML = html;
  updateNotificationBadge();
}

function markAllNotificationsRead() {
  const notifications = getNotifications().map((item) => ({
    ...item,
    read: true,
  }));
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
    button.setAttribute("aria-label", t("open_notifications"));
    button.setAttribute("aria-controls", "notification-panel");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML =
      '<span class="notification-icon" aria-hidden="true"></span><span class="notification-count" id="notification-count">0</span>';
    header.appendChild(button);
  }

  if (!panel) {
    const newPanel = document.createElement("div");
    newPanel.id = "notification-panel";
    newPanel.className = "notification-panel";
    newPanel.hidden = true;
    newPanel.setAttribute("aria-label", t("notifications_panel"));
    newPanel.innerHTML =
      '<div class="panel-top"><h3>' +
      t("notifications") +
      '</h3><button class="text-button" id="mark-all-read" type="button">' +
      t("mark_all_read") +
      "</button></div><div id=\"notification-list\"></div>";
    header.appendChild(newPanel);
  }

  const activeToggle = document.getElementById("notification-toggle");
  const activePanel = document.getElementById("notification-panel");

  if (activeToggle) {
    activeToggle.setAttribute("aria-controls", "notification-panel");
    activeToggle.setAttribute("aria-expanded", "false");
    activeToggle.setAttribute("aria-label", t("open_notifications"));
  }

  if (activePanel) {
    activePanel.setAttribute("aria-label", t("notifications_panel"));
    activePanel.setAttribute("aria-live", "polite");
  }

  if (activeToggle) {
    activeToggle.onclick = (event) => {
      event.stopPropagation();
      refreshAcademicNotifications();
      if (activePanel) {
        activePanel.hidden = !activePanel.hidden;
        activeToggle.setAttribute("aria-expanded", String(!activePanel.hidden));
      }
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
      activeToggle.setAttribute("aria-expanded", "false");
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

  document.addEventListener("campusplan-language-change", renderNotificationList);
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
              ? t("due_today_title")
              : daysLeft === 1
                ? t("due_tomorrow_title")
                : daysLeft > 0
                  ? t("due_in_days", { count: daysLeft })
                  : t("days_due", { count: Math.abs(daysLeft) });

          return (
            '<div class="reminder-item"><strong>' +
            esc(event.title) +
            "</strong><small>" +
            esc(t(event.type)) +
            " • " +
            esc(event.course) +
            '</small><span class="reminder-status ' +
            level.className +
            '">' +
            t(level.label) +
            "</span><small>" +
            label +
            "</small></div>"
          );
        })
        .join("") +
      "</div>"
    : '<p class="empty-state">' + t("no_reminders") + "</p>";
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
            new Intl.DateTimeFormat(appLocale(), { month: "short" }).format(date) +
            '</div><div class="dashboard-mini-copy"><h3>' +
            esc(item.title) +
            "</h3><p>" +
            esc(item.type) +
            " • " +
            esc(item.course) +
            "</p></div></div>"
          );
        })
        .join("") +
      "</div>"
    : '<p class="empty-state">' + t("no_events") + "</p>";
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
      course: "",
    };

    const reminders = getReminders();
    reminders.push(reminder);
    saveReminders(reminders);
    refreshAcademicNotifications();
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
  const monthValue =
    currentMonth && currentMonth.dataset.month
      ? new Date(currentMonth.dataset.month)
      : new Date();
  const monthStart = new Date(
    monthValue.getFullYear(),
    monthValue.getMonth(),
    1,
  );
  const monthEnd = new Date(
    monthValue.getFullYear(),
    monthValue.getMonth() + 1,
    0,
  );
  const startingIndex = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
  const eventsByDate = buildAcademicEventList().reduce((map, item) => {
    const date = item.date;
    if (!map[date]) map[date] = [];
    map[date].push(item);
    return map;
  }, {});

  monthLabel.textContent = new Intl.DateTimeFormat(appLocale(), {
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
      if (isoDate === new Date().toISOString().slice(0, 10))
        classes.push("today");
      if (events.length) classes.push("calendar-day-has-events");

      return (
        '<button type="button" class="' +
        classes.join(" ") +
        '" data-date="' +
        isoDate +
        '" aria-label="' +
        isoDate +
        (events.length
          ? ": " +
            t(events.length === 1 ? "event_count_aria_one" : "event_count_aria", {
              count: events.length,
            })
          : "") +
        '"><span class="calendar-day-number">' +
        entry.date.getDate() +
        "</span>" +
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
        const event = buildAcademicEventList().find(
          (item) => item.id === eventId,
        );
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
  activeCalendarEvent = event;

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
      ? new Intl.DateTimeFormat(appLocale(), {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(event.date + "T12:00:00"))
      : t("no_date");
  }
  if (time) time.textContent = event.time || t("no_time_specified");
  if (description)
    description.textContent = event.description || t("no_description");
  if (status) status.textContent = t(event.status || "Scheduled");
  if (priority) priority.textContent = t(event.priority || "Medium");
  const actions = document.getElementById("calendar-event-actions");
  if (actions) {
    actions.innerHTML =
      event.eventType === "personal"
        ? '<button class="button secondary" type="button" id="calendar-event-edit">' +
          t("edit") +
          '</button><button class="button danger-button" type="button" id="calendar-event-delete">' +
          t("delete") +
          "</button>"
        : '<span class="event-source-note">' +
          t("managed_from") +
          " " +
          esc(
            event.type === "Assignment"
              ? t("assignments")
              : event.type === "Test"
                ? t("tests")
                : event.type === "Presentation"
                  ? t("presentations")
                  : t("reminders"),
          ) +
          "</span>";
    if (event.eventType === "personal") {
      document.getElementById("calendar-event-edit").onclick = () =>
        openPersonalEventForm(event.personalEventId);
      document.getElementById("calendar-event-delete").onclick = () => {
        if (!confirm(t("delete_event_confirm"))) return;
        calendarRequest("/" + encodeURIComponent(event.personalEventId), {
          method: "DELETE",
        })
          .then(() => {
            savePersonalCalendarEvents(
              getPersonalCalendarEvents().filter(
                (item) => String(item.id) !== String(event.personalEventId),
              ),
            );
            modal.hidden = true;
            renderCalendarPage();
            refreshAcademicNotifications();
          })
          .catch((error) => {
            const notice = document.getElementById(
              "calendar-event-description",
            );
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
  activePersonalEventFormId = eventId || "";
  document.getElementById("calendar-event-form-title").textContent = event
    ? t("edit_personal_event")
    : t("add_personal_event");
  document.getElementById("calendar-personal-id").value = event ? event.id : "";
  document.getElementById("calendar-personal-title").value = event
    ? event.title
    : "";
  document.getElementById("calendar-personal-date").value = event
    ? event.date
    : "";
  document.getElementById("calendar-personal-start").value = event
    ? event.startTime || ""
    : "";
  document.getElementById("calendar-personal-end").value = event
    ? event.endTime || ""
    : "";
  document.getElementById("calendar-personal-type").value = event
    ? event.type || "Personal"
    : "Personal";
  document.getElementById("calendar-personal-priority").value = event
    ? event.priority || "Medium"
    : "Medium";
  document.getElementById("calendar-personal-description").value = event
    ? event.description || ""
    : "";
  document.getElementById("calendar-personal-error").textContent = "";
  if (eventId) document.getElementById("calendar-event-modal").hidden = true;
  document.getElementById("calendar-event-form-modal").hidden = false;
  document.getElementById("calendar-personal-title").focus();
}

function setupPersonalCalendarEvents() {
  const form = document.getElementById("calendar-event-form");
  if (!form) return;
  document.querySelector(
    '[data-open-modal="calendar-event-form-modal"]',
  ).onclick = () => openPersonalEventForm();
  form.onsubmit = async (event) => {
    event.preventDefault();
    const startTime = document.getElementById("calendar-personal-start").value;
    const endTime = document.getElementById("calendar-personal-end").value;
    const error = document.getElementById("calendar-personal-error");
    if (endTime && !startTime) {
      error.textContent = t("start_time_required");
      return;
    }
    if (startTime && endTime && endTime <= startTime) {
      error.textContent = t("end_after_start");
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
      description: document
        .getElementById("calendar-personal-description")
        .value.trim(),
    };
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await calendarRequest(
        id ? "/" + encodeURIComponent(id) : "",
        {
          method: id ? "PUT" : "POST",
          body: JSON.stringify(item),
        },
      );
      const events = getPersonalCalendarEvents().slice();
      const index = events.findIndex(
        (savedEvent) => String(savedEvent.id) === String(id),
      );
      if (index === -1) events.push(result.event);
      else events[index] = result.event;
      savePersonalCalendarEvents(events);
      refreshAcademicNotifications();
      form.reset();
      document.getElementById("calendar-event-form-modal").hidden = true;
      renderCalendarPage();
    } catch (requestError) {
      error.textContent =
        requestError.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : requestError.message;
    } finally {
      submitButton.disabled = false;
    }
  };
}

function setupTimetable() {
  if (document.body.dataset.page !== "timetable") return;
  const list = document.getElementById("timetable-list");
  const form = document.getElementById("timetable-form");
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const fields = [
    "course",
    "code",
    "day",
    "start",
    "end",
    "room",
    "lecturer",
    "notes",
  ];
  const legacyKey = userKey("campusplan-timetable");
  const migrationKey = userKey("campusplan-timetable-migrated");
  const progressKey = userKey("campusplan-timetable-migration-progress");
  const showError = (message) => {
    list.innerHTML =
      '<p class="empty-state timetable-api-error">' +
      esc(message) +
      ' <button class="text-button" id="retry-timetable" type="button">' +
      t("retry") +
      "</button></p>";
    document.getElementById("retry-timetable").onclick = loadTimetable;
  };
  const saveCache = () =>
    localStorage.setItem(legacyKey, JSON.stringify(timetableStore));
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
    const importedIds = new Set(
      JSON.parse(localStorage.getItem(progressKey) || "[]"),
    );
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
    list.innerHTML = '<p class="empty-state">' + t("loading_timetable") + "</p>";
    try {
      await migrateLegacyTimetable();
      const result = await timetableRequest();
      timetableStore = result.timetable || [];
      saveCache();
      render();
    } catch (error) {
      showError(
        error.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : error.message,
      );
    }
  }
  function render() {
    const entries = timetableStore
      .slice()
      .sort(
        (a, b) =>
          daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day) ||
          a.startTime.localeCompare(b.startTime),
      );
    list.innerHTML = entries.length
      ? daysOfWeek
          .map((day) => {
            const dayEntries = entries.filter((entry) => entry.day === day);
            if (!dayEntries.length) return "";
            return (
              '<section class="timetable-day"><h2>' +
              t(day) +
              '</h2><div class="timetable-day-entries">' +
              dayEntries
                .map(
                  (entry) =>
                    '<article class="timetable-class"><div><time>' +
                    entry.startTime +
                    " - " +
                    entry.endTime +
                    "</time><h3>" +
                    esc(entry.courseName) +
                    "</h3><p>" +
                    esc(
                      [entry.courseCode, entry.room]
                        .filter(Boolean)
                        .join(" · ") || t("no_room"),
                    ) +
                    "</p>" +
                    (entry.lecturer
                      ? "<small>" +
                        t("lecturer") +
                        " " +
                        esc(entry.lecturer) +
                        "</small>"
                      : "") +
                    '</div><div class="card-actions"><button class="text-button" data-edit-class="' +
                    entry.id +
                    '">' +
                    t("edit") +
                    '</button><button class="text-button danger" data-delete-class="' +
                    entry.id +
                    '">' +
                    t("delete") +
                    "</button></div></article>",
                )
                .join("") +
              "</div></section>"
            );
          })
          .join("")
      : '<div class="panel timetable-empty"><h2>' +
        t("no_classes") +
        "</h2><p>" +
        t("add_weekly_classes") +
        '</p><button class="button" type="button" data-open-modal="timetable-modal">' +
        t("add_class_action") +
        "</button></div>";
    modal();
  }
  document.addEventListener("campusplan-language-change", render);
  function editEntry(entry) {
    document.getElementById("timetable-modal-title").textContent = t("edit_class");
    document.getElementById("timetable-id").value = entry.id;
    [
      "courseName",
      "courseCode",
      "day",
      "startTime",
      "endTime",
      "room",
      "lecturer",
      "notes",
    ].forEach(
      (key, index) =>
        (document.getElementById("timetable-" + fields[index]).value =
          entry[key] || ""),
    );
    document.getElementById("timetable-error").textContent = "";
    document.getElementById("timetable-modal").hidden = false;
  }
  list.onclick = (event) => {
    const editId = event.target.dataset.editClass;
    const deleteId = event.target.dataset.deleteClass;
    if (editId)
      editEntry(
        timetableStore.find((entry) => String(entry.id) === String(editId)),
      );
    if (deleteId && confirm(t("delete_class_confirm"))) {
      timetableRequest("/" + encodeURIComponent(deleteId), { method: "DELETE" })
        .then(() => {
          timetableStore = timetableStore.filter(
            (entry) => String(entry.id) !== String(deleteId),
          );
          saveCache();
          render();
        })
        .catch((error) =>
          showError(
            error.message === "Failed to fetch"
              ? "Unable to connect to CampusPlan server."
              : error.message,
          ),
        );
    }
  };
  form.onsubmit = async (event) => {
    event.preventDefault();
    const startTime = document.getElementById("timetable-start").value;
    const endTime = document.getElementById("timetable-end").value;
    const error = document.getElementById("timetable-error");
    if (!document.getElementById("timetable-course").value.trim()) {
      error.textContent = t("course_required");
      return;
    }
    if (!startTime || !endTime || endTime <= startTime) {
      error.textContent = t("end_after_start");
      return;
    }
    const id = document.getElementById("timetable-id").value;
    const item = {
      courseName: document.getElementById("timetable-course").value.trim(),
      courseCode: document.getElementById("timetable-code").value.trim(),
      day: document.getElementById("timetable-day").value,
      startTime,
      endTime,
      room: document.getElementById("timetable-room").value.trim(),
      lecturer: document.getElementById("timetable-lecturer").value.trim(),
      notes: document.getElementById("timetable-notes").value.trim(),
    };
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
      const result = await timetableRequest(
        id ? "/" + encodeURIComponent(id) : "",
        { method: id ? "PUT" : "POST", body: JSON.stringify(item) },
      );
      timetableStore = id
        ? timetableStore.map((entry) =>
            String(entry.id) === String(id) ? result.timetableEntry : entry,
          )
        : [...timetableStore, result.timetableEntry];
      saveCache();
      form.reset();
      document.getElementById("timetable-id").value = "";
      document.getElementById("timetable-modal-title").textContent =
        "Add class";
      document.getElementById("timetable-modal").hidden = true;
      render();
    } catch (requestError) {
      error.textContent =
        requestError.message === "Failed to fetch"
          ? "Unable to connect to CampusPlan server."
          : requestError.message;
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
  refreshAcademicNotifications();
  setupNotifications();
  setupReminderForm();
  setupPersonalCalendarEvents();
  setupCalendarPage();
  loadCalendarData();
  renderDashboardReminders();
  renderCalendarPreview();
  document.addEventListener("campusplan-language-change", () => {
    renderDashboardReminders();
    renderCalendarPreview();
    renderCalendarPage();
    const eventModal = document.getElementById("calendar-event-modal");
    if (eventModal && !eventModal.hidden && activeCalendarEvent) {
      openEventModal(activeCalendarEvent);
    }
    const eventFormModal = document.getElementById("calendar-event-form-modal");
    if (eventFormModal && !eventFormModal.hidden) {
      document.getElementById("calendar-event-form-title").textContent =
        activePersonalEventFormId
          ? t("edit_personal_event")
          : t("add_personal_event");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupAuth();
  setupPasswordVisibility();

  let b = document.querySelector(".menu-toggle"),
    n = document.querySelector(".main-nav");
  if (b && n) {
    if (!n.id) n.id = "main-navigation";
    b.setAttribute("aria-controls", n.id);
    const updateNavigationButton = () => {
      const expanded = n.classList.contains("open");
      b.setAttribute("aria-expanded", String(expanded));
      b.setAttribute(
        "aria-label",
        t(expanded ? "close_navigation" : "open_navigation"),
      );
    };
    b.onclick = () => {
      n.classList.toggle("open");
      updateNavigationButton();
    };
    updateNavigationButton();
    document.addEventListener(
      "campusplan-language-change",
      updateNavigationButton,
    );
  }

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
  document.addEventListener("campusplan-language-change", () => {
    if (document.body.dataset.page === "dashboard") dashboard(false);
  });
});
