import {logoutUser,  onAuthReady} from "/src/authentication.js";

class SideNavbar extends HTMLElement {
  connectedCallback() {
    // Get the current filename (e.g., "finances.html", default to "index.html")
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    const links = [
      { name: "Overview", href: "overview.html" },
      { name: "Finances", href: "finances.html" },
      { name: "Categories", href: "categories.html" },
      { name: "Graphs", href: "graphs.html" },
    ];

    // Set current page to active on the side navbar
    const navItems = links
      .map(
        (link) => `
        <li class="nav-item">
          <a href="${link.href}" class="nav-link ${currentPage === link.href ? "active" : ""}">
            ${link.name}
          </a>
        </li>`,
      )
      .join("");

    this.innerHTML = `
      <style>
        @media (max-width: 768px) {
          #side-navbar {
            position: fixed;
            top: 120px;
            left: 16px;
            z-index: 1000;
            box-shadow: 5px 5px 0 #000;
          }
          #hamburger-menu {
            box-shadow: 5px 5px 0 #000;
          }
        }
      </style>

      <!-- Hamburger menu -->
      <svg
        id="hamburger-menu"
        role="button"
        xmlns="http://www.w3.org/2000/svg"
        height="70px"
        viewBox="0 -960 960 960"
        width="70px"
        fill="#000000"
        class="position-absolute d-md-none"
        style="top: 5%; left: 5%; background-color: lightgrey; border-radius: 10px;"
      >
        <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
      </svg>

      <!-- Side navbar -->
      <aside
        id="side-navbar"
        class="d-none d-md-block rounded-3"
        style="background-color: lightgrey; min-width: 220px; max-width: 220px"
      >
        <ul
          class="nav nav-pills flex-column p-3 align-items-start justify-content-around"
          style="height: 400px; font-size: 1.7em"
        >
          ${navItems}
          <li class="nav-item">
            <button id="sidebarLogoutBtn" type="button" class="nav-link text-danger">
              Logout
            </button>
          </li>

        </ul>
      </aside>
    `;

    const logoutBtn = this.querySelector("#sidebarLogoutBtn");
    logoutBtn.addEventListener("click", logoutUser);

    const hamburger = this.querySelector("#hamburger-menu");
    const sidebar = this.querySelector("#side-navbar");
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("d-none");
    });
  }
}

customElements.define("side-navbar", SideNavbar);
