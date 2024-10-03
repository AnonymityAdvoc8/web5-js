import { DidContinuum, DidJwk, DidDht, BearerDid } from '@continuum5/dids';
import { Web5UserAgent } from '@web5/user-agent';
import { Web5 } from '@web5/api';

const portableDid = {
  uri: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
  document: {
    id: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
    verificationMethod: [
      {
        id: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#controller',
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller:
          'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
        blockchainAccountId:
          'eip155:10999:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
      },
      {
        id: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-4',
        type: 'JsonWebKey2020',
        controller:
          'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
        publicKeyHex:
          '7b226964223a226469643a636f6e74696e75756d3a3078326166373a30786339463039436466356539353539343336376237343532333431423643314631434563363942634123766572696669636174696f6e2d6b6579222c2274797065223a224a736f6e5765624b657932303230222c22636f6e74726f6c6c6572223a226469643a636f6e74696e75756d3a3078326166373a307863394630394364663565393535393433363762373435323334314236433146314345633639426341222c227075626c69634b65794a776b223a7b226b7479223a224543222c22637276223a22736563703235366b31222c2278223a223851666368596c5a596354346235483079386a437953574337446469736757457a734b7355515a5a366767222c2279223a223935434c4e646165695056426b764e30574c4a7067534e53525a334b6b5132635a5477435637674c2d356f227d7d',
      },
      {
        id: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-5',
        type: 'Secp256k1',
        controller:
          'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
        publicKeyHex:
          '7b226964223a226469643a636f6e74696e75756d3a3078326166373a30786339463039436466356539353539343336376237343532333431423643314631434563363942634123766572696669636174696f6e2d6b6579222c2274797065223a224a736f6e5765624b657932303230222c22636f6e74726f6c6c6572223a226469643a636f6e74696e75756d3a3078326166373a307863394630394364663565393535393433363762373435323334314236433146314345633639426341222c227075626c69634b65794a776b223a7b226b7479223a224543222c22637276223a22736563703235366b31222c2278223a223851666368596c5a596354346235483079386a437953574337446469736757457a734b7355515a5a366767222c2279223a223935434c4e646165695056426b764e30574c4a7067534e53525a334b6b5132635a5477435637674c2d356f227d7d',
      },
    ],
    authentication: [
      'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#controller',
    ],
    assertionMethod: [
      'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#controller',
      'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-4',
      'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-5',
    ],
    service: [
      {
        id: 'dwn',
        type: 'DecentralizedWebNode',
        serviceEndpoint: ['http://localhost:3000'],
        enc: '#enc',
        sig: '#sig',
      },
      {
        id: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#service-4',
        type: 'CredentialServiceTest',
        serviceEndpoint: {
          id: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#verification-key',
          type: 'JsonWebKey2020',
          controller:
            'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
          publicKeyJwk: {
            kty: 'EC',
            crv: 'secp256k1',
            x: '8QfchYlZYcT4b5H0y8jCySWC7DdisgWEzsKsUQZZ6gg',
            y: '95CLNdaeiPVBkvN0WLJpgSNSRZ3KkQ2cZTwCV7gL-5o',
          },
        },
      },
    ],
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
      'https://w3id.org/security/v3-unstable',
    ],
  },
  metadata: {
    tenant: 'did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA',
  },
  privateKeys: [
    {
      kty: 'EC',
      crv: 'secp256k1',
      x: '8QfchYlZYcT4b5H0y8jCySWC7DdisgWEzsKsUQZZ6gg',
      y: '95CLNdaeiPVBkvN0WLJpgSNSRZ3KkQ2cZTwCV7gL-5o',
      d: '_XHEdR2QIcafdih2_-vBh_1ImBIscjX_iWoW3nx_sGE',
    },
  ],
};

