import { useStorage } from "@vueuse/core";

export interface CartLine {
	variantId: number;
	quantity: number;
}

// The visitor's cart, kept in this browser. It only holds which sizes and how
// many: names, prices and stock always come fresh from the server.
export const useCart = () => {
	const lines = useStorage<CartLine[]>("vfc-cart", []);

	const count = computed(() =>
		lines.value.reduce((total, line) => total + line.quantity, 0),
	);

	const quantityOf = (variantId: number) =>
		lines.value.find((line) => line.variantId === variantId)?.quantity ?? 0;

	const setQuantity = (variantId: number, quantity: number) => {
		const capped = Math.min(Math.max(Math.floor(quantity), 0), MAX_QUANTITY);
		if (!capped) {
			lines.value = lines.value.filter((line) => line.variantId !== variantId);
			return;
		}
		const line = lines.value.find((item) => item.variantId === variantId);
		if (line) line.quantity = capped;
		else lines.value = [...lines.value, { variantId, quantity: capped }];
	};

	// keeps the cart's order: a size already in the cart just gets more
	const add = (variantId: number, quantity = 1) => {
		const line = lines.value.find((item) => item.variantId === variantId);
		if (line) line.quantity = Math.min(line.quantity + quantity, MAX_QUANTITY);
		else lines.value = [...lines.value, { variantId, quantity: Math.min(quantity, MAX_QUANTITY) }];
	};

	const remove = (variantId: number) => setQuantity(variantId, 0);
	const clear = () => {
		lines.value = [];
	};

	return { lines, count, quantityOf, add, setQuantity, remove, clear };
};

// The order a customer just placed (or looked up), so its page can show it
// without putting their email in the address bar
export const useLastOrder = () =>
	useStorage<{ reference: string; email: string } | null>("vfc-last-order", null, undefined, {
		serializer: {
			read: (value) => (value ? JSON.parse(value) : null),
			write: (value) => JSON.stringify(value),
		},
	});
