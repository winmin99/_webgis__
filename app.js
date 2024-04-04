// dotenv import: DO NOT REMOVE
import _ from './middelwares/env';
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import hbs from 'hbs';
import helmet from 'helmet';
import noCache from 'nocache';
import bodyParser from 'body-parser';
import pgPool from './middelwares/postgresql';
import session from 'express-session';
import connect_pg_simple from 'connect-pg-simple';
import rateLimiter from './middelwares/limiter';
import flash from 'connect-flash';
import csurf from 'csurf';
import cors from 'cors';
import passport from 'passport';
import configPassport from './middelwares/passport';
import passportMiddleware from './middelwares/account';
import apiMiddleware from './middelwares/api';
import routeMiddleware from './middelwares/route';

const app = express();
const pgSession = connect_pg_simple(session);

// view engine setup
app.set('views', path.join(__dirname, 'public', 'views'));
app.set('view engine', 'html');
app.engine('html', hbs.__express);
hbs.registerPartials(path.join(__dirname, 'public', 'partials'));

app
  .use(
    helmet({
      dnsPrefetchControl: { allow: true }
    })
  )
  .use(noCache())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cookieParser(process.env.SESSION_KEY))
  .use(
    session({
      secret: process.env.SESSION_KEY,
      resave: false,
      saveUninitialized: false,
      store: new pgSession({
        pool: pgPool
      })
    })
  )
  .use(csurf({}))
  .use(rateLimiter)
  .use(flash())
  .use(cors())
  .use(passport.initialize({}))
  .use(passport.session({}))
  .use(express.static(path.join(__dirname, 'public')));

configPassport(passport);

passportMiddleware(passport, app);

apiMiddleware(app);

routeMiddleware(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    error: {
      status: err.status,
      message: res.locals.message
    }
  });
});

export default app;