// const portableDidJWK=
// {
//   uri: 'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6InhlMEctMDhhVVkyMkdIWlNJX2o3MkJVV0k0R2d5dndzbkZId0w3N1RoTmciLCJraWQiOiJSUTl4WlEta0ZoWVczOUQ5VjF1RjlTbF9ZakZLaTZaT09FLWc2ejd0RWpzIiwiYWxnIjoiRWREU0EifQ',
//   document: {
//     '@context': [ 'https://www.w3.org/ns/did/v1' ],
//     id: 'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6InhlMEctMDhhVVkyMkdIWlNJX2o3MkJVV0k0R2d5dndzbkZId0w3N1RoTmciLCJraWQiOiJSUTl4WlEta0ZoWVczOUQ5VjF1RjlTbF9ZakZLaTZaT09FLWc2ejd0RWpzIiwiYWxnIjoiRWREU0EifQ',
//     verificationMethod: [ [Object] ],
//     authentication: [
//       'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6InhlMEctMDhhVVkyMkdIWlNJX2o3MkJVV0k0R2d5dndzbkZId0w3N1RoTmciLCJraWQiOiJSUTl4WlEta0ZoWVczOUQ5VjF1RjlTbF9ZakZLaTZaT09FLWc2ejd0RWpzIiwiYWxnIjoiRWREU0EifQ#0'
//     ],
//     assertionMethod: [
//       'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6InhlMEctMDhhVVkyMkdIWlNJX2o3MkJVV0k0R2d5dndzbkZId0w3N1RoTmciLCJraWQiOiJSUTl4WlEta0ZoWVczOUQ5VjF1RjlTbF9ZakZLaTZaT09FLWc2ejd0RWpzIiwiYWxnIjoiRWREU0EifQ#0'
//     ],
//     capabilityInvocation: [
//       'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6InhlMEctMDhhVVkyMkdIWlNJX2o3MkJVV0k0R2d5dndzbkZId0w3N1RoTmciLCJraWQiOiJSUTl4WlEta0ZoWVczOUQ5VjF1RjlTbF9ZakZLaTZaT09FLWc2ejd0RWpzIiwiYWxnIjoiRWREU0EifQ#0'
//     ],
//     capabilityDelegation: [
//       'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6InhlMEctMDhhVVkyMkdIWlNJX2o3MkJVV0k0R2d5dndzbkZId0w3N1RoTmciLCJraWQiOiJSUTl4WlEta0ZoWVczOUQ5VjF1RjlTbF9ZakZLaTZaT09FLWc2ejd0RWpzIiwiYWxnIjoiRWREU0EifQ#0'
//     ],
//     keyAgreement: [
//       'did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6InhlMEctMDhhVVkyMkdIWlNJX2o3MkJVV0k0R2d5dndzbkZId0w3N1RoTmciLCJraWQiOiJSUTl4WlEta0ZoWVczOUQ5VjF1RjlTbF9ZakZLaTZaT09FLWc2ejd0RWpzIiwiYWxnIjoiRWREU0EifQ#0'
//     ]
//   },
//   metadata: {},
//   keyManager: LocalKeyManager {
//     _algorithmInstances: Map(1) {
//       [class EdDsaAlgorithm extends CryptoAlgorithm] => EdDsaAlgorithm {}
//     },
//     _keyStore: MemoryStore { store: [Map] }
//   }
// }

const didJWK = await DidDht.create({
  options: {
    algorithm: 'Ed25519',
  },
});
console.log('didJWK', didJWK);
const didTest = await didJWK.export();
console.log('didTest', didTest);
// const continuumKeyManager = await DidContinuum.create();
// console.log('continuumKeyManager', continuumKeyManager);
// let agentDid = await BearerDid.import({
//   portableDid: { ...portableDid, keyManager: continuumKeyManager },
// });

let agentDid = await BearerDid.import({
  portableDid: didTest,
});

console.log(agentDid);
let userAgent;
try {
  userAgent = await Web5UserAgent.create();
  console.log(userAgent);
} catch (err) {
  console.log('userAgent err', err);
}

const { web5, did } = await Web5.connect({
  sync: '5s',
  agent: userAgent,
  connectedDid: portableDid.uri,
  techPreview: {
    dwnEndpoints: ['http://localhost:3000'],
  },
  registration: {
    onFailure(error) {
      console.log('Registration failed', error);
      // Registration failed, display an error message to the user, and pass in the registration object again to retry next time the user connects.
    },
    async onSuccess() {
      console.log('Registration succeeded');
    },
  },
});
console.log('DID', did);
console.log('web5', web5);
// Create a JSON record
// try {
//   const { record } = await web5.dwn.records.create({
//     data: {
//       content: 'Hello Web5',
//       description: 'Keep Building!',
//     },
//     message: {
//       dataFormat: 'application/json',
//     },
//   });
//   console.log('record', record);
// } catch (err) {
//   console.log('err', err);
// }
// console.log('web5:', web5);
// console.log('did:', did);
