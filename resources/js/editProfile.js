userName = document.getElementById("userNameInput");
fullName = document.getElementById("userFullNameInput");
email = document.getElementById("emailInput");
dob = document.getElementById("dobInput");
address = document.getElementById("addressInput");
city = document.getElementById("cityInput");
phoneNo = document.getElementById("phoneNoInput");
currentPassword = document.getElementById("currentPasswordInput");
//newPassword = document.getElementById("newPasswordInput");
confirmPassword = document.getElementById("confirmPasswordInput");
save = document.getElementById("save");
cancel = document.getElementById("cancel");
function isset(value) {
    return value !== undefined && value !== null && value.trim() !== "";
}
function isDefined(value) {
    return value !== undefined && value !== null && value !== ""; // Checks for non-null and non-undefined
}
function validations() {
    userName = document.getElementById("userNameInput").value.trim();
    fullName = document.getElementById("userFullNameInput").value.trim();
    email = document.getElementById("emailInput").value.trim();
    address = document.getElementById("addressInput").value.trim();
    city = document.getElementById("cityInput").value.trim();
    phoneNo = document.getElementById("phoneNoInput").value.trim();
    newPassword = document.getElementById("newPasswordInput").value.trim();
    confirmPassword = document.getElementById("confirmPasswordInput").value.trim();
    const namePattern = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s[A-Z][a-z]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9@]+$/;
    const alphanumericRegex = /^[a-zA-Z0-9@]+$/; // Allows only letters, numbers, or the '@' symbol.
    const phoneRegex = /^(\+?\d{1,4})?[-.\s]?(\d{10})$/;
  
    if(isset(userName)){  
        if(!usernameRegex.test(userName)){
        showSlideMessage("Username Should Contain Alphanumeric Characters OR Only '@' Symbol.");
        return false;
        }
    }
    if(isset(fullName)){ 
        if(!namePattern.test(fullName)){
        showSlideMessage("Full-Name Should Contain Atlest First-Last Name With Space In-Between And, Capitalized");
        return false;
        }
    }
    if(isset(email)){ 
        if(!emailRegex.test(email)){
        showSlideMessage("Invalid Email");
        return false;
        }
    }

    if(isset(phoneNo)){ 
        if(!phoneRegex.test(phoneNo)){
        showSlideMessage("Phone Number Should Be 10 Digits with Optional Country Code(+123-PhoneNumber)");
        return false;
    }}
    // Password length validation
    if (isset(newPassword)){ 
        if((newPassword.length < 8 || newPassword.length > 15)) {
      showSlideMessage("Password Must Be Between 8 And 15 Characters Long.");
      return false;
    }}
  
    // Alphanumeric validation
    if (isset(newPassword)){ 
        if(!alphanumericRegex.test(newPassword)) {
            console.log(newPassword);
      showSlideMessage("Password Must Contain Only Letters And Numbers Or Only '@' Symbol.");
  
      return false;
    }}
  
    // Password matching validation
    if(isset(newPassword) || isset(confirmPassword)) {
    if (newPassword !== confirmPassword) {
      showSlideMessage("Password And Confirmed Password Should Be Same!");
      return false;
    }
    }
  
    return true; // All validations passed
}

// Message queue to handle multiple messages
let messageQueue = [];
let isMessageDisplayed = false;

// Function to show the slide-in message
function showSlideMessage(message) {
    // Add the message to the queue
    messageQueue.push(message);

    // If no message is currently displayed, process the queue
    if (!isMessageDisplayed) {
        processMessageQueue();
    }
}

