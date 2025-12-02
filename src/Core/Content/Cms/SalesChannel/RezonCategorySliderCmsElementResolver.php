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
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;

class RezonCategorySliderCmsElementResolver extends AbstractCmsElementResolver
{
    private EntityRepository $seoUrlRepository;

    public function __construct(EntityRepository $seoUrlRepository)
    {
        $this->seoUrlRepository = $seoUrlRepository;
    }
    
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
        $categoryIds = $categories->getIds();

        // Load SEO URLs for categories
        $seoUrlCriteria = new Criteria();
        $seoUrlCriteria->addFilter(new EqualsFilter('routeName', 'frontend.navigation.page'));
        $seoUrlCriteria->addFilter(new EqualsFilter('salesChannelId', $salesChannelId));
        $seoUrlCriteria->addFilter(new EqualsFilter('languageId', $languageId));
        $seoUrlCriteria->addFilter(new EqualsFilter('isCanonical', true));
        $seoUrlCriteria->addFilter(new EqualsAnyFilter('foreignKey', $categoryIds));

        $seoUrls = $this->seoUrlRepository->search($seoUrlCriteria, $salesChannelContext->getContext());

        // Create a map of categoryId => seoUrl
        $seoUrlMap = [];
        foreach ($seoUrls->getEntities() as $seoUrl) {
            $seoUrlMap[$seoUrl->getForeignKey()] = $seoUrl;
        }

        // Assign URLs to categories
        foreach ($categories as $category) {
            $urlData = [];

            // Check for external link first
            $externalLink = $category->getExternalLink();
            if ($externalLink) {
                $urlData['externalLink'] = $externalLink;
                $urlData['url'] = $externalLink;
            } elseif (isset($seoUrlMap[$category->getId()])) {
                // Use SEO URL if available
                $seoUrl = $seoUrlMap[$category->getId()];
                $urlData['url'] = '/' . $seoUrl->getSeoPathInfo();
                $urlData['pathInfo'] = $seoUrl->getPathInfo();
            }

            if (!empty($urlData)) {
                $category->assign($urlData);
            }
        }

        $slot->setData($categories);
    }
}
