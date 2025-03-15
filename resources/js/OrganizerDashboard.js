const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.querySelector("#logout");
const confirmationOptions = document.querySelector("#confirmation-options");
const confirmed = document.querySelector("#confirmed");
const no = document.querySelector("#no");
const loadingScreen = document.getElementById("loadingScreen");
let tableData = document.querySelector("#recordsTable");
//const home = document.querySelector("#home");
//const manageEvents = document.querySelector("#manageEvents");
const manageServices = document.querySelector("#manageServices");
//const settings = document.querySelector("#settings");

//color changing onclick
function changeColor(element)
{
  const items=document.querySelectorAll(".menu-item");
  items.forEach(item=>
  {
    item.addEventListener('click',()=>
    {
        document.querySelector('.active')?.classList.remove('active');
        item.classList.add('active');
    });
  });
  
}

profileBtn.addEventListener("click", () => {
  profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
});

// Close dropdown if clicked outside
window.addEventListener("click", (e) => {
  if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
    profileDropdown.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const btnTab = document.getElementById("btnTab");
    const manageEventsTab = document.getElementById("manageEventsTab");

  // Fetch initial data for the dashboard
  const orgDashRequest = new XMLHttpRequest();
  orgDashRequest.open("POST", "../php/OrganizerDashboardProcess.php", true);
  orgDashRequest.setRequestHeader("Content-Type", "application/json");
  const loggedIn = {orgLoggedIn: true}
  orgDashRequest.send(JSON.stringify(loggedIn));
  
  orgDashRequest.onreadystatechange = function () {
    console.log("Status: " + orgDashRequest.status);
    console.log("Readystate: " + orgDashRequest.readyState);
    if (orgDashRequest.readyState === 4) {
      if (orgDashRequest.status === 200) {
        const response = JSON.parse(orgDashRequest.responseText);
        if (response.status === "success") {
          document.getElementById("userName").innerHTML = response.userName;

        } else if (response.status === "failure" || response.status === "error") {
          console.log(response.message);
        }
      } else {
        console.error("Request failed with status: " + orgDashRequest.status);
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
    logoutRequest.open("POST", "../php/OrganizerDashboardProcess.php", true);
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
    const loggedout = {orgLoggedIn: false}
    // Send the logout request
    logoutRequest.send(JSON.stringify(loggedout));
  });

  // Event listener for the "❌" (NO) option
  no.addEventListener("click", () => {
    console.log("Logout action cancelled - ❌");
    confirmationOptions.style.display === "inline" ? "none" : "inline";
  });

  /*
  home.addEventListener("click", () => {
    if (manageEventsTab) manageEventsTab.style.display = "none"; // Hide manageEventsTab
    if (btnTab) btnTab.style.display = "none";
    document.getElementById("tab").innerHTML = "Home";
    //document.getElementById("recordsTable").innerHTML = "Home Tab";
  });
  */
/*
  settings.addEventListener("click", () => {
    if (btnTab) btnTab.style.display = "none";
    document.getElementById("tab").innerHTML = "Settings";
    //document.getElementById("recordsTable").innerHTML = "Settings Tab";
  });
  */
  /*
  manageEvents.addEventListener("click", () => {
    if (btnTab) btnTab.style.display = "none";
    if (manageEventsTab) manageEventsTab.style.display = "block"; // Show manageEventsTab
    console.log("Manage Events Tab");
    document.getElementById("tab").innerHTML = "Manage Events";
  });
  */
 
  document.getElementById("tab").innerHTML = "Manage Services";
  if (btnTab) btnTab.style.display = "flex"; // Show btnTab
  manageServices.addEventListener("click", () => {
    if (manageEventsTab) manageEventsTab.style.display = "none"; // Hide manageEventsTab
    if (btnTab) btnTab.style.display = "flex"; // Show btnTab
    console.log("Manage Services Tab");
    document.getElementById("tab").innerHTML = "Manage Services";
   // document.getElementById("recordsTable").style.color = "lightbrown";

  });

  document.getElementById("postService").addEventListener("click", () => {
    window.location.href = "postService.html";
  });
  document.getElementById("yourService").addEventListener("click", () => {
    window.location.href = "yourService.html";
  });
  helpAndSupport
  document.getElementById("helpAndSupport").addEventListener("click", () => {
    window.location.href = "contact.html";
  });
});