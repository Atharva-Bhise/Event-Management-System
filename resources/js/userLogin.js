const username = document.getElementById("username");
const password = document.getElementById("password");
const form = document.querySelector("form");
const img = document.getElementById("toggleIcon");
// Function to toggle password visibility
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const img = document.getElementById('toggleIcon');

  if (!passwordField || !img) {
    console.error("Element with id 'password' or 'toggleIcon' not found.");
    return;
  }

  if (passwordField.type === 'password') {
    passwordField.type = 'text'; // Show the password
    img.src = '../images/hide.png'; // Change the icon to 'hide'
  } else {
    passwordField.type = 'password'; // Hide the password
    img.src = '../images/show.png'; // Change the icon to 'show'
  }
}

// Function to update the icon visibility based on input field value
function togglePasswordIcon() {
  const passwordField = document.getElementById('password');
  const img = document.getElementById('toggleIcon');

  if (!passwordField || !img) {
    console.error("Element with id 'password' or 'toggleIcon' not found.");
    return;
  }

  // Update the icon based on input field value
  passwordField.addEventListener('input', () => {
    if (passwordField.value.length > 0) {
      passwordField.type = 'text'; // Show the password
      img.src = '../images/hide.png';
    } else {
      passwordField.type = 'password'; // Hide the password
      img.src = '../images/show.png';
    }
  });
}

// Event listener for the toggle icon click
document.addEventListener('DOMContentLoaded', () => {  
   // Get the forget password link and username input
   const forgetPassword = document.getElementById('forgotPassword');
   const usernameInput = document.getElementById('username'); // Replace with your actual input field ID
 
   // Add click event listener to the forgot password link
   forgetPassword.addEventListener('click', () => {
     const username = usernameInput.value.trim(); // Get and trim the username input
 
     if (username === "") {
       // Display an error if the username is empty
       showSlideMessage("Please, Enter Your Username");
       return; // Stop further execution
     }else{
        const formDataUsername = {
          username : document.getElementById("username").value.trim()
        }

        const userNameVerification = new XMLHttpRequest();
        userNameVerification.open("POST","../php/UsernameExistsProcess.php", true);
      userNameVerification.setRequestHeader("Content-Type", "application/json");
      userNameVerification.onreadystatechange = function(){
      console.log("Status: "+ userNameVerification.status);
      console.log("Readystate: "+ userNameVerification.readyState);
      if (userNameVerification.readyState === 4 && userNameVerification.status === 200) {
        const response = JSON.parse(userNameVerification.responseText);

          if(response.status === "exists"){
            window.location.href = "../html/otpPage.html";
          }
          if(response.status === "notExists"){
            showSlideMessage(response.message);
          }
          if(response.status === "error"){
            console.log(response.message);
          }
        }
      }
      userNameVerification.send(JSON.stringify(formDataUsername)); 

     }
    });

  const img = document.getElementById('toggleIcon');
  if (img) {
    img.addEventListener('click', togglePasswordVisibility);
  } else {
    console.error("Element with id 'toggleIcon' not found.");
  }
  
  // Call togglePasswordIcon to set up input event listener
  togglePasswordIcon();
});


function showPassword(){
    if(password.type === "password")
    {
        password.type = "text";
    }
    else
    {
        password.type = "password";
    }
}
function displayErrorMessage(message) {
  // Create the error message element
  const errorMessage = document.createElement("span");
  errorMessage.textContent = message;
  errorMessage.classList.add("error-message");

  // Clear any existing error messages
  const existingErrorMessage = document.querySelector(".error-message");
  if (existingErrorMessage) {
    existingErrorMessage.remove();
  }

  // Append the error message before the signup button
  password.form.insertBefore(errorMessage, password.form.querySelector("button"));
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

// Add an event listener to the form's submit event
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent default form submission behavior
  const existingErrorMessage = document.querySelector(".error-message");
  if (existingErrorMessage) {
    existingErrorMessage.remove();
  }
  // Collect form data
 
  
  const formData = {
    username : document.getElementById("username").value.trim(),
    password : document.getElementById("password").value.trim()
  }
  
      const xhr = new XMLHttpRequest();
      xhr.open("POST","../php/UserLoginFormProcess.php", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function(){
      console.log("Status: "+ xhr.status);
      console.log("Readystate: "+ xhr.readyState);
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);

          if(response.status === "success"){
            //alert(response.message + " Hello, " + response.user); 
            showSlideMessage(response.message + " Hello, " + response.user);
            setTimeout(() => {
              window.location.href="../html/afterUserLogin.html";
            }, 4000);
          }
          if(response.status === "failure"){
            showSlideMessage(response.message);
          }
          if(response.status === "error"){
            console.log(response.message);
          }
        }
      }
      xhr.send(JSON.stringify(formData)); 

  
  
});