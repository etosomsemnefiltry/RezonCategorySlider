<?php declare(strict_types=1);

namespace RezonCategorySlider\Core\Content\Cms\SalesChannel;

use Shopware\Core\Content\Cms\Aggregate\CmsSlot\CmsSlotEntity;
use Shopware\Core\Content\Cms\DataResolver\CriteriaCollection;
use Shopware\Core\Content\Cms\DataResolver\Element\AbstractCmsElementResolver;
use Shopware\Core\Content\Cms\DataResolver\ResolverContext\ResolverContext;
use Shopware\Core\Content\Cms\DataResolver\Element\ElementDataCollection;
use Shopware\Core\Content\Category\CategoryCollection;
use Shopware\Core\Content\Category\CategoryDefinition;
use Shopware\Core\Content\Product\ProductDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;

class RezonCategorySliderCmsElementResolver extends AbstractCmsElementResolver
{
    
    public function getType(): string
    {
        return 'rezon-category-slider';
    }

    public function collect(CmsSlotEntity $slot, ResolverContext $resolverContext): ?CriteriaCollection
    {
        $config = $slot->getFieldConfig();
        $collection = new CriteriaCollection();

        // 1. Categories logic (keep as is)
        $categories = $config->get('categories');
        if ($categories && $categories->getValue() && \count($categories->getValue()) > 0) {
            $categoryIds = $categories->getValue();
            $criteria = new Criteria($categoryIds);
            $criteria->addAssociation('media');
            $criteria->addAssociation('seoUrls');

            $collection->add(
                'category_' . $slot->getUniqueIdentifier(),
                CategoryDefinition::class,
                $criteria
            );
        }

        // 2. Products logic (new)
        $showProducts = $config->get('showProducts');
        if ($showProducts && $showProducts->getValue() === true) {
            $productCriteria = new Criteria();
            $productCriteria->addAssociation('cover');
            $productCriteria->addAssociation('options.group');

            $selectionType = $config->get('productSelectionType') ? $config->get('productSelectionType')->getValue() : 'static';

            if ($selectionType === 'static') {
                $productIds = $config->get('products') ? $config->get('products')->getValue() : [];
                if (!empty($productIds)) {
                    $productCriteria->setIds($productIds);
                }
            } else {
                $prodCategoryId = $config->get('productCategory') ? $config->get('productCategory')->getValue() : null;
                if ($prodCategoryId) {
                    $productCriteria->addFilter(new EqualsFilter('categoryIds', $prodCategoryId));
                }

                $sort = $config->get('productSort') ? $config->get('productSort')->getValue() : 'name:ASC';
                if ($sort === 'random') {
                    // Random sorting in SW6
                    $productCriteria->addQuery(new \Shopware\Core\Framework\DataAbstractionLayer\Search\Query\ScoreQuery(
                        new EqualsFilter('id', null),
                        1.0,
                        null
                    ));
                } elseif (strpos($sort, ':') !== false) {
                    [$field, $direction] = explode(':', $sort);
                    $productCriteria->addSorting(new FieldSorting($field, $direction));
                }
            }

            $limit = $config->get('productLimit') ? (int)$config->get('productLimit')->getValue() : 10;
            $productCriteria->setLimit($limit);

            $collection->add(
                'product_' . $slot->getUniqueIdentifier(),
                ProductDefinition::class,
                $productCriteria
            );
        }

        return $collection->count() > 0 ? $collection : null;
    }

    public function enrich(
        CmsSlotEntity $slot,
        ResolverContext $resolverContext,
        ElementDataCollection $result
    ): void {
        $categoryKey = 'category_' . $slot->getUniqueIdentifier();
        $productKey = 'product_' . $slot->getUniqueIdentifier();

        // 1. Enrich Categories
        $categoryResult = $result->get($categoryKey);
        if ($categoryResult) {
            /** @var CategoryCollection $categories */
            $categories = $categoryResult->getEntities();
            
            $salesChannelContext = $resolverContext->getSalesChannelContext();
            $salesChannelId = $salesChannelContext->getSalesChannelId();
            $languageId = $salesChannelContext->getLanguageId();

            // Assign URLs to categories using loaded seoUrls association
            foreach ($categories as $category) {
                $urlData = [];

                // Check for external link first
                $externalLink = $category->getExternalLink();
                if ($externalLink) {
                    $urlData['externalLink'] = $externalLink;
                } elseif ($category->getSeoUrls() && $category->getSeoUrls()->count() > 0) {
                    // Use SEO URL from association
                    $seoUrls = $category->getSeoUrls();
                    
                    // Find canonical SEO URL for current sales channel and language
                    $canonicalSeoUrl = null;
                    foreach ($seoUrls as $seoUrl) {
                        if ($seoUrl->getIsCanonical() 
                            && $seoUrl->getSalesChannelId() === $salesChannelId
                            && $seoUrl->getLanguageId() === $languageId
                            && $seoUrl->getRouteName() === 'frontend.navigation.page') {
                            $canonicalSeoUrl = $seoUrl;
                            break;
                        }
                    }
                    
                    // If no canonical found, try to find any matching SEO URL
                    if (!$canonicalSeoUrl) {
                        foreach ($seoUrls as $seoUrl) {
                            if ($seoUrl->getSalesChannelId() === $salesChannelId
                                && $seoUrl->getLanguageId() === $languageId
                                && $seoUrl->getRouteName() === 'frontend.navigation.page') {
                                $canonicalSeoUrl = $seoUrl;
                                break;
                            }
                        }
                    }
                    
                    // If still no match, use first available SEO URL
                    if (!$canonicalSeoUrl && $seoUrls->count() > 0) {
                        $canonicalSeoUrl = $seoUrls->first();
                    }
                    
                    if ($canonicalSeoUrl) {
                        $urlData['url'] = '/' . $canonicalSeoUrl->getSeoPathInfo();
                        $urlData['pathInfo'] = $canonicalSeoUrl->getPathInfo();
                    }
                }

                if (!empty($urlData)) {
                    $category->assign($urlData);
                }
            }

            $slot->setData($categories);
        }

        // 2. Enrich Products (add as extension)
        $productResult = $result->get($productKey);
        if ($productResult) {
            $slot->addExtension('rezon_products', $productResult->getEntities());
        }
    }
}