// Function to process the message queue
function processMessageQueue() {
    if (messageQueue.length === 0) {
        isMessageDisplayed = false;
        return;
    }

    isMessageDisplayed = true;

    // Get the next message from the queue
    const message = messageQueue.shift();

    // Display the message
    const messageElement = document.getElementById('slideMessage');
    messageElement.textContent = message;

    // Add the visible class to show the message
    messageElement.classList.remove('hidden');
    messageElement.classList.add('visible');

    // Remove the message after the specified duration and process the next message
    setTimeout(() => {
        messageElement.classList.remove('visible');
        messageElement.classList.add('hidden');

        // Wait for the animation to finish before showing the next message
        setTimeout(() => {
            processMessageQueue();
        }, 500); // Adjust for the transition time of the "hidden" class if needed
    }, 3000);
}

  
document.addEventListener("DOMContentLoaded", () => {
    
    
    // Fetch initial data for the dashboard
  const detailsRequest = new XMLHttpRequest();
  detailsRequest.open("POST", "../php/EditProfileProcess.php", true);
  detailsRequest.setRequestHeader("Content-Type", "application/json");
  detailsRequest.send(JSON.stringify({}));
  
  detailsRequest.onreadystatechange = function () {
    console.log("Status: " + detailsRequest.status);
    console.log("Readystate: " + detailsRequest.readyState);
    if (detailsRequest.readyState === 4) {
      if (detailsRequest.status === 200) {
        const response = JSON.parse(detailsRequest.responseText);
        if (response.status === "success") {
          document.getElementById("userName").innerHTML = response.userName;
          document.getElementById("fullName").innerHTML = response.userFullName;
          document.getElementById("email").innerHTML = response.userEmail;
          document.getElementById("dob").innerHTML = response.userDOB;
          document.getElementById("address").innerHTML = response.userAddress;
          document.getElementById("city").innerHTML = response.userCity;
          document.getElementById("phoneNo").innerHTML = response.userPhoneNo;

        } else if (response.status === "failure" || response.status === "error") {
          console.log(response.message);
        }
      } else {
        console.error("Request failed with status: " + detailsRequest.status);
      }
    }
  };
  
  
});
save.addEventListener("click", (e) => {
    userName = document.getElementById("userNameInput");
    fullName = document.getElementById("userFullNameInput");
    email = document.getElementById("emailInput");
    dob = document.getElementById("dobInput");
    address = document.getElementById("addressInput");
    city = document.getElementById("cityInput");
    phoneNo = document.getElementById("phoneNoInput");
    currentPassword = document.getElementById("currentPasswordInput");
    const newPassword = document.getElementById("newPasswordInput");
        
    e.preventDefault(); // Prevents the page from reloading
    console.log("Submit event triggered.");
  
    if (validations()) {
        console.log("Validations Passed");
    
        // Initialize the formData object
        const formData = {};
    
         // Check each field and only include non-empty values
    if (isDefined(userName)) formData.userName = userName.trim();
    if (isDefined(fullName)) formData.fullName = fullName.trim();
    if (isDefined(email)) formData.email = email.trim();
    if (isDefined(address)) formData.address = address.trim();
    if (isDefined(city)) formData.city = city.trim();
    if (isDefined(phoneNo)) formData.phoneNo = phoneNo.trim();

    if (dob && dob.value) {
        formData.dob = dob.value;
    } else {
        console.log("dob is undefined or null.");
    }
    // Handle password fields safely
    if (currentPassword && currentPassword.value) {
        formData.currentPassword = currentPassword.value.trim();
    } else {
        console.log("currentPassword is undefined or null.");
    }

    if (newPassword && newPassword.value) {
        formData.newPassword = newPassword.value.trim();
    } else {
        console.log("newPassword is undefined or null.");
    }
      // Fetch initial data for the dashboard
  const updationRequest = new XMLHttpRequest();
  updationRequest.open("POST", "../php/UpdateProfileProcess.php", true);
  updationRequest.setRequestHeader("Content-Type", "application/json");
  updationRequest.send(JSON.stringify(formData));
  
  updationRequest.onreadystatechange = function () {
    console.log("Status: " + updationRequest.status);
    console.log("Readystate: " + updationRequest.readyState);
    if (updationRequest.readyState === 4) {
      if (updationRequest.status === 200) {
        const response = JSON.parse(updationRequest.responseText);
        // Check if the response is an array
        if (Array.isArray(response)) {
          let messageDuration = 4000; // Duration to display each message
          let totalMessages = response.length;
      
          // Iterate through each response object
          response.forEach((res, index) => {
              if (res.status === "success") {
                  // Display success messages with delay
                  setTimeout(() => {
                      showSlideMessage(res.message);
      
                      // If it's the last message, reload the page after it is displayed
                      if (index === totalMessages - 1) {
                          setTimeout(() => {
                              window.location.reload(true);
                          }, messageDuration);
                      }
                  }, index * messageDuration); // Stagger messages
              } else if (res.status === "failure") {
                  // Log or handle any errors
                  console.error("Error:", res.message);
              }
          });
          response.forEach((res, index) => {
            if (res.status === "failure") {
                // Display success messages with delay
                setTimeout(() => {
                    showSlideMessage(res.message);
                }, index * messageDuration); // Stagger messages
            } else if (res.status === "error") {
                // Log or handle any errors
                console.error("Error:", res.message);
            }
        });
      } else {
          // Handle unexpected response formats
          console.error("Unexpected response format:", response);
      }
        
      if(response.status === "exists"){
            showSlideMessage(response.message);
        }
        if (response.status === "error") {
            console.log(response.message);
        }
      } else {
        console.error("Request failed with status: " + updationRequest.status);
      }
    }
  };
}
});
cancel.addEventListener("click", (e) => {
    e.preventDefault(); // Prevents the page from reloading
    console.log("Submit event triggered.");
    window.location.replace("../html/afterUser.html");
});