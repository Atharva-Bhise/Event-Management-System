const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.querySelector("#logout");
const confirmationOptions = document.querySelector("#confirmation-options");
const confirmed = document.querySelector("#confirmed");
const no = document.querySelector("#no");
const loadingScreen = document.getElementById("loadingScreen");
profileBtn.addEventListener("click", () => {
  profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
});

/* Close dropdown if clicked outside
window.addEventListener("click", (e) => {
  if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.style.display = "none";
  }
});*/
document.addEventListener("DOMContentLoaded", () => {
  // Fetch initial data for the dashboard
  const afterUserRequest = new XMLHttpRequest();
  afterUserRequest.open("POST", "../php/AfterUserProcess.php", true);
  afterUserRequest.setRequestHeader("Content-Type", "application/json");
  const loggedIn = {userLoggedIn: true}
  afterUserRequest.send(JSON.stringify(loggedIn));
  
  afterUserRequest.onreadystatechange = function () {
    console.log("Status: " + afterUserRequest.status);
    console.log("Readystate: " + afterUserRequest.readyState);
    if (afterUserRequest.readyState === 4) {
      if (afterUserRequest.status === 200) {
        const response = JSON.parse(afterUserRequest.responseText);
        if (response.status === "success") {
          document.getElementById("userName").innerHTML = response.userName;

        } else if (response.status === "failure" || response.status === "error") {
          console.log(response.message);
        }
      } else {
        console.error("Request failed with status: " + afterUserRequest.status);
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
    logoutRequest.open("POST", "../php/AfterUserProcess.php", true);
    logoutRequest.setRequestHeader("Content-Type", "application/json");

    logoutRequest.onreadystatechange = function () {
      if (logoutRequest.readyState === 4) {
        if (logoutRequest.status === 200) {
          const response = JSON.parse(logoutRequest.responseText);

          // show the loading screen
          loadingScreen.classList.add("show");

          if (response.loggedStatus === "logOff") {
            console.log(response.message);
            setTimeout(() => {
              //loadingScreen.style.display = "flex";
              window.location.replace("../html/landing.html");
            }, 2000); // 2-second delay
          } else {
            console.log("Error in loggedStatus response");
          }
        } else {
          console.error("Logout request failed with status:", logoutRequest.status);
        }
      }
    };
    const loggedout = {userLoggedIn: false}
    // Send the logout request
    logoutRequest.send(JSON.stringify(loggedout));
  });

  // Event listener for the "❌" (NO) option
  no.addEventListener("click", () => {
    console.log("Logout action cancelled - ❌");
    confirmationOptions.style.display === "inline" ? "none" : "inline";
  });
});
