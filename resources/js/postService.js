document.getElementById('addPicture').addEventListener('click', function () {
  const uploadContainer = document.getElementById('uploadContainer');
  const newInputGroup = document.createElement('div');
  newInputGroup.className = 'input-group mb-2';
  newInputGroup.innerHTML = `
      <input type="file" class="form-control upload-input" name="upload[]" required>
      <input type="text" class="form-control description-input" name="description[]" placeholder="Enter description" style="width: 100%;">
  `;
  uploadContainer.appendChild(newInputGroup);
});
document.addEventListener('DOMContentLoaded', function () {
    // Event selection logic
    document.getElementById('eventSelect').addEventListener('change', function() {
        const otherEventInput = document.getElementById('otherEvent');
        otherEventInput.classList.toggle('hidden', this.value !== 'other');
    });

    // Service selection logic
    document.addEventListener('change', function (event) {
        if (event.target.id === 'otherServiceCheck') {
            document.getElementById('otherService').classList.toggle('hidden', !event.target.checked);
            document.getElementById('otherServicePrice').classList.toggle('hidden', !event.target.checked);
            document.getElementById('otherServiceDescription').classList.toggle('hidden', !event.target.checked);
        }

        if (event.target.classList.contains('service-check')) {
            const priceInput = event.target.closest('.form-check').querySelector('.price-input');
            const descriptionInput = event.target.closest('.form-check').querySelector('.description-input');

            if (priceInput && descriptionInput) {
                priceInput.classList.toggle('hidden', !event.target.checked);
                descriptionInput.classList.toggle('hidden', !event.target.checked);
            }
        }
    });

    document.getElementById("postButton").addEventListener("click", function (event) {
        event.preventDefault();

        let formData = new FormData();
        let eventName = document.getElementById("eventSelect").value.trim();
        if (eventName === "other") {
            eventName = document.getElementById("otherEvent").value.trim();
        }
        formData.append("eventName", eventName);

        // Collect selected services
        document.querySelectorAll(".service-check:checked").forEach((checkbox, index) => {
            let serviceName = checkbox.value;
            let priceInput = checkbox.parentElement.querySelector(".price-input");
            let descriptionInput = checkbox.parentElement.querySelector(".description-input");

            formData.append(`services[${index}][name]`, serviceName);
            formData.append(`services[${index}][price]`, priceInput ? priceInput.value.trim() : "");
            formData.append(`services[${index}][description]`, descriptionInput ? descriptionInput.value.trim() : "");
        });

        // Check if 'other' service is selected
        if (document.getElementById('otherServiceCheck').checked) {
            let otherServiceName = document.getElementById('otherService').value.trim();
            let otherServicePrice = document.getElementById('otherServicePrice').value.trim();
            let otherServiceDescription = document.getElementById('otherServiceDescription').value.trim();

            formData.append(`services[other][name]`, otherServiceName);
            formData.append(`services[other][price]`, otherServicePrice);
            formData.append(`services[other][description]`, otherServiceDescription);
        }

        // Valid file types
        const validFileTypes = ['image/jpeg', 'image/png'];
        let validFiles = true;

        document.querySelectorAll('input[type="file"]').forEach((fileInput, index) => {
            const file = fileInput.files[0];
            if (file && validFileTypes.includes(file.type)) {
                formData.append(`upload[${index}]`, file);
                let descriptionInput = fileInput.parentElement.querySelector('input[name="description[]"]');
                formData.append(`description[${index}]`, descriptionInput ? descriptionInput.value.trim() : "");
            } else if (file) {
                validFiles = false;
                showSlideMessage(`Invalid file type: ${file.name}. File Should be in JPEG or PNG format.`);
            }
        });

        if (!validFiles) return;

        console.log([...formData.entries()]); // Debugging output

        // AJAX request
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "../php/PostServiceFormProcess.php", true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (xhr.status === 200 && response.status === "success") {
                        showSlideMessage(response.message);
                        setTimeout(() => {
                            window.location.href = "../html/yourService.html";
                        }, 4000);
                    } else {
                        showSlideMessage(response.message || "An error occurred.");
                    }
                } catch (e) {
                    showSlideMessage("Invalid server response.");
                }
            }
        };

        xhr.send(formData);
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
