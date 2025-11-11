const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();
//const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;

let options = {};
options.clientID = process.env.GOOGLE_CLIENT_ID;
options.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
options.callbackURL = process.env.GOOGLE_CALLBACK_URL;

passport.serializeUser(function(user, done) {
 done(null, user);
});
passport.deserializeUser(function(user, done) {
 done(null, user);
});
passport.use(new GoogleStrategy({
    clientID: options.clientID,
    clientSecret: options.clientSecret,
    callbackURL: options.callbackURL
 },
 function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
 }
));
/*passport.use(
   new GoogleOneTapStrategy(
   {
      client_id: options.clientID, //prod-oneTap
      //clientSecret: "xxxx", //local
      clientSecret: options.clientSecret, 
      verifyCsrfToken: false, // whether to validate the csrf token or
   },
   function (profile, done) {
      return done(null, profile);
   }
   )
);*/