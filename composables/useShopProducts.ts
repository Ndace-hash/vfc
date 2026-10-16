import type { PublicProduct } from "~/types/Shop";

// Every published product, shared by the shop, cart and checkout so the
// catalogue is fetched once per visit
export const useShopProducts = () => {
	const result = useFetch<PublicProduct[]>("/api/shop/products", {
		key: "shop-products",
		default: () => [],
	});

	// a size in the cart -> its product and size, if still for sale
	const findVariant = (variantId: number) => {
		for (const product of result.data.value) {
			const variant = product.variants.find((item) => item.id === variantId);
			if (variant) return { product, variant };
		}
		return null;
	};

	return { ...result, findVariant };
};
