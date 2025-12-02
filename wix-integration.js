/**
 * WIX PAGE INTEGRATION SCRIPT (VELO PAGE CODE)
 *
 * Purpose: only handles messaging with the #html16 embed for height sizing.
 * No scroll passthrough. No direct DOM/window access to avoid SSR/worker errors.
 */

$w.onReady(function () {
    // Target your specific HTML iframe component
    const embed = $w('#html16');

    if (!embed || typeof embed.onMessage !== 'function') {
        console.error('html16 component not found or does not support messaging');
        return;
    }

    const applyHeight = (height) => {
        const numericHeight = Number(height);
        if (!numericHeight || numericHeight <= 0) return;

        try {
            embed.height = numericHeight;
        } catch (e) {
            console.warn('Could not set component height:', e);
        }
    };

    // Listen only for messages that matter to Wix components (no scrolling here)
    embed.onMessage((event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'setHeight' || data.type === 'embed-size') {
            applyHeight(data.height);
        }
    });
});
