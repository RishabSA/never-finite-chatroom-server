const logger = require("../services/logService");
const CryptoJS = require("crypto-js");

const passphrase = CryptoJS.enc.Hex.parse(
  "rfNbQyjptsiJDUg4jppiBJRn4yUJmBTaYTovazF5ZRKx0czg7pOmPGf35CQF23TiAR9Em6eEaP4Zt7EMl3SaJJsicd6dV4ixZzBwQt6pI2Pl43PuxWw7loWLoFlTT8sv"
);

var iv = CryptoJS.enc.Hex.parse(
  "EqtlTtRnDZE70iVRCe8I0TWTHcxxHIPqMQLdCIl3nwMGOagjbJ8tNvPNrFiLtUN9scLA0pn0iPPzkURIGtOC8poj8Y2ydfRaPROUTjr9Sz2TnxmKKNuUb4VbkV1QDKoN"
);

const encrypt = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, passphrase, { iv }).toString();
  } catch (error) {
    logger.log(error);
  }
};

const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase, { iv });
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
