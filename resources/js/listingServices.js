const SERVICES_PER_PAGE = 5; // Number of services per page
let currentPage = 1; // Default page

// Function to get query parameters from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ✅ Function to sanitize input (allows letters, numbers, spaces, and '/')
function sanitizeInput(input) {
    return input ? input.trim().replace(/[^a-zA-Z0-9 /]/g, "").replace(/\s+/g, " ") : "No Service Selected";
}

// Global variable for service name
let globalServiceName = "";

// Function to dynamically load services with pagination
function loadServices(serviceList, page = 1) {
    const servicesContainer = document.getElementById("servicesContainer");
    const paginationContainer = document.querySelector(".pagination");
    // Display filter status
    const filtersContainer = document.querySelector(".right-col h2");
    if (!servicesContainer || !paginationContainer) {
        console.error("Error: Required container elements not found.");
        return;
    }

    servicesContainer.innerHTML = "";
    paginationContainer.innerHTML = "";

    // Get selected filters (excluding "other")
    const selectedFilters = Array.from(document.querySelectorAll(".right-col input[type='checkbox']:checked"))
    .map(cb => cb.value.toLowerCase().replace(/_/g, " ")) // Normalize filter names
    .filter(filter => filter !== "other"); // Exclude "other" from selection

    // Define common events types to exclude when "Other" is selected
    const commonEvents = ["birthday", "wedding", "concert", "anniversary", "baby shower"];

    let filteredServices = serviceList;

    // Apply filter based on selected checkboxes (Filter by event_name instead of service_type)
    if (selectedFilters.length > 0) {
        filteredServices = serviceList.filter(service => {
            const eventName = service.event_name.toLowerCase(); // Correct property for filtering
            return selectedFilters.some(filter => eventName.includes(filter));
        });
    }

    // Debugging: Log filtered services before checking if they're empty
    console.log("Filtered Services:", filteredServices);

    // If "Other" is selected, exclude common service types
    if (document.querySelector(".right-col input[value='other']").checked) {
        filteredServices = filteredServices.filter(service => {
            return !commonEvents.includes(service.event_name.toLowerCase());
        });

        // Check if no events match the "Other" filter
        if (filteredServices.length === 0) {
            const filterText = document.createElement("p");
            filterText.classList.add("selected-filters");
            filterText.innerHTML = `<strong>Selected Filters:</strong> Other not found.`;
            filtersContainer.insertAdjacentElement("afterend", filterText);
            return; // Exit since no events match
        }
    }

    document.querySelectorAll(".selected-filters").forEach(el => el.remove()); // Clear old messages

    const filterText = document.createElement("p");
    filterText.classList.add("selected-filters");

    if (selectedFilters.length > 0) {
        if (filteredServices.length === 0) {
            filterText.innerHTML = `<strong>Selected Filters:</strong> ${selectedFilters.join(", ")} not found.`;
        } else {
            filterText.innerHTML = `<strong>Selected Filters:</strong> ${selectedFilters.join(", ")}`;
        }
        filtersContainer.insertAdjacentElement("afterend", filterText);
    }

    // ✅ Now `filteredServices` contains the correct service list based on applied filters.
    const totalServices = filteredServices.length;
    const totalPages = Math.max(1, Math.ceil(totalServices / SERVICES_PER_PAGE)); // Ensure at least 1 page
    currentPage = Math.min(page, totalPages);

    const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
    const paginatedServices = filteredServices.slice(startIndex, startIndex + SERVICES_PER_PAGE);

    paginatedServices.forEach(service => {
        const photoPath = service.photo_paths && service.photo_paths.length > 0
            ? service.photo_paths[0]
            : "../images/celeb.jpg";

        const serviceHTML = `
        <div class="house serviceImage"
            data-service='${JSON.stringify(service)
                .replace(/'/g, "&#39;")   // Escape single quotes
                .replace(/"/g, "&quot;") // Escape double quotes
            }'>
            <div>
                <img src="${photoPath}" alt="Service Image">
            </div>
            <div class="house-info">
                <h2 class="event-name">${service.event_name}</h2>
                <h2 class="provider-name">${service.organizer_name}</h2>
                <h3 class="service-title">${service.service_type}</h3>
                <span class="description">${service.service_description || "No Description Available"}</span>
                <div class="house-price">
                    <p class="price">${service.service_price ? `Rs. ${parseFloat(service.service_price).toFixed(2)}/-` : "N/A"}</p>
                </div>
            </div>
        </div>`;

        servicesContainer.insertAdjacentHTML("beforeend", serviceHTML);
    });

    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("span");
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add("current");
        }
        pageButton.addEventListener("click", function () {
            loadServices(serviceList, i);
        });
        paginationContainer.appendChild(pageButton);
    }

    // Add event listener for service pop-up modal
    document.querySelectorAll(".house").forEach(house => {
        house.addEventListener("click", function () {
            try {
                let rawData = this.getAttribute("data-service");
                if (!rawData) {
                    throw new Error("Missing data-service attribute");
                }

                let decodedData = rawData
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&amp;/g, "&");

                const serviceData = JSON.parse(decodedData);

                let photosHtml = "";
                if (serviceData.photo_paths && Array.isArray(serviceData.photo_paths) && serviceData.photo_paths.length > 0) {
                    photosHtml = `
                        <div class="carousel">
                            <div class="carousel-track">
                                ${serviceData.photo_paths.map((photo, index) => 
                                    `<img class="carousel-img ${index === 0 ? 'active' : ''}" src="${photo}" alt="Service Image">`
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
                        <tr><th colspan="2">Service Details</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Event Name</strong></td>
                            <td>${serviceData.event_name}</td>
                        </tr>
                        <tr>
                            <td><strong>Service Name</strong></td>
                            <td>${serviceData.service_type}</td>
                        </tr>
                        <tr>
                            <td><strong>Service Provider Name</strong></td>
                            <td>${serviceData.organizer_name}</td>
                        </tr>
                        <tr>
                            <td><strong>Contact</strong></td>
                            <td>${serviceData.organizer_phone}</td>
                        </tr>
                        <tr>
                            <td><strong>Email</strong></td>
                            <td>${serviceData.organizer_email}</td>
                        </tr>
                        <tr>
                            <td><strong>Price (Indian Rupee)</strong></td>
                            <td>${serviceData.service_price ? `Rs. ${parseFloat(serviceData.service_price).toFixed(2)}/-` : "N/A"}</td>
                        </tr>
                        <tr>
                            <td><strong>Description</strong></td>
                            <td>${serviceData.service_description || "No Description Available"}</td>
                        </tr>
                    </tbody>
                </table>
                `;

                // ✅ Integrate this into the modal content
                const modalContent = `
                ${photosHtml}
                ${servicesHtml}
                <button class="confirm-btn">Send Inquiry Email</button>
                `;
        
                document.getElementById("modalServiceDetails").innerHTML = modalContent;
                document.getElementById("serviceModal").style.display = "flex";
                document.body.classList.add("modal-open");
                
                document.addEventListener("click", function (event) {
                    if (event.target.classList.contains("confirm-btn")) {
                        const providerEmail = serviceData.organizer_email; // Get provider email
                
                        if (!providerEmail || providerEmail === "No Email") {
                            alert("Service provider email not available.");
                            return;
                        }
                        const eventName = serviceData.event_name;
                        const serviceType = serviceData.service_type;
                        const providerName = serviceData.organizer_name;
                        let totalPrice = serviceData.service_price ? parseFloat(serviceData.service_price) : 0; // Initialize price
                
                        let servicesText = "Service Details:\n";
                        servicesText += "------------------------------------------\n";
                        servicesText += "Name | Price (Indian Rupee) | Description\n";
                        servicesText += "------------------------------------------\n";
                
                        if (serviceData.service_type) {
                            servicesText += `${serviceType} | Rs. ${totalPrice.toFixed(2)}/- | ${serviceData.service_description || "No Description"}\n`;
                        } else {
                            servicesText += "No Service Details Available\n";
                        }
                
                        servicesText += "------------------------------------------\n";
                        servicesText += `Total Price: Rs. ${totalPrice.toFixed(2)}/-\n`;
                
                        const subject = encodeURIComponent(`Inquiry about ${serviceType}`);
                        const body = encodeURIComponent(
                            `Hello ${providerName},\n\n` +
                            `I am interested in knowing more about the service "${serviceType}" for the event "${eventName}". Please provide me with more details.\n\n` +
                            `${servicesText}\n` +
                            `Best regards`
                        );
                
                        // Open a minimized Gmail compose window
                        window.open(
                            `https://mail.google.com/mail/?view=cm&fs=1&to=${providerEmail}&su=${subject}&body=${body}`,
                            "gmailCompose",
                            "width=700,height=500"
                        );
                    }
                });
                

            } catch (error) {
                console.error("Error parsing JSON:", error, "Raw Data:", this.getAttribute("data-service"));
            }
        });
    });

    // Close modal when clicking the "X" button
    document.querySelector(".close").addEventListener("click", function () {
        document.getElementById("serviceModal").style.display = "none";
        document.body.classList.remove("modal-open");
    });
    
    // Close modal if clicked outside the content box
    window.addEventListener("click", function (event) {
        const modal = document.getElementById("serviceModal");
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.classList.remove("modal-open");
        }
    });
}

