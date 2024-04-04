import passportLocal from 'passport-local';
import pgPool from '../postgresql';
import bcrypt from 'bcryptjs';

export default function (passport) {
  const errorLogin = '등록되지 않은 아이디이거나, 잘못된 비밀번호입니다.';
  const errorActivation = '관리자의 사용 승인이 필요한 계정입니다.';

  /**
   * 사용자 인증 성공 시 호출
   * 사용자 정보를 이용해 세션을 만듦
   * 로그인 이후에 들어오는 요청은 deserializeUser 메소드 안에서 이 세션을 확인할 수 있음
   */
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  /**
   * 사용자 인증 이후 사용자 요청 시마다 호출
   * user -> 사용자 인증 성공 시 serializeUser 메소드를 이용해 만들었던 세션 정보가 파라미터로 넘어온 것임
   */
  passport.deserializeUser(function (user, done) {
    done(null, user);
  });

  passport.use(
    'local-signin',
    new passportLocal.Strategy(
      {
        usernameField: 'LoginName',
        passwordField: 'LoginKey',
        passReqToCallback: true
      },
      onSignIn
    )
  );

  function onSignIn(req, username, password, done) {
    pgPool.connect().then(function (client) {
      return client
        .query(
          `SELECT user_tb.username AS "LoginName",
                    membership_tb.active AS "Status"
             FROM private.sys_login login_tb
                      LEFT JOIN private.sys_user user_tb ON login_tb.userid_fk = user_tb.id
                      LEFT JOIN private.sys_membership membership_tb ON user_tb.id = membership_tb.userid_fk
             WHERE login_tb.username = $1 LIMIT 1`,
          [username]
        )
        .then(function (result) {
          if (result.rowCount === 0) {
            return done({ message: errorLogin }, false);
          } else {
            const isActivated = result.rows[0]['Status'];
            if (isActivated === false) {
              return done(
                { message: errorActivation, status: 'warning' },
                false
              );
            } else {
              return client
                .query(
                  `SELECT login_tb.username AS "LoginName",
                          login_tb.password AS "LoginKey",
                          user_tb.lastname AS "UserLastName",
                          user_tb.firstname AS "UserFirstName",
                          role_tb.role_name AS "RoleName",
                          company_tb.company_name AS "CompanyName",
                          company_tb.wtl AS "CompanyWTL",
                          company_tb.swl AS "CompanySWL"
                   FROM private.sys_login login_tb
                            LEFT JOIN private.sys_user user_tb ON login_tb.userid_fk = user_tb.id
                            LEFT JOIN private.sys_membership membership_tb ON user_tb.id = membership_tb.userid_fk
                            LEFT JOIN private.sys_role role_tb ON membership_tb.roleid_fk = role_tb.id
                            LEFT JOIN private.sys_company company_tb ON membership_tb.companyid_fk = company_tb.id
                   WHERE login_tb.username = $1`,
                  [username]
                )
                .then(function (result) {
                  if (result.rowCount === 0) {
                    return done({ message: errorLogin }, false);
                  } else {
                    onMatchPassword(req, result, password, done);
                  }
                });
            }
          }
        })
        .catch(function (err) {
          return done(null, false);
        })
        .finally(function () {
          client.release();
        });
    });
  }

  function onMatchPassword(req, login, password, done) {
    const info = login.rows[0];
    bcrypt
      .compare(password, info['LoginKey'])
      .then(function (match) {
        if (match) {
          return done(null, {
            UserName: `${info['UserLastName']}${info['UserFirstName']}`,
            LoginName: info['LoginName'],
            CompanyName: info['CompanyName'],
            RoleName: info['RoleName'],
            CompanyWTL: info['CompanyWTL'],
            CompanySWL: info['CompanySWL']
          });
        } else {
          return done({ message: errorLogin }, false);
        }
      })
      .catch(function (err) {
        if (err) {
          return done({ message: errorLogin }, false);
        }
      });
  }

  passport.use(
    'local-signup',
    new passportLocal.Strategy(
      {
        usernameField: 'LoginNameNew',
        passwordField: 'LoginKeyNew',
        passReqToCallback: true
      },
      onSignUp
    )
  );

  function onSignUp(req, username, password, done) {
    const post = req.body;
    pgPool.connect().then(function (client) {
      return client
        .query(
          'SELECT username AS "LoginNameNew" FROM private.sys_user WHERE username = $1',
          [post['LoginNameNew']]
        )
        .then(function (user) {
          if (user.rowCount > 0) {
            client.release();
            return done(null, false);
          } else {
            bcrypt.hash(post['LoginKeyNew'], 10, function (err, hash) {
              return client
                .query(
                  `WITH ins1 AS (INSERT INTO private.sys_user (firstname, lastname, username) VALUES ($1, $2, $3) RETURNING id),
                          ins2 AS (INSERT INTO private.sys_login (username, password, userid_fk) VALUES ($4, $5, (SELECT id FROM ins1))),
                          sel1 AS (SELECT id FROM private.sys_company WHERE company_name = $6),
                          sel2 AS (SELECT id FROM private.sys_role WHERE role_name = $7)
                     INSERT
                     INTO private.sys_membership (email, phone, userid_fk, companyid_fk, roleid_fk, active, reset)
                     VALUES ($8, NULL, (SELECT id FROM ins1), (SELECT sel1.id FROM sel1), (SELECT sel2.id FROM sel2), FALSE, TRUE)`,
                  [
                    post['UserFirstName'],
                    post['UserLastName'],
                    post['LoginNameNew'],
                    post['LoginNameNew'],
                    hash,
                    post['CompanyName'],
                    post['RoleName'],
                    post['EmailNew']
                  ]
                )
                .then(function (result) {
                  return done(null, user);
                })
                .catch(function (err) {
                  return done(null, false);
                })
                .finally(function () {
                  client.release();
                });
            });
          }
        });
    });
  }
}
