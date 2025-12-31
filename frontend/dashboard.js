// ================= AUTH CHECK =================
const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}


// ================= STATE =================
let meds = [];

// ================= ELEMENTS =================
const medListEl = document.getElementById("medList");
const historyListEl = document.getElementById("historyList");
const openAddBtn = document.getElementById("openAddBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const addForm = document.getElementById("addForm");
const alertSound = document.getElementById("alertSound");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

// ================= MODAL =================
openAddBtn.onclick = showModal;
closeModal.onclick = hideModal;

function showModal() {
  modal.classList.remove("hidden");
  document.getElementById("name").focus();
}

function hideModal() {
  modal.classList.add("hidden");
  addForm.reset();
}

// ================= HELPERS =================
function formatTime(h, m) {
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

function nowString() {
  const d = new Date();
  return formatTime(d.getHours(), d.getMinutes());
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function wasTakenToday(med) {
  return med.takenRecords?.some(r =>
    isSameDay(new Date(r.dateISO), new Date())
  );
}

function stopAlert() {
  try {
    alertSound.pause();
    alertSound.currentTime = 0;
    alertSound.loop = false;
  } catch {}
}

// ================= ADD MED =================
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameEl = document.getElementById("name");
const dosageEl = document.getElementById("dosage");
const timeEl = document.getElementById("time");
const frequencyEl = document.getElementById("frequency");
const notesEl = document.getElementById("notes");
const caretakerEmailEl = document.getElementById("caretakerEmail");

const body = {
  name: nameEl.value.trim(),
  dosage: dosageEl.value.trim(),
  time: timeEl.value,
  frequency: frequencyEl.value,
  notes: notesEl.value.trim(),
  caretakerEmail: caretakerEmailEl.value.trim(),
};


  try {
    await apiRequest("/meds", "POST", body, true);
    hideModal();
    loadMedsFromBackend();
  } catch {
    alert("Failed to add medicine");
  }
});

// ================= RENDER =================
function render() {
  medListEl.innerHTML = "";
  historyListEl.innerHTML = "";

  if (meds.length === 0) {
    medListEl.innerHTML =
      `<li class="history-item">No medicines added yet.</li>`;
    return;
  }

  const now = new Date();
  meds.sort((a, b) => a.time.localeCompare(b.time));

  meds.forEach(med => {
    const takenToday = wasTakenToday(med);

    const [h, m] = med.time.split(":").map(Number);
    const medDate = new Date();
    medDate.setHours(h, m, 0, 0);

    let status = med.time;
    let cls = "due";

    if (takenToday) {
      status = "Taken";
      cls = "taken";
    } else if (medDate < now) {
      status = "Missed";
      cls = "missed";
    }

    const li = document.createElement("li");
    li.className = "med-item";
    li.innerHTML = `
      <div class="med-left">
        <div class="dot ${cls}"></div>
        <div class="med-meta">
          <div class="meta-title">${med.name} • ${med.dosage}</div>
          <div class="meta-sub">${med.notes || ""}</div>
        </div>
      </div>

      <div class="med-actions">
        <div style="text-align:right;margin-right:8px">
          <div style="font-weight:600">${status}</div>
          <div style="font-size:12px;color:var(--muted)">${med.frequency}</div>
        </div>
        <button class="small" onclick="markTaken('${med._id}')">Mark Taken</button>
        <button class="small" onclick="deleteMed('${med._id}')">Delete</button>
      </div>
    `;
    medListEl.appendChild(li);

    med.takenRecords?.slice().reverse().slice(0, 5).forEach(r => {
      const h = document.createElement("li");
      h.className = "history-item";
      h.textContent = `${med.name} — ${r.time} on ${new Date(r.dateISO).toLocaleDateString()}`;
      historyListEl.appendChild(h);
    });
  });
}

// ================= ACTIONS =================
window.markTaken = async function (id) {
  try {
    await apiRequest(`/meds/${id}/take`, "POST", {}, true);
    stopAlert();
    loadMedsFromBackend();
  } catch {
    alert("Failed to mark taken");
  }
};

window.deleteMed = async function (id) {
  if (!confirm("Delete this medicine?")) return;
  try {
    await apiRequest(`/meds/${id}`, "DELETE", null, true);
    loadMedsFromBackend();
  } catch {
    alert("Delete failed");
  }
};

// ================= ALERT / NOTIFICATION =================
function playAlert(loop = true) {
  try {
    alertSound.currentTime = 0;
    alertSound.loop = loop;
    alertSound.play();
  } catch {}
}
function notifyUser(message) {
  // Browser notification
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      const n = new Notification("MedAlert+ Reminder", {
        body: message,
      });
      n.onclick = () => window.focus();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then(p => {
        if (p === "granted") {
          new Notification("MedAlert+ Reminder", { body: message });
        } else {
          alert(message);
        }
      });
    } else {
      alert(message);
    }
  } else {
    alert(message);
  }
}

setInterval(checkReminders, 30000);
checkReminders();

function checkReminders() {
  const now = new Date();
  meds.forEach(med => {
    if (wasTakenToday(med)) return;

    const [h, m] = med.time.split(":").map(Number);
    const medDate = new Date();
    medDate.setHours(h, m, 0, 0);

    if (Math.abs(medDate - now) <= 90000) {
      playAlert(true);
      notifyUser(`Time to take ${med.name}`);
    }
  });
}

// ================= LOAD =================
async function loadMedsFromBackend() {
  try {
    meds = await apiRequest("/meds", "GET", null, true);
    render();
  } catch {
    alert("Failed to load medicines");
  }
}

loadMedsFromBackend();
