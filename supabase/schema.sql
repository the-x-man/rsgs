-- ============================================================
-- RSGS Flow — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  name        text,
  avatar_url  text,
  role        text default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Auto-create user profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- WORKSTREAMS
-- ============================================================
create table public.workstreams (
  id                    uuid default gen_random_uuid() primary key,
  title                 text not null,
  description           text,
  start_date            date,
  end_date              date,
  reinvention_partner   text,
  status                text default 'active'
                          check (status in ('active', 'completed', 'archived', 'on_hold')),
  created_by            uuid references public.users(id) on delete set null,
  created_at            timestamptz default now() not null,
  updated_at            timestamptz default now() not null
);

create index workstreams_status_idx on public.workstreams(status);
create index workstreams_created_by_idx on public.workstreams(created_by);

-- ============================================================
-- ACTIVITIES
-- ============================================================
create table public.activities (
  id              uuid default gen_random_uuid() primary key,
  workstream_id   uuid references public.workstreams(id) on delete cascade not null,
  title           text not null,
  description     text,
  due_date        date,
  status          text default 'active'
                    check (status in ('active', 'completed', 'cancelled')),
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

create index activities_workstream_id_idx on public.activities(workstream_id);
create index activities_status_idx on public.activities(status);
create index activities_due_date_idx on public.activities(due_date);

-- ============================================================
-- TASKS
-- ============================================================
create table public.tasks (
  id            uuid default gen_random_uuid() primary key,
  activity_id   uuid references public.activities(id) on delete cascade not null,
  title         text not null,
  description   text,
  due_date      date,
  status        text default 'todo'
                  check (status in ('todo', 'in_progress', 'blocked', 'completed')),
  priority      text default 'medium'
                  check (priority in ('low', 'medium', 'high', 'critical')),
  position      integer default 0,
  created_by    uuid references public.users(id) on delete set null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index tasks_activity_id_idx on public.tasks(activity_id);
create index tasks_status_idx on public.tasks(status);
create index tasks_priority_idx on public.tasks(priority);
create index tasks_due_date_idx on public.tasks(due_date);

-- ============================================================
-- TASK OWNERS (many-to-many)
-- ============================================================
create table public.task_owners (
  task_id      uuid references public.tasks(id) on delete cascade not null,
  user_id      uuid references public.users(id) on delete cascade not null,
  assigned_at  timestamptz default now() not null,
  primary key (task_id, user_id)
);

create index task_owners_task_id_idx on public.task_owners(task_id);
create index task_owners_user_id_idx on public.task_owners(user_id);

-- ============================================================
-- TASK NOTES / RUNNING LOG
-- ============================================================
create table public.task_notes (
  id          uuid default gen_random_uuid() primary key,
  task_id     uuid references public.tasks(id) on delete cascade not null,
  content     text not null,
  author_id   uuid references public.users(id) on delete set null,
  edited_at   timestamptz,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index task_notes_task_id_idx on public.task_notes(task_id);
create index task_notes_author_id_idx on public.task_notes(author_id);

-- ============================================================
-- STATUS REPORTS
-- ============================================================
create table public.status_reports (
  id               uuid default gen_random_uuid() primary key,
  title            text not null,
  workstream_ids   uuid[] default '{}',
  content          jsonb,
  generated_by     uuid references public.users(id) on delete set null,
  created_at       timestamptz default now() not null
);

create index status_reports_generated_by_idx on public.status_reports(generated_by);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_workstreams_updated_at
  before update on public.workstreams
  for each row execute procedure public.set_updated_at();

create trigger set_activities_updated_at
  before update on public.activities
  for each row execute procedure public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.set_updated_at();

create trigger set_task_notes_updated_at
  before update on public.task_notes
  for each row execute procedure public.set_updated_at();

create trigger set_users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.users enable row level security;
alter table public.workstreams enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.task_owners enable row level security;
alter table public.task_notes enable row level security;
alter table public.status_reports enable row level security;

-- Users: everyone authenticated can read, own profile only for write
create policy "Users can view all profiles" on public.users
  for select using (auth.role() = 'authenticated');

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Workstreams: full access for authenticated users
create policy "Authenticated users can view workstreams" on public.workstreams
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create workstreams" on public.workstreams
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update workstreams" on public.workstreams
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete workstreams" on public.workstreams
  for delete using (auth.role() = 'authenticated');

-- Activities
create policy "Authenticated users can view activities" on public.activities
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create activities" on public.activities
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update activities" on public.activities
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete activities" on public.activities
  for delete using (auth.role() = 'authenticated');

-- Tasks
create policy "Authenticated users can view tasks" on public.tasks
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create tasks" on public.tasks
  for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update tasks" on public.tasks
  for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete tasks" on public.tasks
  for delete using (auth.role() = 'authenticated');

-- Task owners
create policy "Authenticated users can view task owners" on public.task_owners
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can manage task owners" on public.task_owners
  for all using (auth.role() = 'authenticated');

-- Task notes
create policy "Authenticated users can view notes" on public.task_notes
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create notes" on public.task_notes
  for insert with check (auth.role() = 'authenticated');

create policy "Authors can update own notes" on public.task_notes
  for update using (auth.uid() = author_id);

create policy "Authors can delete own notes" on public.task_notes
  for delete using (auth.uid() = author_id);

-- Status reports
create policy "Authenticated users can view reports" on public.status_reports
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can create reports" on public.status_reports
  for insert with check (auth.role() = 'authenticated');

create policy "Authors can delete own reports" on public.status_reports
  for delete using (auth.uid() = generated_by);

-- ============================================================
-- SEED DATA (optional — comment out if not needed)
-- ============================================================

-- Insert a sample workstream (replace 'YOUR_USER_ID' with an actual auth user id)
/*
insert into public.workstreams (title, description, status, reinvention_partner)
values
  ('Digital Transformation 2025', 'End-to-end digital transformation initiative', 'active', 'Accenture'),
  ('Customer Experience Platform', 'Unified CX platform rollout', 'active', null),
  ('Data & Analytics Modernisation', 'Data lake and analytics modernisation', 'on_hold', 'McKinsey');

-- For each workstream, add activities and tasks as needed through the UI
*/
