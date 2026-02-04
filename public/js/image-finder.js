document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchBox = document.getElementById("search-box");
  const searchResult = document.getElementById("search-result");
  const showMoreBtn = document.getElementById("show-more-btn");
  const footer = document.getElementById("footer");

  let page = 1;

  async function searchImages() {
    const keyword = searchBox.value.trim();
    if (!keyword) return;

    const loader = document.getElementById("loader");

    loader.style.display = "flex";

    try {
      const response = await fetch(
        `/api/search-images?query=${keyword}&page=${page}`,
      );

      if (!response.ok) {
        console.error("Request failed:", response.status);
        return;
      }

      const data = await response.json();

      if (!data.results || !Array.isArray(data.results)) {
        console.error("Unexpected data:", data);
        return;
      }

      if (page === 1) {
        searchResult.innerHTML = "";
        Array.from(searchResult.children).forEach((child) => {
          if (!child.classList.contains("loader")) child.remove();
        });
      }

      const fragment = document.createDocumentFragment();
      console.log(data);

      data.results.forEach((result) => {
        const image = document.createElement("img");
        image.src = result.urls.small;
        image.srcset = `
    ${result.urls.small} 400w,
    ${result.urls.regular} 1080w
  `;
        image.sizes = "(max-width: 768px) 100vw, 33vw";
        image.loading = "lazy";

        // create link around image
        const imageLink = document.createElement("a");
        imageLink.href = result.links.html;
        imageLink.target = "_blank";
        imageLink.appendChild(image);

        // create overlay button
        const copyBtn = document.createElement("button");
        copyBtn.id = "copy-btn";
        copyBtn.innerHTML = `<svg width="105px" class="copy-btn" alt="Copy" height="105px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z" fill="#ffffff"></path> <path d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z" fill="#ffffff"></path> </g></svg>`;
        copyBtn.onclick = () => {
          copyImageUrl(image.src);
        };

        // wrap image + button in wrapper
        const imageWrapper = document.createElement("div");
        imageWrapper.classList.add("image-wrapper");
        imageWrapper.appendChild(imageLink);
        imageWrapper.appendChild(copyBtn);

        // outer picture div
        const pictureDiv = document.createElement("div");
        pictureDiv.classList.add("picture");
        pictureDiv.appendChild(imageWrapper);

        fragment.appendChild(pictureDiv);
      });

      searchResult.appendChild(fragment);

      showMoreBtn.style.display = "block";
      footer.style.display = "block";
    } catch (error) {
      console.error(error);
    } finally {
      loader.style.display = "none";
    }
  }

  function copyImageUrl(url) {
    navigator.clipboard.writeText(url);
    showToast("Image Url Copied", 4000);
  }
  function showToast(message, duration = 3000) {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;

    const progress = document.createElement("div");
    progress.classList.add("progress");
    progress.style.animationDuration = `${duration}ms`;

    toast.appendChild(progress);
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.4s forwards";
      toast.addEventListener("animationend", () => toast.remove());
    }, duration);
  }

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    page = 1;
    searchImages();
  });

  showMoreBtn.addEventListener("click", () => {
    showMoreBtn.classList.add("darken");
    page++;
    searchImages();
    showMoreBtn.classList.remove("darken");
  });
});
