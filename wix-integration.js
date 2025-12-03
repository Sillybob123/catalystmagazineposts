$w.onReady(function () {
    const htmlComponent = $w('#html16');
    if (!htmlComponent) {
        return;
    }

    const MIN_HEIGHT = 1200;
    const applyHeight = (rawHeight) => {
        const parsed = Number(rawHeight);
        if (!parsed || Number.isNaN(parsed)) return;
        const next = Math.max(Math.ceil(parsed) + 24, MIN_HEIGHT);
        if (htmlComponent.height !== next) {
            htmlComponent.height = next;
        }
    };

    // Listen for height updates from the embedded content
    htmlComponent.onMessage((event) => {
        const data = event.data || {};
        if (!data || typeof data !== 'object') {
            return;
        }

        // Auto-resize the iframe to match content height
        if (data.type === 'setHeight' || data.type === 'embed-size') {
            applyHeight(data.height);
        }
    });
});
