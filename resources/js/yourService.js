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
            eventBox.setAttribute('data-service-id', eventId);

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
                                <tr>
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