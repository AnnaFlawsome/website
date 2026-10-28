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
  // Social profiles, drawn as line icons to match the site's thin, elegant style.
  const socials = [
    ["Instagram", "https://www.instagram.com/anna_flawsomeyoga/",
      '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/>'],
    ["YouTube", "https://www.youtube.com/channel/UCixPqD3kfCwduJTCKSnRu8w",
      '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.2 9.4v5.2l4.4-2.6z" fill="currentColor" stroke="none"/>'],
    ["Facebook", "https://www.facebook.com/flawsomeyogaberlin/",
      '<path d="M15 4.5h-2a3 3 0 0 0-3 3v13M7.5 11h7"/>'],
  ];
  const socialIcons = `<div class="social">${socials.map(([name, href, svg]) =>
    `<a href="${href}" rel="noopener" target="_blank" aria-label="${name}" title="${name}">` +
    `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${svg}</svg></a>`
  ).join("")}</div>`;
  document.querySelectorAll("[data-social]").forEach((el) => { el.outerHTML = socialIcons; });

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
              ${socialIcons}
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
                <li><a href="https://calendly.com/annaflawsome" rel="noopener">Book a discovery call</a></li>
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

  // Mailchimp signup: send through Mailchimp's JSONP endpoint so the visitor stays on the page.
  // Without JavaScript the form still posts to Mailchimp in a new tab.
  document.querySelectorAll("form[data-mailchimp]").forEach((form) => {
    const msg = form.querySelector(".signup-msg");
    const btn = form.querySelector("button[type=submit]");
    const email = form.querySelector("input[name=EMAIL]");
    const done = form.parentElement.querySelector(".signup-done");
    const say = (text) => { msg.textContent = text; };

    email.addEventListener("input", () => { email.removeAttribute("aria-invalid"); say(""); });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.setAttribute("aria-invalid", "true");
        say("Please enter a valid email address.");
        email.focus();
        return;
      }
      const cb = "mc_cb_" + Date.now();
      const params = new URLSearchParams(new FormData(form));
      params.set("c", cb);
      const script = document.createElement("script");
      const cleanup = () => { delete window[cb]; script.remove(); btn.disabled = false; btn.textContent = "Join the circle"; };
      const timer = setTimeout(() => { cleanup(); say("Something went wrong. Please try again in a moment."); }, 12000);

      window[cb] = (res) => {
        clearTimeout(timer);
        cleanup();
        if (res.result === "success") {
          form.hidden = true;
          if (done) done.hidden = false;
          return;
        }
        // Mailchimp messages can contain HTML and a "0 - " field prefix; show plain text only.
        const tmp = document.createElement("div");
        tmp.innerHTML = String(res.msg || "");
        const text = tmp.textContent.replace(/^\d+\s*-\s*/, "");
        say(/already subscribed/i.test(text) ? "You're already in the circle. Thank you ✺" : text || "Something went wrong. Please try again.");
      };
      btn.disabled = true;
      btn.textContent = "Sending…";
      say("");
      script.src = form.action.replace("/post?", "/post-json?") + "&" + params.toString();
      script.onerror = () => { clearTimeout(timer); cleanup(); say("Couldn't reach the mailing list. Please try again."); };
      document.body.appendChild(script);
    });
  });

  // YouTube: load the player only when the visitor presses play (faster page, no tracking before).
  document.querySelectorAll("a[data-youtube]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${link.dataset.youtube}?autoplay=1&rel=0`;
      iframe.title = link.getAttribute("aria-label").replace(/^Play video: /, "");
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      link.replaceChildren(iframe);
      link.removeAttribute("href");
      link.style.cursor = "default";
    }, { once: true });
  });

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
