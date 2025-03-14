const EVENTS_PER_PAGE = 5; // Number of events to show per page
let currentPage = 1; // Default page
// Function to get query parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Function to sanitize input (removes special characters)
function sanitizeInput(input) {
    return input ? input.trim().replace(/[^a-zA-Z0-9 ]/g, "") : "No Event Selected";
}

// Function to dynamically load events with pagination
function loadEvents(eventList, page = 1) {
     const eventsContainer = document.getElementById("eventsContainer");
    const paginationContainer = document.querySelector(".pagination"); // ✅ Defined here

    if (!eventsContainer || !paginationContainer) {
        console.error("Error: Required container elements not found.");
        return;
    }

    eventsContainer.innerHTML = "";
    paginationContainer.innerHTML = ""; // ✅ Clear previous pagination buttons

    // Get selected filters (excluding "other")
    const selectedFilters = Array.from(document.querySelectorAll(".right-col input[type='checkbox']:checked"))
        .map(cb => cb.value.toLowerCase())
        .filter(filter => filter !== "other"); // Exclude "other" from selection

    // Define common service types
    const commonServices = ["whole event", "venue", "photography", "decor/ florists", "food catering", "rentals"];

    // Filter event list based on selected filters
    let filteredEvents = eventList;

    if (selectedFilters.length > 0) {
        filteredEvents = eventList.filter(event => {
            const services = event.service_details.toLowerCase();
            return selectedFilters.some(filter => services.includes(filter));
        });
    }

    // If "Other" is selected, exclude common services
    if (document.querySelector(".right-col input[value='other']").checked) {
        filteredEvents = filteredEvents.filter(event => {
            const services = event.service_details.toLowerCase();
            return !commonServices.some(service => services.includes(service));
        });
    }

    // Display filters status
    const filtersContainer = document.querySelector(".right-col h2");
    document.querySelectorAll(".selected-filters").forEach(el => el.remove()); // Clear old messages

    if (selectedFilters.length > 0) {
        if (filteredEvents.length === 0) {
            const filterText = document.createElement("p");
            filterText.classList.add("selected-filters");
            filterText.innerHTML = `<strong>Selected Filters:</strong> ${selectedFilters.join(", ")} not found.`;
            filtersContainer.insertAdjacentElement("afterend", filterText);
            return; // Exit since no events match
        } else {
            const filterText = document.createElement("p");
            filterText.classList.add("selected-filters");
            filterText.innerHTML = `<strong>Selected Filters:</strong> ${selectedFilters.join(", ")}`;
            filtersContainer.insertAdjacentElement("afterend", filterText);
        }
    }

    const totalEvents = filteredEvents.length;
    const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);
    currentPage = Math.min(page, totalPages);

    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);

    paginatedEvents.forEach(event => {
        const photoPath = event.photo_paths && event.photo_paths.length > 0 
            ? event.photo_paths[0] 
            : "../images/celeb.jpg"; 

        const serviceDetails = event.service_details ? event.service_details.split(", ") : [];
        let servicesHTML = "";
        let totalPrice = 0;

        if (serviceDetails.length > 0 ) {
            serviceDetails.forEach(service => {
                const match = service.match(/(.+?)\s*\(([^)]+)\)\s*:\s*([\d.]+)/);
                if (match) {
                    const serviceType = match[1];
                    const description = match[2];
                    const price = parseFloat(match[3]) || 0;

                    totalPrice += price;

                    servicesHTML += `
                    <h4>
                        <div class="servicesInfo">
                            <span class="services"><strong>${serviceType}</strong></span>: 
                            <span class="description">${description}</span>
                        </div>
                    </h4>`;
                }
            });
        } 

        if (!servicesHTML) {
            servicesHTML = "<p>No Services Available</p>";
        }

        const eventNameHTML = event.event_name !== "other" ? 
        `<h2 class="event-title">${event.event_name}</h2>` : "";

        const eventHTML = `
        <div class="house eventImage" 
            data-event='${JSON.stringify(event)
                .replace(/'/g, "&#39;")   // Escape single quotes
                .replace(/"/g, "&quot;") // Escape double quotes
            }'>
            <div>
                <img src="${photoPath}" alt="Event Image">
            </div>
            <div class="house-info">
                ${eventNameHTML}
                <div class="organizerInfo">
                    <h3 class="organizerNames">${event.organizer_name}</h3>
                    ${servicesHTML}
                </div>
                <div class="house-price">
                    <p class="price">${totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : "N/A"}</p>
                </div>
            </div>
        </div>`;


        eventsContainer.insertAdjacentHTML("beforeend", eventHTML);
    });

    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement("span");
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add("current");
            }
            pageButton.addEventListener("click", function () {
                loadEvents(eventList, i);
            });
            paginationContainer.appendChild(pageButton);
        }
    } else if (totalPages === 1 && totalEvents > 0) {
        const pageButton = document.createElement("span");
        pageButton.textContent = "1";
        pageButton.classList.add("current");
        paginationContainer.appendChild(pageButton);
    }

    document.querySelectorAll(".house").forEach(house => {
        house.addEventListener("click", function () {
            try {
                // Ensure correct attribute retrieval and decoding
                let rawData = this.getAttribute("data-event");
                if (!rawData) {
                    throw new Error("Missing data-event attribute");
                }

                // Decode any HTML-encoded characters before parsing
                let decodedData = rawData
                    .replace(/&quot;/g, '"')   // Convert &quot; to "
                    .replace(/&#39;/g, "'")    // Convert &#39; to '
                    .replace(/&amp;/g, "&");   // Convert &amp; to &

                // Parse JSON safely
                const eventData = JSON.parse(decodedData);

                // 🔹 Proceed with existing logic
                let photosHtml = "";
                if (eventData.photo_paths && Array.isArray(eventData.photo_paths) && eventData.photo_paths.length > 0) {
                    photosHtml = `
                        <div class="carousel">
                            <div class="carousel-track">
                                ${eventData.photo_paths.map((photo, index) => 
                                    `<img class="carousel-img ${index === 0 ? 'active' : ''}" src="${photo}" alt="Event Image">`
                                ).join('')}
                            </div>
                            <button class="prev" onclick="prevSlide(this)">&#10094;</button>
                            <button class="next" onclick="nextSlide(this)">&#10095;</button>
                        </div>
                    `;
                }

                let servicesHtml = `
                    <table class="serviceTable">
                        <thead>
                            <tr><th colspan="3">Service Details</th></tr>
                            <tr><th>Name</th><th>Price (USD)</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                `;

                let totalPrice = 0; // Initialize total price

                if (eventData.service_details) {
                    let servicesArray = eventData.service_details.split(",");
                    servicesHtml += servicesArray.map(serviceString => {
                        let match = serviceString.match(/(.*)\((.*)\):\s([\d.]+)/);
                        if (match) {
                            let serviceName = match[1].trim();
                            let serviceDescription = match[2].trim();
                            let servicePrice = parseFloat(match[3].trim());

                            totalPrice += servicePrice; // Accumulate total price

                            return `
                                <tr>
                                    <td>${serviceName}</td>
                                    <td>$${servicePrice.toFixed(2)}</td>
                                    <td>${serviceDescription}</td>
                                </tr>
                            `;
                        }
                        return "";
                    }).join('');
                    } else {
                        servicesHtml += `<tr><td colspan="3">No Services Available</td></tr>`;
                    }

                    // Add the Total Price row
                    servicesHtml += `
                        <tr>
                            <td  style="font-weight: bold;">
                                Total Price
                            </td>
                            <td  style="font-weight: bold;">
                                $${totalPrice.toFixed(2)}
                            </td>
                            <td>
                            </td>
                        </tr>
                    `;

                    servicesHtml += `
                            </tbody>
                        </table>
                    `;


                const modalContent = `
                    ${photosHtml}
                    <h2>${eventData.event_name}</h2>
                    <p><strong>Organizer:</strong> ${eventData.organizer_name}</p>
                    <p><strong>Phone:</strong> ${eventData.organizer_phone}</p>
                    <p><strong>Email:</strong> ${eventData.organizer_email}</p>
                    ${servicesHtml}
                    <p><strong>Note:</strong> Prices are Negotiable.</p>
                    <button class="confirm-btn">Send The Confirmation Email For Booking</button>
                `;

                document.getElementById("modalEventDetails").innerHTML = modalContent;
                document.getElementById("eventModal").style.display = "flex";
                document.body.classList.add("modal-open");

                document.addEventListener("click", function (event) {
                    if (event.target.classList.contains("confirm-btn")) {
                        const organizerEmail = eventData.organizer_email; // Get organizer email
                
                        if (!organizerEmail || organizerEmail === "No Email") {
                            alert("Organizer email not available.");
                            return;
                        }
                
                        const eventName = eventData.event_name;
                        const organizerName = eventData.organizer_name;
                        let totalPrice = 0; // Initialize total price
                
                        let servicesText = "Service Details:\n";
                        servicesText += "------------------------------------------\n";
                        servicesText += "Name | Price (USD) | Description\n";
                        servicesText += "------------------------------------------\n";
                
                        if (eventData.service_details) {
                            let servicesArray = eventData.service_details.split(",");
                            servicesArray.forEach(serviceString => {
                                let match = serviceString.match(/(.*)\((.*)\):\s([\d.]+)/);
                                if (match) {
                                    let serviceName = match[1].trim();
                                    let serviceDescription = match[2].trim();
                                    let servicePrice = parseFloat(match[3].trim());
                
                                    totalPrice += servicePrice; // Accumulate total price
                
                                    servicesText += `${serviceName} | $${servicePrice.toFixed(2)} | ${serviceDescription}\n`;
                                }
                            });
                        } else {
                            servicesText += "No Services Available\n";
                        }
                
                        servicesText += "------------------------------------------\n";
                        servicesText += `Total Price: $${totalPrice.toFixed(2)}\n`;
                
                        const subject = encodeURIComponent(`Booking Confirmation for ${eventName}`);
                        const body = encodeURIComponent(
                            `Hello ${organizerName},\n\n` +
                            `I am interested in booking the event "${eventName}". Please provide me with the next steps.\n\n` +
                            `${servicesText}\n` +
                            `Best regards`
                        );
                
                        // Open a minimized Gmail compose window
                        window.open(
                            `https://mail.google.com/mail/?view=cm&fs=1&to=${organizerEmail}&su=${subject}&body=${body}`,
                            "gmailCompose",
                            "width=700,height=500"
                        );
                    }
                });
                
                
                
            } catch (error) {
                console.error("Error parsing JSON:", error, "Raw Data:", this.getAttribute("data-event"));
            }
        });
    
    });

    
    // Close modal when clicking the "X" button
    document.querySelector(".close").addEventListener("click", function () {
        document.getElementById("eventModal").style.display = "none";
        document.body.classList.remove("modal-open");
    });
    
    // Close modal if clicked outside the content box
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("eventModal");
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.classList.remove("modal-open");
        }
    });
    
}



