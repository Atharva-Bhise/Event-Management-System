const themeToggle = document.getElementById("theme-toggle");
const logoutBtn = document.querySelector("#logout");
const confirmationOptions = document.querySelector("#confirmation-options");
const confirmed = document.querySelector("#confirmed");
const no = document.querySelector("#no");
const loadingScreen = document.querySelector("#loading-screen");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const sidebar = document.querySelector(".sidebar");
const adminDashboard = document.getElementById("adminDashboard");

const body = document.body;
// Validation function
function validations(td, index) {
  let input = td.querySelector("input, select");
  if (!input) {
    console.error("Input element is missing");
    return false;
  }

  const value = input.value.trim();
  switch (index) {
    case 1: // Organizer Name
      const namePattern = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s[A-Z][a-z]+$/;
      if (!namePattern.test(value)) {
        showSlideMessage("Name Should Contain At Least First-Last Name With Space In-Between And, Capitalized");
        return false;
      }
      break;
    case 2: // Organizer Phone
      const phoneRegex = /^(\+?\d{1,4})?[-.\s]?(\d{10})$/;
      if (!phoneRegex.test(value)) {
        showSlideMessage("Phone Number Should Be 10 Digits with Optional Country Code(+123-PhoneNumber)");
        return false;
      }
      break;
    case 4: // Organizer Login ID
      const usernameRegex = /^[a-zA-Z0-9@]+$/;
      if (!usernameRegex.test(value)) {
        showSlideMessage("Username Should Contain Alphanumeric Characters OR Only '@' Symbol.");
        return false;
      }
      break;
    case 5: // Organizer Login Password
      const passwordValue = value;
      const alphanumericRegex = /^[a-zA-Z0-9@]+$/; // Allow only letters and numbers
      if (passwordValue.length < 8 || passwordValue.length > 15) {
        showSlideMessage("Password Must Be Between 8 And 15 Characters Long.");
        return false;
      }
      if (!alphanumericRegex.test(passwordValue)) {
        showSlideMessage("Password Must Contain Only Letters And Numbers OR Only '@' Symbol.");
        return false;
      }
      break;
    case 6: // Organizer Email
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        showSlideMessage("Invalid Email");
        return false;
      }
      break;
    default:
      break;
  }

  return true; // All validations passed
}

