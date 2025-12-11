// DATA: Quotes with categories
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Dream big and dare to fail.", category: "Inspiration" },
];

// SELECT IMPORTANT ELEMENTS
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const formContainer = document.getElementById("formContainer");
const quoteList = document.getElementById("quoteList");


// FUNCTION: Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const selectedQuote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p><strong>${selectedQuote.category}:</strong> ${selectedQuote.text}</p>
  `;
}

newQuoteBtn.addEventListener("click", showRandomQuote);


// FUNCTION: Display all quotes in a list
function displayQuotes() {
  quoteList.innerHTML = "";  // Clear previous list

  quotes.forEach((q, index) => {
    const li = document.createElement("li");
    li.textContent = `${q.category}: ${q.text}`;
    quoteList.appendChild(li);
  });
}

// Call initially to show default quotes
displayQuotes();


// FUNCTION: Create a form dynamically for adding new quote
function createAddQuoteForm() {

  // Clear previous form (if it exists)
  formContainer.innerHTML = "";

  const form = document.createElement("form");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter quote text";
  quoteInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter category";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Add Quote";
  submitBtn.type = "submit";

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);

  formContainer.appendChild(form);

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const newQuote = {
      text: quoteInput.value,
      category: categoryInput.value
    };

    // Add to array
    quotes.push(newQuote);

    // Update list visually
    displayQuotes();

    alert("Quote added successfully!");

    form.reset();
  });
}

addQuoteBtn.addEventListener("click", createAddQuoteForm);
