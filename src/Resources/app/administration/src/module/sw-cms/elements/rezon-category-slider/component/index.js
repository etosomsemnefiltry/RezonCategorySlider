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
            sliderBoxLimit: 1,
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
            // Если есть данные из resolver (storefront)
            if (this.element.data && this.element.data.length > 0) {
                return this.element.data;
            }

            // Если есть загруженная коллекция (admin)
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
            handler() {
                this.loadCategories();
            },
            immediate: true,
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
            this.loadCategories();
        },

        mountedComponent() {
            this.setSliderRowLimit();
        },

        loadCategories() {
            const categoryIds = this.element.config.categories.value;

            if (!categoryIds || categoryIds.length === 0) {
                this.categoryCollection = null;
                return;
            }

            const categoryRepository = this.repositoryFactory.create('category');
            const criteria = new Criteria();
            criteria.setIds(categoryIds);
            criteria.addAssociation('media');

            categoryRepository
                .search(criteria, Shopware.Context.api)
                .then((result) => {
                    this.categoryCollection = result;
                })
                .catch(() => {
                    this.categoryCollection = null;
                });
        },

        setSliderRowLimit() {
            const boxWidth = this.$refs.categoryHolder?.offsetWidth;

            if (boxWidth === undefined) {
                return;
            }

            if (this.currentDeviceView === 'mobile' || boxWidth < 500) {
                this.sliderBoxLimit = 1;
                return;
            }

            if (
                !this.element.config.elMinWidth.value ||
                this.element.config.elMinWidth.value === 'px' ||
                this.element.config.elMinWidth.value.indexOf('px') === -1
            ) {
                this.sliderBoxLimit = 1;
                return;
            }

            if (parseInt(this.element.config.elMinWidth.value.replace('px', ''), 10) <= 0) {
                return;
            }

            // Subtract to fake look in storefront which has more width
            const fakeLookWidth = 100;
            const elGap = 32;
            let elWidth = parseInt(this.element.config.elMinWidth.value.replace('px', ''), 10);

            if (elWidth >= 300) {
                elWidth -= fakeLookWidth;
            }

            this.sliderBoxLimit = 1;
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