// Fetch service data
function fetchServiceData(serviceName, page = 1) {
    fetch("../php/FetchServiceDetailsProcess.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_name: serviceName, page: page })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            loadServices(data.data.services);
        } else {
            console.error("Error fetching services:", data.message);
        }
    })
    .catch(error => console.error("Fetch error:", error));
}

// ✅ This fixes all filtering issues & pagination edge cases.

// Function to update displayed filters and reload events
function updateDisplayedFilters() {
    fetchServiceData(globalServiceName, 1); // Reload service after updating filters
}

// Event Listener for Page Load
document.addEventListener("DOMContentLoaded", () => {
    globalServiceName = sanitizeInput(getQueryParam("service"));
    document.getElementById("serviceName").textContent = globalServiceName;

    console.log("Service Name from URL:", globalServiceName); // ✅ Debugging Log

    fetchServiceData(globalServiceName);
});


// Pagination Click Event
document.querySelectorAll(".pagination span").forEach(page => {
    page.addEventListener("click", function () {
        document.querySelector(".pagination .current")?.classList.remove("current");
        this.classList.add("current");

        const pageNumber = parseInt(this.textContent, 10);
        fetchServiceData(globalServiceName, pageNumber);
    });
});

// Event Listener for Filter Selection
document.querySelectorAll(".right-col input[type='checkbox']").forEach(checkbox => {
    checkbox.addEventListener("change", function () {
        updateDisplayedFilters(); // Update selected filter display & reload Services
    });
})

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