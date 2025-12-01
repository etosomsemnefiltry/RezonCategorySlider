import template from './sw-cms-el-rezon-category-slider.html.twig';
import './sw-cms-el-rezon-category-slider.scss';

const { Mixin } = Shopware;
const { Criteria } = Shopware.Data;

/**
 * @private
 * @sw-package discovery
 */
export default {
    template,

    inject: [
        'feature',
        'repositoryFactory',
    ],

    mixins: [
        Mixin.getByName('cms-element'),
    ],

    data() {
        return {
            sliderBoxLimit: 3,
            loadedCategories: null,
        };
    },

    computed: {
        demoCategoryElement() {
            return {
                config: {
                    boxLayout: {
                        source: 'static',
                        value: this.element.config.boxLayout.value,
                    },
                    displayMode: {
                        source: 'static',
                        value: this.element.config.displayMode.value,
                    },
                },
                data: null,
            };
        },

        hasNavigationArrows() {
            return [
                'inside',
                'outside',
            ].includes(this.element.config.navigationArrows.value);
        },

        classes() {
            return {
                'has--navigation-indent': this.element.config.navigationArrows.value === 'outside',
                'has--border': !!this.element.config.border.value,
            };
        },

        navArrowsClasses() {
            if (this.hasNavigationArrows) {
                return [`has--arrow-${this.element.config.navigationArrows.value}`];
            }

            return null;
        },

        sliderBoxMinWidth() {
            if (this.element.config.elMinWidth.value && this.element.config.elMinWidth.value.indexOf('px') > -1) {
                return `repeat(auto-fit, minmax(${this.element.config.elMinWidth.value}, 1fr))`;
            }

            return null;
        },

        currentDeviceView() {
            return this.cmsPageState.currentCmsDeviceView;
        },

        verticalAlignStyle() {
            if (!this.element.config.verticalAlign.value) {
                return null;
            }

            return `align-self: ${this.element.config.verticalAlign.value};`;
        },

        categories() {
            // Storefront: data from resolver
            if (this.element.data && this.element.data.length > 0) {
                return this.element.data;
            }

            // Admin: return loaded categories
            return this.loadedCategories;
        },
    },

    watch: {
        'element.config.elMinWidth.value'() {
            this.setSliderRowLimit();
        },

        'element.config.categories.value': {
            handler(categoryIds) {
                if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
                    this.loadCategories(categoryIds);
                } else {
                    this.loadedCategories = null;
                }
            },
            immediate: true,
        },

        currentDeviceView() {
            this.$nextTick(() => {
                this.setSliderRowLimit();
            });
        },
    },

    created() {
        this.createdComponent();
    },

    mounted() {
        this.mountedComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('rezon-category-slider');
            this.initElementData('rezon-category-slider');
        },

        mountedComponent() {
            this.setSliderRowLimit();
        },

        loadCategories(categoryIds) {
            if (!categoryIds || categoryIds.length === 0) {
                this.loadedCategories = null;
                return;
            }

            const categoryRepository = this.repositoryFactory.create('category');
            const criteria = new Criteria(1, 100);
            criteria.setIds(categoryIds);
            criteria.addAssociation('media');

            categoryRepository
                .search(criteria, {
                    ...Shopware.Context.api,
                    inheritance: true,
                })
                .then((result) => {
                    this.loadedCategories = result;
                })
                .catch(() => {
                    this.loadedCategories = null;
                });
        },

        setSliderRowLimit() {
            this.sliderBoxLimit = 3;
        },

        getCategoryEl(category) {
            return {
                config: {
                    boxLayout: {
                        source: 'static',
                        value: this.element.config.boxLayout.value,
                    },
                    displayMode: {
                        source: 'static',
                        value: this.element.config.displayMode.value,
                    },
                },
                data: {
                    category,
                },
            };
        },
    },
};
