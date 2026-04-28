# NexusFlow — AI Automation Agency Website

A complete, production-ready static website for NexusFlow — an AI Automation Agency specializing in Operational Efficiency.

## Tech Stack

- **Pure HTML, CSS, JavaScript** — no build step, no dependencies
- **GitHub Pages** — free hosting with custom domain support
- **Formspree** — free contact form backend (50 submissions/month on free tier)
- **Google Fonts** — Syne + DM Mono typefaces

## Project Structure

```
nexusflow/
├── index.html              # Main landing page
├── privacy.html            # Privacy Policy
├── terms.html              # Terms of Service
├── 404.html                # Custom 404 page
├── src/
│   ├── styles/
│   │   └── main.css        # All styles
│   └── components/
│       ├── canvas.js       # Hero background animation
│       ├── nav.js          # Navigation (scroll + mobile)
│       ├── animations.js   # Scroll reveals + counters
│       └── form.js         # Contact form + validation
└── .github/
    └── workflows/
        └── deploy.yml      # Auto-deploy to GitHub Pages
```

## Quick Setup (15 minutes)

### Step 1: Set Up Formspree (Contact Form)

1. Go to [formspree.io](https://formspree.io/register) and create a free account
2. Click **"New Form"** and name it "NexusFlow Audit Requests"
3. Copy your **Form ID** (looks like `xabc1234`)
4. Open `src/components/form.js` and replace `YOUR_FORM_ID`:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
   // Replace with:
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xabc1234';
   ```
5. In Formspree settings, add your receiving email address

### Step 2: Customize Content

Edit `index.html` to update:
- Email address: replace `hello@nexusflow.ai` with your real email
- Footer social links: update the `href` for LinkedIn and Twitter/X
- Stats and metrics: update numbers in the hero and results sections if needed

### Step 3: Deploy to GitHub Pages

#### Option A: Via GitHub Web UI (Easiest)

1. Go to [github.com](https://github.com) and create a new repository
   - Name: `nexusflow-agency` (or any name)
   - Set to **Public**
   - Do NOT initialize with README
2. Upload all files by dragging them into the repository
3. Go to **Settings → Pages**
4. Under **Source**, select **GitHub Actions**
5. The site will deploy automatically at `https://yourusername.github.io/nexusflow-agency`

#### Option B: Via Git CLI

```bash
# 1. Initialize git in the project folder
cd nexusflow
git init
git add .
git commit -m "Initial commit: NexusFlow website"

# 2. Create repo on GitHub, then push
git remote add origin https://github.com/YOUR_USERNAME/nexusflow-agency.git
git branch -M main
git push -u origin main

# 3. Enable GitHub Pages
# Go to: Settings → Pages → Source → GitHub Actions
# The deploy.yml workflow will handle everything automatically
```

### Step 4: Custom Domain (Optional, Free)

If you have a domain (e.g., `nexusflow.ai`):
1. In your domain registrar, add a CNAME record pointing to `yourusername.github.io`
2. In GitHub → Settings → Pages, add your custom domain
3. Enable **"Enforce HTTPS"**

## Updating the Site

Any time you push to the `main` branch, GitHub Actions automatically redeploys.

```bash
git add .
git commit -m "Update content"
git push
```

## Free Services Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| GitHub Pages | Hosting | Unlimited for public repos |
| GitHub Actions | Auto-deploy CI/CD | 2,000 min/month |
| Formspree | Contact form backend | 50 submissions/month |
| Google Fonts | Typography | Unlimited |

## Going Beyond Free

When you're ready to scale:
- **Formspree Pro** ($10/mo) — unlimited submissions, spam filtering, file uploads
- **Cloudflare** (free) — CDN, DDoS protection, custom domain with HTTPS
- **Zoho Mail** (free) — professional @nexusflow.ai email addresses

## Local Development

No build step needed. Just open `index.html` in a browser, or use any static server:

```bash
# Python
python3 -m http.server 3000

# Node.js (if installed)
npx serve .

# VS Code: Install "Live Server" extension and click "Go Live"
```

---

Built for NexusFlow © 2025
