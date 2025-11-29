import template from './sw-cms-el-config-rezon-category-slider.html.twig';
import './sw-cms-el-config-rezon-category-slider.scss';

const { Mixin } = Shopware;
const { Criteria, EntityCollection } = Shopware.Data;

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

    data() {
        return {
            categoryCollection: null,
        };
    },

    computed: {
        categoryRepository() {
            return this.repositoryFactory.create('category');
        },

        categories() {
            if (this.element?.data?.categories && this.element.data.categories.length > 0) {
                return this.element.data.categories;
            }

            return null;
        },

        categoryMediaFilter() {
            const criteria = new Criteria(1, 25);
            criteria.addAssociation('media');

            return criteria;
        },

        categoryMultiSelectContext() {
            const context = { ...Shopware.Context.api };
            context.inheritance = true;

            return context;
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

            this.categoryCollection = new EntityCollection('/category', 'category', Shopware.Context.api);

            if (this.element.config.categories.value.length <= 0) {
                return;
            }

            const criteria = new Criteria(1, 100);
            criteria.addAssociation('media');
            criteria.setIds(this.element.config.categories.value);

            this.categoryRepository
                .search(criteria, {
                    ...Shopware.Context.api,
                    inheritance: true,
                })
                .then((result) => {
                    this.categoryCollection = result;
                });
        },

        onCategoriesChange() {
            this.element.config.categories.value = this.categoryCollection.getIds();
            this.element.translated.config.categories.value = this.categoryCollection.getIds();

            if (!this.element?.data) {
                return;
            }

            this.element.data.categories = this.categoryCollection;
        },

        isSelected(itemId) {
            return this.categoryCollection.has(itemId);
        },
    },
};
