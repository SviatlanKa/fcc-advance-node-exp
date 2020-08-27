const passport = require("passport");
const bcrypt = require('bcrypt');

module.exports = function (app, db) {
  
      function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');
    };
  
  app.route('/')
      .get((req, res) => {
        res.render(process.cwd() + '/views/pug/index', {title: 'Home Page', message: 'login', showLogin: true, showRegistration: true});
      });
    
    app.route('/profile')
     .get(ensureAuthenticated, (req,res) => {
        res.render(process.cwd() + '/views/pug/profile', { username: req.user.username});
     });

    app.route('/login')
      .post(passport.authenticate('local', { failureRedirect: '/' }), (req,res) => {
           // res.redirect('/profile');
        res.render(process.cwd() + "/views/pug/profile.pug", {
            username: req.user.username
        });
      });    
        
    app.route('/logout')
      .get((req, res) => {
        req.logout();
        res.redirect("/");
    });
    
    app.route('/register')
      .post((req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
        db.collection('users').findOne({ username: req.body.username }, function(err, user) {
          if (err) {
            next(err);
          } else if (user) {
            res.redirect('/');
          } else {
            db.collection('users').insertOne({
              username: req.body.username,
              password: hash
            },
              (err, newUser) => {
                if (err) {
                  res.redirect('/');
                } else {
                  console.log('doc', newUser);
                  next(null, newUser);
                }
              }
            )
          }
        })
      },
        passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
          res.redirect('/profile');
        }
    );  
      
    app.use((req, res, next) => {
      res.status(404)
      .type('text')
      .send('Not Found');
    });

}