$w.onReady(function () {
    const htmlComponent = $w('#html16');
    if (!htmlComponent) {
        return;
    }

    const shouldBridgeScroll = (() => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const isIOS = /iP(ad|hone|od)/i.test(platform) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|OPR|Edg/i.test(ua);
        return isIOS || isSafari;
    })();

    const scrollState = { pending: 0, raf: null };
    const queueScroll = (deltaY) => {
        if (!shouldBridgeScroll) return;
        if (!Number.isFinite(deltaY) || deltaY === 0) return;
        scrollState.pending += deltaY;
        if (scrollState.raf) return;
        scrollState.raf = requestAnimationFrame(() => {
            window.scrollBy({ top: scrollState.pending, behavior: 'auto' });
            scrollState.pending = 0;
            scrollState.raf = null;
        });
    };

    const acknowledgeBridge = () => {
        if (!shouldBridgeScroll) return;
        htmlComponent.postMessage({ type: 'scroll-bridge-ack' });
    };

    // Send an initial acknowledgement in case the iframe requested it during load
    acknowledgeBridge();

    htmlComponent.onMessage((event) => {
        const data = event.data || {};
        if (!data || typeof data !== 'object') {
            return;
        }

        if (data.type === 'setHeight' || data.type === 'embed-size') {
            if (data.height && data.height > 0) {
                htmlComponent.height = data.height;
            }
        }

        if (shouldBridgeScroll && data.type === 'scroll') {
            queueScroll(Number(data.deltaY) || 0);
        }

        if (shouldBridgeScroll && data.type === 'scroll-bridge-ping') {
            acknowledgeBridge();
        }
    });
});
