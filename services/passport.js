const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const User = require('../models/User')

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport