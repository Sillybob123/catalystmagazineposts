# Catalyst Magazine - Interactive Feed

A modern, high-performance magazine feed optimized for Wix embedding with lightning-fast image loading.

## 🚀 Features

- **Blazing Fast Images** - Optimized via Wix CDN with WebP format (60-70% smaller)
- **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- **Smart Preloading** - Critical images load instantly
- **Smooth Scrolling** - Natural scroll-through behavior when embedded
- **HTML5 Compliant** - Modern, standards-compliant code
- **HTTPS Secure** - Ready for production

## 🎯 Quick Start

1. **Clone or Fork** this repository
2. **Enable GitHub Pages** in repository settings
3. **Embed in Wix** using "Embed a Site" feature

**Full instructions:** See [QUICKSTART.md](QUICKSTART.md)

## 📁 Project Structure

```
catalystmagazineposts/
├── index.html              # Main HTML5 page
├── css/
│   └── style.css          # Responsive styles
├── js/
│   ├── data.js            # Article data (edit to add articles)
│   └── app.js             # Core functionality
└── docs/                  # Documentation
    ├── QUICKSTART.md
    ├── GITHUB-WIX-SETUP.md
    └── OPTIMIZATION-GUIDE.md
```

## ✏️ Adding Articles

Edit `js/data.js` and add:

```javascript
{
    title: "Your Article Title",
    author: "Author Name",
    date: "Dec 2, 2025",
    image: "https://static.wixstatic.com/media/11b1c4_XXXXX~mv2.jpeg",
    link: "https://www.catalyst-magazine.com/post/your-article",
    category: "neuro", // or: biochemphys, env, public, biotech
    excerpt: "Brief description of your article."
}
```

**Get Wix Image URLs:**
1. Upload to Wix Media Library
2. Right-click → Copy URL
3. Use the Wix URL (starts with `https://static.wixstatic.com/media/`)

## 🎨 Customization

**Change Colors** - Edit `css/style.css` (lines 2-19):
```css
:root {
    --accent-blue: #0f5ef0;
    --accent-purple: #7c3aed;
}
```

**Adjust Image Quality** - Edit `js/app.js` (line 285):
```javascript
quality = 85,  // 70 (fast) to 95 (high quality)
```

## 📊 Performance

- **WebP Format**: 60-70% smaller than JPEG
- **Responsive Images**: Correct size for each device
- **Smart Preloading**: First 4 images load instantly
- **CDN Optimized**: Using Wix's global CDN

**Result:** Images load as fast as native Wix content! ⚡

## 🔧 Technologies

- HTML5
- CSS3 (Modern flexbox/grid)
- Vanilla JavaScript (no frameworks)
- Wix CDN Integration
- WebP Image Format
- Responsive Images (srcset)

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 3 steps
- **[GITHUB-WIX-SETUP.md](GITHUB-WIX-SETUP.md)** - Complete setup guide
- **[OPTIMIZATION-GUIDE.md](OPTIMIZATION-GUIDE.md)** - Technical details

## 🌐 Live Demo

Once deployed to GitHub Pages, your site will be available at:
```
https://YOUR-USERNAME.github.io/catalystmagazineposts/
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 🔒 Security

- All URLs use HTTPS
- No external tracking
- No third-party scripts
- Images served from secure Wix CDN

## 📄 License

This project is open source and available for use and modification.

## 🤝 Contributing

Feel free to fork and customize for your own use!

## 💬 About

Created for Catalyst Magazine - Science, Policy, and Innovation from the Nation's Capital.

**Website:** [catalyst-magazine.com](https://www.catalyst-magazine.com)

---

**Optimized for Wix · Built with Performance in Mind · HTML5 Compliant**
