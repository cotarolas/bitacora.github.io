(() => {
  function normalizeText(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // 1. Añadir botón de "Copiar" a cada registro operativo
  function initCopyButtons() {
    const records = document.querySelectorAll(".record-list li, .simple-record, .meal-card p");

    records.forEach((item) => {
      // Evitar duplicar si ya existe
      if (item.querySelector(".copy-record-btn")) return;

      item.classList.add("group", "relative", "pr-12");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "copy-record-btn absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none";
      btn.setAttribute("aria-label", "Copiar texto del registro");
      btn.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i><span>Copiar</span>';

      btn.addEventListener("click", async () => {
        // Clonar nodo para extraer solo el texto del registro sin el botón
        const clone = item.cloneNode(true);
        const btnClone = clone.querySelector(".copy-record-btn");
        if (btnClone) btnClone.remove();

        const cleanText = clone.innerText.replace(/\s+/g, " ").trim();

        try {
          await navigator.clipboard.writeText(cleanText);
          btn.classList.remove("text-slate-600", "border-slate-200");
          btn.classList.add("border-emerald-300", "bg-emerald-50", "text-emerald-700");
          btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Copiado</span>';

          setTimeout(() => {
            btn.classList.remove("border-emerald-300", "bg-emerald-50", "text-emerald-700");
            btn.classList.add("text-slate-600", "border-slate-200");
            btn.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i><span>Copiar</span>';
          }, 1800);
        } catch (err) {
          console.error("No se pudo copiar al portapapeles:", err);
        }
      });

      item.appendChild(btn);
    });
  }

  // 2. Buscador instantáneo dentro de la página
  function initLiveSearch() {
    const input = document.getElementById("page-search-input");
    const clearBtn = document.getElementById("page-search-clear");
    const statusEl = document.getElementById("page-search-status");
    const sections = document.querySelectorAll(".section-card, .meal-card");

    if (!input) return;

    const filterRecords = () => {
      const query = normalizeText(input.value.trim());
      clearBtn?.classList.toggle("hidden", query.length === 0);

      let totalMatches = 0;

      sections.forEach((section) => {
        const items = section.querySelectorAll(".record-list li, .simple-record, p.registro-item");
        if (items.length === 0) return;

        let sectionMatches = 0;

        items.forEach((item) => {
          const text = normalizeText(item.innerText);
          const isMatch = query === "" || text.includes(query);

          item.classList.toggle("hidden", !isMatch);
          item.classList.toggle("ring-2", query !== "" && isMatch);
          item.classList.toggle("ring-blue-400", query !== "" && isMatch);
          item.classList.toggle("bg-blue-50/60", query !== "" && isMatch);

          if (isMatch) {
            sectionMatches++;
            totalMatches++;
          }
        });

        // Ocultar subtítulos de día (.day-title) si su lista quedó vacía
        section.querySelectorAll(".day-title").forEach((dayTitle) => {
          const nextList = dayTitle.nextElementSibling;
          if (nextList && nextList.classList.contains("record-list")) {
            const visibleItems = nextList.querySelectorAll("li:not(.hidden)").length;
            dayTitle.classList.toggle("hidden", visibleItems === 0);
          }
        });

        // Ocultar la tarjeta completa si no tiene coincidencias
        section.classList.toggle("hidden", query !== "" && sectionMatches === 0);
      });

      if (statusEl) {
        if (query === "") {
          statusEl.textContent = "";
          statusEl.classList.add("hidden");
        } else {
          statusEl.classList.remove("hidden");
          statusEl.textContent =
            totalMatches === 0
              ? `No se encontraron registros para "${input.value.trim()}".`
              : `${totalMatches} ${totalMatches === 1 ? "coincidencia encontrada" : "coincidencias encontradas"}.`;
        }
      }
    };

    input.addEventListener("input", filterRecords);

    clearBtn?.addEventListener("click", () => {
      input.value = "";
      filterRecords();
      input.focus();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        input.value = "";
        filterRecords();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCopyButtons();
    initLiveSearch();
  });
})();
