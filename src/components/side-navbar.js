import { logoutUser, onAuthReady } from "/src/authentication.js";

class SideNavbar extends HTMLElement {
  connectedCallback() {
    // Get the current filename (e.g., "finances.html", default to "index.html")
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    const links = [
      { name: "Overview", href: "overview.html" },
      { name: "Finances", href: "finances.html" },
    ];

    // Set current page to active on the side navbar
    const navItems = links
      .map(
        (link) => `
        <li class="nav-item w-100">
          <a
            href="${link.href}"
            class="nav-link theme-nav-link px-3 py-2 rounded-3 ${currentPage === link.href ? "active" : ""}"
          >
            ${link.name}
          </a>
        </li>`,
      )
      .join("");

    this.innerHTML = `
      <style>
        #side-navbar,
        #hamburger-menu {
          background-color: var(--accent);
          border: 1px solid rgba(20, 83, 45, 0.15);
        }

        .theme-nav-link {
          color: var(--text-primary);
          font-weight: 600;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .theme-nav-link:hover {
          background-color: rgba(22, 163, 74, 0.14);
          color: var(--primary);
        }

        .theme-nav-link.active {
          background-color: var(--primary) !important;
          color: #ffffff !important;
        }

        .theme-logout-btn {
          color: #b91c1c;
          font-weight: 600;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .theme-logout-btn:hover {
          background-color: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 768px) {
          #side-navbar {
            position: fixed;
            top: 100px;
            left: 16px;
            z-index: 1000;
            box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
          }
          #hamburger-menu {
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
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
        fill="currentColor"
        class="position-absolute d-md-none text-primary p-2"
        style="top: 24px; left: 16px; border-radius: 12px; cursor: pointer;"
      >
        <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
      </svg>

      <!-- Side navbar -->
      <aside
        id="side-navbar"
        class="d-none d-md-block rounded-4 shadow-sm m-md-3"
        style="min-width: 220px; max-width: 220px;"
      >
        <ul
          class="nav nav-pills flex-column p-3 gap-2 align-items-stretch justify-content-between"
          style="min-height: 200px; font-size: 1.35em;"
        >
          <div class="d-flex flex-column gap-2">
            ${navItems}
          </div>
          <li class="nav-item w-100 pt-3 border-top border-success-subtle">
            <button
              id="sidebarLogoutBtn"
              type="button"
              class="nav-link theme-logout-btn w-100 text-start px-3 py-2 rounded-3"
            >
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
