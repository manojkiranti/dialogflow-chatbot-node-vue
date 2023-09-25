const expressJwt = require("express-jwt");
const config = require("../../config/keys");

module.exports = jwt;

function jwt() {
  const { secret } = config;
  return expressJwt({ secret, algorithms: ["HS256"] }).unless({
    path: [
      // public routes that don't require authentication
      "/api/login",
      "/css/frontend/bootstrap.css",
      "/css/frontend/slick.css",
      "/css/frontend/slick-theme.css",
      "/css/frontend/style.css",
      "/login",
      "/dashboard",
      "/pages/website",
      "/pages/loan-enquiry",
      "/pages/linked-with-bot",
      "/tables/regular-tables",
      "/components/icons",
      "/maps/google-maps",
      "/home",
      "/interact",
      "/api/duffer_text_query",
      "/api/duffer_event_query",
      "/webhook/",
      "/webviews/webview",
      "/webviews/save",
    ],
  });
}
