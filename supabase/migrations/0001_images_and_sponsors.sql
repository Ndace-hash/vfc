-- Phase 1: image storage, sponsors and sponsor enquiries.
-- Run once in the Supabase SQL editor. See docs/plans/public-site.md.
--
-- The app reaches these tables only through Nitro server routes that use the
-- secret key (which bypasses row level security). The policies below are a
-- second line of defence for the publishable key, which ships to browsers.

begin;

-- ---------------------------------------------------------------------------
-- Image storage
-- ---------------------------------------------------------------------------

-- One public bucket for every image the admin uploads, split by folder:
-- players/, news/, sponsors/, products/. Uploads go through a server route,
-- so no storage policies are granted to browsers; public read comes from the
-- bucket being public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
	'images',
	'images',
	true,
	5242880, -- 5 MB
	array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sponsors
-- ---------------------------------------------------------------------------

create table public.sponsors (
	id bigint generated always as identity primary key,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	name text not null check (length(trim(name)) > 0),
	logo_url text,
	website_url text check (website_url is null or website_url ~* '^https?://'),
	-- 'main' is shown large at the top of the section, 'partner' in the logo row
	tier text not null default 'partner' check (tier in ('main', 'partner')),
	display_order integer not null default 0,
	-- hidden from the public site without deleting
	is_active boolean not null default true
);

-- at most one main sponsor on the site at a time
create unique index sponsors_one_active_main_idx
	on public.sponsors (tier)
	where tier = 'main' and is_active;

alter table public.sponsors enable row level security;

create policy sponsors_public_read on public.sponsors
	for select
	to anon, authenticated
	using (is_active);

-- ---------------------------------------------------------------------------
-- Sponsor enquiries (the "Become a sponsor" form)
-- ---------------------------------------------------------------------------

create table public.sponsor_enquiries (
	id bigint generated always as identity primary key,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	name text not null check (length(trim(name)) between 1 and 200),
	company text check (company is null or length(company) <= 200),
	email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 320),
	phone text check (phone is null or length(phone) <= 40),
	message text not null check (length(trim(message)) between 1 and 5000),
	status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
	-- staff-only notes, e.g. "called on Monday, sending the sponsorship pack"
	notes text not null default ''
);

-- the admin list: newest first within a status, and the "new" count badge
create index sponsor_enquiries_status_created_idx
	on public.sponsor_enquiries (status, created_at desc);

-- contact details: no browser access at all, only the server
alter table public.sponsor_enquiries enable row level security;
revoke all on public.sponsor_enquiries from anon, authenticated;

commit;
