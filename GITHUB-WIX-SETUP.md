# GitHub Pages + Wix "Embed a Site" Setup Guide

## ✅ Your Code is Ready!

Your site is **fully HTML5 compliant** and optimized for:
- ✅ HTTPS (required by Wix)
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Fast image loading via Wix CDN
- ✅ Smooth scrolling when embedded
- ✅ Mobile responsive

---

## 🚀 Step-by-Step Setup

### Part 1: Deploy to GitHub Pages

#### 1. Push Your Code to GitHub

```bash
# Navigate to your project folder
cd /Users/yairben-dor/XCode/catalystmagazineposts

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Catalyst Magazine with optimized images"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/catalystmagazineposts.git
git branch -M main
git push -u origin main
```

#### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source":
   - Select branch: **main**
   - Select folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes for deployment

#### 3. Get Your GitHub Pages URL

Your site will be available at:
```
https://YOUR-USERNAME.github.io/catalystmagazineposts/
```

**Test it!** Open this URL in your browser to verify everything works.

---

### Part 2: Embed in Wix

#### 1. Open Your Wix Editor

1. Go to [Wix.com](https://www.wix.com) and open your site editor
2. Navigate to the page where you want to embed the magazine

#### 2. Add "Embed a Site" Element

1. Click **+ Add** on the left sidebar
2. Select **Embed Code**
3. Choose **Embed a Site**
4. A new embed element will appear on your page

#### 3. Configure the Embed

1. Click the embed element on your page
2. Click **Enter Site Address**
3. Paste your GitHub Pages URL:
   ```
   https://YOUR-USERNAME.github.io/catalystmagazineposts/
   ```
4. Click **Update**

#### 4. Resize the Embed

1. Drag the corners to make it full-width
2. Height will auto-adjust to fit content
3. Recommended: Set width to 100% of content area

#### 5. Enable Scroll-Through (Optional but Recommended)

To allow users to scroll the main page when scrolling over your embed:

1. In Wix Editor, click **</> Dev Mode** at the top
2. If not enabled, click **Enable Dev Mode**
3. In the left panel, find your embedded site element (usually named `htmlEmbed1` or similar)
4. Add this code to your page code:

```javascript
$w.onReady(function () {
    // Get the embedded site element
    const embed = $w('#htmlEmbed1'); // Replace with your embed ID

    // Listen for scroll events from the embedded site
    if (typeof window !== 'undefined') {
        window.addEventListener('message', function(event) {
            // Handle scroll events
            if (event.data && event.data.type === 'scroll') {
                const deltaY = event.data.deltaY || 0;
                window.scrollBy({
                    top: deltaY,
                    behavior: 'auto'
                });
            }
        });
    }
});
```

**To find your embed element ID:**
- Select the embed element
- Look at the top of the properties panel - it shows the ID (e.g., `#htmlEmbed1`)

#### 6. Publish Your Site

1. Click **Publish** in the top right
2. Wait for Wix to publish your changes
3. Visit your live site to test!

---

## 🔄 Updating Your Content

### To Add or Edit Articles

1. **Edit `js/data.js`** on your computer:

```javascript
{
    title: "Your New Article Title",
    author: "Author Name",
    date: "Dec 2, 2025",
    image: "https://static.wixstatic.com/media/11b1c4_XXXXX~mv2.jpeg",
    link: "https://www.catalyst-magazine.com/post/your-article",
    category: "neuro", // or: biochemphys, env, public, biotech
    excerpt: "Brief description of your article."
}
```

2. **Get the Wix image URL** from your Wix Media Library:
   - Upload image to Wix
   - Right-click → Copy URL
   - URL should start with: `https://static.wixstatic.com/media/`

3. **Push to GitHub**:

```bash
git add js/data.js
git commit -m "Add new article: Your Article Title"
git push
```

4. **Wait 1-2 minutes** for GitHub Pages to rebuild
5. **Refresh your Wix page** - changes appear automatically!

### To Update Styles or Layout

1. Edit `css/style.css` or `index.html`
2. Test locally by opening `index.html` in a browser
3. Push to GitHub:
```bash
git add .
git commit -m "Update styles"
git push
```
4. Refresh your Wix page after 1-2 minutes

---

## 🎨 Customization Tips

### Change Colors

Edit `css/style.css` at the top (lines 2-19):

```css
:root {
    --accent-blue: #0f5ef0;     /* Change primary color */
    --accent-purple: #7c3aed;   /* Change secondary color */
    --text-primary: #0f172a;    /* Change text color */
    --card-bg: #ffffff;         /* Change card background */
}
```

### Adjust Image Quality

Higher quality = larger files, slower loading. Lower quality = smaller files, faster loading.

Edit `js/app.js` line 285:

```javascript
optimizeWixImage(url, {
    quality = 85,  // Change: 70 (fast) to 95 (high quality)
})
```

### Preload More/Fewer Images

Edit `js/app.js` line 320:

```javascript
const top = articles.slice(0, 4)  // Change 4 to any number
```

---

## 🐛 Troubleshooting

### Problem: Embed shows "This content couldn't be embedded"

**Solution:**
- Verify your GitHub Pages URL is live and accessible
- Make sure URL uses HTTPS (GitHub Pages does this automatically)
- Try copying the URL directly from your browser address bar

### Problem: Images not loading

**Solution:**
- Check that image URLs start with `https://static.wixstatic.com/media/`
- Verify images are publicly accessible in your Wix Media Library
- Check browser console for errors (F12 → Console tab)

### Problem: Styling looks broken

**Solution:**
- Verify `css/style.css` is in the correct folder
- Check that `index.html` references `css/style.css` (not `style.css`)
- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Problem: Changes not appearing on Wix

**Solution:**
1. Wait 2-3 minutes for GitHub Pages to rebuild
2. Hard refresh the GitHub Pages URL (Ctrl+Shift+R)
3. If still not updating, check GitHub Actions tab for build status
4. Try clearing your browser cache

### Problem: Scrolling still getting stuck

**Solution:**
- Make sure you added the scroll handler code to Wix Dev Mode
- Check browser console for JavaScript errors
- Verify the embed element ID matches in your code

### Problem: Site loads slowly

**Solution:**
- Images are already optimized to 85% quality
- Reduce quality to 75-80 in `js/app.js` line 285
- Reduce number of preloaded images (line 320)
- Make sure you're using Wix image URLs (they're fastest)

