-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  phone text,
  email text,

  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for emergency contacts
create table contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  phone text not null,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for contacts
alter table contacts enable row level security;

create policy "Users can view their own contacts."
  on contacts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own contacts."
  on contacts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own contacts."
  on contacts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own contacts."
  on contacts for delete
  using ( auth.uid() = user_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
