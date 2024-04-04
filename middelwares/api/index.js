import { onMySqlQuery, onPostgresQuery } from '../dbconn';

export default function (app) {
  app.route('/api/wtl/info').post(checkAuth, function (req, res, next) {
    onPostgresQuery(res, `SELECT * FROM ${req.body.table} WHERE 관리번호=$1;`, [
      req.body.query
    ]);
  });

  app.route('/api/wtl/search').post(checkAuth, function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT * FROM viw_search_tb WHERE (fac_nam LIKE $1 OR cname LIKE $2) AND (role_name=$3) ORDER BY (CASE WHEN fac_nam IS NULL OR fac_nam='' THEN 1 ELSE 0 END), fac_nam ASC`,
      [`%${req.body.query}%`, `%${req.body.query}%`, req.body.role]
    );
  });

  app.route('/api/wtl/wtsAll').post(checkAuth, function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT ${req.body.query} FROM ${req.body.table} ORDER BY ${req.body.query} ASC;`
    );
  });

  app.route('/api/wtl/wtsChild').post(checkAuth, function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT st_asgeojson(${req.body.table['name']}.geom) AS coordinate FROM ${req.body.table['name']} WHERE ${req.body.table['column']}=$1;`,
      [req.body.query]
    );
  });

  app.route('/api/wtl/wtsParent').post(checkAuth, function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT st_asgeojson(${req.body.table['name']}.geom) AS coordinate, 급수구역명, 급수분구명 FROM ${req.body.table['name']} WHERE ${req.body.table['column']}=$1;`,
      [req.body.query]
    );
  });

  app.route('/api/wtl/wtsa').post(checkAuth, function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT st_asgeojson(viw_wtl_wtssa_as.geom) AS coordinate, 급수분구명 FROM viw_wtl_wtssa_as WHERE 급수구역명=$1 ORDER BY 급수분구명 ASC;`,
      [req.body.query]
    );
  });

  app.route('/api/wtl/wtssa').post(checkAuth, function (req, res, next) {
    onPostgresQuery(
      res,
      `SELECT st_asgeojson(viw_wtl_wtsba_as.geom) AS coordinate, 급수블럭명 FROM viw_wtl_wtsba_as WHERE 급수분구명=$1 ORDER BY 급수블럭명 ASC;`,
      [req.body.query]
    );
  });

  app.route('/api/wtl/detail').post(checkAuth, function (req, res, next) {
    let columnName = '관리번호';
    if (req.body.table['name'] === 'viw_swt_bs_img_et') columnName = "배수설비인허가번호";
    onMySqlQuery(
      res,
      `SELECT * FROM ${req.body.table['name']} WHERE 시설물구분="${req.body.query['layer']}" AND ${columnName}=${req.body.query['id']} ORDER BY 사진일련번호 ASC;`
    );
  });

  app.route('/api/wtl/cons').post(checkAuth, function (req, res, next) {
    onMySqlQuery(
      res,
      `SELECT 공사명, 실준공일자 AS 준공일자, 도급자명 AS 시공사, 도급자전화번호 AS 시공사연락처 FROM viw_wtt_cons_ma WHERE 공사번호="${req.body.query['number']}" ORDER BY 공사번호 ASC;`
    );
  });

  // app.route('/api/');
}

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.send();
  }
}
