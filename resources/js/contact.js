// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');

    // Listen for the form's submit event
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the form's default submission behavior

        // Get values from the form fields
        const name = e.target.name.value;
        const email = e.target.email.value;
        const phone = e.target.phone.value;
        const feedback = e.target.feedback.value;

        // Display a confirmation alert
        alert(`Thank you, ${name}! We have received your message.`);

        // Optionally reset the form fields
        form.reset();
    });
});
