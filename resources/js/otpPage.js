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
                                alert(response.message);
                                window.location.replace("../html/createNewPassword.html");
                            }if (response.status === "invaild") {
                                document.getElementById("msg").innerHTML = response.message;
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
