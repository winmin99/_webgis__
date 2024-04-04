export default function (app) {
  app.get(['/'], checkAuth, function (req, res, next) {
    req.session.cookie.expires = false;

    const localName = process.env.LOCAL_NAME;
    const localRole = process.env.LOCAL_ROLE;
    res.render('index', {
      _csrfToken: req.csrfToken(),
      name: localName,
      title: {
        browser: `${localName} ${localRole} 웹조회시스템`,
        page: `${localName} ${localRole} 시설물 웹조회시스템`
      },
      user: {
        name: req.user['UserName'],
        rolename: req.user['RoleName']
      },
      CompanyWTL: req.user['CompanyWTL'],
      CompanySWL: req.user['CompanySWL'],
      isAdmin: req.user['LoginName'] === 'admin'
    });
  });

  app.get('/download/manual', checkAuth, function (req, res, next) {
    const file = `${__dirname}/public/assets/media/misc/Seongju_Manual_202005.pdf`;
    res.download(file);
  });

  app.get('/auth/signout', function (req, res) {
    req.session.destroy(function (err) {
      req.logOut();
      res.redirect('/auth/signin');
    });
  });
}

function checkAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/auth/signin');
  } else {
    next();
  }
}
