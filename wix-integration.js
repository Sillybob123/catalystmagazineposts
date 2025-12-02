$w.onReady(function () {
    const htmlComponent = $w('#html16');
    if (!htmlComponent) {
        return;
    }

    // Listen for height updates from the embedded content
    htmlComponent.onMessage((event) => {
        const data = event.data || {};
        if (!data || typeof data !== 'object') {
            return;
        }

        // Auto-resize the iframe to match content height
        if (data.type === 'setHeight' || data.type === 'embed-size') {
            if (data.height && data.height > 0) {
                htmlComponent.height = data.height;
            }
        }
    });
});
