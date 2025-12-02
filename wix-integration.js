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
    const handleMessage = (data, sourceComponent) => {
        if (!data) return;

        if (data.type === 'scroll') {
            const deltaY = Number(data.deltaY) || 0;
            const deltaX = Number(data.deltaX) || 0;

            window.scrollBy({
                top: deltaY,
                left: deltaX,
                behavior: 'auto' // Use 'auto' for immediate response, 'smooth' for smooth scrolling
            });
        }

        if (data.type === 'setHeight' || data.type === 'embed-size') {
            const height = Number(data.height);
            if (height && height > 0) {
                if (sourceComponent && typeof sourceComponent.height === 'number') {
                    sourceComponent.height = height;
                } else {
                    const iframe = document.querySelector('iframe[src*="catalystmagazineposts"]') ||
                                  document.querySelector('iframe.html-embed-iframe');

                    if (iframe) {
                        iframe.style.height = height + 'px';
                    }
                }
            }
        }

        if (data.type === 'scroll-bridge-ping' && sourceComponent && typeof sourceComponent.postMessage === 'function') {
            sourceComponent.postMessage({ type: 'scroll-bridge-ack' });
        }
    };

    const wireHtmlComponent = (component) => {
        if (!component || typeof component.onMessage !== 'function') return;
        component.onMessage((event) => handleMessage(event.data, component));

        // Tell the embedded frame we're ready to handle scroll passthrough
        if (typeof component.postMessage === 'function') {
            component.postMessage({ type: 'scroll-bridge-ack' });
        }
    };

    // Attach to any HTML embeds on the page
    const htmlComponents = $w('HtmlComponent');
    if (Array.isArray(htmlComponents)) {
        htmlComponents.forEach(wireHtmlComponent);
    } else if (htmlComponents) {
        // $w('HtmlComponent') may return a single component when only one exists
        if (typeof htmlComponents.forEach === 'function') {
            htmlComponents.forEach(wireHtmlComponent);
        } else {
            wireHtmlComponent(htmlComponents);
        }
    }

    // Fallback listener (covers preview mode / non-Wix shells)
    if (typeof window !== 'undefined') {
        window.addEventListener('message', function(event) {
            handleMessage(event.data, null);
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
