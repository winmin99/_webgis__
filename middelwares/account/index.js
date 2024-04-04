import { onPostgresQuery, onPostgresTransaction } from '../dbconn';
import bcrypt from 'bcryptjs';
import pgPool from '../postgresql';

const feedbackWrongAccountInfo =
  '등록되지 않은 아이디이거나, 잘못된 비밀번호입니다.';

export default function (passport, app) {
  // 로그인
  app
    .route('/auth/signin')
    .get(function (req, res) {
      res.render('signin', {
        _csrfToken: req.csrfToken(),
        title: {
          browser: '로그인',
          page: `${process.env.LOCAL_NAME} 시설물 웹조회시스템`
        },
        company: process.env.LOCAL_NAME
      });
    })
    .post(function (req, res, next) {
      passport.authenticate('local-signin', function (err, user, info) {
        if (err || !user) {
          return res.status(400).json({
            message: feedbackWrongAccountInfo,
            status: 'danger'
          });
        } else {
          req.login(user, function (err) {
            if (err) {
              return res.status(400).json({
                message: err.message ? err.message : feedbackWrongAccountInfo,
                status: err.status
              });
            } else {
              return res.status(200).json({
                workspace: process.env.WORKSPACE,
                role: req.user['RoleName']
              });
            }
          });
        }
      })(req, res, next);
    });

  // 회원가입
  app.route('/auth/signup').post(function (req, res, next) {
    passport.authenticate('local-signup', function (err, info, result) {
      if (err) {
        return res.status(400).json({
          message: '계정 생성에 실패하였습니다. 관리자에게 문의바랍니다.'
        });
      } else {
        if (info === false) {
          return res
            .status(400)
            .json({ message: '이미 사용중인 아이디입니다.' });
        } else {
          return res.status(200).json({
            message: '등록한 계정은 관리자의 승인 후 사용이 가능합니다.'
          });
        }
      }
    })(req, res, next);
  });

  app.route('/auth/duplicate').post(function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT username AS "LoginName"
FROM private.sys_login
WHERE username = $1;`,
      [req.body['LoginName']]
    );
  });

  app.route('/auth/resetKey').post(function (req, res, next) {
    const post = req.body;
    pgPool.connect().then(function (client) {
      return client
        .query(
          `SELECT login_tb.username AS "LoginName", login_tb.password AS "LoginKey"
FROM private.sys_login AS login_tb WHERE login_tb.username = $1;`,
          [post['OldLoginName']]
        )
        .then(function (result) {
          if (result.rowCount === 0) {
            return res.status(400).json({
              message: feedbackWrongAccountInfo
            });
          } else {
            bcrypt
              .compare(post['OldLoginKey'], result.rows[0]['LoginKey'])
              .then(function (match) {
                if (match) {
                  onChangePassword(post, res);
                } else {
                  return res.status(401).json({
                    message: feedbackWrongAccountInfo
                  });
                }
              });
          }
        })
        .catch(function (err) {
          return res.status(400).json({
            message: feedbackWrongAccountInfo
          });
        })
        .finally(function () {
          client.release();
        });
    });
  });

  app.route('/auth/forgot').post(function (req, res, next) {
    onPostgresQuery(
      res,
      `UPDATE private.sys_membership AS membership_tb
SET active = TRUE, 
    reset = TRUE
FROM private.sys_user AS user_tb
WHERE membership_tb.userid_fk = user_tb.id
  AND user_tb.username = $1
  AND membership_tb.email = $2`,
      [req.body.username, req.body.email]
    );
  });

  app.route('/api/account').post(checkAdmin, function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT membership_tb.userid_fk AS "RecordID",
       role_tb.role_name AS "RoleName",
       concat(user_tb.lastname, ' ', user_tb.firstname) AS "Name",
       user_tb.username AS "LoginName",
       membership_tb.email AS "Email",
       CASE
           WHEN active = TRUE AND reset = FALSE THEN '정상'
           WHEN active = FALSE AND reset = TRUE THEN '대기'
           WHEN active = TRUE AND reset = TRUE THEN '리셋'
           ELSE '중지' END                                AS "Status"
FROM private.sys_login AS login_tb
         LEFT JOIN private.sys_membership AS membership_tb ON login_tb.id = membership_tb.userid_fk
         LEFT JOIN private.sys_user AS user_tb ON membership_tb.userid_fk = user_tb.id
         LEFT JOIN private.sys_role AS role_tb ON membership_tb.roleid_fk = role_tb.id
WHERE user_tb.username != 'admin'
ORDER BY role_tb.role_name ASC, user_tb.lastname ASC, user_tb.firstname ASC;
          `,
      [],
      formatAccountData
    );
  });

  app.route('/auth/reset').post(checkAdmin, function (req, res, next) {
    const post = req.body[0];
    bcrypt.hash(post['newValue'], 10, function (err, hash) {
      onPostgresTransaction(
        res,
        [
          `UPDATE private.sys_login AS login_tb
SET password = $1
FROM private.sys_membership AS membership_tb
WHERE login_tb.userid_fk = membership_tb.userid_fk
  AND membership_tb.userid_fk = $2
  AND login_tb.username != 'admin';`,
          `UPDATE private.sys_membership AS membership_tb
SET active = TRUE,
    reset  = FALSE
FROM private.sys_login AS login_tb
WHERE membership_tb.userid_fk = login_tb.userid_fk
  AND membership_tb.userid_fk = $1
  AND login_tb.username != 'admin';`
        ],
        [[hash, post['id']], [post['id']]]
      );
    });
  });

  app.route('/auth/update').post(checkAdmin, function (req, res, next) {
    const post = req.body;
    const queries = [];
    const values = [];
    post.forEach(function (element) {
      if (element.active === undefined || element.reset === undefined) {
        queries.push(`
UPDATE private.sys_membership AS membership_tb
SET roleid_fk = $2
WHERE membership_tb.userid_fk = $1;`);
        values.push([element['id'], element['newValue']]);
      } else {
        queries.push(`UPDATE private.sys_membership AS membership_tb
SET active = $2,
    reset  = $3
WHERE membership_tb.userid_fk = $1;`);
        values.push([element['id'], element['active'], element['reset']]);
      }
    });
    onPostgresTransaction(res, queries, values);
  });

  app.route('/auth/delete').post(checkAdmin, function (req, res, next) {
    // 삭제 쿼리 추가하고 js 에도 삭제 버튼 처리 추가, html 에도 삭제 버튼 추가
    const id = req.body[0].id;
    onPostgresTransaction(
      res,
      [
        `DELETE FROM private.sys_login AS login_tb WHERE login_tb.userid_fk = $1 AND login_tb.username != 'admin';`,
        `DELETE FROM private.sys_membership AS membership_tb WHERE membership_tb.userid_fk = $1`,
        `DELETE FROM private.sys_user AS user_tb WHERE user_tb.id = $1 AND user_tb.username != 'admin';`
      ],
      [[id], [id], [id]]
    );
  });
}