---

## 📊 Performance Checklist

✅ **All optimizations are already enabled:**
- Images convert to WebP automatically (60-70% smaller)
- Responsive images load correct size for each device
- First 4 images preload with high priority
- Wix CDN connection established early
- Modern HTML5 + CSS3
- HTTPS everywhere

**Your images load as fast as native Wix content!**

---

## 🔒 Security Notes

- All URLs use HTTPS ✅
- GitHub Pages provides free SSL ✅
- No external tracking or analytics ✅
- All images served from Wix's secure CDN ✅

---

## 📱 Mobile Optimization

Your site is fully responsive and optimized for:
- ✅ iPhone (Safari)
- ✅ Android (Chrome)
- ✅ iPad/Tablets
- ✅ Desktop browsers

Specific mobile optimizations:
- Touch-friendly navigation
- Optimized image sizes for mobile screens
- Smooth scrolling on iOS
- No zoom on input focus (font-size: 16px)

---

## 💡 Pro Tips

1. **Use Wix Media Library**: Always upload images to Wix first, then use those URLs in `data.js` - they're optimized and load instantly

2. **Test on GitHub Pages First**: Before checking Wix, make sure your changes work on the GitHub Pages URL

3. **Keep Quality at 85**: This is the sweet spot - great quality, still fast

4. **Preload Sparingly**: Only preload 3-4 images max - more can slow down initial load

5. **Update Regularly**: Small, frequent updates are better than large batches

6. **Monitor File Sizes**: Keep your repo under 1GB (GitHub's recommendation)

---

## 📞 Quick Reference

### Your URLs
- **GitHub Repo**: `https://github.com/YOUR-USERNAME/catalystmagazineposts`
- **GitHub Pages**: `https://YOUR-USERNAME.github.io/catalystmagazineposts/`
- **Wix Site**: Your main Wix site URL

### File Structure
```
catalystmagazineposts/
├── index.html              ← Main page (HTML5)
├── css/
│   └── style.css          ← All styles
├── js/
│   ├── data.js            ← Articles (edit this!)
│   └── app.js             ← Functionality
└── *.md                   ← Documentation files
```

### Key Files to Edit
- **Add articles**: `js/data.js`
- **Change colors**: `css/style.css` (lines 2-19)
- **Adjust layout**: `css/style.css`
- **Modify functionality**: `js/app.js`

---

## 🎉 You're All Set!

Your magazine is now:
- 🚀 Blazing fast with optimized images
- 📱 Fully responsive
- ✅ HTML5 compliant
- 🔒 Secure (HTTPS)
- 🎨 Easy to customize
- 📊 Integrated with Wix

**Need help?** Check the other documentation files:
- `OPTIMIZATION-GUIDE.md` - Technical details
- `wix-integration.js` - Advanced scroll integration
- `wix-embed-code.html` - Alternative embed methods
