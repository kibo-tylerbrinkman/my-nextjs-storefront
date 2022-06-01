import React from 'react'

import StarIcon from '@mui/icons-material/StarRounded'
import { Box, Grid, Rating, Button, Typography, Divider } from '@mui/material'
import { useTranslation } from 'next-i18next'

import FulfillmentOptions from '@/components/common/FulfillmentOptions/FulfillmentOptions'
import Price from '@/components/common/Price/Price'
import QuantitySelector from '@/components/common/QuantitySelector/QuantitySelector'
import KiboBreadcrumbs from '@/components/core/Breadcrumbs/KiboBreadcrumbs'
import ImageGallery from '@/components/core/ImageGallery/ImageGallery'
import ColorSelector from '@/components/product/ColorSelector/ColorSelector'
import ProductInformation from '@/components/product/ProductInformation/ProductInformation'
import ProductOptionCheckbox from '@/components/product/ProductOptionCheckbox/ProductOptionCheckbox'
import ProductOptionSelect from '@/components/product/ProductOptionSelect/ProductOptionSelect'
import ProductOptionTextBox from '@/components/product/ProductOptionTextBox/ProductOptionTextBox'
import ProductRecommendations from '@/components/product/ProductRecommendations/ProductRecommendations'
import ProductVariantSizeSelector from '@/components/product/ProductVariantSizeSelector/ProductVariantSizeSelector'
import { productGetters } from '@/lib/getters'
import type { ProductProperties, ProductCustom, BreadCrumb } from '@/lib/types'

import type {
  AttributeDetail,
  ProductImage,
  ProductOption,
  ProductOptionValue,
} from '@/lib/gql/types'

interface ProductDetailTemplateProps {
  product: ProductCustom
  breadcrumbs: BreadCrumb[]
}

const ProductDetailTemplate = (props: ProductDetailTemplateProps) => {
  const { product, breadcrumbs } = props
  const { t } = useTranslation(['product', 'common'])

  const productName = productGetters.getName(product)
  const productPrice = productGetters.getPrice(product)
  const productRating = productGetters.getRating(product)
  const description = productGetters.getDescription(product)
  const shortDescription = productGetters.getShortDescription(product)
  const productGallery = productGetters.getProductGallery(product)

  const productOptions = productGetters.getSegregatedOptions(product)
  const optionsVisibility = {
    color: productOptions && productOptions.colourOptions && productOptions.colourOptions.values,
    size: productOptions && productOptions.sizeOptions && productOptions.sizeOptions.values,
    select: productOptions && productOptions.selectOptions.length,
    checkbox: productOptions && productOptions.yesNoOptions.length,
    textbox: productOptions && productOptions.textBoxOptions.length,
  }

  const properties = productGetters.getProperties(product) as ProductProperties[]
  const isValidForAddToCart = productGetters.validateAddToCart(product)

  return (
    <>
      <Grid container>
        <Grid item xs={12} alignItems="center" sx={{ paddingBlock: 4 }}>
          <KiboBreadcrumbs breadcrumbs={breadcrumbs} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ pb: { xs: 3, md: 0 } }}>
          <ImageGallery images={productGallery as ProductImage[]} title={''} />
        </Grid>

        <Grid item xs={12} md={6} sx={{ width: '100%', pl: { xs: 0, md: 5 } }}>
          <Typography variant="h1" gutterBottom>
            {productName}
          </Typography>
          <Price
            price={t<string>('common:currency', { val: productPrice.regular })}
            {...(productPrice.special && {
              salePrice: t<string>('common:currency', { val: productPrice.special }),
            })}
          />

          <Box paddingY={1} display={shortDescription ? 'block' : 'none'}>
            <Box
              data-testid="short-description"
              dangerouslySetInnerHTML={{
                __html: shortDescription,
              }}
            />
          </Box>

          <Box data-testid="product-rating">
            <Rating
              name="read-only"
              value={productRating}
              precision={0.5}
              readOnly
              size="small"
              icon={<StarIcon color="primary" />}
              emptyIcon={<StarIcon />}
            />
          </Box>

          <Box paddingX={1} paddingY={3} display={optionsVisibility.color ? 'block' : 'none'}>
            <ColorSelector
              attributeFQN="tenant~color"
              values={productOptions?.colourOptions?.values as ProductOptionValue[]}
              onChange={() => null}
            />
          </Box>

          <Box paddingY={1} display={optionsVisibility.size ? 'block' : 'none'}>
            <ProductVariantSizeSelector
              values={productOptions?.sizeOptions?.values as ProductOptionValue[]}
              attributeFQN="tenant~size"
              selectOption={() => null}
            />
          </Box>

          <Box paddingY={1} display={optionsVisibility.select ? 'block' : 'none'}>
            {productOptions?.selectOptions.map((option) => {
              return (
                <ProductOptionSelect
                  key={option?.attributeDetail?.name}
                  optionValues={option?.values as ProductOptionValue[]}
                  value={productGetters.getOptionSelectedValue(option as ProductOption)}
                  label={productGetters.getOptionName(option as ProductOption)}
                  onChange={() => null}
                />
              )
            })}
          </Box>

          <Box paddingY={1} display={optionsVisibility.checkbox ? 'block' : 'none'}>
            {productOptions?.yesNoOptions.map((option: ProductOption | null) => {
              const attributeDetail = option?.attributeDetail as AttributeDetail
              return (
                <ProductOptionCheckbox
                  key={attributeDetail.name}
                  label={attributeDetail.name as string}
                  checked={
                    productGetters.getOptionSelectedValue(option as ProductOption) ? true : false
                  }
                  onChange={() => null}
                />
              )
            })}
          </Box>

          <Box paddingY={1} display={optionsVisibility.textbox ? 'block' : 'none'}>
            {productOptions?.textBoxOptions.map((option) => {
              return (
                <ProductOptionTextBox
                  key={option?.attributeDetail?.name}
                  option={option as ProductOption}
                  onChange={() => null}
                />
              )
            })}
          </Box>

          <Box paddingY={1}>
            <QuantitySelector label="Qty" />
          </Box>

          <Box paddingY={1}>
            <FulfillmentOptions />
          </Box>

          <Box paddingY={1} display="flex" flexDirection={'column'} gap={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              {...(!isValidForAddToCart && { disabled: true })}
            >
              {t('common:add-to-cart')}
            </Button>
            <Box display="flex" gap={3}>
              <Button variant="contained" color="secondary" fullWidth>
                {t('common:add-to-wishlist')}
              </Button>
              <Button variant="contained" color="inherit" fullWidth>
                {t('common:one-click-checkout')}
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} paddingY={3}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          {properties?.length && (
            <Box paddingY={3}>
              <ProductInformation productFullDescription={description} options={properties} />
            </Box>
          )}
        </Grid>

        {/* This section is hardcoded for now */}
        <ProductRecommendations title={t('product-recommendations')} />
        <ProductRecommendations title={t('customers-also-bought')} />
      </Grid>
    </>
  )
}

export default ProductDetailTemplate
