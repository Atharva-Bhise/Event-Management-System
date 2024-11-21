const username = document.getElementById("username");
const password = document.getElementById("password");
const form = document.querySelector("form");
const icon = document.querySelector('.emoji-icon');

function togglePasswordVisibility() {
  const passwordField = document.getElementById('password');
  const icon = document.querySelector('.emoji-icon');

  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    icon.textContent = '🙈'; // Change to "hide" icon
  } else {
    passwordField.type = 'password';
    icon.textContent = '👁️'; // Change to "show" icon
  }
}

function togglePasswordIcon() {
  const passwordField = document.getElementById('password');
  const icon = document.querySelector('.emoji-icon');
  
  // Adjust icon based on input length
  if (passwordField.value.length > 0) {
    icon.textContent = '🙈'; // Show "visible" icon
    passwordField.type = 'text';    
  } else {
    icon.textContent = '👁️'; // Reset icon if input is empty
  }
}

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
      xhr.onreadystatechange = function(){
      console.log("Status: "+ xhr.status);
      console.log("Readystate: "+ xhr.readyState);
      if (xhr.readyState === 4 && xhr.status === 200) {
          document.write(xhr.responseText);
          }
      }
      xhr.send(JSON.stringify(formData)); 

  
  
});

