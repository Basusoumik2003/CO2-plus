const identityService = require("./identity.service");
const tokenService = require("./token.service");

exports.handleOAuthLogin = async (provider, profile) => {
  const user = await identityService.resolveOAuthUser(provider, profile);
  return tokenService.issueTokens(user);
};
