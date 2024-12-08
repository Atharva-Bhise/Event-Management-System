const themeToggle = document.getElementById("theme-toggle");
const logoutBtn = document.querySelector("#logout");
const confirmationOptions = document.querySelector("#confirmation-options");
const confirmed = document.querySelector("#confirmed");
const no = document.querySelector("#no");
const loadingScreen = document.querySelector("#loading-screen");

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

document.addEventListener("DOMContentLoaded", () => {
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
              loadingScreen.style.display = "none";
              window.location.href = "../html/adminLogin.html";
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
});
