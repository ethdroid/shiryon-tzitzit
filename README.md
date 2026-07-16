# Shiryon Tzitzit — Preorder Site

A fully static site (HTML/CSS/JS only) built for free hosting on GitHub Pages.

## 1. Put it on GitHub Pages (free hosting)

1. Create a new GitHub repository (e.g. `shiryon-tzitzit`).
2. Upload `index.html`, `styles.css`, `script.js`, and the `` folder to the repo root.
3. In the repo: **Settings → Pages → Source: Deploy from a branch → main → / (root) → Save**.
4. In ~1 minute your site is live at `https://YOURUSERNAME.github.io/shiryon-tzitzit/`.

## 2. Connect the three services (all free)

Open `script.js` — everything you need to edit is in the `CONFIG` block at the top.

### Preorders (Thin)
Create a **Stripe Payment Link** (stripe.com → Products → Payment Links — supports quantity selection, no code needed) *or* a PayPal payment link. Paste it into:
```js
paymentLinks: { thin: "https://buy.stripe.com/..." }
```

### Donations
Create a PayPal Donate button (paypal.com/donate/buttons) or just use your `paypal.me/yourname` link. Paste into `donateLink`.

### Medium/Thick waitlist (your email list)
1. Sign up free at **formspree.io** and create a form.
2. Copy the form ID from its endpoint (`https://formspree.io/f/xqkrgbba` → the ID is `xqkrgbba`).
3. Paste it into `formspreeId`.

Every checkout-page email submission is saved in your Formspree dashboard with the email **and which size they want** (Medium or Thick). You can export the whole list to CSV whenever you're ready to email them. Free tier = 50 submissions/month.

## 3. Add your photos

Drop your images into the `` folder with these exact names. Until a photo exists, the site shows a labeled dashed placeholder telling you what goes there.

| File | What it's for |
|---|---|
| `hero.png` | Big hero product shot (tall/portrait works best) |
| `before.jpg` / `after.jpg` | Tangled strings vs. protected strings |
| `thin.png`, `medium.png`, `thick.png` | Product photos on the three shop cards |
| `step1.jpg`–`step3.jpg` | Thread / Snap / Wash & dry photos |
| `gallery1.jpg`–`gallery6.jpg` | Gallery grid |
| `founder.jpg` | Small round photo of you in the story section |

## 4. Other things you'll update over time (all in `CONFIG`)

- `priceThin` — the preorder price shown site-wide
- `shipEstimate` — estimated shipping date
- `preordersSoFar` / `preorderGoal` — the hero progress bar. Update `preordersSoFar` by hand as orders come in, commit, and push.
- The demo video is already embedded (your YouTube short). To change it, edit the iframe `src` in `index.html`.

## 5. Test locally

Just double-click `index.html` — everything works from a local file except the Formspree submit, which needs the site to be online.
