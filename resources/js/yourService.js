document.addEventListener("DOMContentLoaded", function () {
    let loadMoreBtn = document.querySelector('#load-more');

    // Fetch and display services
    fetchServices();

    // Toggle Service Details
    document.querySelector('.container .box-container').addEventListener('click', function (e) {
        let viewBtn = e.target.closest(".view");
        if (!viewBtn) return;

        let box = viewBtn.closest(".box");
        let serviceDetails = box.querySelector(".servicesDetailsContainer");

        if (!serviceDetails) return;

        let isExpanded = serviceDetails.classList.contains("show");

        // Collapse all except the clicked one
        document.querySelectorAll('.servicesDetailsContainer').forEach(details => {
            if (details !== serviceDetails) {
                details.style.maxHeight = "0px";
                details.classList.remove("show");
                details.closest(".box").classList.remove("expanded");
            }
        });

        // Toggle the clicked box
        if (!isExpanded) {
            serviceDetails.classList.add("show");
            box.classList.add("expanded");
            serviceDetails.style.maxHeight = serviceDetails.scrollHeight + "px";
        } else {
            serviceDetails.style.maxHeight = "0px";
            box.classList.remove("expanded");

            setTimeout(() => {
                serviceDetails.classList.remove("show");
            }, 300);
        }
    });

    // Event delegation for edit button
    document.querySelector('.box-container').addEventListener("click", function (e) {
        let editBtn = e.target.closest(".edit");
        if (!editBtn) return;

        let box = editBtn.closest(".box");
        if (!box) return console.error(`Box not found! Event target: ${e.target.tagName}, Event type: ${e.type}, Context: Edit button click handler`);

        let table = box.querySelector(".serviceTable tbody");
        if (!table) return console.error(`Service table not found in box with ID: ${box.getAttribute('data-event-id')} for event: ${eventName}`);

        let eventName = box.querySelector(".eventName").innerText.trim();
        if (!eventName) return console.error(`Event name not found for box with ID: ${box.getAttribute('data-event-id')}`);

        let isInEditMode = table.classList.toggle("editing");
        if (isInEditMode) {

            // Enter edit mode for all rows
            table.querySelectorAll("tr").forEach(row => {
            row.querySelectorAll("td").forEach((td, index) => {
                if (index === 0) { // Name column
                let select = document.createElement("select");
                select.className = "form-select";
                select.innerHTML = `
                    <option value="">Select a Service</option>
                    <option value="venue">Venue</option>
                    <option value="photography">Photography</option>
                    <option value="food catering">Food Catering</option>
                    <option value="rentals">Rentals</option>
                    <option value="whole event">Whole Event</option>
                    <option value="decor/ florists">Decor/ Florists</option>
                    <option value="other">Other</option>
                `;
                let currentServiceName = td.innerText.trim();
                select.value = currentServiceName.toLowerCase();
                select.style.width = "100%";
                select.style.border = "1px solid #ccc";
                select.style.padding = "5px";
                td.innerHTML = "";
                td.appendChild(select);
                table.style.height = table.scrollHeight + "px";
                table.style.height = "auto";

                select.addEventListener("change", function () {
                    let existingInput = td.querySelector("input");
                    if (existingInput) {
                    td.removeChild(existingInput);
                    }

                    if (select.value === "other") {
                    let input = document.createElement("input");
                    input.type = "text";
                    input.placeholder = "Enter service name";
                    input.style.width = "100%";
                    input.style.border = "1px solid #ccc";
                    input.style.padding = "5px";
                    td.appendChild(input);
                    table.style.height = table.scrollHeight + "px";
                    table.style.height = "auto";

                    input.addEventListener("input", function () {
                        select.querySelector("option[value='other']").innerText = input.value.trim() || "Other";
                        console.log("Entered service name:", input.value.trim()); // Debugging
                    });
                    }
                });

                if (currentServiceName.toLowerCase() === "other") {
                    let input = document.createElement("input");
                    input.type = "text";
                    input.placeholder = "Enter service name";
                    input.style.width = "100%";
                    input.style.border = "1px solid #ccc";
                    input.style.padding = "5px";
                    input.value = currentServiceName;
                    td.appendChild(input);
                    table.style.height = table.scrollHeight + "px";
                    table.style.height = "auto";

                    input.addEventListener("input", function () {
                    select.querySelector("option[value='other']").innerText = input.value.trim() || "Other";
                    console.log("Entered service name:", input.value.trim()); // Debugging
                    });
                } else {
                    td.innerHTML = "";
                    td.appendChild(select);
                }
                } else {
                let input = document.createElement("input");
                input.type = "text";
                input.value = td.innerText.trim();
                input.style.width = "100%";
                input.style.border = "1px solid #ccc";
                input.style.padding = "5px";
                td.innerHTML = "";
                table.style.height = "auto";
                td.appendChild(input);
                }
            });
            });
            editBtn.classList.add("editing-mode"); // Change edit button color to green
            table.style.height = "auto";

        } else {
            // Save changes for all rows
            let data = [];
            table.querySelectorAll("tr").forEach(row => {
            let rowData = {};
            row.querySelectorAll("td").forEach((td, index) => {
                let input = td.querySelector("input, select");
                if (input) {
                // Use the data-column-name attribute if present, otherwise default to column{index}
                let columnName = td.getAttribute("data-column-name") || `column${index}`;
                if (input.tagName.toLowerCase() === "select" && input.value === "other") {
                    let customInput = td.querySelector("input[type='text']");
                    let customValue = customInput && customInput.value.trim() !== "" ? customInput.value.trim() : "N/A";
                    td.innerText = customValue;
                    rowData[columnName] = customValue; // Save the custom value
                    input.querySelector("option[value='other']").innerText = customValue; // Update the option text
                } else {
                    td.innerText = input.value.trim() !== "" ? input.value.trim() : "N/A"; // Prevent empty cells
                    rowData[columnName] = input.value.trim();
                }
                }
            });
            rowData['serviceId'] = row.getAttribute('data-service-id'); // Add serviceId to rowData
            data.push(rowData);
            });

            editBtn.classList.remove("editing-mode"); // Reset edit button color

            let eventId = box.getAttribute("data-event-id");
            if (eventId) {
            saveChanges(eventId, data, eventName);
            } else {
            console.error("Service ID not found!");
            }
        }
    });

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
    };
        
    function saveChanges(eventId, data, eventName) {
        console.log(`Saving changes for Event ID: ${eventId}`, data, `Event Name: ${eventName}`);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "../php/UpdateServicesFormProcess.php", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.status === "success") {
                            showSlideMessage(response.message);
                        } else {
                            showSlideMessage(response.message);
                        }
                    } catch (e) {
                        console.log("Invalid server response: " + e.message);
                    }
                } else {
                    console.log("Request failed with status: " + xhr.status);
                }
            }
        };

        xhr.onerror = function () {
            alert("Request failed due to a network error.");
        };

        xhr.send(JSON.stringify({ eventId, data, eventName }));
    }

    // Load More Functionality
    loadMoreBtn.onclick = () => {
        let hiddenBoxes = document.querySelectorAll('.box-container .box.hidden');
        for (let i = 0; i < 3 && i < hiddenBoxes.length; i++) {
            hiddenBoxes[i].classList.remove('hidden');
        }

        if (document.querySelectorAll('.box-container .box.hidden').length === 0) {
            loadMoreBtn.style.display = 'none';
        }
    };

    // Fetch services from server
    function fetchServices() {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "../php/YourServiceFormProcess.php", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.status === "success") {
                            displayServices(response.data);
                        } else {
                            console.error("Failed to fetch services:", response.message);
                        }
                    } catch (e) {
                        console.error("Invalid server response:", e);
                    }
                } else {
                    console.error("Request failed with status:", xhr.status);
                }
            }
        };

        xhr.onerror = function () {
            console.error("Request failed due to a network error.");
        };

        xhr.send();
    }

    // Function to display services in HTML
    function displayServices(services) {
        const boxContainer = document.querySelector('.box-container');
        boxContainer.innerHTML = ''; // Clear existing content

        Object.keys(services).forEach(eventId => {
            const event = services[eventId];
            const eventBox = document.createElement('div');
            eventBox.className = 'box hidden';
            eventBox.setAttribute('data-event-id', eventId);

            let photosHtml = '';
            let servicesHtml = '';

            // Create a carousel for event photos (if multiple)
            if (event.photos && Array.isArray(event.photos) && event.photos.length > 0) {
                photosHtml = `
                    <div class="carousel">
                        <div class="carousel-track">
                            ${event.photos.map((photo, index) => {
                                let correctPath = photo.photoPath.replace("/xampp/htdocs/", "/");
                                return `<img class="carousel-img ${index === 0 ? 'active' : ''}" src="${correctPath}" alt="${photo.photoDescription}">`;
                            }).join('')}
                        </div>
                        <button class="prev" onclick="prevSlide(this)">&#10094;</button>
                        <button class="next" onclick="nextSlide(this)">&#10095;</button>
                    </div>
                `;
            }

            // Loop through services and display in a table format
            servicesHtml = `
                <table class="serviceTable">
                    <thead>
                        <tr>
                            <th colspan="3" align="center">Service</th>
                        </tr>
                        <tr>
                            <th>Name</th>
                            <th>Price(USD)</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(event.services).map(serviceId => {
                            const service = event.services[serviceId];
                            return `
                                <tr data-service-id="${serviceId}">
                                    <td>${service.serviceType}</td>
                                    <td>${service.servicePrice}$</td>
                                    <td>${service.serviceDescription}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;

            eventBox.innerHTML = `
                <div class="image">
                    ${photosHtml}
                </div>
                <div class="content">
                    <h3 class="eventName">${event.eventName}</h3>
                    <div class="icons">
                        <div class="actions">
                            <span class="fa-regular fa-eye view"></span>
                            <span class="fa-regular fa-pen-to-square edit"></span>
                            <span class="fa-solid fa-trash delete"></span> 
                        </div>
                    </div>
                    <div class="servicesDetailsContainer">
                        ${servicesHtml}
                    </div>
                </div>
            `;

            boxContainer.appendChild(eventBox);
        });

        // Initially show the first 3 boxes
        let initialBoxes = document.querySelectorAll('.box-container .box.hidden');
        for (let i = 0; i < 3 && i < initialBoxes.length; i++) {
            initialBoxes[i].classList.remove('hidden');
        }

        if (document.querySelectorAll('.box-container .box.hidden').length === 0) {
            document.getElementById('load-more').style.display = 'none';
        }
    }
});

// Image carousel functionality
function prevSlide(button) {
    let container = button.closest('.carousel');
    let images = container.querySelectorAll('.carousel-img');
    let activeIndex = [...images].findIndex(img => img.classList.contains('active'));

    images[activeIndex].classList.remove('active');
    let newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    images[newIndex].classList.add('active');
}

function nextSlide(button) {
    let container = button.closest('.carousel');
    let images = container.querySelectorAll('.carousel-img');
    let activeIndex = [...images].findIndex(img => img.classList.contains('active'));

    images[activeIndex].classList.remove('active');
    let newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    images[newIndex].classList.add('active');
}