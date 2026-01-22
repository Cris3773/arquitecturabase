const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;

require("dotenv").config();
//const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;

let options = {};
options.clientID = process.env.GOOGLE_CLIENT_ID;
options.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
options.callbackURL = process.env.GOOGLE_CALLBACK_URL;

passport.serializeUser(function (user, done) {
  done(null, user.email || user.emails?.[0]?.value);
});

passport.deserializeUser(function (email, done) {
  done(null, { email: email });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL, // http://localhost:3000/google/callback
}, (accessToken, refreshToken, profile, done) => done(null, profile)));
passport.use(
   new GoogleOneTapStrategy(
   {
      client_id: options.clientID, //prod-oneTap
      clientSecret: options.clientSecret, 
      verifyCsrfToken: false, // whether to validate the csrf token or
   },
   function (profile, done) {
      return done(null, profile);
   }
   )
);

 