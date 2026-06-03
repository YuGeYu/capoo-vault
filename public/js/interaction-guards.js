const DEFAULT_ALLOWED_CONTEXT_MENU_SELECTORS = [
    '[data-allow-contextmenu]',
    '[contenteditable="true"]'
];

export function bindInteractionGuards(options = {}) {
    const allowSelectors = Array.isArray(options.allowContextMenuSelectors) && options.allowContextMenuSelectors.length
        ? options.allowContextMenuSelectors
        : DEFAULT_ALLOWED_CONTEXT_MENU_SELECTORS;

    document.addEventListener('contextmenu', event => {
        const target = event.target;
        if (target instanceof Element && allowSelectors.some(selector => target.closest(selector))) return;
        event.preventDefault();
    });
}
