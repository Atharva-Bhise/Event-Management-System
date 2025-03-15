document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submitBtn");

    submitBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form from submitting normally

        // Get values from the form fields
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const feedback = document.querySelector("textarea[name='feedback']").value.trim();

        // Validate required fields
        if (!name || !email || !phone || !feedback) {
            alert("Please fill in all fields before submitting.");
            return;
        }

        // Prepare data for sending
        const formData = {
            name: name,
            email: email,
            phone: phone,
            feedback: feedback
        };

        // Send the data using a POST request
        fetch("../php/HandleFeedback.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                showSlideMessage("Thank you! Your Feedback and Queries has been sent to the admins.");
                form.reset(); // Reset form after successful submission
            } else {
                showSlideMessage("Something went wrong. Please try again.");
                console.log("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error("❌ Request failed:", error);
            showSlideMessage("Something went wrong. Please try again.");
        });
    });
    
});

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
  
