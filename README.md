# 4leafclover

A bold, high-contrast Ghost theme with a horizontal post feed, sticky-capable sidebar, featured rail, and deep admin-side customization. Built for Ghost 6.0+ and styled with Tailwind CSS.

> 4leafclover — Bold high-contrast Ghost theme with horizontal feed, sidebar, and deep customization.

## Live demo

See it running in production on my own site: **[painfully-useful.com](https://painfully-useful.com)**.

## About this theme

This theme is **free to use** — grab it, fork it, change it, ship it on your own Ghost site. No license fee, no attribution required.

It isn't perfect. I built it because I needed something for my own site and didn't want to pay for a premium theme, so the rough edges reflect "good enough for me" rather than a polished commercial release. Expect to tweak CSS, swap placeholder values (like the Formspree form ID), and clean up anything that doesn't fit your site.

## Support

Very light support offered — I'll do my best to answer issues as they come in. If this theme gets more traction I'll put more energy into it. And if I make changes or improvements for my own site, I'll push updates back to this repo.

### Known incomplete: contact page

The contact page is **not finished**. The form markup, styling, and a webhook hook are all in place (see `partials/contact-form.hbs` and the `contact_webhook_url` setting) so you can wire it up to n8n, Zapier, Make, Formspree, etc. — but the end-to-end flow is **not fully tested**, and Ghost itself is a bit awkward about contact forms (no native server-side handling, so you're on your own for where the submission actually goes). Expect to do some plumbing and testing on your side before relying on it in production.

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

The `contact-form` partial is automatically rendered on:

- any page whose slug is `contact` (via `page.hbs`)
- any page using the `page-contact.hbs` custom template

Behavior:

- By default the form `POST`s to the `action` attribute (Formspree placeholder — replace `YOUR_FORM_ID` in `partials/contact-form.hbs` or point it elsewhere).
- If `contact_webhook_url` is set in theme settings, submissions are sent as JSON to that URL instead (name, email, subject, message, pageUrl, userAgent, timestamp).
- Includes a hidden honeypot field (`_gotcha`) for basic spam protection.
- Displays the configurable success/error messages inline without a page reload when using the webhook path.

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
