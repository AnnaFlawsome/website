# Flawsome Wellness website

The website of Anna Giunta: HEARTist, voice coach and embodiment guide.

A static site (plain HTML, CSS and a little JavaScript) with no build step.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `about.html` | About |
| `love-method.html` | The L.O.V.E. method |
| `work-with-me.html` | Work with me |
| `events.html` | Retreats & events |
| `liminal-village.html` | Liminal Village |
| `music.html` | Music |
| `press.html` | Press kit |
| `contact.html` | Contact form |
| `thank-you.html`, `404.html` | Form confirmation and page-not-found |

Shared files live in `assets/`. The header and footer are added to every page by `assets/js/main.js`, and all styling is in `assets/css/style.css`.

## Editing

- **Events:** in `events.html`, copy one `<div class="event">` block and change its date, title, place and link.
- **Placeholder text:** search for `Anna to add` to find what still needs content.
- **Replacing a photo or the video:** give the new file a new name and update the page, because browsers keep these files cached for a year.

## Deploying on Netlify

1. In Netlify choose **Add new site → Import an existing project → GitHub** and pick this repository.
2. Leave the build command empty and set the publish directory to `.` (both already come from `netlify.toml`).
3. Under **Forms**, add an email notification so contact messages reach anna@flawsomewellness.com.
4. Under **Domain management**, connect your domain.

Every change pushed to this repository then deploys automatically.
