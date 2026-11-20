(() => {
  const CURRENT_PAGE = window.location.pathname.split("/").pop() || "index.html";

  const NAV_ITEMS = [
    { label: "Inicio", href: "index.html", icon: "fa-house" },
    {
      label: "Ingresos",
      icon: "fa-file-invoice-dollar",
      children: [
        { label: "RACSA", href: "ingreso.html", icon: "fa-building" },
        { label: "CONAVI & Externo", href: "ingvarios.html", icon: "fa-road" },
        { label: "Seguridad privada", href: "seguridad.html", icon: "fa-shield-halved" }
      ]
    },
    {
      label: "Eventos",
      icon: "fa-calendar-days",
      children: [
        { label: "Eventos CONAVI", href: "conavi.html", icon: "fa-road" },
        { label: "Eventos varios", href: "eventos.html", icon: "fa-list-check" },
        { label: "Control vehicular", href: "controlvehicular.html", icon: "fa-car" }
      ]
    }
  ];

  function renderHeader() {
    const headerTarget = document.getElementById("app-header");
    if (!headerTarget) return;

    const navHTML = NAV_ITEMS.map(item => {
      if (!item.children) {
        const isActive = CURRENT_PAGE === item.href;
        return `
          <li>
            <a href="${item.href}" ${isActive ? 'aria-current="page"' : ""}
               class="flex items-center gap-2 rounded-lg px-4 py-2.5 transition ${
                 isActive ? "bg-white/15 text-blue-200 font-semibold" : "hover:bg-white/10 hover:text-blue-200"
               }">
              <i class="fa-solid ${item.icon}" aria-hidden="true"></i>
              ${item.label}
            </a>
          </li>`;
      }

      const hasActiveChild = item.children.some(c => c.href === CURRENT_PAGE);
      const childrenHTML = item.children.map(child => {
        const isChildActive = CURRENT_PAGE === child.href;
        return `
          <li>
            <a href="${child.href}" ${isChildActive ? 'aria-current="page"' : ""}
               class="flex items-center gap-2.5 px-4 py-2.5 transition ${
                 isChildActive
                   ? "bg-blue-50 font-bold text-blue-700"
                   : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
               }">
              <i class="fa-solid ${child.icon} w-4 text-blue-500" aria-hidden="true"></i>
              ${child.label}
            </a>
          </li>`;
      }).join("");

      return `
        <li>
          <details class="nav-dropdown group relative">
            <summary class="flex cursor-pointer items-center justify-between gap-2.5 rounded-lg px-4 py-2.5 transition md:justify-start ${
              hasActiveChild ? "bg-white/15 text-blue-200 font-semibold" : "hover:bg-white/10 hover:text-blue-200"
            }">
              <span class="flex items-center gap-2">
                <i class="fa-solid ${item.icon}" aria-hidden="true"></i>
                ${item.label}
              </span>
              <i class="fa-solid fa-chevron-down text-[10px] transition duration-200 group-open:rotate-180" aria-hidden="true"></i>
            </summary>
            <ul class="mt-1 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-xl md:absolute md:left-0 md:top-full md:mt-2 md:w-56">
              ${childrenHTML}
            </ul>
          </details>
        </li>`;
    }).join("");

    headerTarget.innerHTML = `
      <header class="sticky top-0 z-50 bg-[#102a4c] text-white shadow-lg">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex min-h-[74px] flex-wrap items-center justify-between">
            <a href="index.html" class="flex items-center gap-3 py-3 text-white no-underline">
              <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 shadow-md">
                <i class="fa-solid fa-book-open text-xl" aria-hidden="true"></i>
              </span>
              <span>
                <span class="block text-xl font-bold tracking-wide leading-tight">BITÁCORA</span>
                <span class="block text-[10px] font-semibold tracking-[.22em] text-blue-200">
                  P&amp;D · ESPARZA
                </span>
              </span>
            </a>

            <div class="flex items-center gap-3">
              <!-- Reloj operativo en vivo -->
              <div id="live-clock" class="hidden rounded-lg bg-white/10 px-3 py-1.5 text-xs font-mono text-blue-100 sm:flex items-center gap-2" title="Hora local">
                <i class="fa-regular fa-clock text-blue-300" aria-hidden="true"></i>
                <span>--:--:--</span>
              </div>

              <button id="menu-toggle" type="button"
                      class="inline-flex h-11 w-11 items-center justify-center rounded-lg text-xl transition hover:bg-white/10 md:hidden"
                      aria-label="Abrir menú de navegación" aria-controls="main-navigation" aria-expanded="false">
                <i class="fa-solid fa-bars" aria-hidden="true"></i>
              </button>
            </div>

            <nav id="main-navigation" aria-label="Navegación principal" class="hidden w-full pb-4 md:block md:w-auto md:pb-0">
              <ul class="flex flex-col gap-1 text-sm font-medium md:flex-row md:items-center md:gap-2">
                ${navHTML}
              </ul>
            </nav>
          </div>
        </div>
      </header>`;
  }

  function renderFooter() {
    const footerTarget = document.getElementById("app-footer");
    if (!footerTarget) return;

    footerTarget.innerHTML = `
      <footer class="mt-12 bg-[#102a4c] py-6 text-center text-slate-300">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="mb-1.5 flex items-center justify-center gap-2 text-white">
            <i class="fa-solid fa-book-open text-blue-300" aria-hidden="true"></i>
            <span class="font-bold tracking-wider">BITÁCORA P&amp;D</span>
          </div>
          <p class="text-xs sm:text-sm">&copy; ${new Date().getFullYear()} Bitácora P&amp;D Esparza · Grupo D.</p>
        </div>
      </footer>`;
  }

  function initNavigationBehavior() {
    const menuToggle = document.getElementById("menu-toggle");
    const navigation = document.getElementById("main-navigation");
    const dropdowns = document.querySelectorAll(".nav-dropdown");

    if (menuToggle && navigation) {
      menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
        navigation.classList.toggle("hidden", isExpanded);
        menuToggle.innerHTML = isExpanded
          ? '<i class="fa-solid fa-bars" aria-hidden="true"></i>'
          : '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      });
    }

    // Cerrar otros dropdowns al abrir uno y cerrar al hacer clic fuera
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener("toggle", () => {
        if (dropdown.open) {
          dropdowns.forEach(other => {
            if (other !== dropdown) other.removeAttribute("open");
          });
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-dropdown")) {
        dropdowns.forEach(d => d.removeAttribute("open"));
      }
    });
  }

  function initLiveClock() {
    const clockEl = document.querySelector("#live-clock span");
    if (!clockEl) return;
    const update = () => {
      clockEl.textContent = new Date().toLocaleTimeString("es-CR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    };
    update();
    setInterval(update, 1000);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    initNavigationBehavior();
    initLiveClock();
  });
})();
