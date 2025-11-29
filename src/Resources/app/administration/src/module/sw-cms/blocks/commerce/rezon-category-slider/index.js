import './component';
import './preview';

Shopware.Service('cmsService').registerCmsBlock({
    name: 'rezon-category-slider',
    label: 'Rezon Category Slider',
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
        categorySlider: 'rezon-category-slider'
    }
});