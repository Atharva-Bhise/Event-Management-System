console.log("Script loaded successfully.");

// Basic validation for password matching

const form = document.getElementById("signUp");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const img1 = document.getElementById("toggleIcon1");
const img2 = document.getElementById("toggleIcon1");

// Function to toggle password visibility
function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirm-password');
  const img1 = document.getElementById('toggleIcon1');
  const img2 = document.getElementById('toggleIcon2');

  if (!passwordField || !confirmPasswordField || !img1 || !img2) {
    console.error("Element with id 'password' or 'toggleIcon' not found.");
    return;
  }

  if (passwordField.type === 'password' && confirmPasswordField.type === 'password') {
    passwordField.type = 'text'; // Show the password
    confirmPasswordField.type = 'text'; // Show the confirm password
    img1.src = '../images/hide1.png'; // Change the icon to 'hide'
    img2.src = '../images/hide2.png'; // Change the icon to 'hide'
  } else {
    passwordField.type = 'password'; // Hide the password
    confirmPasswordField.type = 'password'; // Hide the confirm password
    img1.src = '../images/show.png'; // Change the icon to 'show'
    img2.src = '../images/show.png'; // Change the icon to 'show'
  }
}

// Function to update the icon visibility based on input field value
function togglePasswordIcon() {
  const passwordField = document.getElementById('password');
  const confirmPasswordField = document.getElementById('confirm-password');
  const img1 = document.getElementById('toggleIcon1');
  const img2 = document.getElementById('toggleIcon2');

  if (!passwordField || !confirmPasswordField || !img1 || !img2) {
    console.error("Element with id 'password' or 'toggleIcon' not found.");
    return;
  }

  // Update the icon based on input field value
  passwordField.addEventListener('input', () => {
    if (passwordField.value.length > 0) {
      passwordField.type = 'text'; // Show the password
      img1.src = '../images/hide1.png';
    }else {
      passwordField.type = 'password'; // Hide the password
      img1.src = '../images/show.png';
    }
  });
  confirmPasswordField.addEventListener('input', () => {
    if(confirmPasswordField.value.length > 0){
      confirmPasswordField.type = 'text'; // Show the confirm password
      img2.src = '../images/hide2.png';
    }else {
      confirmPasswordField.type = 'password'; // Hide the confirm password
      img2.src = '../images/show.png';
    }
  });
}

// Event listener for the toggle icon click
document.addEventListener('DOMContentLoaded', () => {
  const img1 = document.getElementById('toggleIcon1');
  const img2 = document.getElementById('toggleIcon2');
  if (img1) {
    img1.addEventListener('click', togglePasswordVisibility);
  } if(img2){
    img2.addEventListener('click', togglePasswordVisibility);
  }
  else {
    console.error("Element with id 'toggleIcon' not found.");
  }
  
  // Call togglePasswordIcon to set up input event listener
  togglePasswordIcon();
});
function showPassword(){
    if(password.type === "password" && confirmPassword.type === "password")
    {
        password.type = "text";
        confirmPassword.type = "text";
    }
    else
    {
        password.type = "password";
        confirmPassword.type = "password";
    }
}
function validations() {
  const name =  document.getElementById("name").value.trim();
  const email =  document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim();
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;
  const phoneNo = document.getElementById("phoneNumber").value.trim();
  const namePattern = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s[A-Z][a-z]+$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const usernameRegex = /^[a-zA-Z0-9@]+$/;
  const alphanumericRegex = /^[a-zA-Z0-9@]+$/; // Allow only letters and numbers
  const phoneRegex = /^(\+?\d{1,4})?[-.\s]?(\d{10})$/;

  if(!namePattern.test(name)){

    showSlideMessage("Name Should Contain Atlest First-Last Name With Space In-Between And, Capitalized");

    return false;
  }
  if(!emailRegex.test(email)){
    showSlideMessage("Invalid Email");
    return false;
  }
  if(!usernameRegex.test(username)){

    showSlideMessage("Username Should Contain Alphanumeric Characters OR Only '@' Symbol.");

    return false;
  }
  if(!phoneRegex.test(phoneNo)){
    showSlideMessage("Phone Number Should Be 10 Digits with Optional Country Code(+123-PhoneNumber)");
    return false;
  }
  // Password length validation
  if (passwordValue.length < 8 || passwordValue.length > 15) {
    showSlideMessage("Password Must Be Between 8 And 15 Characters Long.");
    return false;
  }

  // Alphanumeric validation
  if (!alphanumericRegex.test(passwordValue)) {

    showSlideMessage("Password Must Contain Only Letters And Numbers Or Only '@' Symbol.");

    return false;
  }

  // Password matching validation
  if (passwordValue !== confirmPasswordValue) {
    showSlideMessage("Password And Confirmed Password Should Be Same!");
    return false;
  }

  return true; // All validations passed
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

// Form submission event listener
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevents the page from reloading
  console.log("Submit event triggered.");

  if (validations()) {
    
    const formData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      username: document.getElementById("username").value.trim(),
      phoneNo: document.getElementById("phoneNumber").value.trim(),
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      password: password.value.trim()
    };
    
    

    const xhr = new XMLHttpRequest();

    try{
        xhr.open("POST", "../php/UserSignupFormProcess.php", true);
        xhr.setRequestHeader("Content-Type","application/json");
        xhr.onreadystatechange = function() {
          console.log("Ready State = "+ xhr.readyState);
          console.log("Status = "+ xhr.status);
          if(xhr.readyState === 4 && xhr.status === 200)
          {
            try{
                const response = JSON.parse(xhr.responseText);
                if(response.status === "success"){
                  showSlideMessage(response.message);
                  setTimeout(() => {
                    window.location.href="../html/afterUser.html";
                  }, 4000);
                }else{
                  if(response.status === "exists"){
                    showSlideMessage(response.message);
                  }
                  if(response.status === "failure" || response.status === "invalid"){
                    showSlideMessage(response.message);
                  }
                  if(response.status === "error"){
                    console.log(response.message);
                  }
                }
              }catch(error){
                console.error("Error parsing JSON:", error.message);
              }
          }
        }
        xhr.send(JSON.stringify(formData));
      }catch(error){
        console.error("Error XMLHttpRequest:", error.message);
      }   
   
  }

});


