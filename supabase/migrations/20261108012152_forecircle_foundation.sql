-- Phase 0 foundation. Apply to a new, dedicated ForeCircle project only.
-- Live community UI remains disabled until hosted RLS and end-to-end checks pass.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check(username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null check(char_length(display_name) between 2 and 60),
 bio text not null default '' check(char_length(bio)<=1000),
 avatar_url text, general_region text not null check(char_length(general_region) between 2 and 100),
 handicap numeric(3,1) check(handicap between -10 and 54),
 golf_style text not null default 'Casual' check(golf_style in ('Casual','Competitive','Social','Beginner friendly')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table private.account_controls(profile_id uuid primary key references public.profiles on delete cascade,suspended_at timestamptz,reason text,created_at timestamptz not null default now());
create table private.admin_audit_log(id uuid primary key default gen_random_uuid(),actor_id uuid references public.profiles,action text not null,target_id uuid,created_at timestamptz not null default now());
create table public.profile_preferences(profile_id uuid primary key references public.profiles on delete cascade,round_length smallint check(round_length in (9,18)),walking_riding text not null default 'either' check(walking_riding in ('walk','ride','either')),message_permission text not null default 'connections' check(message_permission in ('connections','circle_members','nobody')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.organizer_profiles(profile_id uuid primary key references public.profiles on delete cascade,bio text not null default '' check(char_length(bio)<=1000),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.follows(follower_id uuid references public.profiles on delete cascade,followed_id uuid references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(follower_id,followed_id),check(follower_id<>followed_id));
create table public.golf_connections(profile_id uuid references public.profiles on delete cascade,golfer_id uuid references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(profile_id,golfer_id),check(profile_id<>golfer_id));
create table public.golf_courses(id uuid primary key default gen_random_uuid(),name text not null,city text not null,state text not null,country text not null default 'US',address text,postal_code text,latitude numeric(9,6) check(latitude between -90 and 90),longitude numeric(9,6) check(longitude between -180 and 180),website text,phone text,public_private text check(public_private in ('public','private','semi_private')),active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.circles(id uuid primary key default gen_random_uuid(),slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),name text not null check(char_length(name) between 3 and 80),description text not null default '' check(char_length(description)<=2000),general_region text not null,founder_id uuid not null references public.profiles,visibility text not null default 'public' check(visibility in ('public','request','private')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.circle_members(circle_id uuid references public.circles on delete cascade,profile_id uuid references public.profiles on delete cascade,role text not null default 'member' check(role in ('founder','admin','organizer','member')),created_at timestamptz not null default now(),primary key(circle_id,profile_id));
create table public.rounds(id uuid primary key default gen_random_uuid(),title text not null check(char_length(title) between 3 and 100),host_id uuid not null references public.profiles,course_id uuid not null references public.golf_courses,circle_id uuid references public.circles,start_at timestamptz not null,timezone text not null default 'America/Los_Angeles',holes smallint not null check(holes in (9,18)),capacity smallint not null check(capacity between 2 and 4),status text not null default 'draft' check(status in ('draft','open','full','scheduled','in_progress','completed','cancelled')),visibility text not null default 'public' check(visibility in ('public','circle')),style text not null default 'Casual',notes text not null default '' check(char_length(notes)<=1000),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),check(visibility<>'circle' or circle_id is not null));
create table public.round_participants(round_id uuid references public.rounds on delete cascade,profile_id uuid references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(round_id,profile_id));
create table public.round_waitlist(id uuid primary key default gen_random_uuid(),round_id uuid not null references public.rounds on delete cascade,profile_id uuid not null references public.profiles on delete cascade,created_at timestamptz not null default now(),unique(round_id,profile_id));
create table public.conversations(id uuid primary key default gen_random_uuid(),round_id uuid unique references public.rounds on delete cascade,circle_id uuid unique references public.circles on delete cascade,created_at timestamptz not null default now(),check(num_nonnulls(round_id,circle_id)=1));
create table public.conversation_members(conversation_id uuid references public.conversations on delete cascade,profile_id uuid references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(conversation_id,profile_id));
create table public.messages(id uuid primary key default gen_random_uuid(),conversation_id uuid not null references public.conversations on delete cascade,sender_id uuid not null references public.profiles,body text not null check(char_length(btrim(body)) between 1 and 2000),created_at timestamptz not null default now());
create table public.notifications(id uuid primary key default gen_random_uuid(),recipient_id uuid not null references public.profiles on delete cascade,type text not null,title text not null,body text not null default '',read_at timestamptz,created_at timestamptz not null default now());
create table public.feature_requests(id uuid primary key default gen_random_uuid(),created_by uuid not null references public.profiles,title text not null check(char_length(title) between 5 and 120),description text not null check(char_length(description) between 15 and 4000),category text not null,status text not null default 'submitted' check(status in ('submitted','under_review','planned','building','beta','released','declined')),admin_response text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.feature_request_votes(request_id uuid references public.feature_requests on delete cascade,profile_id uuid references public.profiles on delete cascade,created_at timestamptz not null default now(),primary key(request_id,profile_id));
create table public.feature_request_comments(id uuid primary key default gen_random_uuid(),request_id uuid not null references public.feature_requests on delete cascade,profile_id uuid not null references public.profiles,body text not null check(char_length(btrim(body)) between 1 and 2000),created_at timestamptz not null default now());
create index follows_followed_idx on public.follows(followed_id);
create index connections_golfer_idx on public.golf_connections(golfer_id);
create index circle_members_profile_idx on public.circle_members(profile_id);
create index circles_founder_idx on public.circles(founder_id);
create index courses_location_idx on public.golf_courses(state,city);
create index rounds_discovery_idx on public.rounds(status,start_at);
create index rounds_host_idx on public.rounds(host_id);
create index rounds_course_idx on public.rounds(course_id);
create index rounds_circle_idx on public.rounds(circle_id);
create index round_participants_profile_idx on public.round_participants(profile_id);
create index round_waitlist_order_idx on public.round_waitlist(round_id,created_at,id);
create index round_waitlist_profile_idx on public.round_waitlist(profile_id);
create index conversation_members_profile_idx on public.conversation_members(profile_id);
create index messages_history_idx on public.messages(conversation_id,created_at desc,id);
create index messages_sender_idx on public.messages(sender_id);
create index notifications_recipient_idx on public.notifications(recipient_id,created_at desc);
create index feature_requests_author_idx on public.feature_requests(created_by);
create index feature_votes_profile_idx on public.feature_request_votes(profile_id);
create index feature_comments_request_idx on public.feature_request_comments(request_id,created_at);
create index feature_comments_profile_idx on public.feature_request_comments(profile_id);
create index profiles_search_idx on public.profiles using gin(to_tsvector('simple',display_name||' '||username));
-- Internal lookups avoid recursive RLS. They never accept a caller-provided actor ID.
create function private.is_active() returns boolean language sql stable security definer set search_path='' as $$select auth.uid() is not null and not exists(select 1 from private.account_controls where profile_id=auth.uid() and suspended_at is not null)$$;
create function private.is_organizer() returns boolean language sql stable security definer set search_path='' as $$select private.is_active() and exists(select 1 from public.organizer_profiles where profile_id=auth.uid())$$;
create function private.is_circle_member(target uuid) returns boolean language sql stable security definer set search_path='' as $$select private.is_active() and exists(select 1 from public.circle_members where circle_id=target and profile_id=auth.uid())$$;
create function private.is_circle_admin(target uuid) returns boolean language sql stable security definer set search_path='' as $$select private.is_active() and (exists(select 1 from public.circles where id=target and founder_id=auth.uid()) or exists(select 1 from public.circle_members where circle_id=target and profile_id=auth.uid() and role in ('founder','admin')))$$;
create function private.is_round_member(target uuid) returns boolean language sql stable security definer set search_path='' as $$select private.is_active() and exists(select 1 from public.round_participants where round_id=target and profile_id=auth.uid())$$;
create function private.is_round_host(target uuid) returns boolean language sql stable security definer set search_path='' as $$select private.is_active() and exists(select 1 from public.rounds where id=target and host_id=auth.uid())$$;
create function private.is_conversation_member(target uuid) returns boolean language sql stable security definer set search_path='' as $$select private.is_active() and exists(select 1 from public.conversation_members where conversation_id=target and profile_id=auth.uid())$$;
-- Enable RLS on every created table, including internal moderation records.
do $$declare t record;begin for t in select schemaname,tablename from pg_tables where schemaname in ('public','private') loop execute format('alter table %I.%I enable row level security',t.schemaname,t.tablename);end loop;end$$;
revoke all on all tables in schema private from public,anon,authenticated;
grant usage on schema public to anon,authenticated;
grant select on public.profiles,public.organizer_profiles,public.golf_courses,public.circles,public.rounds to anon;
grant select on all tables in schema public to authenticated;
-- Explicit mutation grants prevent privilege-bearing columns from being edited.
grant insert(id,username,display_name,bio,avatar_url,general_region,handicap,golf_style),update(username,display_name,bio,avatar_url,general_region,handicap,golf_style) on public.profiles to authenticated;
grant insert,update,delete on public.profile_preferences,public.follows,public.golf_connections to authenticated;
grant insert(profile_id,bio),update(bio) on public.organizer_profiles to authenticated;
grant insert(id,slug,name,description,general_region,founder_id,visibility),update(name,description,general_region,visibility) on public.circles to authenticated;
grant insert(circle_id,profile_id,role),update(role),delete on public.circle_members to authenticated;
grant insert(id,title,host_id,course_id,circle_id,start_at,timezone,holes,capacity,status,visibility,style,notes),update(title,notes) on public.rounds to authenticated;
grant insert(conversation_id,sender_id,body) on public.messages to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant insert(created_by,title,description,category),update(title,description,category) on public.feature_requests to authenticated;
grant insert,delete on public.feature_request_votes to authenticated;
grant insert(request_id,profile_id,body) on public.feature_request_comments to authenticated;
create policy profiles_read on public.profiles for select using(true);
create policy profiles_create on public.profiles for insert to authenticated with check(id=(select auth.uid()) and (select private.is_active()));
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid()) and (select private.is_active())) with check(id=(select auth.uid()) and (select private.is_active()));
create policy preferences_owner on public.profile_preferences for all to authenticated using(profile_id=(select auth.uid()) and (select private.is_active())) with check(profile_id=(select auth.uid()) and (select private.is_active()));
create policy organizers_read on public.organizer_profiles for select using(true);
create policy organizers_insert on public.organizer_profiles for insert to authenticated with check(profile_id=(select auth.uid()) and (select private.is_active()));
create policy organizers_update on public.organizer_profiles for update to authenticated using(profile_id=(select auth.uid()) and (select private.is_active())) with check(profile_id=(select auth.uid()) and (select private.is_active()));
create policy follows_owner on public.follows for all to authenticated using(follower_id=(select auth.uid()) and (select private.is_active())) with check(follower_id=(select auth.uid()) and (select private.is_active()));
create policy connections_owner on public.golf_connections for all to authenticated using(profile_id=(select auth.uid()) and (select private.is_active())) with check(profile_id=(select auth.uid()) and (select private.is_active()));
create policy courses_read on public.golf_courses for select using(active);
create policy circles_public on public.circles for select using(visibility in ('public','request'));
create policy circles_private on public.circles for select to authenticated using(private.is_circle_member(id) or private.is_circle_admin(id));
create policy circles_create on public.circles for insert to authenticated with check(founder_id=(select auth.uid()) and (select private.is_organizer()));
create policy circles_update on public.circles for update to authenticated using(private.is_circle_admin(id)) with check(private.is_circle_admin(id));
create policy circle_members_read on public.circle_members for select to authenticated using(private.is_circle_member(circle_id) or private.is_circle_admin(circle_id));
create policy circle_members_join on public.circle_members for insert to authenticated with check(profile_id=(select auth.uid()) and role='member' and (select private.is_active()) and exists(select 1 from public.circles where id=circle_id and visibility='public'));
create policy circle_members_update on public.circle_members for update to authenticated using(private.is_circle_admin(circle_id) and role<>'founder') with check(private.is_circle_admin(circle_id) and role<>'founder');
create policy circle_members_leave on public.circle_members for delete to authenticated using(role<>'founder' and (profile_id=(select auth.uid()) or private.is_circle_admin(circle_id)) and (select private.is_active()));
create policy rounds_public on public.rounds for select using(visibility='public' and status<>'draft');
create policy rounds_private on public.rounds for select to authenticated using(host_id=(select auth.uid()) or private.is_round_member(id) or (visibility='circle' and private.is_circle_member(circle_id)));
create policy rounds_create on public.rounds for insert to authenticated with check(host_id=(select auth.uid()) and (select private.is_active()) and status in ('draft','open') and (circle_id is null or private.is_circle_member(circle_id)));
create policy rounds_update on public.rounds for update to authenticated using(host_id=(select auth.uid()) and (select private.is_active())) with check(host_id=(select auth.uid()) and (select private.is_active()));
create policy participants_read on public.round_participants for select to authenticated using(private.is_round_member(round_id) or private.is_round_host(round_id));
create policy waitlist_read on public.round_waitlist for select to authenticated using((profile_id=(select auth.uid()) and (select private.is_active())) or private.is_round_host(round_id));
create policy conversations_read on public.conversations for select to authenticated using(private.is_conversation_member(id));
create policy conversation_members_read on public.conversation_members for select to authenticated using(private.is_conversation_member(conversation_id));
create policy messages_read on public.messages for select to authenticated using(private.is_conversation_member(conversation_id));
create policy messages_send on public.messages for insert to authenticated with check(sender_id=(select auth.uid()) and private.is_conversation_member(conversation_id));
create policy notifications_read on public.notifications for select to authenticated using(recipient_id=(select auth.uid()) and (select private.is_active()));
create policy notifications_update on public.notifications for update to authenticated using(recipient_id=(select auth.uid()) and (select private.is_active())) with check(recipient_id=(select auth.uid()) and (select private.is_active()));
create policy ideas_read on public.feature_requests for select to authenticated using((select private.is_organizer()));
create policy ideas_create on public.feature_requests for insert to authenticated with check(created_by=(select auth.uid()) and (select private.is_organizer()));
create policy ideas_update on public.feature_requests for update to authenticated using(created_by=(select auth.uid()) and (select private.is_organizer())) with check(created_by=(select auth.uid()) and (select private.is_organizer()));
create policy votes_read on public.feature_request_votes for select to authenticated using((select private.is_organizer()));
create policy votes_insert on public.feature_request_votes for insert to authenticated with check(profile_id=(select auth.uid()) and (select private.is_organizer()));
create policy votes_delete on public.feature_request_votes for delete to authenticated using(profile_id=(select auth.uid()) and (select private.is_organizer()));
create policy comments_read on public.feature_request_comments for select to authenticated using((select private.is_organizer()));
create policy comments_insert on public.feature_request_comments for insert to authenticated with check(profile_id=(select auth.uid()) and (select private.is_organizer()));
-- A created round gets its host and a private group conversation atomically.
create function private.initialize_round() returns trigger language plpgsql security definer set search_path='' as $$declare cid uuid;begin
 insert into public.round_participants(round_id,profile_id) values(new.id,new.host_id);
 insert into public.conversations(round_id) values(new.id) returning id into cid;
 insert into public.conversation_members(conversation_id,profile_id) values(cid,new.host_id);
 return new;end$$;
create trigger initialize_round after insert on public.rounds for each row execute function private.initialize_round();
create function private.initialize_circle() returns trigger language plpgsql security definer set search_path='' as $$declare cid uuid;begin
 insert into public.circle_members(circle_id,profile_id,role) values(new.id,new.founder_id,'founder');
 insert into public.conversations(circle_id) values(new.id) returning id into cid;
 insert into public.conversation_members(conversation_id,profile_id) values(cid,new.founder_id);
 return new;end$$;
create trigger initialize_circle after insert on public.circles for each row execute function private.initialize_circle();
create function private.sync_circle_chat() returns trigger language plpgsql security definer set search_path='' as $$begin
 if tg_op='INSERT' then insert into public.conversation_members(conversation_id,profile_id) select id,new.profile_id from public.conversations where circle_id=new.circle_id on conflict do nothing;return new;
 else delete from public.conversation_members where profile_id=old.profile_id and conversation_id in(select id from public.conversations where circle_id=old.circle_id);return old;end if;end$$;
create trigger sync_circle_chat after insert or delete on public.circle_members for each row execute function private.sync_circle_chat();
-- Capacity cannot be changed by direct member inserts. Row locking serializes join decisions.
create function private.join_round(target uuid) returns text language plpgsql security definer set search_path='' as $$declare r public.rounds;uid uuid:=auth.uid();n integer;cid uuid;begin
 if not private.is_active() then raise exception 'Authentication required';end if;
 select * into r from public.rounds where id=target for update;
 if not found or r.status not in ('open','full') or r.start_at<=now() then raise exception 'Round is not available';end if;
 if r.visibility='circle' and not private.is_circle_member(r.circle_id) then raise exception 'Circle membership required';end if;
 if exists(select 1 from public.round_participants where round_id=target and profile_id=uid) then return 'confirmed';end if;
 select count(*) into n from public.round_participants where round_id=target;
 if n>=r.capacity then insert into public.round_waitlist(round_id,profile_id) values(target,uid) on conflict do nothing;return 'waitlisted';end if;
 insert into public.round_participants(round_id,profile_id) values(target,uid);
 delete from public.round_waitlist where round_id=target and profile_id=uid;
 select id into cid from public.conversations where round_id=target;
 insert into public.conversation_members(conversation_id,profile_id) values(cid,uid) on conflict do nothing;
 if n+1>=r.capacity then update public.rounds set status='full' where id=target;end if;
 return 'confirmed';end$$;
create function public.join_round(target uuid) returns text language sql security invoker set search_path='' as $$select private.join_round(target)$$;
create function private.leave_round(target uuid) returns void language plpgsql security definer set search_path='' as $$declare r public.rounds;begin
 if not private.is_active() then raise exception 'Authentication required';end if;
 select * into r from public.rounds where id=target for update;
 if not found or r.host_id=auth.uid() or r.status not in ('open','full') then raise exception 'Cannot leave this round';end if;
 delete from public.round_participants where round_id=target and profile_id=auth.uid();
 delete from public.round_waitlist where round_id=target and profile_id=auth.uid();
 delete from public.conversation_members where profile_id=auth.uid() and conversation_id in(select id from public.conversations where round_id=target);
 if r.status='full' then update public.rounds set status='open' where id=target and (select count(*) from public.round_participants where round_id=target)<r.capacity;end if;
 end$$;
create function public.leave_round(target uuid) returns void language sql security invoker set search_path='' as $$select private.leave_round(target)$$;
create function private.updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end$$;
do $$declare t record;begin for t in select table_name from information_schema.columns where table_schema='public' and column_name='updated_at' loop execute format('create trigger set_updated_at before update on public.%I for each row execute function private.updated_at()',t.table_name);end loop;end$$;
-- Deny default function execution; grant only required policy helpers and RPC entry points.
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.is_active(),private.is_organizer(),private.is_circle_member(uuid),private.is_circle_admin(uuid),private.is_round_member(uuid),private.is_round_host(uuid),private.is_conversation_member(uuid),private.join_round(uuid),private.leave_round(uuid) to authenticated;
revoke all on function public.join_round(uuid),public.leave_round(uuid) from public,anon;
grant execute on function public.join_round(uuid),public.leave_round(uuid) to authenticated;
commit;
