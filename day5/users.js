const API_URL = "https://jsonplaceholder.typicode.com/users";

// Select the HTML elements.
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Store all users returned by the API.
let users = [];

// Display users in the HTML list.
function renderUsers(list) {
// Remove the previously displayed users.
usersList.replaceChildren();

// Show a message if no users match the current filter.
if (list.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "No users match your filter.";
    usersList.appendChild(listItem);
    return;
}

// Create a list item for each user.
list.forEach((user) => {
    const listItem = document.createElement("li");

    const name = document.createElement("h3");
    name.textContent = user.name;

    const email = document.createElement("p");
    email.textContent = `Email: ${user.email}`;

    const city = document.createElement("p");
    city.textContent = `City: ${user.address.city}`;

    const company = document.createElement("p");
    company.textContent = `Company: ${user.company.name}`;

    listItem.appendChild(name);
    listItem.appendChild(email);
    listItem.appendChild(city);
    listItem.appendChild(company);

    usersList.appendChild(listItem);
});

}

// Fetch users from the API.
async function loadUsers() {
// Clear previous results and show the loading state.
loadButton.disabled = true;
statusMessage.textContent = "Loading users...";
usersList.replaceChildren();

try {
    const response = await fetch(API_URL);

    // fetch() does not automatically throw for HTTP errors.
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    // Convert the response body from JSON into JavaScript data.
    const data = await response.json();

    // Store the loaded users.
    users = data;

    // Apply the current filter without making another request.
    const searchText = filterInput.value.trim().toLowerCase();

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchText)
    );

    renderUsers(filteredUsers);

    statusMessage.textContent =
        `Successfully loaded ${users.length} users.`;
} catch (error) {
    // Clear stale data so filtering cannot display old results.
    users = [];
    usersList.replaceChildren();

    statusMessage.textContent =
        "Error loading users. Please check your connection and try again.";

    console.error("Error loading users:", error);
} finally {
    // Always re-enable the button, whether the request succeeds or fails.
    loadButton.disabled = false;
}

}

// Load users when the button is clicked.
loadButton.addEventListener("click", loadUsers);

// Filter the stored users whenever the input changes.
// This does not make another API request.
filterInput.addEventListener("input", () => {
const searchText = filterInput.value.trim().toLowerCase();


const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchText)
);

renderUsers(filteredUsers);

});
