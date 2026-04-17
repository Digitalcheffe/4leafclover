# 4leafclover

A bold, high-contrast Ghost theme with a horizontal post feed, sticky-capable sidebar, featured rail, and deep admin-side customization. Built for Ghost 6.0+ and styled with Tailwind CSS.

> 4leafclover — Bold high-contrast Ghost theme with horizontal feed, sidebar, and deep customization.

## Live demo

See it running in production on my own site: **[painfully-useful.com](https://painfully-useful.com)**.

## About this theme

This theme is **free to use** — grab it, fork it, change it, ship it on your own Ghost site. No license fee, no attribution required.

It isn't perfect. I built it because I needed something for my own site and didn't want to pay for a premium theme, so the rough edges reflect "good enough for me" rather than a polished commercial release. Expect to tweak CSS and clean up anything that doesn't fit your site.

## Support

Very light support offered — I'll do my best to answer issues as they come in. If this theme gets more traction I'll put more energy into it. And if I make changes or improvements for my own site, I'll push updates back to this repo.

## Requirements

- Ghost `>= 6.0.0`
- Node.js (for building Tailwind CSS)

## Install

1. Download this repository as a ZIP (GitHub → **Code → Download ZIP**).
2. In Ghost Admin, go to **Settings → Design → Change theme → Upload theme** and upload the ZIP.
3. Activate **4leafclover**.

## Theme customization

All of these settings live in `package.json` under `config.custom`. Once the theme is installed they show up in **Ghost Admin → Settings → Design → Customize → Site-wide**. Changes save instantly and are applied to the live site without a rebuild — the theme reads them at render time via Ghost's `{{@custom.*}}` helpers and injects color values as CSS variables in `default.hbs`.

If you don't see a setting, make sure you re-uploaded the theme after changing `package.json` (Ghost only picks up new custom fields on theme upload).

### Colors

| Setting             | Type  | Default    | Effect |
| ------------------- | ----- | ---------- | ------ |
| `background_color`  | color | `#0B0F14`  | Page background. |
| `surface_color`     | color | `#121823`  | Card and panel background. |

The main accent color uses Ghost's built-in `@site.accent_color` (set under **Settings → Design → Brand**) and drives links, tags, CTAs, and highlights across the theme.

### Layout

| Setting          | Type    | Default | Effect |
| ---------------- | ------- | ------- | ------ |
| `sticky_header`  | boolean | `false` | Pins the site header to the top while scrolling. |
| `sidebar_sticky` | boolean | `false` | Sticks the sidebar in place on desktop while scrolling. |

### Search

The header search button (`#/search`) is powered by Ghost's native Sodo Search and only renders when **Members** is enabled in Ghost Admin (Settings → Membership). Ghost injects the search script automatically in that case — no extra setup needed. If Members is disabled, the button is hidden rather than silently broken.

### Homepage

| Setting             | Type    | Default       | Effect |
| ------------------- | ------- | ------------- | ------ |
| `home_hero_logo`    | image   | _(empty)_     | Optional logo overlaid on the homepage hero. |
| `show_home_intro`   | boolean | `true`        | Shows or hides the homepage intro block. |
| `page_bridge_text`  | text    | `Field:Notes` | Text for the bridge graphic between the hero and feed. Format: `Left:Right`. |

### Footer

| Setting              | Type | Default                    | Effect |
| -------------------- | ---- | -------------------------- | ------ |
| `footer_bridge_text` | text | `Stay Curious:Stay Useful` | Text for the bridge graphic above the footer. Format: `Left:Right`. |

### Sidebar, social, and CTA

| Setting               | Type | Default                         | Effect |
| --------------------- | ---- | ------------------------------- | ------ |
| `social_links_extra`  | text | _(empty)_                       | Extra social icons in the sidebar. Comma-separated `Platform:URL` pairs. |
| `cta_text`            | text | `Join free for updates`         | Headline on the sidebar signup CTA. |
| `cta_subtext`         | text | `No spam. Just the good stuff.` | Subtext under the CTA headline. |

### Contact form

The contact form renders on any page whose slug is `contact`, or on any page using the `page-contact.hbs` template.

| Setting                   | Type | Default                                                 | Effect |
| ------------------------- | ---- | ------------------------------------------------------- | ------ |
| `contact_webhook_url`     | text | _(empty)_                                               | Optional webhook URL to POST form submissions to (n8n, Zapier, etc.). |
| `contact_success_message` | text | `Thanks — your message has been sent!`                  | Message shown after a successful submission. |
| `contact_error_message`   | text | `Sorry — something went wrong. Please try again later.` | Message shown if the submission fails. |

## Contact form

The contact form renders on any page with slug `contact` (via `page.hbs`) or any page using the `page-contact.hbs` template.

This theme doesn't use integrated form partners like Formspree or Netlify Forms. Instead, form submissions POST as a JSON payload to a webhook URL you control. The simplest approach is to point `contact_webhook_url` at a service that can receive a POST and do something with it — send an email, log to a spreadsheet, trigger a notification, etc.

### Payload

Every submission sends:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Hello",
  "message": "Your message here",
  "website": "",
  "_elapsed": 4823,
  "pageUrl": "https://yoursite.com/contact",
  "ts": "2025-01-01T12:00:00.000Z"
}
```

### Spam signals

Two bot-detection signals are included in every payload:

- **`website`** — a hidden field humans never see. Bots fill it automatically. Non-empty means discard.
- **`_elapsed`** — milliseconds between page load and submit. Under 3000ms means a bot submitted the form before a human could have read it.

### Wiring it up with n8n

1. Add a **Webhook** node. Copy the production URL into `contact_webhook_url` in Ghost Admin → Settings → Design → Customize.
2. Add a **Code** node. Paste this:

```javascript
const b = $input.first().json.body;
const trap = (b.website || '').trim();
const elapsed = parseInt(b._elapsed || 0);
return [{ json: { ...b, _status: (trap || elapsed < 3000) ? 'bot' : 'good' } }];
```

3. Add an **IF** node. Set the condition to: `{{ $json._status }}` **equals** `good`.
4. Connect: **Webhook → Code → IF**. Wire the **true** branch to your action (Send Email, Slack, etc.). Leave the false branch empty — bots get no response.

> Tune the `3000` threshold (ms) up or down to taste. 5000ms is more conservative if you want extra headroom.

### Posting to Matrix

After the IF node's true branch, add a **Code** node to build the Matrix message payload:

```javascript
const b = $input.first().json;

