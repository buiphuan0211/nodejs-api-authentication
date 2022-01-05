const crypto = require('crypto');

//Generate key để sử dụng cho accessToken và refreshToken
const key1 = crypto.randomBytes(32).toString('hex');
const key2 = crypto.randomBytes(32).toString('hex');

console.table({key1, key2})
// node helpers/generate_key -> run file để lấy key