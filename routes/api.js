const router = require('express').Router()
const {registerValidation,loginValidation,auth} = require('../app/middlewares/auth')
const {register ,refreshToken,login,search, batchRegister} = require('../app/controllers/AuthController')

router.post('/register',registerValidation,register)
router.post('/login',loginValidation,login)
router.post('/refresh_session',refreshToken)
router.post('/search',search);
router.post('/batch_register',batchRegister);

module.exports = router