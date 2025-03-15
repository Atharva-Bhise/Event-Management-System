document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalDescription = document.getElementById("modal-description");
  const closeBtn = document.querySelector(".close");
  const galleryContainer = document.querySelector(".gallery-container");
  const filterButtons = document.querySelectorAll(".filter-btn");


  // Function to fetch gallery data from the backend (using POST request)
  function fetchGalleryPhotos() {
    fetch("../php/FetchGalleryPhotos.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ request: "fetch_all" }) // Send request data
    })
      .then(response => response.json())
      .then(data => {

        if (data.status === "success" && Array.isArray(data.data.gallery)) {
          displayGallery(data.data.gallery);
        } else {
          console.error("❌ Error fetching gallery data:", data.message);
        }
      })
      .catch(error => {
        console.error("❌ Fetch error:", error);
      });
  }

  // Function to display gallery images dynamically
  function displayGallery(galleryData) {
    galleryContainer.innerHTML = ""; // Clear existing images

    galleryData.forEach(item => {
        const imageElement = document.createElement("img");
        imageElement.src = item.photo_paths; // 🔥 Ensure correct path
        imageElement.classList.add("gallery-item", item.event_name.toLowerCase().replace(/\s+/g, "_"));
        imageElement.setAttribute("data-description", `
            <strong>Event: ${item.event_name}</strong> <br>
            <strong>Description: ${item.photo_description || "No description available."}</strong> <br>
            <strong>Organizer: ${item.organizer_name}</strong>
        `);

        galleryContainer.appendChild(imageElement);

        // Add event listener for modal
        imageElement.addEventListener("click", () => {
            modal.style.display = "flex";
            modalImg.src = imageElement.src;
            modalDescription.innerHTML = imageElement.getAttribute("data-description");
        });
    });
  }

  // Modal close event
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // 🔹 **Filter Functionality**
  const excludedEvents = ["birthday", "wedding", "concert", "baby_shower", "anniversary"];

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((button) => button.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      const galleryItems = document.querySelectorAll(".gallery-item");

      galleryItems.forEach((item) => {
        const itemClass = item.classList[1]; // Get the event name class

        if (filter === "all") {
          item.classList.remove("hidden");
        } 
        else if (filter === "other") {
          // Hide images that belong to excluded events
          if (excludedEvents.includes(itemClass)) {
            item.classList.add("hidden");
          } else {
            item.classList.remove("hidden");
          }
        } 
        else {
          // Show only selected category
          if (item.classList.contains(filter)) {
            item.classList.remove("hidden");
          } else {
            item.classList.add("hidden");
          }
        }
      });
    });
  });

  // Fetch gallery photos on page load
  fetchGalleryPhotos();
});
