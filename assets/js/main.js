// Shared header, footer and small interactions for every page.
(function () {
  const pages = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["love-method.html", "L.O.V.E."],
    ["work-with-me.html", "Work with me"],
    ["events.html", "Retreats & events"],
    ["liminal-village.html", "Liminal Village"],
    ["music.html", "Music"],
    ["press.html", "Press"],
    ["contact.html", "Contact"],
  ];
  const current = location.pathname.split("/").pop() || "index.html";
  const link = ([href, label]) =>
    `<a href="${href}"${href === current ? ' aria-current="page"' : ""}>${label}</a>`;

  const header = document.querySelector("[data-header]");
  if (header) {
    header.outerHTML = `
      <header class="site-header">
        <div class="wrap">
          <a class="brand" href="index.html">FLAWSOME <span>✺</span> WELLNESS</a>
          <button class="nav-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
          <nav class="nav" id="nav">${pages.slice(1).map(link).join("")}</nav>
        </div>
      </header>`;
  }

  const footer = document.querySelector("[data-footer]");
  if (footer) {
    footer.outerHTML = `
      <footer class="site-footer">
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <a class="brand" href="index.html" style="color:var(--sand)">FLAWSOME <span>✺</span> WELLNESS</a>
              <p class="footer-quote" style="margin-top:20px">Live heart-based. Embody the frequency of love.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <ul>${pages.slice(1, 6).map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul>
            </div>
            <div>
              <h4>Connect</h4>
              <ul>
                <li><a href="mailto:anna@flawsomeyogawellness.com">anna@flawsomeyogawellness.com</a></li>
                <li><a href="https://wa.me/393288585419">WhatsApp +39 328 85 85 419</a></li>
                <li><a href="https://www.instagram.com/anna_flawsomeyoga" rel="noopener">Instagram</a></li>
                <li><a href="https://www.youtube.com/channel/UCixPqD3kfCwduJTCKSnRu8w" rel="noopener">YouTube</a></li>
                <li><a href="press.html">Press kit</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© ${new Date().getFullYear()} Anna Giunta · Flawsome Wellness</span>
            <span>HEARTist ✺ Voice Coach ✺ Embodiment Guide</span>
          </div>
        </div>
      </footer>`;
  }

  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open);
      toggle.textContent = open ? "Close" : "Menu";
    });
  }

  // Slow-motion playback for videos marked with data-speed.
  document.querySelectorAll("video[data-speed]").forEach((v) => {
    const speed = parseFloat(v.dataset.speed) || 1;
    const apply = () => { v.defaultPlaybackRate = speed; v.playbackRate = speed; };
    apply();
    v.addEventListener("loadedmetadata", apply);
    v.addEventListener("play", apply);
  });

  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }
})();
