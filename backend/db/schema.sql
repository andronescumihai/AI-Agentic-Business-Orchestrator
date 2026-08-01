-- Rulează acest script în Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- Rolurile posibile: 'owner', 'doctor', 'client'
create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    role text not null check (role in ('owner', 'doctor', 'client')),
    email text unique,
    created_at timestamptz default now()
);

create table if not exists appointments (
    id uuid primary key default gen_random_uuid(),
    client_id uuid references users(id),
    doctor_id uuid references users(id),
    scheduled_at timestamptz not null,
    status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'done')),
    notes text,
    created_at timestamptz default now()
);

-- Notițe live între client și doctor pe o programare (ex: "ajung cu 10 min mai târziu")
create table if not exists appointment_notes (
    id uuid primary key default gen_random_uuid(),
    appointment_id uuid references appointments(id) on delete cascade,
    author_id uuid references users(id),
    content text not null,
    created_at timestamptz default now()
);

-- Cereri primite (email/telefon simulat) — istoricul agentului de comunicare
create table if not exists inbound_requests (
    id uuid primary key default gen_random_uuid(),
    channel text check (channel in ('email', 'phone_sim')),
    from_contact text,
    message text not null,
    ai_confidence numeric,
    escalated boolean default false,
    owner_response text,
    resolved boolean default false,
    created_at timestamptz default now()
);

-- Date financiare mock (owner-only)
create table if not exists finance_entries (
    id uuid primary key default gen_random_uuid(),
    entry_type text check (entry_type in ('expense', 'revenue')),
    amount numeric not null,
    category text,
    entry_date date default current_date,
    created_at timestamptz default now()
);

-- === Row Level Security: cele 3 niveluri ===
alter table appointments enable row level security;
alter table appointment_notes enable row level security;
alter table finance_entries enable row level security;

-- Owner vede tot (presupune un claim custom 'role' în JWT-ul Supabase Auth)
create policy owner_full_access on appointments
    for all using (auth.jwt() ->> 'role' = 'owner');

-- Doctorul vede/editează doar programările lui
create policy doctor_own_appointments on appointments
    for select using (auth.jwt() ->> 'role' = 'doctor' and doctor_id = auth.uid());

-- Clientul vede doar programările lui
create policy client_own_appointments on appointments
    for select using (auth.jwt() ->> 'role' = 'client' and client_id = auth.uid());

-- Finanțele sunt strict owner-only
create policy finance_owner_only on finance_entries
    for all using (auth.jwt() ->> 'role' = 'owner');
