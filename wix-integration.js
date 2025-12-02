$w.onReady(function () {
    const htmlComponent = $w('#html16');

    if (htmlComponent) {
        htmlComponent.onMessage((event) => {
            // Simply resize the iframe to fit the content perfectly
            if (event.data.type === 'setHeight' || event.data.type === 'embed-size') {
                if (event.data.height && event.data.height > 0) {
                    htmlComponent.height = event.data.height;
                }
            }
        });
    }
});
