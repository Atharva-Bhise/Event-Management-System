let profileDropdownList = document.querySelector(".profile-dropdown-list");
let btn = document.querySelector(".profile-dropdown-btn");
let classList = profileDropdownList.classList;

// Toggle the dropdown on click
const toggle = () => classList.toggle("active");

// Close the dropdown if clicked outside
document.addEventListener("click", function (e) {
    if (!btn.contains(e.target) && !profileDropdownList.contains(e.target)) {
        classList.remove("active");
    }
});

// Optionally, close the dropdown if the mouse hovers outside
profileDropdownList.addEventListener("mouseleave", function () {
    classList.remove("active");
});
