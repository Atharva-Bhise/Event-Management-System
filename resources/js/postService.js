document.getElementById('addPicture').addEventListener('click', function() {
    const uploadContainer = document.getElementById('uploadContainer');
    const newInputGroup = document.createElement('div');
    newInputGroup.className = 'input-group mb-2';
    newInputGroup.innerHTML = `
      <input type="file" class="form-control" name="upload[]" required>
      <input type="text" class="form-control" name="description[]" placeholder="Enter description" style="width: 100%;">

    `;
    uploadContainer.appendChild(newInputGroup);
    this.classList.add('btn-added');
  });
  
  document.getElementById('otherServiceCheck').addEventListener('change', function() {
    const otherServiceInput = document.getElementById('otherService');
    if (this.checked) {
      otherServiceInput.classList.remove('hidden');
    } else {
      otherServiceInput.classList.add('hidden');
    }
  });

  document.getElementById('eventSelect').addEventListener('change', function() {
    const otherEventInput = document.getElementById('otherEvent');
    
    if (this.value === 'other') {
      otherEventInput.classList.remove('hidden');
    } else {
      otherEventInput.classList.add('hidden');
    }
  });
  document.querySelectorAll('.service-check').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const priceInput = this.parentElement.querySelector('.price-input');
      const descriptionInput = this.parentElement.querySelector('.description-input');

      if (this.checked) {
        priceInput.classList.remove('hidden');
        descriptionInput.classList.remove('hidden');

      } else {
        priceInput.classList.add('hidden');
        descriptionInput.classList.add('hidden');

      }
    });
});

document.getElementById("postButton").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default form submission

    // Create an object to store form data
    let formData = {
        eventName: document.getElementById("eventSelect").value.trim(),
        services: []
    };

    // Handle "Other" event input
    if (formData.eventName === "other") {
        formData.eventName = document.getElementById("otherEvent").value.trim();
    }

    // Get selected services and their details
    document.querySelectorAll(".service-check:checked").forEach((checkbox) => {
        let serviceName = checkbox.value;
        let priceInput = checkbox.parentElement.querySelector(".price-input");
        let descriptionInput = checkbox.parentElement.querySelector(".description-input");

        formData.services.push({
            serviceName: serviceName,
            price: priceInput ? priceInput.value.trim() : "",
            description: descriptionInput ? descriptionInput.value.trim() : ""
        });
    });

    console.log(formData);
    
    // Prepare the XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "../php/PostServiceFormProcess.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        console.log("Status: " + xhr.status);
        console.log("Readystate: " + xhr.readyState);

        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);

                if (response.status === "success") {
                    showSlideMessage(response.message);
                    setTimeout(() => {
                        window.location.href = "../html/servicePosted.html"; // Redirect after success
                    }, 4000);
                } else if (response.status === "failure") {
                    showSlideMessage(response.message);
                } else if (response.status === "error") {
                    console.log(response.message);
                }
            } else {
                showSlideMessage("Something went wrong. Please try again.");
            }
        }
    };

    xhr.send(JSON.stringify(formData));
    
});
