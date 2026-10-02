let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];


// 1. searchNotes(word)
// Returns an array of notes whose text contains the word.
// Search is case-insensitive.
function searchNotes(word) {
  return notes.filter(note =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}


// Test 1A: searchNotes() - normal case
console.log(searchNotes("javascript"));
// Expected: [{ id: 4, text: "Revise JavaScript arrays", category: "study" }]

// Test 1B: searchNotes() - edge case
console.log(searchNotes("pizza"));
// Expected: []


// 2. longestNote()
// Returns the note with the most characters.
// Returns null if there are no notes.
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  return notes.reduce((longest, note) => {
    return note.text.length > longest.text.length
      ? note
      : longest;
  });
}


// Test 2A: longestNote() - normal case
console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

// Test 2B: longestNote() - edge case
let savedNotes = notes;
notes = [];

console.log(longestNote());
// Expected: null

notes = savedNotes;


// 3. countByCategory()
// Returns an object counting notes in each category.
function countByCategory() {
  const counts = {
    personal: 0,
    work: 0,
    study: 0
  };

  notes.forEach(note => {
    counts[note.category]++;
  });

  return counts;
}


// Test 3A: countByCategory() - normal case
console.log(countByCategory());
// Expected: { personal: 2, work: 1, study: 2 }

// Test 3B: countByCategory() - edge case
notes = [];

console.log(countByCategory());
// Expected: { personal: 0, work: 0, study: 0 }

notes = savedNotes;


// 4. getSummary()
// Returns a sentence summarising the notes.
function getSummary() {
  const counts = countByCategory();

  const noteWord = notes.length === 1 ? "note" : "notes";

  return `${notes.length} ${noteWord}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}


// Test 4A: getSummary() - normal case
console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."

// Test 4B: getSummary() - edge case
notes = [savedNotes[0]];

console.log(getSummary());
// Expected: "1 note: 1 personal, 0 work, 0 study."

notes = savedNotes;


// 5. isDuplicate(text)
// Checks whether a note with the same text already exists.
// Ignores case and extra spaces.
function isDuplicate(text) {
  const normalise = value =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const cleanedText = normalise(text);

  return notes.some(note =>
    normalise(note.text) === cleanedText
  );
}


// Test 5A: isDuplicate() - normal case
console.log(isDuplicate("  CALL   MUM  "));
// Expected: true

// Test 5B: isDuplicate() - edge case
console.log(isDuplicate("Go for a walk"));
// Expected: false


// 6. addNote()
// Adds a note only if:
// - text is 1–200 characters
// - text is not a duplicate
// - category is personal, work, or study
function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];

  // Check text
  if (typeof text !== "string" || text.trim().length === 0) {
    console.log("Note was not added: text cannot be empty.");
    return false;
  }

  if (text.trim().length > 200) {
    console.log("Note was not added: text must be 200 characters or less.");
    return false;
  }

  // Check duplicate
  if (isDuplicate(text)) {
    console.log("Note was not added: duplicate note.");
    return false;
  }

  // Check category
  if (!validCategories.includes(category)) {
    console.log(
      "Note was not added: category must be personal, work, or study."
    );
    return false;
  }

  // Add the note
  const newNote = {
    id: notes.length + 1,
    text: text.trim(),
    category: category
  };

  notes.push(newNote);

  console.log("Note added successfully.");
  return true;
}


// Test 6A: addNote() - normal case
console.log(addNote("Learn Git and GitHub", "study"));
// Expected: true

// Test 6B: addNote() - edge case / duplicate
console.log(addNote("  BUY   MILK AND BREAD  ", "personal"));
// Expected: false


// Test 6C: addNote() - invalid category
console.log(addNote("Go for a walk", "fitness"));
// Expected: false


// Test 6D: addNote() - empty text
console.log(addNote("", "personal"));
// Expected: false


// Show final notes
console.log(notes);