/**
 * @private
 * @sw-package discovery
 */
Shopware.Component.register('sw-cms-el-preview-rezon-category-slider', () => import('./preview'));
/**
 * @private
 * @sw-package discovery
 */
Shopware.Component.register('sw-cms-el-config-rezon-category-slider', () => import('./config'));
/**
 * @private
 * @sw-package discovery
 */
Shopware.Component.register('sw-cms-el-rezon-category-slider', () => import('./component'));

/**
 * @private
 * @sw-package discovery
 */
Shopware.Service('cmsService').registerCmsElement({
    name: 'rezon-category-slider',
    label: 'rezon-category-slider.element.label',
    component: 'sw-cms-el-rezon-category-slider',
    configComponent: 'sw-cms-el-config-rezon-category-slider',
    previewComponent: 'sw-cms-el-preview-rezon-category-slider',
    defaultConfig: {
        categories: {
            source: 'static',
            required: false,
            value: [],
        },
        title: {
            source: 'static',
            value: '',
        },
        displayMode: {
            source: 'static',
            value: 'standard',
        },
        boxLayout: {
            source: 'static',
            value: 'standard',
        },
        navigationArrows: {
            source: 'static',
            value: 'outside',
        },
        rotate: {
            source: 'static',
            value: false,
        },
        autoplayTimeout: {
            source: 'static',
            value: 5000,
        },
        speed: {
            source: 'static',
            value: 200,
        },
        border: {
            source: 'static',
            value: false,
        },
        elMinWidth: {
            source: 'static',
            value: '300px',
        },
        verticalAlign: {
            source: 'static',
            value: null,
        },
        categoryStreamSorting: {
            source: 'static',
            value: 'name:ASC',
        },
        categoryStreamLimit: {
            source: 'static',
            value: 1,
        },
    },
    collect: Shopware.Service('cmsService').getCollectFunction(),
});
