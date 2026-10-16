import type { Fulfilment, OrderStatus } from "#shared/utils/shop";

// A row of the Supabase `product_variants` table
export interface ProductVariant {
	id: number;
	product_id: number;
	label: string;
	stock: number;
	display_order: number;
	is_active: boolean;
}

// A row of the Supabase `products` table
export interface Product {
	id: number;
	created_at: string;
	updated_at: string;
	slug: string;
	name: string;
	description: string;
	price_kobo: number;
	option_name: string;
	image_urls: string[];
	is_active: boolean;
	is_featured: boolean;
	display_order: number;
}

// A product with all its sizes, as the admin gets it
export interface AdminProduct extends Product {
	variants: ProductVariant[];
}

// A product as the public site gets it: published, with its available sizes
export interface PublicProduct {
	id: number;
	slug: string;
	name: string;
	description: string;
	price_kobo: number;
	option_name: string;
	image_urls: string[];
	is_featured: boolean;
	variants: { id: number; label: string; stock: number }[];
}

// The single row of the Supabase `shop_settings` table
export interface ShopSettings {
	pickup_address: string;
	delivery_fee_kobo: number;
	outside_lagos_message: string;
	updated_at: string;
}

// A row of the Supabase `order_items` table
export interface OrderItem {
	id: number;
	order_id: number;
	variant_id: number;
	product_name: string;
	variant_label: string;
	unit_price_kobo: number;
	quantity: number;
}

// A row of the Supabase `orders` table, with its items
export interface Order {
	id: number;
	created_at: string;
	updated_at: string;
	reference: string;
	status: OrderStatus;
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	fulfilment: Fulfilment;
	delivery_address: string | null;
	subtotal_kobo: number;
	delivery_fee_kobo: number;
	total_kobo: number;
	paid_at: string | null;
	paystack_transaction_id: number | null;
	attention_reason: string | null;
	items: OrderItem[];
}

// What a customer sees when they look up their own order
export interface PublicOrder {
	reference: string;
	status: OrderStatus;
	created_at: string;
	customer_name: string;
	fulfilment: Fulfilment;
	delivery_address: string | null;
	// where to collect a pickup order
	pickup_address: string | null;
	subtotal_kobo: number;
	delivery_fee_kobo: number;
	total_kobo: number;
	items: Pick<
		OrderItem,
		"product_name" | "variant_label" | "unit_price_kobo" | "quantity"
	>[];
}
