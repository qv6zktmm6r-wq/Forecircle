import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const ids = Array.from(
  { length: 6 },
  (_, i) => `00000000-0000-4000-8000-00000000000${i + 1}`,
);
test("Foundation SQL and RLS integration (local PostgreSQL engine, mocked Supabase auth)", async (t) => {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`,
  );
  await db.exec(
    await readFile(
      "supabase/migrations/20261108012152_forecircle_foundation.sql",
      "utf8",
    ),
  );
  for (let i = 0; i < ids.length; i++) {
    await db.query("insert into auth.users(id) values($1)", [ids[i]]);
    await db.query(
      "insert into public.profiles(id,username,display_name,general_region) values($1,$2,$3,$4)",
      [ids[i], `demo_${i}`, `Demo ${i}`, "Test region"],
    );
  }
  const as = async (id: string, role = "authenticated") => {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await db.exec(`set role ${role}`);
  };
  const admin = async () => db.exec("reset role");
  await t.test("RLS enabled on all 20 foundation tables", async () => {
    const { rows } = await db.query<{ n: number }>(
      "select count(*)::int as n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private') and c.relkind='r' and not c.relrowsecurity",
    );
    assert.equal(rows[0].n, 0);
  });
  await t.test(
    "profiles: own update allowed, cross-account update prevented",
    async () => {
      await as(ids[0]);
      await db.query("update profiles set display_name=$1 where id=$2", [
        "Changed demo",
        ids[0],
      ]);
      const other = await db.query(
        "update profiles set display_name=$1 where id=$2 returning id",
        ["Stolen", ids[1]],
      );
      assert.equal(other.rows.length, 0);
      await assert.rejects(() =>
        db.query("update profiles set id=$1 where id=$2", [ids[2], ids[0]]),
      );
    },
  );
  await t.test("preferences are not visible to other golfers", async () => {
    await as(ids[0]);
    await db.query("insert into profile_preferences(profile_id) values($1)", [
      ids[0],
    ]);
    await as(ids[1]);
    assert.equal(
      (await db.query("select * from profile_preferences")).rows.length,
      0,
    );
  });
  const circleId = "10000000-0000-4000-8000-000000000001";
  await t.test("organizer and Circle permissions enforced", async () => {
    await as(ids[0]);
    await assert.rejects(() =>
      db.query(
        "insert into circles(id,slug,name,general_region,founder_id) values($1,$2,$3,$4,$5)",
        [circleId, "test-circle", "Test circle", "Test area", ids[0]],
      ),
    );
    await db.query("insert into organizer_profiles(profile_id) values($1)", [
      ids[0],
    ]);
    await db.query(
      "insert into circles(id,slug,name,general_region,founder_id,visibility) values($1,$2,$3,$4,$5,$6)",
      [circleId, "test-circle", "Test circle", "Test area", ids[0], "private"],
    );
    await as(ids[1]);
    assert.equal((await db.query("select * from circles")).rows.length, 0);
    await assert.rejects(() =>
      db.query(
        "insert into circle_members(circle_id,profile_id,role) values($1,$2,$3)",
        [circleId, ids[1], "founder"],
      ),
    );
  });
  let roundId = "20000000-0000-4000-8000-000000000001";
  let courseId = "30000000-0000-4000-8000-000000000001";
  let conversationId = "";
  await t.test(
    "round creation atomically adds host and private chat",
    async () => {
      await admin();
      await db.query(
        "insert into golf_courses(id,name,city,state) values($1,$2,$3,$4)",
        [courseId, "Demo course", "Demo city", "CA"],
      );
      await as(ids[0]);
      await db.query(
        "insert into rounds(id,title,host_id,course_id,start_at,holes,capacity,status) values($1,'Demo round',$2,$3,now()+interval '7 days',18,4,'open')",
        [roundId, ids[0], courseId],
      );
      assert.equal(
        (await db.query("select * from round_participants")).rows.length,
        1,
      );
      const r = await db.query<{ id: string }>(
        "select id from conversations where round_id=$1",
        [roundId],
      );
      conversationId = r.rows[0].id;
      assert.equal(
        (await db.query("select * from conversation_members")).rows.length,
        2,
      );
    },
  );
  await t.test(
    "capacity cannot be bypassed; fifth golfer is waitlisted once",
    async () => {
      for (const id of ids.slice(1, 4)) {
        await as(id);
        const r = await db.query<{ result: string }>(
          "select join_round($1) as result",
          [roundId],
        );
        assert.equal(r.rows[0].result, "confirmed");
      }
      await as(ids[4]);
      assert.equal(
        (
          await db.query<{ result: string }>(
            "select join_round($1) as result",
            [roundId],
          )
        ).rows[0].result,
        "waitlisted",
      );
      await db.query("select join_round($1)", [roundId]);
      assert.equal(
        (await db.query("select * from round_waitlist")).rows.length,
        1,
      );
      await assert.rejects(() =>
        db.query(
          "insert into round_participants(round_id,profile_id) values($1,$2)",
          [roundId, ids[4]],
        ),
      );
      await admin();
      assert.equal(
        (await db.query("select * from round_participants")).rows.length,
        4,
      );
    },
  );
  await t.test("outsiders cannot read or write a group chat", async () => {
    await as(ids[4]);
    assert.equal(
      (
        await db.query("select * from conversations where id=$1", [
          conversationId,
        ])
      ).rows.length,
      0,
    );
    await assert.rejects(() =>
      db.query(
        "insert into messages(conversation_id,sender_id,body) values($1,$2,$3)",
        [conversationId, ids[4], "Not authorized"],
      ),
    );
    await as(ids[1]);
    await db.query(
      "insert into messages(conversation_id,sender_id,body) values($1,$2,$3)",
      [conversationId, ids[1], "Hello crew"],
    );
    await assert.rejects(() =>
      db.query(
        "insert into messages(conversation_id,sender_id,body) values($1,$2,$3)",
        [conversationId, ids[0], "Forged sender"],
      ),
    );
    assert.equal((await db.query("select * from messages")).rows.length, 1);
  });
  await t.test(
    "leaving removes conversation access and frees capacity",
    async () => {
      await as(ids[1]);
      await db.query("select leave_round($1)", [roundId]);
      assert.equal((await db.query("select * from messages")).rows.length, 0);
      await as(ids[4]);
      assert.equal(
        (
          await db.query<{ result: string }>(
            "select join_round($1) as result",
            [roundId],
          )
        ).rows[0].result,
        "confirmed",
      );
      assert.equal(
        (await db.query("select * from round_waitlist")).rows.length,
        0,
      );
    },
  );
  await t.test(
    "feature voting is organizer-only, unique, and status is protected",
    async () => {
      await as(ids[0]);
      const idea = await db.query<{ id: string }>(
        "insert into feature_requests(created_by,title,description,category) values($1,'A useful demo idea','A sufficiently long problem description','Other') returning id",
        [ids[0]],
      );
      const id = idea.rows[0].id;
      await db.query(
        "insert into feature_request_votes(request_id,profile_id) values($1,$2)",
        [id, ids[0]],
      );
      await assert.rejects(() =>
        db.query(
          "insert into feature_request_votes(request_id,profile_id) values($1,$2)",
          [id, ids[0]],
        ),
      );
      await assert.rejects(() =>
        db.query("update feature_requests set status='released' where id=$1", [
          id,
        ]),
      );
      await as(ids[2]);
      await assert.rejects(() =>
        db.query(
          "insert into feature_request_votes(request_id,profile_id) values($1,$2)",
          [id, ids[2]],
        ),
      );
    },
  );
  await t.test(
    "suspended golfers cannot use join RPC or write messages",
    async () => {
      await admin();
      await db.query(
        "insert into private.account_controls(profile_id,suspended_at) values($1,now())",
        [ids[4]],
      );
      await as(ids[4]);
      await assert.rejects(() => db.query("select join_round($1)", [roundId]));
      await assert.rejects(() =>
        db.query(
          "insert into messages(conversation_id,sender_id,body) values($1,$2,$3)",
          [conversationId, ids[4], "Blocked"],
        ),
      );
      await assert.rejects(() =>
        db.query("select * from private.account_controls"),
      );
    },
  );
  await t.test(
    "anonymous clients cannot invoke registration RPCs",
    async () => {
      await as("", "anon");
      await assert.rejects(() => db.query("select join_round($1)", [roundId]));
      await assert.rejects(() => db.query("select * from messages"));
    },
  );
  await admin();
  const summary = await db.query<{ tables: number }>(
    "select count(*)::int as tables from pg_tables where schemaname in ('public','private')",
  );
  console.log("Foundation tables verified:", summary.rows[0].tables);
  await db.close();
});
