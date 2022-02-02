const Sentry = require("@sentry/node");

function init() {
  Sentry.init({
    dsn: "https://a4dd9c4ee323453d9c42b34cb8d99e5a@o1101045.ingest.sentry.io/6134347",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

function log(error) {
  Sentry.captureException(error);
}

module.exports = {
  init,
  log,
};
