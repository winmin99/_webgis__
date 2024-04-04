import pgPool from '../postgresql';
import myPool from '../mysql';
import moment from 'moment';

Date.prototype.toJSON = function () {
  return moment(this).format('YYYY년 MM월 DD일');
};

const onPostgresQuery = function (res, query, values, formatter) {
  pgPool.connect().then(function (client) {
    return client
      .query(query, values)
      .then(formatter)
      .then(function (result) {
        res.status(200).send(result);
      })
      .catch(function (err) {
        res.status(400).json(err);
      })
      .finally(function () {
        client.release();
      });
  });
};

const onPostgresTransaction = function (res, queries, values) {
  let results = [];
  (async function () {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      for (var i = 0, len = queries.length; i < len; i++) {
        const row = await client.query(queries[i], values[i]);
        if (row.rowCount > 0) {
          results[i] = row;
        }
      }
      if (results.length === 0) {
        throw new Error('NONE');
      } else {
        await client.query('COMMIT');
        res.status(200).send(results);
      }
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
      results = null;
    }
  })().catch(function (err) {
    res.status(400).json(err);
    results = null;
  });
};

const onMySqlQuery = function (res, query, values) {
  myPool
    .promise()
    .query(query, values)
    .then(function ([result, fields]) {
      res.status(200).send(result);
    })
    .catch(function (err) {
      res.status(400).send(err);
    })
    .finally(function () {});
};

export { onPostgresQuery, onMySqlQuery, onPostgresTransaction };
