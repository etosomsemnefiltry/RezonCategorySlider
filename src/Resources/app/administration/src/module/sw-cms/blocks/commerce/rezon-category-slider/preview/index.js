import template from './sw-cms-preview-rezon-category-slider.html.twig';
import './sw-cms-preview-rezon-category-slider.scss';

/**
 * @private
 * @sw-package discovery
 */
export default {
    template,

    computed: {
        assetFilter() {
            return Shopware.Filter.getByName('asset');
        },
    },
};