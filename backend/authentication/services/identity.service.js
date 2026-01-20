const Identity = require("../models/userIdentityModel");
const User = require("../models/userModel");

exports.resolveOAuthUser = async (provider, profile) => {
  const { id, email, name } = profile;

  let identity = await Identity.findByProvider(provider, id);
  if (identity) {
    return await User.findById(identity.user_id);
  }

  let user = await User.findByEmail(email);
  if (!user) {
    user = await User.createOAuthUser({ email, username: name });
  }

  await Identity.create({
    user_id: user.id,
    provider,
    provider_user_id: id,
    email,
    is_verified: true,
    metadata: profile
  });

  return user;
};
