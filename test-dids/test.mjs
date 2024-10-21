import { Web5 } from '@web5/api';
import { DidJwk, DidDht, BearerDid } from '@web5/dids';
import { DwnRegistrar } from '@web5/agent';
import { Web5UserAgent } from '@web5/user-agent';
import fs from 'fs';
import fetch from 'node-fetch';

let initialize;
const instances = {};
const didLabelRegex = /(?:[^@]*@)?(did:[a-z0-9]+:[a-zA-Z0-9-]+)/;

const storageFilePath = './storage.json';
const storageIdentityFilePath = './storageIdentity.json';

const storage = {
  get: (key, _default) => {
    const data = JSON.parse(fs.readFileSync(storageFilePath, 'utf-8') || '{}');
    let value = data[key];
    if (value) return value;
    if (_default !== undefined) {
      storage.set(key, _default);
      return _default;
    }
  },
  set: (key, value) => {
    let data = JSON.parse(fs.readFileSync(storageFilePath, 'utf-8') || '{}');
    data[key] = value;
    fs.writeFileSync(storageFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return value;
  },
  modify: (key, fn) => {
    const value = storage.get(key);
    return storage.set(key, fn(value));
  },
};

const storageIdentity = {
  get: (key, _default) => {
    const data = JSON.parse(
      fs.readFileSync(storageIdentityFilePath, 'utf-8') || '{}'
    );
    let value = data[key];
    if (value) return value;
    if (_default !== undefined) {
      storageIdentity.set(key, _default);
      return _default;
    }
  },
  set: (key, value) => {
    let data = JSON.parse(
      fs.readFileSync(storageIdentityFilePath, 'utf-8') || '{}'
    );
    data[key] = value;
    fs.writeFileSync(
      storageIdentityFilePath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    return value;
  },
  modify: (key, fn) => {
    const value = storageIdentity.get(key);
    return storageIdentity.set(key, fn(value));
  },
};

function getUserDidOptions(endpoints) {
  return {
    services: [
      {
        id: 'dwn',
        type: 'DecentralizedWebNode',
        serviceEndpoint: ['http://localhost:3000'],
        enc: '#enc',
        sig: '#sig',
      },
    ],
    verificationMethods: [
      {
        algorithm: 'Ed25519',
        id: 'sig',
        purposes: ['assertionMethod', 'authentication'],
      },
      {
        algorithm: 'secp256k1',
        id: 'enc',
        purposes: ['keyAgreement'],
      },
    ],
  };
}

async function registerEndpoints(
  agent,
  identity,
  dwnEndpoints = [],
  registration
) {
  try {
    for (const endpoint of dwnEndpoints) {
      const serverInfo = await agent.rpc.getServerInfo(endpoint);
      if (serverInfo.registrationRequirements.length === 0) {
        continue;
      }
      // Register agent DID
      await DwnRegistrar.registerTenant(endpoint, agent.agentDid.uri);
      // Register connected Identity DID
      await DwnRegistrar.registerTenant(endpoint, identity.did.uri);
    }
    registration.onSuccess();
  } catch (error) {
    registration.onFailure(error);
  }
}

async function getAgent() {
  return DWeb.initialize({ portableAgent: false });
}

async function getPortableDid(identity) {
  return identity?.export?.() || identity;
}

async function importIdentity(agent, portableIdentity, manage = false) {
  const uri = portableIdentity?.portableDid?.uri;
  let exists = await agent.identity.get({ didUri: uri });
  console.log('exists=>', exists);
  if (!exists) {
    let identity = await agent.identity.import({ portableIdentity });
    return identity;
  }

  console.log('PORTABLE IDENTITY ALREADY EXISTS');
  return { exists, sync: false };
}

export const DWeb = {
  storage,
  storageIdentity,
  async initialize(options = {}) {
    return (
      initialize ||
      (initialize = new Promise(async (resolve) => {
        let did = storage.get('agentDid');
        if (!did) {
          if (options.portableAgent !== false) {
            did = await DidDht.create({
              options: getUserDidOptions(options.dwnEndpoints),
            });
          } else {
            did = await DidJwk.create({
              options: {
                algorithm: 'Ed25519',
              },
            });
          }
          did = await did.export();
          console.log('did==>', did);
          storage.set('agentDid', did);
        }
        let agentDid = await BearerDid.import({ portableDid: did });
        const agent = (DWeb.agent = await Web5UserAgent.create({ agentDid }));
        agent.sync.startSync({ interval: '5s' }).catch((error) => {
          console.error(`Sync failed: ${error}`);
        });
        resolve(DWeb.agent);
      }))
    );
  },
  did: {
    async update(identity, modifier) {
      if (!modifier)
        throw 'You must pass in a function that modifies a copy of the DID Document, or an already modified DID Document.';
      if (typeof identity === 'string') {
        const agent = await getAgent();
        identity = await agent.identity.get({ didUri: identity });
      }
      let currentDoc = identity.did.document;
      let updatedDoc = modifier;
      if (typeof modifier === 'function') {
        updatedDoc = structuredClone(identity.did.document);
        await modifier(updatedDoc);
      }
      identity.did.document = updatedDoc;
      try {
        const result = await DidDht.publish({ did: identity.did });
        return result;
      } catch (e) {
        identity.did.document = currentDoc;
        throw 'Failed to update DID Document';
      }
    },
  },
  identity: {
    async create(options = {}) {
      const agent = await getAgent();
      const dwnEndpoints = ['http://localhost:3000'];
      const identity = await agent.identity.create({
        didMethod: options.method || 'dht',
        metadata: { name: 'Default' },
        didOptions: getUserDidOptions(dwnEndpoints),
      });
      if (options.cache !== false) {
        await agent.identity.manage({
          portableIdentity: await identity.export(),
        });
      }
      if (options.register !== false && dwnEndpoints) {
        const registration = {
          onSuccess: () => console.log('DID successfully registered with DWN.'),
          onFailure: (error) =>
            console.error('Failed to register DID with DWN:', error),
        };
        await registerEndpoints(
          agent,
          identity,
          dwnEndpoints,
          registration
        ).catch((e) => console.log('Endpoint registration failed: ', e));
        console.log('registerEndpoints Successful: ', dwnEndpoints);
      }
      return identity;
    },
    async list() {
      const agent = await getAgent();
      return agent.identity.list();
    },
    async get(uri) {
      const identities = await this.list();
      return identities.find((identity) => identity.did.uri === uri);
    },
    async backup(identity) {
      const portableDid = await getPortableDid(identity);
      storageIdentity.set('identity', portableDid);
    },
  },

  async use(identity, options = {}) {
    console.log('identity: ==>', identity);
    const uri =
      identity?.metadata?.connectedDid ||
      identity?.did?.uri ||
      identity?.uri ||
      identity;
    console.log('uri==>', uri);
    let instance = instances[uri];
    if (instance) return instance;
    const agent = await getAgent();
    const entry = await DWeb.identity.get(uri);
    console.log('entry==>', entry);
    if (!entry) {
      await agent.identity.manage({
        portableIdentity: await getPortableDid(identity),
      });
    }
    instance = new Web5({
      agent: agent,
      connectedDid: uri,
    });
    instances[uri] = instance;
    if (options.sync !== false) {
      await agent.sync.registerIdentity({ did: uri });
    }
    return instance;
  },
  dispose(instance) {
    (instance?.agent || instance).sync.stopSync();
    delete instances[instance.connectedDid];
  },
};

// (async () => {
//   const agent = await DWeb.initialize();
//   console.log('Web5 agent initialized:', agent);

//   const newIdentity = await DWeb.identity.create();
//   console.log('Created new identity:', newIdentity);

//   const identity = await DWeb.identity.get(newIdentity.did.uri);
//   console.log('Fetched identity:', identity);

//   const web5Instance = await DWeb.use(identity);

//   const { record } = await web5Instance.dwn.records.create({
//     data: {
//       content: 'Hello Web5',
//       description: 'Keep Building!',
//     },
//     message: { published: true, dataFormat: 'application/json' },
//   });

//   const response = await web5Instance.dwn.records.query({
//     message: {
//       filter: {
//         dataFormat: 'application/json',
//       },
//     },
//   });

//   if (response.status.code === 200) {
//     response.records.forEach(async (record) => {
//       console.log(`recordID: ${record._recordId}=> `, await record.data.text());
//     });
//   }
// })();

///NOT WORKING SYNC MOT HAPENING???????
(async () => {
  // Initialize the Web5 agent
  const agent = await DWeb.initialize();

  // Check if an identity exists in storage
  let storedIdentity = DWeb.storageIdentity.get('identity');
  let newIdentity;
  let web5Instance;
  if (storedIdentity) {
    console.log('Found stored identity:');
    console.log('storedIdentity==>', storedIdentity);
    const oldIdentity = await importIdentity(agent, storedIdentity, true);
    console.log('oldIdentity', oldIdentity);
    if (oldIdentity.sync === false) {
      console.log('Here');
      web5Instance = await DWeb.use(oldIdentity.exists, { sync: false });
    } else {
      web5Instance = await DWeb.use(oldIdentity);
    }
  } else {
    // Create a new identity if none exists in storage
    newIdentity = await DWeb.identity.create();
    console.log('Stored Identity NOT FOUND, Created new identity:');
    // Store the new identity in storage for future use
    // DWeb.storage.set('identity', { didUri: newIdentity.did.uri });
    await DWeb.identity.backup(newIdentity);
    web5Instance = await DWeb.use(newIdentity);
  }

  console.log('Using identity:');

  // Use the identity with the Web5 instance

  // Create a new record on the Decentralized Web Node (DWN)
  const { record } = await web5Instance.dwn.records.create({
    data: {
      content: 'Hello Web5',
      description: 'Keep Building!',
    },
    message: { published: true, dataFormat: 'application/json' },
  });

  // Query records from the DWN
  const response = await web5Instance.dwn.records.query({
    message: {
      filter: {
        dataFormat: 'application/json',
      },
    },
  });

  // If the query was successful, print out the records
  if (response.status.code === 200) {
    response.records.forEach(async (record) => {
      console.log(`recordID: ${record._recordId} =>`, await record.data.text());
    });
  }
})();