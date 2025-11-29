import template from './sw-cms-el-config-rezon-category-slider.html.twig';
import './sw-cms-el-config-rezon-category-slider.scss';

const { Mixin } = Shopware;
const { Criteria } = Shopware.Data;

/**
 * @private
 * @sw-package discovery
 */
export default {
    template,

    inject: [
        'repositoryFactory',
        'feature',
    ],

    mixins: [
        Mixin.getByName('cms-element'),
    ],

    computed: {
        categoryCriteria() {
            const criteria = new Criteria();
            criteria.addAssociation('media');
            return criteria;
        },

        displayModeOptions() {
            return [
                {
                    id: 1,
                    value: 'standard',
                    label: this.$tc('sw-cms.elements.general.config.label.displayModeStandard'),
                },
                {
                    id: 2,
                    value: 'cover',
                    label: this.$tc('sw-cms.elements.general.config.label.displayModeCover'),
                },
                {
                    id: 3,
                    value: 'contain',
                    label: this.$tc('sw-cms.elements.general.config.label.displayModeContain'),
                },
            ];
        },

        alignmentOptions() {
            return [
                {
                    id: 1,
                    value: 'flex-start',
                    label: this.$tc('sw-cms.elements.general.config.label.verticalAlignTop'),
                },
                {
                    id: 2,
                    value: 'center',
                    label: this.$tc('sw-cms.elements.general.config.label.verticalAlignCenter'),
                },
                {
                    id: 3,
                    value: 'flex-end',
                    label: this.$tc('sw-cms.elements.general.config.label.verticalAlignBottom'),
                },
            ];
        },

        boxLayoutOptions() {
            return [
                {
                    id: 1,
                    value: 'standard',
                    label: this.$tc('sw-cms.elements.productBox.config.label.layoutTypeStandard'),
                },
                {
                    id: 2,
                    value: 'image',
                    label: this.$tc('sw-cms.elements.productBox.config.label.layoutTypeImage'),
                },
                {
                    id: 3,
                    value: 'minimal',
                    label: this.$tc('sw-cms.elements.productBox.config.label.layoutTypeMinimal'),
                },
            ];
        },

        arrowOptions() {
            return [
                {
                    id: 1,
                    value: 'none',
                    label: this.$tc('sw-cms.elements.productSlider.config.label.navigationPositionNone'),
                },
                {
                    id: 2,
                    value: 'inside',
                    label: this.$tc('sw-cms.elements.productSlider.config.label.navigationPositionInside'),
                },
                {
                    id: 3,
                    value: 'outside',
                    label: this.$tc('sw-cms.elements.productSlider.config.label.navigationPositionOutside'),
                },
            ];
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('rezon-category-slider');
        },
    },
};
