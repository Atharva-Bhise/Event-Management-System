new Swiper('.card-wrapper', {
    loop: true,
    spaceBetween: 60,
  
    // Pagination bullets
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
  
    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    // Responsive breakpoints for 3 posts in a row
    breakpoints: {
        0: {
            slidesPerView: 1  // Mobile view: Show 1 post
        },
        768: {
            slidesPerView: 2  // Tablet view: Show 2 posts
        },
        1024: {
            slidesPerView: 3  // Desktop view: Show 3 posts
        }
    }
});
