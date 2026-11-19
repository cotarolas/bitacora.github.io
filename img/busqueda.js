
/* =====================================================
   BUSCADOR GLOBAL - BITÁCORA P&D
   Busca información en todos los módulos del sitio.
   ===================================================== */

(() => {
  "use strict";

  const paginas = [
    { archivo: "index.html", nombre: "Inicio" },
    { archivo: "ingreso.html", nombre: "Ingresos RACSA" },
    { archivo: "ingvarios.html", nombre: "CONAVI y externos" },
    { archivo: "seguridad.html", nombre: "Seguridad privada" },
    { archivo: "conavi.html", nombre: "Eventos CONAVI" },
    { archivo: "eventos.html", nombre: "Eventos varios" },
    { archivo: "controlvehicular.html", nombre: "Control vehicular" }
  ];

  const formulario = document.getElementById("busqueda-form");
  const campo = document.getElementById("busqueda-input");
  const resultados = document.getElementById("busqueda-resultados");

  if (!formulario || !campo || !resultados) return;

  // Normaliza tildes y mayúsculas.
  function normalizar(texto) {
    return texto
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Obtiene el contenido principal de una página.
  async function cargarPagina(pagina) {
    try {
      const respuesta = await fetch(pagina.archivo);

      if (!respuesta.ok) {
        throw new Error("No se pudo cargar " + pagina.archivo);
      }

      const html = await respuesta.text();
      const documento = new DOMParser().parseFromString(html, "text/html");
      const contenido = documento.querySelector("main");

      if (!contenido) return null;

      const texto = contenido.innerText || contenido.textContent || "";

      return {
        nombre: pagina.nombre,
        archivo: pagina.archivo,
        texto: texto.replace(/\s+/g, " ").trim()
      };
    } catch (error) {
      console.warn("Error al consultar:", pagina.archivo, error);
      return null;
    }
  }

  // Construye un fragmento de texto alrededor de la coincidencia.
  function crearFragmento(texto, consulta) {
    const textoNormalizado = normalizar(texto);
    const primeraPalabra = normalizar(consulta).split(" ")[0];
    const posicion = textoNormalizado.indexOf(primeraPalabra);

    if (posicion < 0) {
      return texto.substring(0, 150) + "...";
    }

    const inicio = Math.max(0, posicion - 65);
    const final = Math.min(texto.length, posicion + 120);

    return (inicio > 0 ? "..." : "") +
      texto.substring(inicio, final) +
      (final < texto.length ? "..." : "");
  }

  function mostrarMensaje(mensaje) {
    resultados.innerHTML = "";
    const aviso = document.createElement("p");
    aviso.className = "busqueda-mensaje";
    aviso.textContent = mensaje;
    resultados.appendChild(aviso);
  }

  // Ejecuta la búsqueda global.
  async function buscar(consulta) {
    const palabras = normalizar(consulta).split(" ").filter(Boolean);

    if (palabras.length === 0) {
      resultados.innerHTML = "";
      return;
    }

    mostrarMensaje("Buscando en todos los módulos...");

    const paginasCargadas = await Promise.all(
      paginas.map(cargarPagina)
    );

    const coincidencias = paginasCargadas
      .filter(Boolean)
      .filter(pagina => {
        const contenido = normalizar(pagina.texto);
        return palabras.every(palabra => contenido.includes(palabra));
      });

    resultados.innerHTML = "";

    const encabezado = document.createElement("p");
    encabezado.className = "busqueda-contador";
    encabezado.textContent = coincidencias.length === 1
      ? "Se encontró información en 1 página:"
      : `Se encontró información en ${coincidencias.length} páginas:`;

    resultados.appendChild(encabezado);

    if (coincidencias.length === 0) {
      mostrarMensaje("No se encontraron coincidencias. Prueba con otro nombre, código o palabra.");
      return;
    }

    coincidencias.forEach(pagina => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "busqueda-resultado";

      const titulo = document.createElement("h3");
      titulo.textContent = pagina.nombre;

      const fragmento = document.createElement("p");
      fragmento.textContent = crearFragmento(pagina.texto, consulta);

      const enlace = document.createElement("a");
      enlace.href = pagina.archivo + "?buscar=" + encodeURIComponent(consulta);
      enlace.textContent = "Ver información ";
      enlace.setAttribute("aria-label", "Ver coincidencia en " + pagina.nombre);

      const icono = document.createElement("span");
      icono.textContent = "→";
      enlace.appendChild(icono);

      tarjeta.append(titulo, fragmento, enlace);
      resultados.appendChild(tarjeta);
    });
  }

  formulario.addEventListener("submit", event => {
    event.preventDefault();
    buscar(campo.value);
  });

  // Permite limpiar los resultados al borrar el campo.
  campo.addEventListener("input", () => {
    if (!campo.value.trim()) {
      resultados.innerHTML = "";
    }
  });

  // Si se llega desde un resultado, busca y resalta la coincidencia.
  window.addEventListener("DOMContentLoaded", () => {
    const parametros = new URLSearchParams(window.location.search);
    const consulta = parametros.get("buscar");

    if (!consulta) return;

    campo.value = consulta;

    const palabras = normalizar(consulta).split(" ").filter(Boolean);
    const principal = document.querySelector("main");

    if (principal) {
      const elementos = principal.querySelectorAll(
        ".record-box, .record-description, .section-card, section, article, li, p, h2, h3"
      );

      const candidatos = Array.from(elementos)
        .filter(elemento => {
          const texto = normalizar(elemento.innerText || elemento.textContent || "");
          return palabras.every(palabra => texto.includes(palabra));
        })
        .sort((a, b) => {
          const textoA = (a.innerText || a.textContent || "").length;
          const textoB = (b.innerText || b.textContent || "").length;
          return textoA - textoB;
        });

      if (candidatos.length > 0) {
        candidatos[0].classList.add("busqueda-coincidencia");

        setTimeout(() => {
          candidatos[0].scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 300);
      }
    }
  });

})();