function onChangePassword(post, res) {
  bcrypt.hash(post['NewLoginKey'], 10, function (err, hash) {
    pgPool.connect().then(function (client) {
      return client
        .query(
          `UPDATE private.sys_login AS login_tb
  SET password = $1
 WHERE login_tb.username = $2;`,
          [hash, post['OldLoginName']]
        )
        .then(function (result) {
          if (result.rowCount === 1) {
            res.status(200).send();
          } else {
            res.status(400).json({
              message:
                '비밀번호 변경에 실패하였습니다. 관리자에게 문의바랍니다.'
            });
          }
        })
        .catch(function (err) {
          res.status(400).json({
            message: '비밀번호 변경에 실패하였습니다. 관리자에게 문의바랍니다.'
          });
        })
        .finally(function () {
          client.release();
        });
    });
  });
}

function checkAdmin(req, res, next) {
  if (!req.isAuthenticated() && req.user['LoginName'] !== 'admin') {
    res.status(401).send();
  } else {
    next();
  }
}

function formatAccountData(rawData) {
  const rows = rawData.rows;
  const total = rawData.rowCount;
  const dataSet = {
    meta: {
      page: 1,
      pages: Math.ceil(total / 10),
      perpage: 10,
      total: total,
      sort: 'asc',
      field: 'name'
    },
    data: []
  };
  for (var i = 0, len = rawData.rowCount; i < len; i++) {
    dataSet.data[i] = rows[i];
  }
  return JSON.stringify(dataSet);
}
