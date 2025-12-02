/**
 * WIX PAGE INTEGRATION SCRIPT (VELO PAGE CODE)
 *
 * Purpose: only handles messaging with the #html16 embed. All scroll work is
 * handled by the Custom Code snippet injected via Wix Dashboard, keeping this
 * file free of any direct DOM/window access to avoid "document is not defined".
 */

$w.onReady(function () {
    // Target your specific HTML iframe component
    const embed = $w('#html16');

    if (!embed || typeof embed.onMessage !== 'function') {
        console.error('html16 component not found or does not support messaging');
        return;
    }

    const sendAck = () => {
        if (typeof embed.postMessage === 'function') {
            try {
                embed.postMessage({ type: 'scroll-bridge-ack' });
            } catch (e) {
                console.warn('Could not send handshake ack:', e);
            }
        }
    };

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

        if (data.type === 'scroll-bridge-ping') {
            sendAck();
        }
    });

    // Eager handshakes help the iframe start forwarding scroll quickly
    sendAck();
    setTimeout(sendAck, 120);
    setTimeout(sendAck, 480);
});
