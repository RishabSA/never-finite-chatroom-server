const logger = require("../services/logService");
const CryptoJS = require("crypto-js");

const passphrase =
  "LIKDJFHSUDrhiuweyrsiu45y08w37ykjDbDKGLSDKfhliau45yiubjHsldKLJDSFh";

const encrypt = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, passphrase).toString();
  } catch (error) {
    logger.log(error);
  }
};

const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    logger.log(error);
  }
};

module.exports = {
  encrypt,
  decrypt,
};
