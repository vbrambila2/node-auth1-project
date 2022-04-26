// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const bcrypt = require('bcryptjs');
const { checkUsernameFree, checkUsernameExists, checkPasswordLength } = require('./auth-middleware');
const router = require('express').Router();
const Users = require('../users/users-model');

/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post('/register', checkPasswordLength, checkUsernameFree, async (req, res, next) => {
  const { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 12);

  Users.add({ username, password: hash })
    .then(saved => {
      console.log(saved, "saved");
      res.status(201).json(saved)
    })
    .catch(next)
  // try {
  //   const { username, password } = req.body;
  //   const hash = bcrypt.hashSync(password, 12);
  //   const user = { username, password: hash };
  //   await Users.add(user)
  //   return;
  // } catch (err) {
  //   console.log('error')
  //   next(err);
  // }
})

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.post('/login', checkUsernameExists, async (req, res, next) => {
  const { password} = req.body;
  if(bcrypt.compareSync(password, req.user.password)) {
    //attach the cookie to the client here
    req.session.user = req.user
    res.json({ message: `Welcome ${req.user.username}` })
  } else {
    next({ status: 401, message: 'Invalid credentials' })
  }
  // try {
  //   const { username} = req.body;
  //   const user = await Users.findBy({ username }).first();
  //   //const success = bcrypt.compareSync(password, user.password);
  //   console.log(user, "user")

  //   if(user !== undefined) {
  //     //req.session.user = user
  //     res.status(200).json({ message: `Welcome ${username}!` });
  //   }
  // } catch (err) {
  //   next(err)
  // }
})

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
router.get('/logout', (req, res, next) => {
  if(req.session.user) {
    req.session.destroy(err => {
      if(err) {
        next(err)
      } else {
        res.status(200).json({ message: 'logged out' });
      }
    })
  } else {
    res.status(200).json({ message: 'no session' })
  }
})
 
// Don't forget to add the router to the `exports` object so it can be required in other modules

module.exports = router;