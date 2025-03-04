document.addEventListener("DOMContentLoaded", function () {
    let loadMoreBtn = document.querySelector('#load-more');
    let currentItem = 3;
    let boxes = document.querySelectorAll('.container .box-container .box');

    // Load more functionality
    loadMoreBtn.onclick = () => {
        for (let i = currentItem; i < currentItem + 3; i++) {
            if (boxes[i]) {
                boxes[i].style.display = 'inline-block';
            }
        }
        currentItem += 3;
        if (currentItem >= boxes.length) {
            loadMoreBtn.style.display = 'none';
        }
    };

    // Handle View Button Click
    document.querySelectorAll(".view").forEach((viewBtn) => {
        viewBtn.addEventListener("click", function () {
            let box = viewBtn.closest(".box"); // Get the parent box
            let serviceDetails = box.querySelector(".servicesDeatils");

            if (!serviceDetails) return; // If there's no .servicesDeatils, exit

            let isExpanded = serviceDetails.classList.contains("show");

            // Collapse all before expanding the clicked one
            document.querySelectorAll(".servicesDeatils").forEach((details) => {
                details.style.maxHeight = "0px";
                details.classList.remove("show");
            });

            if (!isExpanded) {
                serviceDetails.style.maxHeight = serviceDetails.scrollHeight + "px";
                serviceDetails.classList.add("show");
            }
        });
    });
});
