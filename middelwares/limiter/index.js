import { RateLimiterPostgres } from 'rate-limiter-flexible';
import pgPool from '../postgresql';

const options = {
  // Basic options
  storeClient: pgPool,
  storeType: pgPool.constructor.name,
  points: 100, // Number of points
  duration: 1, // Per second(s)

  // Custom options
  tableName: 'private.sys_rtl',
  keyPrefix: 'sys_rtl', // must be unique for limiters with different purpose

  inmemoryBlockOnConsumed: 301,
  inmemoryBlockDuration: 60,
  // TODO: 개선: https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#login-endpoint-protection
  blockDuration: 60 // Block for 10 seconds if consumed more than `points`
};

const rateLimiterPostgres = new RateLimiterPostgres(options, function (err) {
  if (err) {
    // log or/and process exit
  } else {
    // table checked/created
  }
});

function rateLimiter(req, res, next) {
  rateLimiterPostgres
    .consume(req.ip)
    .then(function (rateLimiterRes) {
      // There were enough points to consume
      // ... Some app logic here ...
      next();
    })
    .catch(function (rejRes) {
      if (rejRes instanceof Error) {
        // Some Postgres error
        // Never happen if `insuranceLimiter` set up
        // Decide what to do with it in other case
      } else {
        // Can't consume
        // If there is no error, rateLimiterRedis promise rejected with number of ms before next request allowed
        // consumed and remaining points
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res.status(429).send('Too Many Requests');
      }
    });
}

export default rateLimiter;
