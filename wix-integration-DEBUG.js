/**
 * DEBUG VERSION - WIX PAGE INTEGRATION SCRIPT
 * Use this temporarily to see what's happening in the console
 */

$w.onReady(function () {
    console.log('🚀 Wix integration script started');

    // Direct scroll execution
    const executeScroll = (deltaY, deltaX) => {
        console.log('📜 Scrolling:', { deltaY, deltaX });
        try {
            window.scrollBy({
                top: deltaY,
                left: deltaX,
                behavior: 'auto'
            });
        } catch (e) {
            window.scrollBy(deltaY, deltaX);
        }
    };

    const handleMessage = (data, sourceComponent) => {
        if (!data) return;

        console.log('📨 Message received:', data);

        if (data.type === 'scroll') {
            const deltaY = Number(data.deltaY) || 0;
            const deltaX = Number(data.deltaX) || 0;

            if (deltaY !== 0 || deltaX !== 0) {
                executeScroll(deltaY, deltaX);
            }
        }

        if (data.type === 'setHeight' || data.type === 'embed-size') {
            const height = Number(data.height);
            console.log('📏 Setting height:', height);
            if (height && height > 0 && sourceComponent) {
                try {
                    sourceComponent.height = height;
                } catch (e) {
                    console.warn('Could not set height:', e);
                }
            }
        }

        if (data.type === 'scroll-bridge-ping') {
            console.log('🤝 Handshake ping received, sending ACK');
            if (sourceComponent) {
                try {
                    sourceComponent.postMessage({ type: 'scroll-bridge-ack' });
                } catch (e) {
                    console.warn('Could not send ACK:', e);
                }
            }
        }
    };

    // Target #html16
    try {
        const embed = $w('#html16');
        console.log('🎯 Found #html16:', embed);

        if (embed && typeof embed.onMessage === 'function') {
            console.log('✅ #html16 supports messaging');

            embed.onMessage((event) => {
                console.log('📥 Message from #html16:', event.data);
                handleMessage(event.data, embed);
            });

            if (typeof embed.postMessage === 'function') {
                console.log('📤 Sending initial handshake to #html16');
                embed.postMessage({ type: 'scroll-bridge-ack' });

                setTimeout(() => {
                    console.log('📤 Sending handshake retry (100ms)');
                    embed.postMessage({ type: 'scroll-bridge-ack' });
                }, 100);

                setTimeout(() => {
                    console.log('📤 Sending handshake retry (500ms)');
                    embed.postMessage({ type: 'scroll-bridge-ack' });
                }, 500);
            }
        } else {
            console.error('❌ #html16 does not support messaging');
        }
    } catch (e) {
        console.error('❌ Error setting up #html16:', e);
    }

    // FALLBACK: Global message listener
    console.log('🌐 Setting up global message listener');
    window.addEventListener('message', function(event) {
        const data = event.data;

        console.log('🌍 Global message received:', {
            origin: event.origin,
            data: data
        });

        if (data && (data.type === 'scroll' || data.type === 'scroll-bridge-ping')) {
            if (data.type === 'scroll') {
                const deltaY = Number(data.deltaY) || 0;
                const deltaX = Number(data.deltaX) || 0;
                if (deltaY !== 0 || deltaX !== 0) {
                    executeScroll(deltaY, deltaX);
                }
            }

            if (data.type === 'scroll-bridge-ping' && event.source) {
                console.log('🤝 Sending global ACK to:', event.origin);
                try {
                    event.source.postMessage({ type: 'scroll-bridge-ack' }, '*');
                } catch (e) {
                    console.warn('Could not send global ACK:', e);
                }
            }
        }
    }, false);

    console.log('✅ Wix integration setup complete');
});
