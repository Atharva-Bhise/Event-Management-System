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

    // Pagination Logic
    const totalEvents = filteredEvents.length;
    const totalPages = Math.ceil(totalEvents / EVENTS_PER_PAGE);
    currentPage = Math.min(page, totalPages); // Ensure valid page number

    // Slice events for current page
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    const paginatedEvents = filteredEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);

    // Display events
    paginatedEvents.forEach(event => {
        const photoPath = event.photo_paths && event.photo_paths.length > 0 
            ? event.photo_paths[0] 
            : "../images/celeb.jpg"; 

        const serviceDetails = event.service_details ? event.service_details.split(", ") : [];
        let servicesHTML = "";
        let totalPrice = 0;

        if (serviceDetails.length > 0 && event.service_details.trim() !== "") {
            serviceDetails.forEach(service => {
                const match = service.match(/^(.+)\((.+)\): ([\d.]+)$/);
                if (match) {
                    const serviceType = match[1].trim();
                    const description = match[2].trim();
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

        // Modify eventHTML to include event name above organizerInfo
        const eventHTML = `
        <div class="house eventImage">
            <div>
                <img src="${photoPath}" alt="Event Image">
            </div>
            <div class="house-info">
                ${eventNameHTML} <!-- Display Event Name Here -->
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

    // Generate pagination buttons
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
    } 
    // ✅ If only one page exists, show a single button
    else if (totalPages === 1 && totalEvents > 0) {
        const pageButton = document.createElement("span");
        pageButton.textContent = "1";
        pageButton.classList.add("current");
        paginationContainer.appendChild(pageButton);
    }

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
        body: JSON.stringify({
            event_name: eventName,
            page: page
        })
    })
    .then(response => response.json())
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
