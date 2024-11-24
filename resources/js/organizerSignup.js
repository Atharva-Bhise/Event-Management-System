console.log("Script loaded successfully.");

// Basic validation for password matching

const form = document.getElementById("signUp");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

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
function validatePassword() {
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;


  // Password length validation
  if (passwordValue.length < 8 || passwordValue.length > 15) {
    displayErrorMessage("Password must be between 8 and 15 characters long.");
    return false;
  }

  // Alphanumeric validation
  const alphanumericRegex = /^[a-zA-Z0-9]+$/; // Allow only letters and numbers
  if (!alphanumericRegex.test(passwordValue)) {
    displayErrorMessage("Password must contain only letters and numbers.");
    return false;
  }

  // Password matching validation
  if (passwordValue !== confirmPasswordValue) {
    displayErrorMessage("Password and confirmed password should be same!");
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

// Form submission event listener
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevents the page from reloading
  console.log("Submit event triggered.");

  if (validatePassword()) {
    
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
<<<<<<<< HEAD:resources/js/organizerSignup.js
    xhr.open("POST", "../php/OrganizerSignupFormProcess.php", true);
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
========
    xhr.open("POST", "../php/UserSignupFormProcess.php", true);
    xhr.setRequestHeader("Content-Type","application/json");
>>>>>>>> b9d2f5b4052b2578a8e3d233f3cfc84874514882:resources/js/userSignup.js
    xhr.onreadystatechange = function() {
      console.log("Ready State = "+ xhr.readyState);
      console.log("Status = "+ xhr.status);
      if(xhr.readyState === 4 && xhr.status === 200)
      {
<<<<<<<< HEAD:resources/js/organizerSignup.js
        document.write(xhr.responseText);
========
        const response = JSON.parse(xhr.responseText);
        if(response.status === "success"){
          alert(response.message);
          window.location.href="../html/after.html";
        }else{
          console.log(response.message);
        }
>>>>>>>> b9d2f5b4052b2578a8e3d233f3cfc84874514882:resources/js/userSignup.js
      }
    }
    xhr.send(JSON.stringify(formData));   
   
  }
});

