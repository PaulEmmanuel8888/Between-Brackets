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

  //Automatically increase the height of the textareas
  const textareas = document.querySelectorAll("textarea");

  const autoResize = (el) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  textareas.forEach((textarea) => {
    textarea.addEventListener("input", () => autoResize(textarea));
    autoResize(textarea);
  });

  //Adding live preview for markdown in content (textarea) field
  const textarea = document.getElementById("content");
  const preview = document.getElementById("preview");

  const updatePreview = () => {
    const markdown = textarea.value;
    preview.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
    Prism.highlightAllUnder(preview);
  };

  textarea.addEventListener("input", updatePreview);
  updatePreview();
});
