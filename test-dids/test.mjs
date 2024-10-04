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

const storage = {
  get: (key, _default) => {
    const data = JSON.parse(fs.readFileSync(storageFilePath, 'utf-8') || '{}');
    let value = data['web5:' + key];
    if (value) return value;
    if (_default !== undefined) {
      storage.set(key, _default);
      return _default;
    }
  },
  set: (key, value) => {
    let data = JSON.parse(fs.readFileSync(storageFilePath, 'utf-8') || '{}');
    data['web5:' + key] = value;
    fs.writeFileSync(storageFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return value;
  },
  modify: (key, fn) => {
    const value = storage.get(key);
    return storage.set(key, fn(value));
  }
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
      }
    ],
    verificationMethods: [
      {
        algorithm: 'Ed25519',
        id: 'sig',
        purposes: ['assertionMethod', 'authentication']
      },
      {
        algorithm: 'secp256k1',
        id: 'enc',
        purposes: ['keyAgreement']
      }
    ]
  };
}

async function registerEndpoints(agent, identity, dwnEndpoints = [], registration) {
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
  if (!exists) {
    let identity = await agent.identity.import({ portableIdentity });
    if (manage) {
      return await agent.identity.manage({ portableIdentity });
    }
    return identity;
  }
}

export const DWeb = {
  storage,
  async initialize(options = {}) {
    return initialize || (initialize = new Promise(async (resolve) => {
      let did = storage.get('agentDid');
      if (!did) {
        if (options.portableAgent !== false) {
          did = await DidDht.create({
            options: getUserDidOptions(options.dwnEndpoints)
          });
        } else {
          did = await DidJwk.create({
            options: {
              algorithm: 'Ed25519'
            }
          });
        }
        did = await did.export();
        storage.set('agentDid', did);
      }
      let agentDid = await BearerDid.import({ portableDid: did });
      const agent = DWeb.agent = await Web5UserAgent.create({ agentDid });
      agent.sync.startSync({ interval: options.syncInterval || '2m' }).catch((error) => {
        console.error(`Sync failed: ${error}`);
      });
      resolve(DWeb.agent);
    }));
  },
  did: {
    async update(identity, modifier) {
      if (!modifier) throw 'You must pass in a function that modifies a copy of the DID Document, or an already modified DID Document.';
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
    }
  },
  identity: {
    async create(options = {}) {
      const agent = await getAgent();
      const dwnEndpoints = ['http://localhost:3000'];
      const identity = await agent.identity.create({
        didMethod: options.method || 'dht',
        metadata: { name: 'Default' },
        didOptions: getUserDidOptions(dwnEndpoints)
      });
      if (options.cache !== false) {
        await agent.identity.manage({ portableIdentity: await identity.export() });
      }
      if (dwnEndpoints) {
        const registration = {
            onSuccess: () => console.log('DID successfully registered with DWN.'),
            onFailure: (error) => console.error('Failed to register DID with DWN:', error)
          };
        await registerEndpoints(agent, identity, dwnEndpoints, registration)
          .catch((e) => console.log('Endpoint registration failed: ', e));
          console.log("registerEndpoints Successful: ", dwnEndpoints);
      }
      return identity;
    },
    async list() {
      const agent = await getAgent();
      return agent.identity.list();
    },
    async get(uri) {
      const identities = await this.list();
      return identities.find(identity => identity.did.uri === uri);
    }
  },
  async use(identity, options = {}) {
    const uri = identity?.metadata?.uri || identity?.uri || identity;
    let instance = instances[uri];
    if (instance) return instance;
    const agent = await getAgent();
    const entry = await DWeb.identity.get(uri);
    if (!entry) {
      await agent.identity.manage({ portableIdentity: await getPortableDid(identity) });
    }
    instance = new Web5({
      agent: agent,
      connectedDid: uri
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
  }
};


(async () => {
    const agent = await DWeb.initialize();
    console.log('Web5 agent initialized:', agent);
  
    const newIdentity = await DWeb.identity.create();
    console.log('Created new identity:', newIdentity);
  
    const identity = await DWeb.identity.get(newIdentity.did.uri);
    console.log('Fetched identity:', identity);

    const web5Instance = await DWeb.use(identity);

    const { record } = await web5Instance.dwn.records.create({
        data: {
          content: 'Hello Web5',
          description: 'Keep Building!',
        },
        message: { published: true, dataFormat: 'application/json' },
      });
      
      const response = await web5Instance.dwn.records.query({
        message: {
          filter: {
            dataFormat: 'application/json',
          },
        },
      });
      
      if (response.status.code === 200) {
        response.records.forEach(async (record) => {
          console.log(`recordID: ${record._recordId}=> `, await record.data.text());
        });
    }
  })();