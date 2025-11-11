 /*const GOOGLE_CLIENT_ID = "582016504675-11lu8bo3hvkondc898udh8s4krs9fgf9.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(new GoogleStrategy({
  clientID: "582016504675-11lu8bo3hvkondc898udh8s4krs9fgf9.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));
passport.serializeUser(function(user, done) { 
  done(null, user); 
}); 
 
passport.deserializeUser(function(user, done) { 
    done(null, user); 
}); */
 
 const passport=require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();
const GoogleOneTapStrategy = require("passport-google-one-tap").GoogleOneTapStrategy;

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
passport.use(
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
);