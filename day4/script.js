// 1. Select the required HTML elements
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

// 2. Define localStorage keys
const DRAFT_KEY = "quicknotes-day4-draft";
const THEME_KEY = "quicknotes-day4-theme";

const MAX_CHARACTERS = 200;
const WARNING_LIMIT = 180;

// 3. Update the character and word counters
function updateCounts() {
const text = noteText.value;
const characters = text.length;

// Count words, ignoring extra spaces and empty input
const trimmedText = text.trim();
const words = trimmedText === ""
? 0
: trimmedText.split(/\s+/).length;

// Update the displayed counters
charCount.textContent = `${characters} / ${MAX_CHARACTERS} characters`;
wordCount.textContent = `${words} words`;

// Remove previous counter warning classes
charCount.classList.remove("warning", "over");

// Apply the appropriate class
if (characters > MAX_CHARACTERS) {
charCount.classList.add("over");
} else if (characters > WARNING_LIMIT) {
charCount.classList.add("warning");
}
}

// 4. Save the current draft
function saveDraft() {
localStorage.setItem(DRAFT_KEY, noteText.value);
}

// 5. Clear the note, counters, and saved draft
function clearNote() {
noteText.value = "";

localStorage.removeItem(DRAFT_KEY);

updateCounts();

noteText.focus();
}

// 6. Update the theme button label
function updateThemeButton() {
const isDark = document.body.classList.contains("dark");

themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

// 7. Apply and remember the selected theme
function setTheme(isDark) {
document.body.classList.toggle("dark", isDark);

updateThemeButton();

localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

// 8. Handle every textarea input event
noteText.addEventListener("input", () => {
updateCounts();
saveDraft();
});

// 9. Clear button event
clearBtn.addEventListener("click", () => {
clearNote();
});

// 10. Pressing Escape clears the note
noteText.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
event.preventDefault();
clearNote();
}
});

// 11. Toggle between light and dark themes
themeToggle.addEventListener("click", () => {
const isCurrentlyDark = document.body.classList.contains("dark");

setTheme(!isCurrentlyDark);
});

// 12. Restore the draft and theme when the page loads
function initializeApp() {
const savedDraft = localStorage.getItem(DRAFT_KEY);
const savedTheme = localStorage.getItem(THEME_KEY);

// Restore the saved note
if (savedDraft !== null) {
noteText.value = savedDraft;
}

// Restore the saved theme
if (savedTheme === "dark") {
document.body.classList.add("dark");
} else {
document.body.classList.remove("dark");
}

updateThemeButton();

// Update counters using the restored text
updateCounts();

// Ensure the current draft is saved
saveDraft();
}

// 13. Initialize the application
initializeApp();