const plain = `📬 New contact from ${b.name}\nSubject: ${b.subject}\nEmail: ${b.email}\n\n${b.message}`;

const html = `
<h3>📬 New Contact Form Submission</h3>
<p>
  <strong>From:</strong> ${b.name} — <a href="mailto:${b.email}">${b.email}</a><br>
  <strong>Subject:</strong> ${b.subject}
</p>
<blockquote>${b.message.replace(/\n/g, '<br>')}</blockquote>
<p><em>${b.pageUrl}</em></p>
`.trim();

return [{
  json: {
    msgtype: "m.text",
    body: plain,
    format: "org.matrix.custom.html",
    formatted_body: html
  }
}];
```

Then add an **HTTP Request** node:

- **Method:** `PUT`
- **URL:** `https://YOUR_MATRIX_SERVER/_matrix/client/v3/rooms/YOUR_ROOM_ID/send/m.room.message/{{$now}}`
- **Header:** `Authorization: Bearer YOUR_ACCESS_TOKEN`
- **Body:** JSON → pass `{{ $json }}` from the Code node

The `{{$now}}` timestamp in the URL serves as the transaction ID and prevents duplicate messages if n8n retries.

## Featured posts

The homepage rail shows up to 4 posts flagged as **Featured** in Ghost Admin. The main feed below the rail shows all non-featured posts.

## Built with

- [Ghost](https://ghost.org/) 6+
- [Tailwind CSS](https://tailwindcss.com/) 3.4
- [PostCSS](https://postcss.org/) + Autoprefixer
- [gscan](https://github.com/TryGhost/gscan) for theme validation

## Reference

Ghost theme documentation: https://docs.ghost.org/themes

## License

Free to use, modify, and redistribute — including on commercial Ghost sites. No attribution required (though a shout-out is always appreciated). No warranty, no guaranteed support: use at your own risk.

The `"private": true` flag in `package.json` only prevents accidental publishing to npm — it does **not** restrict how you use the theme.
