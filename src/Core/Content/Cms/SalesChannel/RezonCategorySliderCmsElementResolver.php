<?php declare(strict_types=1);

namespace RezonCategorySlider\Core\Content\Cms\SalesChannel;

use Shopware\Core\Content\Cms\Aggregate\CmsSlot\CmsSlotEntity;
use Shopware\Core\Content\Cms\DataResolver\CriteriaCollection;
use Shopware\Core\Content\Cms\DataResolver\Element\AbstractCmsElementResolver;
use Shopware\Core\Content\Cms\DataResolver\ResolverContext\ResolverContext;
use Shopware\Core\Content\Cms\DataResolver\Element\ElementDataCollection;
use Shopware\Core\Content\Category\CategoryCollection;
use Shopware\Core\Content\Category\CategoryDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\EntitySearchResult;
class RezonCategorySliderCmsElementResolver extends AbstractCmsElementResolver
{
    
    public function getType(): string
    {
        return 'rezon-category-slider';
    }

    public function collect(CmsSlotEntity $slot, ResolverContext $resolverContext): ?CriteriaCollection
    {
        $config = $slot->getFieldConfig();
        $categories = $config->get('categories');

        if (!$categories || !$categories->getValue()) {
            return null;
        }

        $categoryIds = $categories->getValue();
        if (!\is_array($categoryIds) || \count($categoryIds) === 0) {
            return null;
        }

        $criteria = new Criteria($categoryIds);
        $criteria->addAssociation('media');
        $criteria->addAssociation('seoUrls');

        $collection = new CriteriaCollection();
        $collection->add(
            'category_' . $slot->getUniqueIdentifier(),
            CategoryDefinition::class,
            $criteria
        );

        return $collection;
    }

    public function enrich(
        CmsSlotEntity $slot,
        ResolverContext $resolverContext,
        ElementDataCollection $result
    ): void {
        $key = 'category_' . $slot->getUniqueIdentifier();

        /** @var EntitySearchResult<CategoryCollection>|null $entityResult */
        $entityResult = $result->get($key);
        if (!$entityResult) {
            return;
        }

        /** @var CategoryCollection $categories */
        $categories = $entityResult->getEntities();
        if ($categories->count() === 0) {
            return;
        }

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
}
