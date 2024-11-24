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
// Add an event listener to the form's submit event
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent default form submission behavior

  // Collect form data
 
  
  const formData = {
    username : document.getElementById("username").value.trim(),
    password : document.getElementById("password").value.trim()
  }
  
      const xhr = new XMLHttpRequest();
      xhr.open("POST","../php/UserLoginFormProcess.php", true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onreadystatechange = function(){
      console.log("Status: "+ xhr.status);
      console.log("Readystate: "+ xhr.readyState);
      if (xhr.readyState === 4 && xhr.status === 200) {
          document.write(xhr.responseText);
          }
        const response = JSON.parse(xhr.responseText);
        
        
          if(response.status === "success"){
            alert(response.message + " Hello, " + response.user); 
            window.location.href="../html/after.html";
          }
          if(response.status === "failure"){
            alert(response.message);
          }
        }
      }
      xhr.send(JSON.stringify(formData)); 

  
  
});

