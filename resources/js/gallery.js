document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalDescription = document.getElementById("modal-description");
  const closeBtn = document.querySelector(".close");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Modal functionality
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = item.src;
      modalDescription.textContent = item.getAttribute("data-description") || "No description available.";
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Filter functionality
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((button) => button.classList.remove("active"));
      // Add active class to the clicked button
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      // Show/hide images based on filter
      galleryItems.forEach((item) => {
        if (filter === "all" || item.classList.contains(filter)) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = item.src;
  
      // Get the description and replace newlines with <br> tags
      const description = item.getAttribute("data-description") || "No description available.";
      modalDescription.innerHTML = description.replace(/\n/g, "<br>");
    });
  });
  
  
});
