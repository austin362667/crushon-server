require('../../config.js');
const pgp = require('pg-promise')();
const db = pgp(process.env.DB_URL);

const schemaSql = `
    -- Extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE EXTENSION IF NOT EXISTS uuid-ossp;

    -- Drop (droppable only when no dependency)
    DROP INDEX IF EXISTS users_idx_name;
    DROP INDEX IF EXISTS users_idx_ts;
    DROP TABLE IF EXISTS users;
    DROP TYPE IF EXISTS gender;

    -- Create
    CREATE TYPE gender AS ENUM (
      'm',
      'f',
      'n'
  );
    CREATE TABLE users (
        id              uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        gender          gender,
        name            text NOT NULL,
        sso             text NOT NULL,
        email           text,
        photo           text,
        lat             real,
        long            real,
        ts              bigint NOT NULL DEFAULT (extract(epoch from now())),
    );
    CREATE INDEX posts_idx_ts ON users USING btree(ts);
    CREATE INDEX posts_idx_name ON users USING gin(text gin_trgm_ops);
`;


db.none(schemaSql)
  .then(() => {
    console.log('Schema created');
  })
  .catch((err) => {
    console.log('Error creating schema', err);
  });
