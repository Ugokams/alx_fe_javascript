/* ===========================
   Storage keys & initial data
   =========================== */
const LS_KEY = "dq_quotes_v1";      // localStorage key for quotes array
const SESSION_LAST_KEY = "dq_last_viewed"; // sessionStorage key for last viewed quote

let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Dream big and dare to fail.", category: "Inspiration" }
];

/* -------------------------
   Element references
   ------------------------- */
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const formContainer = document.getElementById("formContainer");
const quoteList = document.getElementById("quoteList");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const lastViewedNote = document.getElementById("lastViewedNote");
const clearStorageBtn = document.getElementById("clearStorage");
const importLabel = document.getElementById("importLabel");

/* ===========================
   Helper: persist & load
   =========================== */
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes:", err);
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;
    quotes = parsed;
    return true;
  } catch (err) {
    console.error("Failed to load quotes:", err);
    return false;
  }
}

/* Load quotes at startup (if present) */
loadQuotesFromLocalStorage(); // merges implicitly by replacing the default array if stored

/* ===========================
   Display & UI functions
   =========================== */
function displayQuotes() {
  quoteList.innerHTML = "";
  if (quotes.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No quotes available.";
    quoteList.appendChild(li);
    return;
  }

  quotes.forEach((q, idx) => {
    const li = document.createElement("li");

    const textWrap = document.createElement("div");
    textWrap.style.maxWidth = "70%";
    textWrap.innerHTML = `<div class="meta"><strong>${escapeHtml(q.category)}</strong></div>
                          <div class="author">"${escapeHtml(q.text)}" — ${escapeHtml(q.author || "Unknown")}</div>`;

    // actions (remove)
    const actions = document.createElement("div");
    actions.className = "li-actions";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.className = "secondary";
    removeBtn.addEventListener("click", () => removeQuote(idx));

    const viewBtn = document.createElement("button");
    viewBtn.textContent = "View";
    viewBtn.addEventListener("click", () => {
      showQuote(q);
      // save last viewed to sessionStorage (session-only)
      try {
        sessionStorage.setItem(SESSION_LAST_KEY, JSON.stringify(q));
      } catch (err) { /* ignore */ }
      renderLastViewed();
    });

    actions.appendChild(viewBtn);
    actions.appendChild(removeBtn);

    li.appendChild(textWrap);
    li.appendChild(actions);
    quoteList.appendChild(li);
  });
}

/* show a quote in the top display area */
function showQuote(q) {
  quoteDisplay.innerHTML = `<strong>${escapeHtml(q.category)}</strong>: "${escapeHtml(q.text)}" <div style="margin-top:6px;color:#475569">— ${escapeHtml(q.author || "Unknown")}</div>`;
}

/* show a random quote and store as last viewed in sessionStorage */
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  const q = quotes[idx];
  showQuote(q);
  try {
    sessionStorage.setItem(SESSION_LAST_KEY, JSON.stringify(q));
  } catch (err) { /* ignore */ }
  renderLastViewed();
}

/* display last viewed from sessionStorage (if present) */
function renderLastViewed() {
  try {
    const raw = sessionStorage.getItem(SESSION_LAST_KEY);
    if (!raw) {
      lastViewedNote.textContent = "";
      return;
    }
    const obj = JSON.parse(raw);
    lastViewedNote.textContent = `Last viewed (this session): ${obj.category} — "${obj.text}"`;
  } catch (err) {
    console.warn("Could not read last viewed:", err);
    lastViewedNote.textContent = "";
  }
}

/* remove a quote by index and persist */
function removeQuote(index) {
  if (index < 0 || index >= quotes.length) return;
  if (!confirm("Remove this quote?")) return;
  quotes.splice(index, 1);
  saveQuotesToLocalStorage();
  displayQuotes();
}

/* ===========================
   Add Quote Form (dynamic)
   =========================== */
function createAddQuoteForm() {
  formContainer.innerHTML = ""; // clear any existing form

  const form = document.createElement("form");
  form.style.display = "flex";
  form.style.gap = "8px";
  form.style.marginTop = "12px";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Quote text";
  quoteInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Category (e.g. Inspiration)";
  categoryInput.required = true;

  const authorInput = document.createElement("input");
  authorInput.type = "text";
  authorInput.placeholder = "Author (optional)";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Add";

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(authorInput);
  form.appendChild(submit);

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const newQ = {
      text: quoteInput.value.trim(),
      category: categoryInput.value.trim() || "Uncategorized",
      author: authorInput.value.trim()
    };

    if (!newQ.text) {
      alert("Please enter quote text.");
      return;
    }

    quotes.push(newQ);
    saveQuotesToLocalStorage();
    displayQuotes();
    form.reset();
    alert("Quote added and saved.");
  });

  formContainer.appendChild(form);
}

/* ===========================
   Export / Import JSON
   =========================== */

/* Export current quotes array to a downloadable JSON file */
function exportQuotesToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes_export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    // free memory
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed. See console for details.");
  }
}

/* Import from JSON file input (merges into existing quotes) */
function importFromJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (!Array.isArray(imported)) {
        alert("Imported JSON must be an array of quote objects.");
        return;
      }

      // Validate and clean items before merging
      const valid = imported.filter(item => {
        return item && typeof item.text === "string" && item.text.trim().length > 0;
      }).map(item => ({
        text: String(item.text).trim(),
        category: String(item.category || "Uncategorized").trim(),
        author: item.author ? String(item.author).trim() : ""
      }));

      if (valid.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }

      // Merge and save
      quotes.push(...valid);
      saveQuotesToLocalStorage();
      displayQuotes();
      alert(`${valid.length} quotes imported successfully.`);
    } catch (err) {
      console.error("Failed to import JSON:", err);
      alert("Failed to import JSON. Make sure the file contains a valid JSON array of quote objects.");
    }
  };
  reader.readAsText(file);
}

/* ===========================
   Utilities
   =========================== */
function escapeHtml(str) {
  if (!str) return "";
  return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

/* ===========================
   Event bindings
   =========================== */
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", createAddQuoteForm);
exportBtn.addEventListener("click", exportQuotesToJson);
importFile.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) importFromJsonFile(f);
  // reset input so the same file can be selected again if needed
  importFile.value = "";
});
clearStorageBtn.addEventListener("click", function() {
  if (!confirm("This will remove all saved quotes from localStorage (not in-memory defaults). Continue?")) return;
  localStorage.removeItem(LS_KEY);
  // reload defaults (or keep empty)
  quotes = [];
  displayQuotes();
  alert("Saved quotes cleared. (In-memory quotes are now empty.)");
});

/* ===========================
   Initial render
   =========================== */
displayQuotes();
renderLastViewed();
