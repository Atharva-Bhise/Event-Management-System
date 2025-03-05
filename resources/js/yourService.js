let loadMoreBtn = document.querySelector('#load-more');
let currentItem = 3;

loadMoreBtn.onclick = () => {
   let boxes = [...document.querySelectorAll('.container .box-container .box')];
   for (var i = currentItem; i < currentItem + 3; i++) {
      if (boxes[i]) {
         boxes[i].style.display = 'inline-block';
      }
   }
   currentItem += 3;

   if (currentItem >= boxes.length) {
      loadMoreBtn.style.display = 'none';
   }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".view").forEach(viewBtn => {
        viewBtn.addEventListener("click", function () {
            let box = this.closest(".box"); // Get the specific box clicked
            let serviceDetails = box.querySelector(".servicesDetails"); // Target this box's details

            if (!serviceDetails) return; // Prevent errors if .servicesDetails is missing

            // Toggle the clicked box only
            if (serviceDetails.classList.contains("show")) {
                serviceDetails.style.maxHeight = "0px"; // Collapse
                serviceDetails.classList.remove("show");
                box.classList.remove("expanded");
            } else {
                serviceDetails.style.maxHeight = serviceDetails.scrollHeight + "px"; // Expand dynamically
                serviceDetails.classList.add("show");
                box.classList.add("expanded");
            }
        });
    });
});