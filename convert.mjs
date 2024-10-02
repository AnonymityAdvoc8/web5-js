import * as jose from 'jose';
import * as crypto from 'crypto';

  // Function to convert a secp256k1 private key (hex) to JWK
async function convertSecp256k1PrivateKeyToJwk(privateKeyHex) {
  // Ensure the private key is in the correct format (remove '0x' if present)
  const hexKey = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;

  // Decode the hex string into a buffer
  const privateKeyBuffer = Buffer.from(hexKey, 'hex');

  // Generate public key from the private key
  const ecdh = crypto.createECDH('secp256k1');
  ecdh.setPrivateKey(privateKeyBuffer);
  const publicKeyBuffer = ecdh.getPublicKey();

  // Extract public key X and Y coordinates from the uncompressed public key
  const x = publicKeyBuffer.slice(1, 33).toString('base64url'); // X coordinate
  const y = publicKeyBuffer.slice(33).toString('base64url'); // Y coordinate
  const d = privateKeyBuffer.toString('base64url'); // Private key

  // Construct the JWK manually
  const jwk = {
    kty: 'EC',
    crv: 'secp256k1',
    x: x,
    y: y,
    d: d,
    alg: 'ES256K', // Algorithm used with secp256k1 curve
    use: 'sig', // Usage: Signature
  };

  return jwk;
}


// Example usage
const privateKeyHex = 'fd71c4751d9021c69f762876ffebc187fd4898122c7235ff896a16de7c7fb061'; // Replace with your private key
convertSecp256k1PrivateKeyToJwk(privateKeyHex).then((jwk) => {
  console.log('JWK:', jwk);
}).catch((err) => {
  console.error('Error:', err);
});