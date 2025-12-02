/**
 * WIX PAGE INTEGRATION SCRIPT
 *
 * Add this code to your Wix page to enable smooth scrolling through the HTML embed.
 *
 * INSTRUCTIONS:
 * 1. In your Wix editor, click on "Add" > "Embed" > "Custom Embeds" > "HTML iframe"
 * 2. Paste your HTML embed code there
 * 3. Go to your page's code panel (click "</>" at the top left)
 * 4. Click "+ Add Code" and select "Page Code"
 * 5. Paste this entire script into the code panel
 * 6. Set it to run on "Page is ready"
 * 7. Save and publish
 */

$w.onReady(function () {
    // Listen for messages from the embedded iframe
    if (typeof window !== 'undefined') {
        window.addEventListener('message', function(event) {
            // Handle scroll events from iframe
            if (event.data && event.data.type === 'scroll') {
                const deltaY = event.data.deltaY || 0;
                const deltaX = event.data.deltaX || 0;

                // Scroll the parent page
                window.scrollBy({
                    top: deltaY,
                    left: deltaX,
                    behavior: 'auto' // Use 'auto' for immediate response, 'smooth' for smooth scrolling
                });
            }

            // Handle height updates from iframe (for proper sizing)
            if (event.data && (event.data.type === 'setHeight' || event.data.type === 'embed-size')) {
                const height = event.data.height;
                if (height && height > 0) {
                    // Find the iframe element
                    const iframe = document.querySelector('iframe[src*="catalystmagazineposts"]') ||
                                  document.querySelector('iframe.html-embed-iframe');

                    if (iframe) {
                        iframe.style.height = height + 'px';
                    }
                }
            }
        }, false);
    }
});

/**
 * ALTERNATIVE: If you're using a custom HTML element instead of Wix's iframe embed,
 * add this script directly in your custom HTML element after your content:
 *
 * <script>
 *   window.addEventListener('message', function(e) {
 *     if (e.data?.type === 'scroll') {
 *       window.parent.scrollBy({
 *         top: e.data.deltaY || 0,
 *         behavior: 'auto'
 *       });
 *     }
 *   });
 * </script>
 */
