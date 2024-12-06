const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

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
document.addEventListener('DOMContentLoaded', () => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '../php/AdminDashboardProcess.php', true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        console.log("Status: " + xhr.status);
        console.log("Readystate: " + xhr.readyState);
        
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.status === "success") {
                    document.getElementById("welcome-message").innerHTML += response.adminName;
                    document.getElementById("userCount").innerHTML = response.userCount;
                }  
                else if (response.status === "failure" || response.status === "error") {
                    console.log(response.message);
                }
            } else {
                console.error("Request failed with status: " + xhr.status);
            }
        }
    };

    // Send request with empty JSON object if no data needs to be sent
    xhr.send(JSON.stringify({}));
});
