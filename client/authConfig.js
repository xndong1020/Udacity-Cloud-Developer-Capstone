const baseAuthObj = {
  domain: "bbxit.au.auth0.com",
  clientID: "tpR1o6tgQ36fokctTUjAiOqkZjuanScu",
};

const mode = process.env.NODE_ENV;
console.log("mode", mode);

export const authConfig =
  mode === "development"
    ? {
        ...baseAuthObj,
        callbackUrl: "http://localhost:3000/callback",
        logoutUrl: "http://localhost:3000/",
      }
    : {
        ...baseAuthObj,
        callbackUrl:
          "http://my-cloud-dev-s3.s3-website-us-west-2.amazonaws.com/callback",
        logoutUrl: "http://localhost:3000/",
      };