// Function to show the slide-in message
function showSlideMessage(message) {
  const messageElement = document.getElementById('slideMessage');

  // Set the message text
  messageElement.textContent = message;

  // Add the visible class to show the message
  messageElement.classList.remove('hidden');
  messageElement.classList.add('visible');

  // Remove the message after the specified duration
  setTimeout(() => {
    messageElement.classList.remove('visible');
    messageElement.classList.add('hidden');
  }, 3000);
}
// Check if dark mode was previously selected
if (localStorage.getItem("dark-mode") === "enabled") {
  body.classList.add("dark-mode");
  themeToggle.checked = true;
}

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    body.classList.add("dark-mode");
    localStorage.setItem("dark-mode", "enabled");
  } else {
    body.classList.remove("dark-mode");
    localStorage.setItem("dark-mode", "disabled");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const homeTab = document.getElementById("homeTab");
  const manageOrganizersTab = document.getElementById("manageOrganizersTab");
  const organizerTableContainer = document.getElementById("organizerTableContainer");

  const manageUsersTab = document.getElementById("manageUsersTab");
  const userTableContainer = document.getElementById("userTableContainer");

  const homeLink = document.querySelector(".home");
  const manageOrgLink = document.querySelector(".manageOrganizers");
  const manageUserLink = document.querySelector(".manageUsers");


  function showTab(tabToShow) {
    homeTab.style.display = "none";
    manageOrganizersTab.style.display = "none";
    manageUsersTab.style.display = "none";
    tabToShow.style.display = "block";
  }

  homeLink.addEventListener("click", function (event) {
    event.preventDefault();
    homeLink.classList.add("active");
    manageOrgLink.classList.remove("active");
    manageUserLink.classList.remove("active");
    showTab(homeTab);
  });

  manageOrgLink.addEventListener("click", function (event) {
    event.preventDefault();
    manageOrgLink.classList.add("active");
    homeLink.classList.remove("active");
    manageUserLink.classList.remove("active");
    showTab(manageOrganizersTab);
    fetchOrganizerDetails();
  });

  
  manageUserLink.addEventListener("click", function (event) {
    event.preventDefault();
    manageUserLink.classList.add("active");
    homeLink.classList.remove("active");
    manageOrgLink.classList.remove("active");
    showTab(manageUsersTab);
    fetchUsersDetails();
  });

  // Show the home tab by default when the page loads
  showTab(homeTab);

  // Function to fetch and display organizer details
  function fetchOrganizerDetails() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "../php/ManageOrganizerDetailsProcess.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({}));
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          const organizers = JSON.parse(xhr.responseText);
          if (!Array.isArray(organizers)) {
            throw new Error("Invalid response format");
          }
          let tableHtml = `
            <table class="table table-striped table-sm">
            <thead class="table-dark">
              <tr>
                <th>Organizer ID</th>
                <th>Organizer Name</th>
                <th>Organizer Phone</th>
                <th>Login SR No</th>
                <th>Organizer Login ID</th>
                <th class="two-lines-column">Organizer Login Password</th>
                <th>Organizer Email</th>
                <th>Organizer Address</th>
                <th>Organizer City</th>
                <th>Organizer DOB</th>
                <th>Organizer Gender</th>
                <th colspan="2" class="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${organizers.map(organizer => `
                <tr>
                  <td>${organizer.organizer_id}</td>
                  <td>${organizer.organizer_name}</td>
                  <td>${organizer.organizer_phone}</td>
                  <td>${organizer.login_sr_no}</td>
                  <td>${organizer.organizer_login_id}</td>
                  <td class="two-lines-column">${organizer.organizer_login_password}</td>
                  <td>${organizer.organizer_email}</td>
                  <td>${organizer.organizer_address}</td>
                  <td>${organizer.organizer_city}</td>
                  <td>${organizer.organizer_dob}</td>
                  <td>${organizer.organizer_gender}</td>
                  <td class="actions-column"><span class="fa-regular fa-pen-to-square edit"></span></td>
                  <td class="actions-column"><span class="fa-solid fa-trash delete"></span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          `;
          organizerTableContainer.innerHTML = tableHtml;

          // Add event listener for edit buttons
          document.querySelectorAll(".edit").forEach(editBtn => {
            editBtn.addEventListener("click", function () {
              let row = editBtn.closest("tr");
              let isInEditMode = row.classList.toggle("editing");

              console.log("Edit button clicked. Edit mode:", isInEditMode);

              if (isInEditMode) {
                // Add click event listeners to each td to make them editable
                row.querySelectorAll("td").forEach((td, index) => {
                  if (index !== 0 && index !== 3 && index < 11) { // Skip the action columns and non-editable columns
                    td.addEventListener("click", makeEditable);
                  }
                });
                editBtn.classList.add("editing-mode"); // Change edit button color to indicate edit mode
              } else {
                // Save changes and remove event listeners
                let formData = new FormData(); // Create a FormData object

                const columnNames = {
                  1: "organizer_name",
                  2: "organizer_phone",
                  4: "organizer_login_id",
                  5: "organizer_login_password",
                  6: "organizer_email",
                  7: "organizer_address",
                  8: "organizer_city",
                  9: "organizer_dob",
                  10: "organizer_gender"
                };

                formData.append("organizer_id", row.cells[0].innerText); // Add organizer_id to FormData

                row.querySelectorAll("td").forEach((td, index) => {
                  if (td.classList.contains("editing")) {
                    let input = td.querySelector("input, select");
                    if (input) {
                      if (validations(td, index)) {
                        td.innerText = input.value.trim() !== "" ? input.value.trim() : "N/A"; // Prevent empty cells
                        td.classList.remove("editing");
                        formData.append(columnNames[index], input.value.trim()); // Add value to FormData
                      } else {
                        td.classList.remove("editing");
                        setTimeout(() => {
                          showSlideMessage("Updation Failed! Please Check The Fields And Try Again.");
                        }, 4000);
                      }
                    }
                  } else {
                    // Restore original text content if not edited
                    let originalText = td.getAttribute("data-original-text");
                    if (originalText !== null) {
                      td.innerHTML = originalText;
                      td.removeAttribute("data-original-text");
                    }
                  }
                  td.removeEventListener("click", makeEditable);
                });
                editBtn.classList.remove("editing-mode"); // Reset edit button color

                // Log the FormData to the console
                for (let [key, value] of formData.entries()) {
                  console.log(`${key}: ${value}`);
                }

                // Send the FormData to the server
                const updateRequest = new XMLHttpRequest();
                updateRequest.open("POST", "../php/UpdateOrganizerDetailsProcess.php", true);
                updateRequest.setRequestHeader("Content-Type", "application/json");
                updateRequest.onreadystatechange = function () {
                  if (updateRequest.readyState === 4 && updateRequest.status === 200) {
                    const response = JSON.parse(updateRequest.responseText);
                    if (response.status === "success") {
                      showSlideMessage(response.message);
                    } else if (response.status === "error") {
                      setTimeout(() => {
                        showSlideMessage(response.message);
                      }, 8000);                      
                      console.error("Failed to update organizer details:" + response.message);
                    } else if (response.status === "empty") {
                      setTimeout(() => {
                        showSlideMessage(response.message);
                      }, 8000);                    
                    } else {
                      console.error("Failed to update organizer details");
                    }
                  }
                };

                // Convert FormData to JSON
                const formDataObject = {};
                formData.forEach((value, key) => {
                  formDataObject[key] = value;
                });
                const jsonData = JSON.stringify(formDataObject);

                updateRequest.send(jsonData);

                // Log the row data to the console
                let rowData = Array.from(row.querySelectorAll("td")).map(td => td.innerText);
                console.log("Row data after edit mode:", rowData);
              
              }
            });

          });
          
          // Event delegation for delete button
          document.querySelectorAll('.delete').forEach(deleteBtn => {
            deleteBtn.addEventListener("click", function () {
              let row = deleteBtn.closest("tr");
              if (!row) return console.error(`Row not found! Event target: ${e.target.tagName}, Event type: ${e.type}, Context: Delete button click handler`);
          
              let organizerId = row.cells[0].innerText;
              let loginSrNo = row.cells[3].innerText;
              if (!organizerId) return console.error("Organizer ID not found!");
          
              // Toggle confirmation buttons
              let existingConfirmBtn = row.querySelector('.confirm-btn');
              let existingCancelBtn = row.querySelector('.cancel-btn');
          
              if (existingConfirmBtn && existingCancelBtn) {
                existingConfirmBtn.remove();
                existingCancelBtn.remove();
                deleteBtn.style.display = 'inline'; // Show the delete button again
                return;
              }
          
              // Create confirmation buttons
              let confirmBtn = document.createElement('span');
              confirmBtn.className = 'confirm-btn';
              confirmBtn.style.backgroundColor = 'red';
              confirmBtn.style.color = 'white';
              confirmBtn.style.cursor = 'pointer';
              confirmBtn.style.marginLeft = '0px';
              confirmBtn.style.padding = '5px';
              confirmBtn.textContent = 'CONFIRM';
              confirmBtn.style.fontSize = '0.7rem';
          
              let cancelBtn = document.createElement('span');
              cancelBtn.className = 'cancel-btn';
              cancelBtn.style.backgroundColor = 'green';
              cancelBtn.style.color = 'white';
              cancelBtn.style.cursor = 'pointer';
              cancelBtn.style.marginLeft = '0px';
              cancelBtn.style.padding = '5px';
              cancelBtn.textContent = 'CANCEL';
              cancelBtn.style.fontSize = '0.8rem';
          
              let actionsContainer = deleteBtn.closest('.actions-column');
              actionsContainer.appendChild(confirmBtn);
              actionsContainer.appendChild(cancelBtn);
          
              // Hide the delete button
              deleteBtn.style.display = 'none';
          
              // Event listener for confirm button
              confirmBtn.addEventListener('click', function () {
                // Log the row details for debugging
                console.log("Row to be deleted:", {
                  organizerId: row.cells[0].innerText,
                  organizerName: row.cells[1].innerText,
                  organizerPhone: row.cells[2].innerText,
                  loginSrNo: row.cells[3].innerText,
                  organizerLoginId: row.cells[4].innerText,
                  organizerLoginPassword: row.cells[5].innerText,
                  organizerEmail: row.cells[6].innerText,
                  organizerAddress: row.cells[7].innerText,
                  organizerCity: row.cells[8].innerText,
                  organizerDob: row.cells[9].innerText,
                  organizerGender: row.cells[10].innerText
                });
          
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "../php/DeleteOrganizerProcess.php", true);
                xhr.setRequestHeader("Content-Type", "application/json");
          
                xhr.onreadystatechange = function () {
                  if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                      try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.status === "success") {
                          showSlideMessage(response.message);
                          console.log("Deleting row:", row); // Log the row being deleted
                          row.remove(); // Remove the row from the DOM
                        } else {
                          showSlideMessage(response.message);
                        }
                      } catch (e) {
                        console.error("Invalid server response:", e);
                      }
                    } else {
                      console.error("Request failed with status:", xhr.status);
                    }
                  }
                };
          
                xhr.onerror = function () {
                  alert("Request failed due to a network error.");
                };
          
                xhr.send(JSON.stringify({ organizerId, loginSrNo }));
                confirmBtn.remove(); // Remove the confirm button
                cancelBtn.remove(); // Remove the cancel button
              });
          
              // Event listener for cancel button
              cancelBtn.addEventListener('click', function () {
                confirmBtn.remove(); // Remove the confirm button
                cancelBtn.remove(); // Remove the cancel button
                deleteBtn.style.display = 'inline'; // Show the delete button again
              });
            });
          });
          
        } catch (error) {
          console.error("Failed to parse response:", error);
        }
      } else {
        console.error("Failed to fetch organizer details");
      }
    };
  
  
    let searchText = ""; // Store typed characters
    let searchActive = false; // Track if searching mode is active

    document.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
            event.preventDefault(); // Prevent default tab behavior
            if (searchActive) {
                removeHighlight(); // If already searching, remove highlight
                searchActive = false;
                searchText = "";
            } else {
                searchActive = true; // Activate search mode
                searchText = "";
            }
            return;
        }
    
        if (!searchActive) return; // Only allow typing when search mode is active
    
        if (event.key.length === 1 || event.key === "Backspace") {
            if (event.key === "Backspace") {
                searchText = searchText.slice(0, -1);
            } else {
                searchText += event.key.toLowerCase();
            }
    
            highlightMatchingRow(searchText);
        }
    });
    
    function highlightMatchingRow(text) {
        let rows = document.querySelectorAll("tbody tr");
        let found = false;
    
        rows.forEach(row => {
            let idCell = row.cells[0]; // Organizer ID (1st column)
            let nameCell = row.cells[1]; // Organizer Name (2nd column)
    
            if (idCell && nameCell) {
                let idText = idCell.textContent.trim().toLowerCase();
                let nameText = nameCell.textContent.trim().toLowerCase();
    
                if ((idText.startsWith(text) || nameText.startsWith(text)) && text.length > 0) {
                    row.classList.add("highlight");
                    row.scrollIntoView({ behavior: "smooth", block: "center" });
                    found = true;
                } else {
                    row.classList.remove("highlight");
                }
            }
        });
    }
    
    function removeHighlight() {
        document.querySelectorAll("tbody tr").forEach(row => row.classList.remove("highlight"));
    }
    
  }

  function fetchUsersDetails() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "../php/ManageUserDetailsProcess.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({}));
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          const users = JSON.parse(xhr.responseText);
          if (!Array.isArray(users)) {
            throw new Error("Invalid response format");
          }
          let tableHtml = `
            <table class="table table-striped table-sm">
            <thead class="table-dark">
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>User Phone</th>
                <th>Login SR No</th>
                <th>User Login ID</th>
                <th class="two-lines-column">User Login Password</th>
                <th>User Email</th>
                <th>User Address</th>
                <th>User City</th>
                <th>User DOB</th>
                <th>User Gender</th>
                <th colspan="2" class="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(user => `
                <tr>
                  <td>${user.user_id}</td>
                  <td>${user.user_name}</td>
                  <td>${user.user_phone}</td>
                  <td>${user.login_sr_no}</td>
                  <td>${user.user_login_id}</td>
                  <td class="two-lines-column">${user.user_login_password}</td>
                  <td>${user.user_email}</td>
                  <td>${user.user_address}</td>
                  <td>${user.user_city}</td>
                  <td>${user.user_dob}</td>
                  <td>${user.user_gender}</td>
                  <td class="actions-column"><span class="fa-regular fa-pen-to-square edit"></span></td>
                  <td class="actions-column"><span class="fa-solid fa-trash delete"></span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          `;
          userTableContainer.innerHTML = tableHtml;
  
          // Add event listener for edit buttons
          document.querySelectorAll(".edit").forEach(editBtn => {
            editBtn.addEventListener("click", function () {
              let row = editBtn.closest("tr");
              let isInEditMode = row.classList.toggle("editing");
  
              console.log("Edit button clicked. Edit mode:", isInEditMode);
  
              if (isInEditMode) {
                // Add click event listeners to each td to make them editable
                row.querySelectorAll("td").forEach((td, index) => {
                  if (index !== 0 && index !== 3 && index < 11) { // Skip the action columns and non-editable columns
                    td.addEventListener("click", makeEditable);
                  }
                });
                editBtn.classList.add("editing-mode"); // Change edit button color to indicate edit mode
              } else {
                // Save changes and remove event listeners
                let formData = new FormData(); // Create a FormData object
  
                const columnNames = {
                  1: "user_name",
                  2: "user_phone",
                  4: "user_login_id",
                  5: "user_login_password",
                  6: "user_email",
                  7: "user_address",
                  8: "user_city",
                  9: "user_dob",
                  10: "user_gender"
                };
  
                formData.append("user_id", row.cells[0].innerText); // Add user_id to FormData
  
                row.querySelectorAll("td").forEach((td, index) => {
                  if (td.classList.contains("editing")) {
                    let input = td.querySelector("input, select");
                    if (input) {
                      if (validations(td, index)) {
                        td.innerText = input.value.trim() !== "" ? input.value.trim() : "N/A"; // Prevent empty cells
                        td.classList.remove("editing");
                        formData.append(columnNames[index], input.value.trim()); // Add value to FormData
                      } else {
                        td.classList.remove("editing");
                        setTimeout(() => {
                          showSlideMessage("Updation Failed! Please Check The Fields And Try Again.");
                        }, 4000);
                      }
                    }
                  } else {
                    // Restore original text content if not edited
                    let originalText = td.getAttribute("data-original-text");
                    if (originalText !== null) {
                      td.innerHTML = originalText;
                      td.removeAttribute("data-original-text");
                    }
                  }
                  td.removeEventListener("click", makeEditable);
                });
                editBtn.classList.remove("editing-mode"); // Reset edit button color
  
                // Log the FormData to the console
                for (let [key, value] of formData.entries()) {
                  console.log(`${key}: ${value}`);
                }
  
                // Send the FormData to the server
                const updateRequest = new XMLHttpRequest();
                updateRequest.open("POST", "../php/UpdateUserDetailsProcess.php", true);
                updateRequest.setRequestHeader("Content-Type", "application/json");
                updateRequest.onreadystatechange = function () {
                  if (updateRequest.readyState === 4 && updateRequest.status === 200) {
                    const response = JSON.parse(updateRequest.responseText);
                    if (response.status === "success") {
                      showSlideMessage(response.message);
                    } else if (response.status === "error") {
                      setTimeout(() => {
                        showSlideMessage(response.message);
                      }, 8000);                      
                      console.error("Failed to update user details:" + response.message);
                    } else if (response.status === "empty") {
                      setTimeout(() => {
                        showSlideMessage(response.message);
                      }, 8000);                    
                    } else {
                      console.error("Failed to update user details");
                    }
                  }
                };
  
                // Convert FormData to JSON
                const formDataObject = {};
                formData.forEach((value, key) => {
                  formDataObject[key] = value;
                });
                const jsonData = JSON.stringify(formDataObject);
  
                updateRequest.send(jsonData);
  
                // Log the row data to the console
                let rowData = Array.from(row.querySelectorAll("td")).map(td => td.innerText);
                console.log("Row data after edit mode:", rowData);
              
              }
            });
  
          });
          
          // Event delegation for delete button
          document.querySelectorAll('.delete').forEach(deleteBtn => {
            deleteBtn.addEventListener("click", function () {
              let row = deleteBtn.closest("tr");
              if (!row) return console.error(`Row not found! Event target: ${e.target.tagName}, Event type: ${e.type}, Context: Delete button click handler`);
          
              let userId = row.cells[0].innerText;
              let loginSrNo = row.cells[3].innerText;
              if (!userId) return console.error("User ID not found!");
          
              // Toggle confirmation buttons
              let existingConfirmBtn = row.querySelector('.confirm-btn');
              let existingCancelBtn = row.querySelector('.cancel-btn');
          
              if (existingConfirmBtn && existingCancelBtn) {
                existingConfirmBtn.remove();
                existingCancelBtn.remove();
                deleteBtn.style.display = 'inline'; // Show the delete button again
                return;
              }
          
              // Create confirmation buttons
              let confirmBtn = document.createElement('span');
              confirmBtn.className = 'confirm-btn';
              confirmBtn.style.backgroundColor = 'red';
              confirmBtn.style.color = 'white';
              confirmBtn.style.cursor = 'pointer';
              confirmBtn.style.marginLeft = '0px';
              confirmBtn.style.padding = '5px';
              confirmBtn.textContent = 'CONFIRM';
              confirmBtn.style.fontSize = '0.7rem';
          
              let cancelBtn = document.createElement('span');
              cancelBtn.className = 'cancel-btn';
              cancelBtn.style.backgroundColor = 'green';
              cancelBtn.style.color = 'white';
              cancelBtn.style.cursor = 'pointer';
              cancelBtn.style.marginLeft = '0px';
              cancelBtn.style.padding = '5px';
              cancelBtn.textContent = 'CANCEL';
              cancelBtn.style.fontSize = '0.8rem';
          
              let actionsContainer = deleteBtn.closest('.actions-column');
              actionsContainer.appendChild(confirmBtn);
              actionsContainer.appendChild(cancelBtn);
          
              // Hide the delete button
              deleteBtn.style.display = 'none';
          
              // Event listener for confirm button
              confirmBtn.addEventListener('click', function () {
                // Log the row details for debugging
                console.log("Row to be deleted:", {
                  userId: row.cells[0].innerText,
                  userName: row.cells[1].innerText,
                  userPhone: row.cells[2].innerText,
                  loginSrNo: row.cells[3].innerText,
                  userLoginId: row.cells[4].innerText,
                  userLoginPassword: row.cells[5].innerText,
                  userEmail: row.cells[6].innerText,
                  userAddress: row.cells[7].innerText,
                  userCity: row.cells[8].innerText,
                  userDob: row.cells[9].innerText,
                  userGender: row.cells[10].innerText
                });
          
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "../php/DeleteUserProcess.php", true);
                xhr.setRequestHeader("Content-Type", "application/json");
          
                xhr.onreadystatechange = function () {
                  if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                      try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.status === "success") {
                          showSlideMessage(response.message);
                          console.log("Deleting row:", row); // Log the row being deleted
                          row.remove(); // Remove the row from the DOM
                        } else {
                          showSlideMessage(response.message);
                        }
                      } catch (e) {
                        console.error("Invalid server response:", e);
                      }
                    } else {
                      console.error("Request failed with status:", xhr.status);
                    }
                  }
                };
          
                xhr.onerror = function () {
                  alert("Request failed due to a network error.");
                };
          
                xhr.send(JSON.stringify({ userId, loginSrNo }));
                confirmBtn.remove(); // Remove the confirm button
                cancelBtn.remove(); // Remove the cancel button
              });
          
              // Event listener for cancel button
              cancelBtn.addEventListener('click', function () {
                confirmBtn.remove(); // Remove the confirm button
                cancelBtn.remove(); // Remove the cancel button
                deleteBtn.style.display = 'inline'; // Show the delete button again
              });
            });
          });
          
        } catch (error) {
          console.error("Failed to parse response:", error);
        }
      } else {
        console.error("Failed to fetch user details");
      }
    };

    let searchText = ""; // Store typed characters
    let searchActive = false; // Track if searching mode is active

    document.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
            event.preventDefault(); // Prevent default tab behavior
            if (searchActive) {
                removeHighlight(); // If already searching, remove highlight
                searchActive = false;
                searchText = "";
            } else {
                searchActive = true; // Activate search mode
                searchText = "";
            }
            return;
        }
    
        if (!searchActive) return; // Only allow typing when search mode is active
    
        if (event.key.length === 1 || event.key === "Backspace") {
            if (event.key === "Backspace") {
                searchText = searchText.slice(0, -1);
            } else {
                searchText += event.key.toLowerCase();
            }
    
            highlightMatchingRow(searchText);
        }
    });
    
    function highlightMatchingRow(text) {
        let rows = document.querySelectorAll("tbody tr");
        let found = false;
    
        rows.forEach(row => {
            let idCell = row.cells[0]; // Organizer ID (1st column)
            let nameCell = row.cells[1]; // Organizer Name (2nd column)
    
            if (idCell && nameCell) {
                let idText = idCell.textContent.trim().toLowerCase();
                let nameText = nameCell.textContent.trim().toLowerCase();
    
                if ((idText.startsWith(text) || nameText.startsWith(text)) && text.length > 0) {
                    row.classList.add("highlight");
                    row.scrollIntoView({ behavior: "smooth", block: "center" });
                    found = true;
                } else {
                    row.classList.remove("highlight");
                }
            }
        });
    }
    
    function removeHighlight() {
        document.querySelectorAll("tbody tr").forEach(row => row.classList.remove("highlight"));
    }
    
  }

  // Fetch initial data for the dashboard
  const dashboardRequest = new XMLHttpRequest();
  dashboardRequest.open("POST", "../php/AdminDashboardProcess.php", true);
  dashboardRequest.setRequestHeader("Content-Type", "application/json");
  dashboardRequest.send(JSON.stringify({}));
  
  dashboardRequest.onreadystatechange = function () {
    console.log("Status: " + dashboardRequest.status);
    console.log("Readystate: " + dashboardRequest.readyState);
    if (dashboardRequest.readyState === 4) {
      if (dashboardRequest.status === 200) {
        const response = JSON.parse(dashboardRequest.responseText);
        if (response.status === "success") {
          document.getElementById("welcome-message").innerHTML += response.adminName;
          document.getElementById("userCount").innerHTML = response.userCount;
          document.getElementById("eventsCount").innerHTML = response.eventsCount;
        } else if (response.status === "failure" || response.status === "error") {
          console.log(response.message);
        }
      } else {
        console.error("Request failed with status: " + dashboardRequest.status);
      }
    }
  };

  // Event listener for the "Logout" button
  logoutBtn.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent the default link behavior
    confirmationOptions.style.display =
      confirmationOptions.style.display === "inline" ? "none" : "inline";
  });

  // Event listener for the "✅" (Confirmed) option
  confirmed.addEventListener("click", () => {
    console.log("Logged out - ✅");

    const logoutRequest = new XMLHttpRequest(); // Create a new XMLHttpRequest for logout
    logoutRequest.open("POST", "../php/AdminDashboardProcess.php", true);
    logoutRequest.setRequestHeader("Content-Type", "application/json");

    logoutRequest.onreadystatechange = function () {
      if (logoutRequest.readyState === 4) {
        if (logoutRequest.status === 200) {
          const response = JSON.parse(logoutRequest.responseText);

          // show the loading screen
          loadingScreen.style.display = "flex";

          if (response.loggedStatus === "logOff") {
            console.log(response.message);
            setTimeout(() => {
              loadingScreen.style.display = "flex";
              window.location.replace("../html/adminLogin.html");
            }, 2000); // 2-second delay
          } else {
            console.log("Error in loggedStatus response");
          }
        } else {
          console.error("Logout request failed with status:", logoutRequest.status);
        }
      }
    };

    // Send the logout request
    logoutRequest.send(JSON.stringify({ login_status: "loggedOff" }));
  });

  // Event listener for the "❌" (NO) option
  no.addEventListener("click", () => {
    console.log("Logout action cancelled - ❌");
    confirmationOptions.style.display === "inline" ? "none" : "inline";
  });

  sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    document.querySelector(".content").classList.toggle("expanded");
    adminDashboard.style.display = (adminDashboard.style.display === "none" || adminDashboard.style.display === "") ? "inline" : "none";

    // Toggle the visibility of the text labels and adjust icon size
    const sidebarLinks = sidebar.querySelectorAll("a");
    sidebarLinks.forEach(link => {
        const icon = link.querySelector("i");
        const text = link.querySelector("span");
        if (sidebar.classList.contains("collapsed")) {
            if (text) text.style.display = "none";
            if (icon) icon.style.fontSize = "1.8rem"; // Increase icon size
            link.style.justifyContent = "center";
        } else {
            if (text) text.style.display = "inline";
            if (icon) icon.style.fontSize = "1.2rem"; // Restore normal size
            link.style.justifyContent = "flex-start";
        }
    });
});

  fetchOrganizerDetails();
});

function makeEditable(event) {
  let td = event.currentTarget;
  console.log("Making cell editable:", td);

  if (!td.classList.contains("editing")) {
    let input;
    let originalText = td.innerText.trim();
    td.setAttribute("data-original-text", originalText); // Store original text

    if (td.cellIndex === 9) { // Organizer DOB column
      input = document.createElement("input");
      input.type = "date";
      input.value = originalText;
    } else if (td.cellIndex === 10) { // Organizer Gender column
      input = document.createElement("select");
      input.innerHTML = `
        <option value="" disabled>--Select Your Gender--</option>
        <option value="male" ${originalText === "male" ? "selected" : ""}>Male</option>
        <option value="female" ${originalText === "female" ? "selected" : ""}>Female</option>
        <option value="other" ${originalText === "other" ? "selected" : ""}>Other</option>
      `;
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.value = originalText;
    }
    input.style.width = "100%";
    input.style.border = "1px solid #ccc";
    input.style.padding = "5px";
    td.innerHTML = "";
    td.appendChild(input);
    td.classList.add("editing");
  }
}

// Validation function
function validations(td, index) {
  let input = td.querySelector("input, select");
  if (!input) {
    console.error("Input element is missing");
    return false;
  }

  const value = input.value.trim();
  switch (index) {
    case 1: // Organizer Name
      const namePattern = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s[A-Z][a-z]+$/;
      if (!namePattern.test(value)) {
        showSlideMessage("Name Should Contain At Least First-Last Name With Space In-Between And, Capitalized");
        return false;
      }
      break;
    case 2: // Organizer Phone
      const phoneRegex = /^(\+?\d{1,4})?[-.\s]?(\d{10})$/;
      if (!phoneRegex.test(value)) {
        showSlideMessage("Phone Number Should Be 10 Digits with Optional Country Code(+123-PhoneNumber)");
        return false;
      }
      break;
    case 4: // Organizer Login ID
      const usernameRegex = /^[a-zA-Z0-9@]+$/;
      if (!usernameRegex.test(value)) {
        showSlideMessage("Username Should Contain Alphanumeric Characters OR Only '@' Symbol.");
        return false;
      }
      break;
    case 5: // Organizer Login Password
      const passwordValue = value;
      const alphanumericRegex = /^[a-zA-Z0-9@]+$/; // Allow only letters and numbers
      if (passwordValue.length < 8 || passwordValue.length > 15) {
        showSlideMessage("Password Must Be Between 8 And 15 Characters Long.");
        return false;
      }
      if (!alphanumericRegex.test(passwordValue)) {
        showSlideMessage("Password Must Contain Only Letters And Numbers OR Only '@' Symbol.");
        return false;
      }
      break;
    case 6: // Organizer Email
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        showSlideMessage("Invalid Email");
        return false;
      }
      break;
    default:
      break;
  }

  return true; // All validations passed
}
