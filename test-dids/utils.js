import { createHash, randomBytes } from 'crypto';

// Function to hash an input array and return the hash as a hex string
export function hashAsHexString(input) {
  const hash = createHash('sha256');
  for (const item of input) {
    if (item !== undefined) {
      // Ensure item is not undefined
      hash.update(String(item)); // Convert item to string if it's not already
    }
  }
  return hash.digest('hex');
}

// Function to find a qualified response nonce
export function findQualifiedResponseNonce(
  maximumAllowedHashValue,
  challengeNonce,
  requestData
) {
  const startTime = Date.now();

  // Ensure the maximumAllowedHashValue is a string and convert it to BigInt
  const maximumAllowedHashValueAsBigInt = BigInt(
    `0x${maximumAllowedHashValue}`
  );

  let iterations = 1;
  let randomNonce;
  let qualifiedSolutionNonceFound = false;

  // Loop to find a qualified nonce
  do {
    randomNonce = generateNonce();
    const computedHash = computeHash(challengeNonce, randomNonce, requestData);
    const computedHashAsBigInt = BigInt(`0x${computedHash}`);

    // Check if the computed hash is within the allowed range
    qualifiedSolutionNonceFound =
      computedHashAsBigInt <= maximumAllowedHashValueAsBigInt;

    iterations++;
  } while (!qualifiedSolutionNonceFound);

  // Log the final/successful iteration and time elapsed
  console.log(
    `iterations: ${iterations}, time lapsed: ${Date.now() - startTime} ms`
  );

  return randomNonce;
}

// Function to generate a nonce
function generateNonce() {
  const hexString = randomBytes(32).toString('hex').toUpperCase();
  return hexString;
}

// Function to compute a hash from the input values
export function computeHash(challengeNonce, responseNonce, requestData) {
  const hashInput = [challengeNonce, responseNonce, requestData];
  return hashAsHexString(hashInput);
}

// Static method to verify the response nonce
export function verifyResponseNonce(input) {
  const {
    maximumAllowedHashValue,
    challengeNonce,
    responseNonce,
    requestData,
  } = input;
  const computedHash = computeHash(challengeNonce, responseNonce, requestData);
  const computedHashAsBigInt = BigInt(`0x${computedHash}`);

  if (computedHashAsBigInt > maximumAllowedHashValue) {
    throw new Error(
      `Insufficient computed hash ${computedHashAsBigInt}, needs to be <= ${maximumAllowedHashValue}.`
    );
  }
}

// Function to check if a string is a valid HEX string
export function isHexString(str) {
  const regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(str);
}

export const configureProtocol = async (protocolDefinition, web5) => {
  // query the list of existing protocols on the DWN
  const { protocols, status } = await web5.dwn.protocols.query({
    message: {
      filter: {
        protocol: protocolDefinition.protocol,
      },
    },
  });

  if (status.code !== 200) {
    alert('Error querying protocols');
    console.error('Error querying protocols', status);
    return;
  }

  // if the protocol already exists, we return
  if (protocols.length > 0) {
    console.log('Protocol already exists');
    return;
  }

  // configure protocol on local DWN
  const { status: configureStatus, protocol } =
    await web5.dwn.protocols.configure({
      message: {
        definition: protocolDefinition,
      },
    });

  console.log('Protocol configured', configureStatus);
  console.log();
};