// Function to update displayed filters and reload events
function updateDisplayedFilters() {
    fetchEventData(globalEventName, 1); // Reload events after updating filters
}


// Function to fetch event data from the backend
function fetchEventData(eventName, page = 1) {
    fetch("../php/FetchOrgEventsDetailsProcess.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ event_name: eventName, page: page })
    })
    .then(response => response.text())  // Get raw text first
    .then(text => {
        return JSON.parse(text);  // Now parse it
    })
    .then(data => {
        if (data.status === "success") {
            loadEvents(data.data.events);
        } else {
            console.error("Error fetching events:", data.message);
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
    
}

// Function to get query parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ✅ Function to sanitize input (prevents special characters)
function sanitizeInput(input) {
    return input ? input.trim().replace(/[^a-zA-Z0-9 ]/g, "") : "No Event Selected";
}

// Global variable for event name
let globalEventName = "";

// Event Listener for Page Load
document.addEventListener("DOMContentLoaded", () => {
    globalEventName = sanitizeInput(getQueryParam("event")); // ✅ No error now
    document.getElementById("eventName").textContent = globalEventName;
    fetchEventData(globalEventName);
});


// Pagination Click Event
document.querySelectorAll(".pagination span").forEach(page => {
    page.addEventListener("click", function () {
        document.querySelector(".pagination .current")?.classList.remove("current");
        this.classList.add("current");

        const pageNumber = parseInt(this.textContent, 10);
        fetchEventData(globalEventName, pageNumber);
    });
});

// Event Listener for Filter Selection
document.querySelectorAll(".right-col input[type='checkbox']").forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        updateDisplayedFilters(); // Update selected filter display & reload events
    });
});


// 🔹 Image Carousel Functions
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