// Prototype only: production authentication needs a backend, hashed passwords, secure sessions/tokens, and database storage.
const USER_KEY = "campusplan-users",
  SESSION_KEY = "campusplan-current-user";
const THEME_KEY = "campusplan_theme";
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
  toggle.setAttribute("aria-label", "Switch color theme");
  toggle.innerHTML = '<span class="theme-toggle-label">' + (currentTheme === "dark" ? "Dark" : "Light") + "</span>";
  const header = document.querySelector(".site-header");
  const authCard = document.querySelector(".auth-card");
  if (header) header.insertBefore(toggle, header.querySelector(".profile") || null);
  else if (authCard) authCard.appendChild(toggle);
  toggle.onclick = () => {
    const nextTheme = applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    toggle.querySelector(".theme-toggle-label").textContent = nextTheme === "dark" ? "Dark" : "Light";
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
  let all = get("assignments"),
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
  renderAssignments();
  [
    "assignment-search",
    "course-filter",
    "status-filter",
    "priority-filter",
  ].forEach((id) =>
    document.getElementById(id).addEventListener("input", renderAssignments),
  );
  document.getElementById("assignment-form").onsubmit = (e) => {
    e.preventDefault();
    let id = document.getElementById("assignment-id").value,
      x = {
        id: id || "a" + Date.now(),
        title: document.getElementById("assignment-title").value.trim(),
        course: document.getElementById("assignment-course").value.trim(),
        description: document
          .getElementById("assignment-description")
          .value.trim(),
        dueDate: document.getElementById("assignment-date").value,
        priority: document.getElementById("assignment-priority").value,
        status: document.getElementById("assignment-status").value,
      },
      all = get("assignments"),
      i = all.findIndex((a) => a.id === id);
    i < 0 ? all.push(x) : (all[i] = x);
    put("assignments", all);
    e.target.reset();
    document.getElementById("assignment-id").value = "";
    document.getElementById("assignment-modal").hidden = true;
    renderAssignments();
  };
  document.getElementById("assignment-list").onclick = (e) => {
    let id =
        e.target.dataset.edit ||
        e.target.dataset.delete ||
        e.target.dataset.complete,
      all = get("assignments");
    if (!id) return;
    if (e.target.dataset.delete) {
      if (confirm("Delete this assignment?"))
        put(
          "assignments",
          all.filter((x) => x.id !== id),
        );
    } else if (e.target.dataset.complete)
      put(
        "assignments",
        all.map((x) => (x.id === id ? { ...x, status: "Completed" } : x)),
      );
    else {
      let x = all.find((x) => x.id === id);
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
    renderAssignments();
  };
}
function renderTests() {
  let l = document.getElementById("test-list");
  if (!l) return;
  let rows = get("tests").sort((a, b) => a.date.localeCompare(b.date));
  l.innerHTML = rows
    .map(
      (x) =>
        '<article class="test-card"><div class="card-top"><span class="course-tag green-bg">' +
        esc(x.course) +
        '</span><button class="text-button danger" data-delete-test="' +
        x.id +
        '">Delete</button></div><h2>' +
        esc(x.title) +
        "</h2><dl><div><dt>Date</dt><dd>" +
        date(x.date) +
        "</dd></div><div><dt>Time</dt><dd>" +
        esc(x.time) +
        "</dd></div><div><dt>Room</dt><dd>" +
        esc(x.room) +
        '</dd></div></dl><p class="days-remaining">' +
        (days(x.date) === 0 ? "Today" : days(x.date) + " days remaining") +
        "</p></article>",
    )
    .join("");
}
function setupTests() {
  if (!document.getElementById("test-list")) return;
  renderTests();
  document.getElementById("test-form").onsubmit = (e) => {
    e.preventDefault();
    let x = get("tests");
    x.push({
      id: "t" + Date.now(),
      title: document.getElementById("test-title").value.trim(),
      course: document.getElementById("test-course").value.trim(),
      date: document.getElementById("test-date").value,
      time: document.getElementById("test-time").value,
      room: document.getElementById("test-room").value.trim(),
    });
    put("tests", x);
    e.target.reset();
    document.getElementById("test-modal").hidden = true;
    renderTests();
  };
  document.getElementById("test-list").onclick = (e) => {
    if (e.target.dataset.deleteTest && confirm("Delete this test?")) {
      put(
        "tests",
        get("tests").filter((x) => x.id !== e.target.dataset.deleteTest),
      );
      renderTests();
    }
  };
}
function renderPresentations() {
  let l = document.getElementById("presentation-list");
  if (!l) return;
  l.innerHTML = get("presentations")
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
        '</dd></div></dl><label class="status-update">Preparation status<select data-p-status="' +
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
  renderPresentations();
  document.getElementById("presentation-form").onsubmit = (e) => {
    e.preventDefault();
    let x = get("presentations");
    x.push({
      id: "p" + Date.now(),
      title: document.getElementById("presentation-title").value.trim(),
      course: document.getElementById("presentation-course").value.trim(),
      date: document.getElementById("presentation-date").value,
      group: document.getElementById("presentation-group").value.trim(),
      part: document.getElementById("presentation-part").value.trim(),
      status: document.getElementById("presentation-status").value,
    });
    put("presentations", x);
    e.target.reset();
    document.getElementById("presentation-modal").hidden = true;
    renderPresentations();
  };
  document.getElementById("presentation-list").onchange = (e) => {
    let id = e.target.dataset.pStatus;
    if (id) {
      put(
        "presentations",
        get("presentations").map((x) =>
          x.id === id ? { ...x, status: e.target.value } : x,
        ),
      );
      renderPresentations();
    }
  };
}
function dashboard() {
  if (document.body.dataset.page !== "dashboard") return;
  let a = get("assignments"),
    t = get("tests"),
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
  const oldKey = userKey("campusplan-chats");
  const storageKey = userKey("campusplan-conversations");
  let saved = localStorage.getItem(storageKey);
  let conversations = saved ? JSON.parse(saved) : null;
  if (!conversations) {
    const oldChats = JSON.parse(localStorage.getItem(oldKey) || "[]");
    conversations = oldChats.map((chat) => ({
      id: "conversation-" + chat.id,
      participantId: chat.id === "sarah" ? "sarah-m" : chat.id,
      messages: (chat.messages || []).map((message, index) => ({
        id: "legacy-message-" + index,
        senderId: message.from === "David" ? me.studentId : "sarah-m",
        conversationId: "conversation-" + chat.id,
        text: message.text,
        timestamp: new Date().toISOString(),
        read: !chat.unread,
      })),
    }));
  }
  if (!conversations.length) conversations = [];
  let activeId = conversations[0] ? conversations[0].id : null;
  const list = document.getElementById("conversation-list");
  const search = document.getElementById("student-search");
  const results = document.getElementById("student-results");

  function save() {
    localStorage.setItem(storageKey, JSON.stringify(conversations));
  }
  function participant(conversation) {
    return getUserProfile(conversation.participantId) || {
      name: "Student",
      studentId: conversation.participantId,
    };
  }
  function renderList() {
    const query = search.value.trim().toLowerCase();
    const visible = conversations.filter((conversation) => {
      const profile = participant(conversation);
      return (profile.name + " " + profile.studentId)
        .toLowerCase()
        .includes(query);
    });
    list.innerHTML = visible.length
      ? visible
          .map((conversation) => {
            const profile = participant(conversation);
            const last = conversation.messages[conversation.messages.length - 1];
            const unread = conversation.messages.filter(
              (message) => message.senderId !== me.studentId && !message.read,
            ).length;
            return (
              '<article class="conversation ' +
              (conversation.id === activeId ? "active" : "") +
              '" data-conversation-id="' +
              conversation.id +
              '">' +
              avatarMarkup(profile.studentId) +
              '<div class="conversation-copy"><h3>' +
              esc(profile.name) +
              '</h3><p>' +
              esc(last ? last.text : "No messages yet") +
              '</p></div><div class="conversation-meta"><time>' +
              (last ? formatMessageTime(last.timestamp) : "") +
              '</time>' +
              (unread ? '<b class="unread" aria-label="' + unread + ' unread">' + unread + "</b>" : "") +
              '</div><button class="conversation-delete" data-delete-conversation="' +
              conversation.id +
              '" aria-label="Delete conversation">&times;</button></article>'
            );
          })
          .join("")
      : '<p class="empty-state">No conversations found.</p>';
  }
  function renderChat() {
    const chat = document.getElementById("private-chat");
    const conversation = conversations.find((item) => item.id === activeId);
    if (!conversation) {
      chat.classList.remove("has-conversation");
      document.getElementById("private-messages").innerHTML =
        '<p class="empty-state chat-empty">Select a student to start messaging.</p>';
      return;
    }
    chat.classList.add("has-conversation");
    const profile = participant(conversation);
    const chatAvatar = avatarMarkup(profile.studentId).replace(
      /<(img|span) /,
      '<$1 id="chat-avatar" ',
    );
    document.getElementById("chat-avatar").outerHTML = chatAvatar;
    document.getElementById("chat-name").textContent = profile.name;
    document.getElementById("chat-status").textContent = "CampusPlan student";
    const messageList = document.getElementById("private-messages");
    messageList.innerHTML = conversation.messages.length
      ? conversation.messages
          .map(
            (message) =>
              '<div class="message-row ' +
              (message.senderId === me.studentId ? "sent-row" : "received-row") +
              '">' +
              avatarMarkup(message.senderId) +
              '<div class="bubble ' +
              (message.senderId === me.studentId ? "sent" : "received") +
              '"><span>' +
              esc(message.text) +
              '</span><time>' +
              formatMessageTime(message.timestamp) +
              (message.senderId === me.studentId ? (message.read ? " · Read" : " · Sent") : "") +
              "</time></div></div>",
          )
          .join("")
      : '<p class="empty-state chat-empty">No messages yet. Start the conversation.</p>';
    const readKeys = conversation.messages
      .filter((message) => message.senderId !== me.studentId && !message.read)
      .map((message) => "message:" + conversation.id + ":" + message.id);
    conversation.messages.forEach((message) => {
      if (message.senderId !== me.studentId) message.read = true;
    });
    markCommunicationNotificationsRead(readKeys);
    save();
    renderList();
    renderNotificationList();
  }
  function openConversation(participantId) {
    let conversation = conversations.find((item) => item.participantId === participantId);
    if (!conversation) {
      conversation = {
        id: "conversation-" + me.studentId + "-" + participantId,
        participantId,
        messages: [],
      };
      conversations.push(conversation);
    }
    activeId = conversation.id;
    renderList();
    renderChat();
    document.getElementById("private-chat").classList.add("mobile-open");
  }
  function renderSearchResults() {
    const query = search.value.trim().toLowerCase();
    if (!query) {
      results.innerHTML = "";
      return;
    }
    const people = students
      .filter((student) => student.studentId !== me.studentId)
      .filter((student) =>
        (student.name + " " + student.studentId + " " + student.email)
          .toLowerCase()
          .includes(query),
      );
    results.innerHTML = people.length
      ? people
          .map(
            (student) =>
              '<button class="student-result" type="button" data-start="' +
              student.studentId +
              '">' +
              avatarMarkup(student.studentId) +
              '<span><b>' +
              esc(student.name) +
              '</b><small>' +
              esc(student.studentId + " · " + student.program + " · " + student.year) +
              "</small></span></button>",
          )
          .join("")
      : '<p class="empty-state">No students found.</p>';
  }
  search.oninput = () => {
    renderSearchResults();
    renderList();
  };
  results.onclick = (event) => {
    const button = event.target.closest("[data-start]");
    if (button) openConversation(button.dataset.start);
  };
  list.onclick = (event) => {
    const deleteButton = event.target.closest("[data-delete-conversation]");
    if (deleteButton) {
      conversations = conversations.filter((item) => item.id !== deleteButton.dataset.deleteConversation);
      if (activeId === deleteButton.dataset.deleteConversation) activeId = null;
      save();
      renderList();
      renderChat();
      return;
    }
    const item = event.target.closest("[data-conversation-id]");
    if (item) openConversation(participant(conversations.find((conversation) => conversation.id === item.dataset.conversationId)).studentId);
  };
  document.getElementById("private-form").onsubmit = (event) => {
    event.preventDefault();
    const input = document.getElementById("private-input");
    const text = input.value.trim();
    const conversation = conversations.find((item) => item.id === activeId);
    if (!conversation || !text) return;
    conversation.messages.push({
      id: "message-" + Date.now(),
      senderId: me.studentId,
      conversationId: conversation.id,
      text,
      timestamp: new Date().toISOString(),
      read: true,
    });
    input.value = "";
    save();
    renderChat();
  };
  document.getElementById("back-to-list").onclick = () =>
    document.getElementById("private-chat").classList.remove("mobile-open");
  document.getElementById("clear-conversation").onclick = () => {
    const conversation = conversations.find((item) => item.id === activeId);
    if (conversation) conversation.messages = [];
    save();
    renderChat();
  };
  syncCommunicationNotifications(conversations, []);
  renderList();
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
    login.onsubmit = (e) => {
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
      if (!found) {
        document.getElementById("login-error").textContent =
          "Invalid email/student ID or password.";
        return;
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(found));
      location.href = "index.html";
    };
    document.querySelector(".forgot-password").onclick = () =>
      alert("Password recovery will be implemented later.");
  }

  if (register) {
    register.onsubmit = (e) => {
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
      let users = JSON.parse(localStorage.getItem(USER_KEY) || "[]");
      if (
        users.some(
          (x) =>
            x.email === f("reg-email").value ||
            x.studentId === f("reg-id").value,
        )
      ) {
        document.getElementById("register-success").textContent =
          "An account with this email or Student ID already exists.";
        return;
      }
      users.push({
        name: f("reg-name").value,
        studentId: f("reg-id").value,
        email: f("reg-email").value,
        institution: f("reg-institution").value,
        program: f("reg-program").value,
        year: f("reg-year").value,
        password: f("reg-password").value,
      });
      localStorage.setItem(USER_KEY, JSON.stringify(users));
      document.getElementById("register-success").textContent =
        "Account created successfully! Redirecting to login...";
      setTimeout(() => (location.href = "login.html"), 800);
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
  const assignmentEvents = get("assignments").map((item) => ({
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

  const testEvents = get("tests").map((item) => ({
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

  const presentationEvents = get("presentations").map((item) => ({
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

  return [...assignmentEvents, ...testEvents, ...presentationEvents, ...reminderEvents].sort(
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
    const date = new Date(monthEnd);
    date.setDate(monthEnd.getDate() + (days.length % 7 === 0 ? 0 : 1));
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

  modal.hidden = false;
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
  setupCalendarPage();
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
  setupReminderAndCalendar();
});
