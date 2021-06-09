require('../../config.js');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

const schemaSql = `
    -- Extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    -- Drop (droppable only when no dependency)
    DROP INDEX IF EXISTS users_idx_name;
    DROP INDEX IF EXISTS users_idx_ts;
    DROP INDEX IF EXISTS follows_idx_follower;
    DROP INDEX IF EXISTS follows_idx_followee;
    DROP TABLE IF EXISTS users;
    DROP TYPE IF EXISTS gender;

    -- Create
    CREATE TYPE gender AS ENUM (
      'm',
      'f',
      'n'
  );
    CREATE TABLE users (
        id              uuid PRIMARY KEY NOT NULL,
        gender          gender,
        name            text NOT NULL,
        sso             text NOT NULL,
        email           text,
        photo           text,
        lat             real,
        long            real,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now()))
    );
    CREATE TABLE follows (
      id              uuid PRIMARY KEY NOT NULL,
      follower        uuid NOT NULL,
      followee        uuid NOT NULL,
      ts              bigint NOT NULL DEFAULT (extract(epoch from now()))
  );
    CREATE INDEX posts_idx_ts ON users USING btree(ts);
    CREATE INDEX posts_idx_name ON users USING gin(text gin_trgm_ops);
    CREATE INDEX follows_idx_follower ON follows USING btree(follower);
    CREATE INDEX follows_idx_followee ON follows USING btree(followee);
`;


db.none(schemaSql)
  .then(() => {
    console.log('Schema created');
  })
  .catch((err) => {
    console.log('Error creating schema', err);
  });
