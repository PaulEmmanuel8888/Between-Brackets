

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menuToggle");
  const navigation = document.querySelector(".navigation");
  const navItems = document.querySelectorAll(".navigation li");

  // Get the current page URL
  const currentPage = window.location.pathname;

  navItems.forEach((item) => {
    const link = item.querySelector("a");

    // Check if the link's href matches the current page
    if (link.getAttribute("href") === currentPage) {
      item.classList.add("active");
    }

    item.addEventListener("click", function () {
      if (this.classList.contains("active")) {
        // Prevent default action if the item is already active
        this.preventDefault();
        return;
      }

      menuToggle.classList.remove("active");
      navigation.classList.remove("active");
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';

      // Remove 'active' class from all items
      navItems.forEach((navItem) => navItem.classList.remove("active"));

      // Add 'active' class to the clicked item
      this.classList.add("active");
    });
  });

  menuToggle.addEventListener("click", function () {
    menuToggle.classList.toggle("active");
    navigation.classList.toggle("active");

    if (menuToggle.classList.contains("active")) {
      menuToggle.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });

  //Get Current Date
  const dateElement = document.getElementById("current-date");
  const currentDate = new Date().getFullYear();
  dateElement.textContent = currentDate;
});
