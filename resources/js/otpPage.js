function moveFocus(input, nextIndex) { 
    const inputs = document.querySelectorAll('.otp-input input');
    if (input.value.length === 1 && nextIndex < inputs.length) {
        inputs[nextIndex].focus();
    }
    if (input.value === "" && nextIndex > 0) {
        inputs[nextIndex - 1].focus();
    }

    // Automatically submit when all inputs are filled
    let otp = '';
    inputs.forEach(inp => otp += inp.value);
    
    // Ensure OTP validation happens after all inputs are filled
    if (otp.length === 6) {
        // Slight delay to ensure the last input's value is captured
        setTimeout(() => {
            
            const otpValidation = new XMLHttpRequest();
            otpValidation.open("POST", "../php/OTPProcess.php", true);
            otpValidation.setRequestHeader("Content-Type", "application/json");
            otpValidation.send(JSON.stringify({otp}));

            otpValidation.onreadystatechange = function () {
                console.log("Status: " + otpValidation.status);
                console.log("Readystate: " + otpValidation.readyState);
                if (otpValidation.readyState === 4) {
                    if (otpValidation.status === 200) {
                        try {
                            const response = JSON.parse(otpValidation.responseText);
                            if(response.status === "vaild") {
                                showSlideMessage(response.message);
                                setTimeout(() => {
                                    window.location.replace("../html/createNewPassword.html");
                                }, 4000);
                            }if (response.status === "invaild") {
                                showSlideMessage(response.message);
                            }if (response.status === "error") {
                                console.log(response.message);
                            }
                        } catch (error) {
                            console.error("Error parsing JSON response:", error);
                        }
                    } else {
                        console.error("Logout request failed with status:", otpValidation.status);
                    }
                }
            };
        }, 100); // Delay by 100 milliseconds
    }
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
document.addEventListener("DOMContentLoaded", () => {
      const otpRequest = new XMLHttpRequest(); 
      otpRequest.open("POST", "../php/OTPProcess.php", true);
      otpRequest.setRequestHeader("Content-Type", "application/json");
  
      otpRequest.onreadystatechange = function () {
        console.log("Status: " + otpRequest.status);
        console.log("Readystate: " + otpRequest.readyState);
        if (otpRequest.readyState === 4) {
          if (otpRequest.status === 200) {
            const response = JSON.parse(otpRequest.responseText);

            if(response.status === "sent"){
                document.getElementById("msg").innerHTML = response.message + response.emailID;
            }
            if(response.status === "error"){
                console.log(response.message);
            }
            }
            }
        }
        otpRequest.send(JSON.stringify({})); 
});
