/**
 * @private
 * @sw-package discovery
 */
Shopware.Component.register('sw-cms-preview-rezon-category-slider', () => import('./preview'));
/**
 * @private
 * @sw-package discovery
 */
Shopware.Component.register('sw-cms-block-rezon-category-slider', () => import('./component'));

/**
 * @private
 * @sw-package discovery
 */
Shopware.Service('cmsService').registerCmsBlock({
    name: 'rezon-category-slider',
    label: 'rezon-category-slider.block.label',
    category: 'commerce',
    component: 'sw-cms-block-rezon-category-slider',
    previewComponent: 'sw-cms-preview-rezon-category-slider',
    defaultConfig: {
        marginBottom: '0',
        marginTop: '0',
        marginLeft: '0',
        marginRight: '0',
        sizingMode: 'full_width'
    },
    slots: {
        categorySlider: {
            type: 'rezon-category-slider',
            default: {
                config: {
                    displayMode: { source: 'static', value: 'standard' },
                    boxLayout: { source: 'static', value: 'standard' },
                    navigationArrows: { source: 'static', value: 'outside' },
                    elMinWidth: { source: 'static', value: '300px' },
                },
            },
        },
    }
});

