// create token
export const getToken = async (user: any) => {
  //   let payload = {
  //     id: user._id,
  //     email: user.email,
  //     role: user.role,
  //   };
  const token = user.getJWTToken();
  return token;
};
