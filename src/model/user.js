if (!global.db) {
  const pgp = require('pg-promise')();
  db = pgp(process.env.DB_URL);
}

function list_sso(sso) {
  const where = [];
  if(sso) where.push(`sso = $1`);

  const sql = `
        SELECT *
        FROM users
        ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
        LIMIT 1
    `;
  return db.any(sql, [sso]);
}


function list_id(id) {
  const where = [];
  if(id) where.push(`id = $1`);

  const sql = `
        SELECT *
        FROM users
        ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
        LIMIT 1
    `;
  return db.any(sql, [id]);
}

function list_followee(id) {
  const where = [];
  if(id) where.push(`followee = $1`);

  const sql = `
        SELECT *
        FROM follows
        ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
        ORDER BY ts DESC
    `;
  return db.any(sql, [id]);
}


function list_location(lat, long) {
  const where = [];


  if (lat) where.push('lat < $2 + 0.1 AND lat > $2 - 0.1');
  if (long) where.push('long < $3 + 0.1 AND long > $3 - 0.1');
  

  const sql = `
        SELECT *
        FROM users
        ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
        ORDER BY ts DESC
        LIMIT 100
    `;
  return db.any(sql, [lat, long]);
}

function list(searchText = '') {
  const where = [];
  if (searchText) where.push(`name ILIKE '%$1:value%'`);

  // if(id){
  //   where.push(`id = $2`);
  // }else{
  //   if(sso){
  //     if (sso) where.push(`sso = $2`);
  //   }else{
  //     if (lat) where.push('lat < $2 + 0.00001 AND lat > $2 - 0.00001');
  //     if (long) where.push('long < $3 + 0.00001 AND long > $3 - 0.00001');
  //   }
  // }

  

  const sql = `
        SELECT *
        FROM users
        ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
        ORDER BY ts DESC
        LIMIT 100
    `;
  return db.any(sql, [searchText]);
}

function create(id = '', name = '', sso = '', email = '', photo = '') {
  const sql = `
        INSERT INTO users ($<this:name>)
        VALUES ($<id>, $<name>, $<sso>, $<email>, $<photo>)
        RETURNING *
    `;
  return db.one(sql, { id, name, sso, email, photo });
}

function update_location(id, lat, long) {
  const where = [];
  if (id) where.push(`id = $1`);

  const update= [];
  if (lat) update.push(`lat = $2`);
  if (long) update.push(`long = $3`);
  

  const sql = `
        UPDATE users
        ${update.length ? ' SET ' + update.join(' , ') : ''}
        ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
        RETURNING *
    `;
  return db.one(sql, [id, lat, long]);
}

module.exports = {
  list_sso,
  list_id,
  list,
  create,
  update_location,
  list_followee,
  list_location,
};
