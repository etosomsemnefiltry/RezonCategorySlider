<?php declare(strict_types=1);

namespace RezonCategorySlider\Core\Content\Cms\SalesChannel;

use Shopware\Core\Content\Cms\Aggregate\CmsSlot\CmsSlotEntity;
use Shopware\Core\Content\Cms\DataResolver\Element\ElementDataCollection;
use Shopware\Core\Content\Cms\DataResolver\CriteriaCollection;
use Shopware\Core\Content\Cms\DataResolver\ResolverContext\ResolverContext;
use Shopware\Core\Content\Cms\DataResolver\Element\AbstractCmsElementResolver;
use Shopware\Core\Content\Category\CategoryCollection;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsAnyFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;

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

        if (!$categories || $categories->getValue() === null) {
            return null;
        }

        $categoryIds = $categories->getValue();

        if (empty($categoryIds)) {
            return null;
        }

        $criteria = new Criteria();
        $criteria->addFilter(new EqualsAnyFilter('id', $categoryIds));
        $criteria->addFilter(new EqualsFilter('active', true));
        $criteria->addAssociation('media');
        $criteria->addAssociation('seoUrls');

        $criteriaCollection = new CriteriaCollection();
        $criteriaCollection->add('category_' . $slot->getUniqueIdentifier(), CategoryCollection::class, $criteria);

        return $criteriaCollection;
    }

    public function enrich(CmsSlotEntity $slot, ResolverContext $resolverContext, ElementDataCollection $result): void
    {
        $key = 'category_' . $slot->getUniqueIdentifier();
        $categoryCollection = $result->get($key);

        if (!$categoryCollection) {
            return;
        }

        $slot->setData($categoryCollection);
    }
}


