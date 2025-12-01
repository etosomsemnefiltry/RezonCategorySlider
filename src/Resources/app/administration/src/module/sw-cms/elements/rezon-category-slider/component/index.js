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
            categoryCollection: null,
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
            // If data exists from resolver (storefront)
            if (this.element.data && this.element.data.length > 0) {
                return this.element.data;
            }

            // If loaded collection exists (admin)
            if (this.categoryCollection && this.categoryCollection.length > 0) {
                return this.categoryCollection;
            }

            return null;
        },
    },

    watch: {
        'element.config.elMinWidth.value': {
            handler() {
                this.setSliderRowLimit();
            },
        },

        'element.config.categories.value': {
            handler(newValue) {
                // Load categories on change
                if (newValue && Array.isArray(newValue) && newValue.length > 0) {
                    this.loadCategories();
                } else {
                    this.categoryCollection = null;
                }
            },
            deep: true,
        },

        currentDeviceView() {
            setTimeout(() => {
                this.setSliderRowLimit();
            }, 400);
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
            
            // Load categories on initialization if they exist
            if (this.element.config.categories.value && this.element.config.categories.value.length > 0) {
                this.loadCategories();
            }
        },

        mountedComponent() {
            this.setSliderRowLimit();
        },

        loadCategories() {
            const categoryIds = this.element.config.categories.value;

            if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
                this.categoryCollection = null;
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
                    this.categoryCollection = result;
                })
                .catch(() => {
                    this.categoryCollection = null;
                });
        },

        setSliderRowLimit() {
            // Always show 3 elements
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
