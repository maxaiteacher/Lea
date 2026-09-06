-- Supabase SQL 편집기에 이 파일 전체를 붙여 넣고 한 번 실행하세요.
-- 여러 번 실행해도 같은 결과가 되도록 작성했습니다.

-- ─────────────────────────────────────────────────────────────
-- 1. notes 테이블
-- ─────────────────────────────────────────────────────────────
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists notes_user_id_created_at_idx
  on public.notes (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- 2. 행 수준 보안(RLS)
--    RLS를 켜지 않으면 anon 키만으로 모든 사용자의 데이터를 읽을 수 있습니다.
--    새 테이블을 추가할 때마다 반드시 함께 설정해야 합니다.
-- ─────────────────────────────────────────────────────────────
alter table public.notes enable row level security;

drop policy if exists notes_select_own on public.notes;
create policy notes_select_own on public.notes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists notes_insert_own on public.notes;
create policy notes_insert_own on public.notes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists notes_update_own on public.notes;
create policy notes_update_own on public.notes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists notes_delete_own on public.notes;
create policy notes_delete_own on public.notes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- 3. 스토리지 버킷
--    public 을 false 로 두어, 서명된 URL로만 파일을 내려받게 합니다.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- 파일 경로의 첫 번째 폴더 이름을 사용자 ID로 쓰기로 약속하고,
-- 그 폴더 안에서만 읽고 쓸 수 있도록 제한합니다.
drop policy if exists uploads_select_own on storage.objects;
create policy uploads_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'uploads'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists uploads_insert_own on storage.objects;
create policy uploads_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists uploads_update_own on storage.objects;
create policy uploads_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'uploads'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

drop policy if exists uploads_delete_own on storage.objects;
create policy uploads_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'uploads'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
