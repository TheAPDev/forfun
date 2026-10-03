# Homeeni website: deploy package

A static site with no framework, no build step and no third-party requests. Fonts are self-hosted.

## Go live (Vercel, about 5 minutes)
1. Create a new Vercel project and upload this folder (or push it to a GitHub repo and import it).
2. Framework preset: **Other**. Leave the build command empty. Output directory: `/`.
3. Add your domain under Project → Domains.
4. `vercel.json` already applies the security headers, caching and redirects.

Netlify and Cloudflare Pages work the same way; they read `_headers` instead.

## Before launch: things only you can confirm
| What | Where | Current value |
|---|---|---|
| Domain | `index.html`, `privacy.html`, `robots.txt`, `sitemap.xml`, `.well-known/security.txt` | `https://homeeni.com` |
| Contact emails | footer, FAQ, JSON-LD, privacy page, form message | hello@, privacy@, security@ homeeni.com |
| Early-access form backend | `main.js` → `EARLY_ACCESS_ENDPOINT` | empty (the form shows "opens shortly") |

If the form endpoint is on another domain, add that origin to `connect-src` in the Content-Security-Policy in both `vercel.json` and `_headers`.

## SEO, after the site is live
1. Add the domain to Google Search Console and submit `https://<domain>/sitemap.xml`.
2. Check the structured data with Google's Rich Results Test (Organization, Product, FAQ).
3. Create a Google Business Profile and link it to the site.
4. Rankings come from links and content over time: get listed on Indian startup and smart-home directories, and publish DoorCam updates on the site.

## Security headers included
Strict CSP (scripts, styles and fonts from this origin only), HSTS with preload, X-Frame-Options DENY, nosniff, a strict Referrer-Policy, a Permissions-Policy that blocks camera, microphone and location, and COOP/CORP. The form has a honeypot field and validates input on the client. Your backend must validate it again on the server.
After launch, test at securityheaders.com and pagespeed.web.dev.
