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
  return db.any(sql, [sso]);
}


function list(searchText = '', lat = 0, long = 0) {
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
        LIMIT 10
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

function update(id = '', lat = 0, long = 0, photo = '', gender = '', name = '') {
  const where = [];
  if (id) where.push(`id = $1`);

  const update= [];
  if (lat) update.push(`lat = $2`);
  if (long) update.push(`long = $3`);
  if (photo) update.push(`photo = $4`);
  if (gender) update.push(`gender = $5`);
  if (name) update.push(`name = $6`);
  

  const sql = `
        UPDATE users
        ${update.length ? ' SET ' + update.join(' , ') : ''}
        ${where.length ? ' WHERE ' + where.join(' AND ') : ''}
        ORDER BY ts DESC
        LIMIT 10
    `;
  return db.one(sql, [id, lat, long, photo, gender, name]);
}

module.exports = {
  list_sso,
  list_id,
  list,
  create,
  update,
};
