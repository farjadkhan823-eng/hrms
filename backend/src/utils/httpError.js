// small helper to create an error with a status code
module.exports = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};
