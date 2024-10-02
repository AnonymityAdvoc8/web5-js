import { DidContinuum, BearerDid } from "@continuum5/dids";
import { Web5UserAgent } from '@web5/user-agent';
import { Web5 } from '@web5/api';


const portableDid = {
    "uri": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA",
    "document": {
      "id": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA",
      "verificationMethod": [
          {
              "id": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#controller",
              "type": "EcdsaSecp256k1RecoveryMethod2020",
              "controller": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA",
              "blockchainAccountId": "eip155:10999:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA"
          },
          {
              "id": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-4",
              "type": "JsonWebKey2020",
              "controller": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA",
              "publicKeyHex": "7b226964223a226469643a636f6e74696e75756d3a3078326166373a30786339463039436466356539353539343336376237343532333431423643314631434563363942634123766572696669636174696f6e2d6b6579222c2274797065223a224a736f6e5765624b657932303230222c22636f6e74726f6c6c6572223a226469643a636f6e74696e75756d3a3078326166373a307863394630394364663565393535393433363762373435323334314236433146314345633639426341222c227075626c69634b65794a776b223a7b226b7479223a224543222c22637276223a22736563703235366b31222c2278223a223851666368596c5a596354346235483079386a437953574337446469736757457a734b7355515a5a366767222c2279223a223935434c4e646165695056426b764e30574c4a7067534e53525a334b6b5132635a5477435637674c2d356f227d7d"
          },
          {
              "id": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-5",
              "type": "Secp256k1",
              "controller": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA",
              "publicKeyHex": "7b226964223a226469643a636f6e74696e75756d3a3078326166373a30786339463039436466356539353539343336376237343532333431423643314631434563363942634123766572696669636174696f6e2d6b6579222c2274797065223a224a736f6e5765624b657932303230222c22636f6e74726f6c6c6572223a226469643a636f6e74696e75756d3a3078326166373a307863394630394364663565393535393433363762373435323334314236433146314345633639426341222c227075626c69634b65794a776b223a7b226b7479223a224543222c22637276223a22736563703235366b31222c2278223a223851666368596c5a596354346235483079386a437953574337446469736757457a734b7355515a5a366767222c2279223a223935434c4e646165695056426b764e30574c4a7067534e53525a334b6b5132635a5477435637674c2d356f227d7d"
          }
      ],
      "authentication": [
          "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#controller"
      ],
      "assertionMethod": [
          "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#controller",
          "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-4",
          "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#delegate-5"
      ],
      "service": [
          {
              "id": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#service-6",
              "type": "CredentialService",
              "serviceEndpoint": {
                  "id": "did:continuum:0x2af7:0xde0157fAa2233761F813d4585D2bdB9792476083",
                  "type": "VerifiableCredentialService",
                  "serviceEndpoint": "https://docs.cycurid.com"
              }
          },
          {
              "id": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#service-4",
              "type": "CredentialServiceTest",
              "serviceEndpoint": {
                  "id": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA#verification-key",
                  "type": "JsonWebKey2020",
                  "controller": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA",
                  "publicKeyJwk": {
                      "kty": "EC",
                      "crv": "secp256k1",
                      "x": "8QfchYlZYcT4b5H0y8jCySWC7DdisgWEzsKsUQZZ6gg",
                      "y": "95CLNdaeiPVBkvN0WLJpgSNSRZ3KkQ2cZTwCV7gL-5o"
                  }
              }
          }
      ],
      "@context": [
          "https://www.w3.org/ns/did/v1",
          "https://w3id.org/security/suites/secp256k1recovery-2020/v2",
          "https://w3id.org/security/v3-unstable"
      ]
    },
    "metadata": {
      "tenant": "did:continuum:0x2af7:0xc9F09Cdf5e95594367b7452341B6C1F1CEc69BcA"
    },
    "privateKeys": [
      {
        "kty": "EC",
        "crv": "secp256k1",
        x: '8QfchYlZYcT4b5H0y8jCySWC7DdisgWEzsKsUQZZ6gg',
        y: '95CLNdaeiPVBkvN0WLJpgSNSRZ3KkQ2cZTwCV7gL-5o',
        d: '_XHEdR2QIcafdih2_-vBh_1ImBIscjX_iWoW3nx_sGE',
      }
    ]
  }

//   // const portableDid = {
//   //   "uri": "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy",
//   //   "document": {
//   //     "id": "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy",
//   //     "verificationMethod": [
//   //       {
//   //         "id": "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy#0",
//   //         "type": "JsonWebKey",
//   //         "controller": "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy",
//   //         "publicKeyJwk": {
//   //           "crv": "Ed25519",
//   //           "kty": "OKP",
//   //           "x": "d8VImB22MD-Gdhmd9a46zPjWduLs7ovzRCBCDiibCB4",
//   //           "kid": "QFcKoi06TpLnyb8g_V2fgFcW-sMK3husMf_fhQZhEDg",
//   //           "alg": "EdDSA"
//   //         }
//   //       }
//   //     ],
//   //     "service": [
//   //       {
//   //         "id": "#dwn",
//   //         "type": "DecentralizedWebNode",
//   //         "serviceEndpoint": {
//   //           "messageAuthorizationKeys": ["#authz"],
//   //           "nodes": ["http://localhost:3000"],
//   //           "recordEncryptionKeys": ["#enc"]
//   //         }
//   //       }
//   //     ],
//   //     "authentication": [
//   //       "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy#0"
//   //     ],
//   //     "assertionMethod": [
//   //       "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy#0"
//   //     ],
//   //     "capabilityDelegation": [
//   //       "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy#0"
//   //     ],
//   //     "capabilityInvocation": [
//   //       "did:dht:q9nwtgy7saad9busdgq9mmt43uhpc7zn7uzezh4rrbbyhkr5byxy#0"
//   //     ]
//   //   },
//   //   "metadata": {
//   //     "published": true,
//   //     "versionId": "1727659675"
//   //   },
//   //   "privateKeys": [
//   //     {
//   //       "crv": "Ed25519",
//   //       "d": "Wwr2E7XISAX4A8aE7XjiR7nOD8UH50F4Z6sABrYmoSQ",
//   //       "kty": "OKP",
//   //       "x": "d8VImB22MD-Gdhmd9a46zPjWduLs7ovzRCBCDiibCB4",
//   //       "kid": "QFcKoi06TpLnyb8g_V2fgFcW-sMK3husMf_fhQZhEDg",
//   //       "alg": "EdDSA"
//   //     }
//   //   ]
//   // }

let agentDid = await BearerDid.import({ portableDid: portableDid });

// console.log(agentDid);

const userAgent = await Web5UserAgent.create({ agentDid });
// console.log(userAgent);

const { web5, did } = await Web5.connect({
    agent: userAgent,
    connectedDid: portableDid.uri,
    techPreview: {
      dwnEndpoints: ["http://localhost:3000"]
    }
});

// Create a JSON record
const { record } = await web5.dwn.records.create({
  data: {
  content: 'Hello Web5',
  description: 'Keep Building!',
  },
  message: {
  dataFormat: 'application/json',
  },
});
console.log("web5:", web5);
console.log("did:",did);
console.log("record:",record);



  


