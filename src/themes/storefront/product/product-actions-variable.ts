/**
 * Variable product actions sub-module.
 * Handles add-to-cart with variation selectors for variable products.
 * Styled to match WooCommerce Storefront theme.
 */

import { escapeHtml, sanitizeUrl } from '@/core/utils/html';

export interface VariableActionsAttribute {
  name: string;
  slug: string;
  options: string[];
  variation: boolean;
}

export interface VariableActionsVariation {
  id: number;
  price_formatted: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  attributes: Record<string, string>;
}

export interface VariableActionsData {
  /** Product ID */
  productId: number;
  /** Home URL for form action */
  homeUrl: string;
  /** Product attributes (only variation=true will be rendered) */
  attributes: VariableActionsAttribute[];
  /** Product variations with their attribute combinations */
  variations: VariableActionsVariation[];
  /** Whether product can be purchased */
  purchasable: boolean;
  /** Stock status */
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
}

/**
 * Format a slug for display (e.g., "light-blue" -> "Light Blue")
 */
function formatSlugForDisplay(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Build a map of attribute slugs to their valid option slugs from variations.
 * This ensures we use the exact slugs WooCommerce expects.
 *
 * WooCommerce variation attributes come as: { "attribute_pa_color": "red" }
 * Product attributes have slug like: "pa_color"
 */
function buildAttributeOptionsFromVariations(
  attributes: VariableActionsAttribute[],
  variations: VariableActionsVariation[],
): Map<string, Set<string>> {
  const optionsMap = new Map<string, Set<string>>();

  // Initialize with empty sets for each variation attribute
  for (const attr of attributes) {
    if (attr.variation) {
      optionsMap.set(attr.slug, new Set());
    }
  }

  // Collect all unique values from variations
  for (const variation of variations) {
    for (const [attrKey, value] of Object.entries(variation.attributes)) {
      if (value) {
        // WooCommerce sends keys like "attribute_pa_color" or "attribute_color"
        // Strip the "attribute_" prefix to get "pa_color" or "color"
        const normalizedKey = attrKey.startsWith('attribute_') ? attrKey.slice(10) : attrKey;

        // Find matching attribute by comparing slugs
        for (const attr of attributes) {
          if (attr.slug === normalizedKey || attr.slug === attrKey) {
            const existing = optionsMap.get(attr.slug);
            if (existing) {
              existing.add(value);
            }
            break;
          }
        }
      }
    }
  }

  return optionsMap;
}

/**
 * Generate the variation selectors HTML.
 * Uses slugs from variations for option values to match WooCommerce expectations.
 */
function generateVariationSelectors(
  attributes: VariableActionsAttribute[],
  variations: VariableActionsVariation[],
): string {
  const variationAttributes = attributes.filter((attr) => attr.variation);

  if (variationAttributes.length === 0) {
    return '';
  }

  // Build options map from variations (these are the actual slugs WooCommerce expects)
  const optionsFromVariations = buildAttributeOptionsFromVariations(attributes, variations);

  return variationAttributes
    .map((attr) => {
      // Get slugs from variations, fall back to original options if none found
      const slugOptions = optionsFromVariations.get(attr.slug);
      const options =
        slugOptions && slugOptions.size > 0 ? Array.from(slugOptions) : attr.options;

      const optionsHtml = options
        .map((option) => {
          // Use slug as value, formatted version for display
          const displayName = formatSlugForDisplay(option);
          return `<option value="${escapeHtml(option)}">${escapeHtml(displayName)}</option>`;
        })
        .join('');

      // Use attribute_{slug} naming to match WooCommerce format
      const fieldName = `attribute_${escapeHtml(attr.slug)}`;

      return `<div class="mb-4">
  <label class="block text-sm text-[#43454b] mb-2">${escapeHtml(attr.name)}</label>
  <select name="${fieldName}" class="flexi-variation-select border border-gray-300 px-3 py-2 text-sm min-w-[160px]" data-attribute="${escapeHtml(attr.slug)}">
    <option value="">Choose an option</option>
    ${optionsHtml}
  </select>
</div>`;
    })
    .join('\n');
}

/**
 * Generate the add-to-cart section for variable products.
 * Includes form, variation selectors, and JavaScript for variation handling.
 */
export function generateVariableAddToCart(data: VariableActionsData): string {
  const selectorsHtml = generateVariationSelectors(data.attributes, data.variations);
  const formAction = sanitizeUrl(data.homeUrl);

  // Determine initial button state (disabled until variation selected)
  const buttonClass =
    'flexi-add-to-cart-btn bg-gray-400 text-white px-6 py-2 text-sm cursor-not-allowed';

  // Prepare variations data for JavaScript (only include needed fields)
  const variationsJson = JSON.stringify(
    data.variations.map((v) => ({
      id: v.id,
      price_formatted: v.price_formatted,
      stock_status: v.stock_status,
      attributes: v.attributes,
    })),
  );

  return `<form id="flexi-variable-form" class="flexi-variations-form" action="${formAction}" method="post">
  <input type="hidden" name="add-to-cart" value="${data.productId}">
  <input type="hidden" name="product_id" value="${data.productId}">
  <input type="hidden" name="variation_id" id="flexi-variation-id" value="">
  ${selectorsHtml}
  <div id="flexi-variation-price" class="mb-4 text-lg font-semibold text-[#43454b]"></div>
  <div id="flexi-variation-stock" class="mb-4 text-sm"></div>
  <div class="flex items-center gap-2 mb-6">
    <div class="flex items-stretch rounded-md border overflow-hidden" role="group" aria-label="Quantity">
      <button type="button" class="px-3 py-1.5 text-base leading-none" data-qty-action="decrease" aria-label="Decrease quantity">&minus;</button>
      <input type="number" name="quantity" value="1" min="1" inputmode="numeric" class="w-12 px-0 text-center border-x focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
      <button type="button" class="px-3 py-1.5 text-base leading-none" data-qty-action="increase" aria-label="Increase quantity">+</button>
    </div>
    <button type="submit" class="${buttonClass}" disabled>Add to cart</button>
  </div>
</form>
<script>
(function() {
  var variations = ${variationsJson};
  var form = document.getElementById('flexi-variable-form');
  var selects = form.querySelectorAll('.flexi-variation-select');
  var variationIdInput = document.getElementById('flexi-variation-id');
  var priceDisplay = document.getElementById('flexi-variation-price');
  var stockDisplay = document.getElementById('flexi-variation-stock');
  var addToCartBtn = form.querySelector('.flexi-add-to-cart-btn');

  function getSelectedAttributes() {
    var selected = {};
    selects.forEach(function(select) {
      var attr = select.getAttribute('data-attribute');
      if (select.value) {
        selected[attr] = select.value;
      }
    });
    return selected;
  }

  function findMatchingVariation(selectedAttrs) {
    var selectedKeys = Object.keys(selectedAttrs);
    if (selectedKeys.length === 0) return null;

    for (var i = 0; i < variations.length; i++) {
      var variation = variations[i];
      var attrs = variation.attributes;
      var match = true;

      // Check if all selected attributes match this variation
      for (var j = 0; j < selectedKeys.length; j++) {
        var key = selectedKeys[j];
        // WooCommerce variation attributes use "attribute_" prefix
        // key is like "pa_color", so we need "attribute_pa_color"
        var varValue = attrs['attribute_' + key] || attrs[key] || '';

        // Empty string in variation means "any value" is accepted
        if (varValue !== '' && varValue.toLowerCase() !== selectedAttrs[key].toLowerCase()) {
          match = false;
          break;
        }
      }

      // Also check we have all required attributes selected
      var variationAttrKeys = Object.keys(attrs).filter(function(k) { return attrs[k] !== ''; });
      if (match && variationAttrKeys.length <= selectedKeys.length) {
        return variation;
      }
    }
    return null;
  }

  function updateVariation() {
    var selectedAttrs = getSelectedAttributes();
    var variation = findMatchingVariation(selectedAttrs);

    if (variation) {
      variationIdInput.value = variation.id;
      priceDisplay.textContent = variation.price_formatted;

      if (variation.stock_status === 'instock') {
        stockDisplay.innerHTML = '<span class="text-green-600">In stock</span>';
        addToCartBtn.disabled = false;
        addToCartBtn.className = 'flexi-add-to-cart-btn bg-[#3c3c3c] hover:bg-gray-800 text-white px-6 py-2 text-sm cursor-pointer';
      } else if (variation.stock_status === 'onbackorder') {
        stockDisplay.innerHTML = '<span class="text-yellow-600">Available on backorder</span>';
        addToCartBtn.disabled = false;
        addToCartBtn.className = 'flexi-add-to-cart-btn bg-[#3c3c3c] hover:bg-gray-800 text-white px-6 py-2 text-sm cursor-pointer';
      } else {
        stockDisplay.innerHTML = '<span class="text-red-600">Out of stock</span>';
        addToCartBtn.disabled = true;
        addToCartBtn.className = 'flexi-add-to-cart-btn bg-gray-400 text-white px-6 py-2 text-sm cursor-not-allowed';
      }
    } else {
      variationIdInput.value = '';
      priceDisplay.textContent = '';
      stockDisplay.textContent = '';
      addToCartBtn.disabled = true;
      addToCartBtn.className = 'flexi-add-to-cart-btn bg-gray-400 text-white px-6 py-2 text-sm cursor-not-allowed';
    }
  }

  selects.forEach(function(select) {
    select.addEventListener('change', updateVariation);
  });

  // Prevent form submission if no variation selected
  form.addEventListener('submit', function(e) {
    if (!variationIdInput.value) {
      e.preventDefault();
      alert('Please select product options before adding to cart.');
    }
  });
})();
</script>`;
}
