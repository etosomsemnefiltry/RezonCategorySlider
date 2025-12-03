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

        categoryCriteria() {
            const criteria = new Criteria(1, 500);
            criteria.addAssociation('media');
            criteria.addAssociation('parent');
            criteria.addSorting(Criteria.sort('name', 'ASC', false));

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

    watch: {
        categoryCollection: {
            handler() {
                this.updateCategoriesConfig();
            },
            deep: true,
        },
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            this.initElementConfig('rezon-category-slider');
            this.initCategoryCollection();
        },

        getCategoryDisplayName(category) {
            if (!category) {
                return '';
            }

            if (category.translated && category.translated.name) {
                return category.translated.name;
            }

            return category.name || '';
        },

        getCategoryBreadcrumbLabel(category) {
            if (!category) {
                return '';
            }

            // Попробуем получить хлебные крошки из разных источников
            // В Shopware EntityCollection данные нормализуются, но проверим разные варианты
            let breadcrumb = null;
            
            // 1. Сначала пробуем получить из translated (приоритет)
            if (category.translated && category.translated.breadcrumb) {
                breadcrumb = category.translated.breadcrumb;
            } 
            // 2. Затем из обычного поля breadcrumb
            else if (category.breadcrumb) {
                breadcrumb = category.breadcrumb;
            }
            // 3. Если данные в формате attributes (на случай, если не нормализованы)
            else if (category.attributes && category.attributes.breadcrumb) {
                breadcrumb = category.attributes.breadcrumb;
            }
            else if (category.attributes && category.attributes.translated && category.attributes.translated.breadcrumb) {
                breadcrumb = category.attributes.translated.breadcrumb;
            }
            // 4. Если хлебные крошки не загружены, пробуем построить путь из родительской категории
            else if (category.parent) {
                const parentName = category.parent.translated?.name || category.parent.name || '';
                const categoryName = this.getCategoryDisplayName(category);
                if (parentName && parentName !== categoryName) {
                    // Если есть родитель родителя, строим путь дальше
                    if (category.parent.parent) {
                        const grandParentName = category.parent.parent.translated?.name || category.parent.parent.name || '';
                        if (grandParentName && grandParentName !== parentName) {
                            return `${grandParentName} > ${parentName}`;
                        }
                    }
                    return parentName;
                }
            }

            if (!breadcrumb) {
                return '';
            }

            // Обрабатываем разные форматы хлебных крошек
            // В JSON это массив: ["Deutsch 2.0", "Footer Service", "Wochenendtrip Berlin"]
            let breadcrumbNames = [];
            
            if (Array.isArray(breadcrumb)) {
                // Фильтруем пустые значения и приводим к строкам
                breadcrumbNames = breadcrumb.filter(item => item && String(item).trim()).map(item => String(item).trim());
            } else if (typeof breadcrumb === 'object' && breadcrumb !== null) {
                breadcrumbNames = Object.values(breadcrumb).filter(item => item && String(item).trim()).map(item => String(item).trim());
            } else if (typeof breadcrumb === 'string') {
                breadcrumbNames = breadcrumb.split(' > ').filter(Boolean).map(item => item.trim());
            }

            // Если массив пустой или содержит только один элемент (текущая категория), возвращаем пустую строку
            if (breadcrumbNames.length <= 1) {
                return '';
            }

            // Убираем последний элемент (текущая категория) и объединяем остальные
            return breadcrumbNames.slice(0, -1).join(' > ');
        },

        isSelected(categoryId) {
            if (!this.categoryCollection) {
                return false;
            }

            return this.categoryCollection.has(categoryId);
        },

        initCategoryCollection() {
            const categoryIds = this.element.config.categories.value;

            if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
                this.categoryCollection = new EntityCollection(
                    this.categoryRepository.route,
                    this.categoryRepository.schema.entity,
                    Shopware.Context.api,
                    this.categoryCriteria,
                );
                return;
            }

            const criteria = new Criteria(1, 100);
            criteria.setIds(categoryIds);
            criteria.addAssociation('media');
            criteria.addAssociation('parent');

            this.categoryRepository
                .search(criteria, {
                    ...Shopware.Context.api,
                    inheritance: true,
                })
                .then((result) => {
                    this.categoryCollection = result;
                })
                .catch(() => {
                    this.categoryCollection = new EntityCollection(
                        this.categoryRepository.route,
                        this.categoryRepository.schema.entity,
                        Shopware.Context.api,
                        this.categoryCriteria,
                    );
                });
        },

        updateCategoriesConfig() {
            if (!this.categoryCollection) {
                this.element.config.categories.value = [];
                return;
            }

            this.element.config.categories.value = this.categoryCollection.map((category) => category.id);
        },

        fetchCategories(searchTerm = '', limit = 25) {
            const criteria = new Criteria(1, limit);
            criteria.addAssociation('media');
            criteria.addAssociation('parent');
            criteria.addSorting(Criteria.sort('name', 'ASC', false));

            if (searchTerm) {
                criteria.setTerm(searchTerm);
            }

            return this.categoryRepository
                .search(criteria, {
                    ...Shopware.Context.api,
                    inheritance: true,
                })
                .then((result) => ({
                    data: result,
                    total: result.total,
                }));
        },
    },
};
