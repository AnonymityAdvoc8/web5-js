import { Web5 } from '@continuum5/api';
import { DidJwk, DidDht, BearerDid } from '@continuum5/dids';
import { Web5UserAgent } from '@continuum5/user-agent';
import { DwnRegistrar, Oidc } from '@continuum5/agent';
import { storage } from './helpers.mjs';

export function getUserDidOptions() {
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

async function createAndExportDid() {
  let did;
  console.log('createAndExportDid started');
  // Creating a DID using DidDht (you can use DidJwk if needed, just change the method)
  did = await DidDht.create({ options: getUserDidOptions() });

  // Exporting the DID (portable version)
  const exportedDid = await did.export();
  console.log('createAndExportDid finished');
  return exportedDid;
}

// Import and use the portable DID
async function importAndUsePortableDid(storedDid) {
  console.log('importAndUsePortableDid started');
  let agentDid;
  try {
    agentDid = await BearerDid.import({ portableDid: storedDid });
  } catch (error) {
    console.error('Error importing DID:', error);
    return;
  }
  console.log('importAndUsePortableDid finished');
  return agentDid;
}

// Function to initialize and return the Web5 agent
async function createWeb5Agent(storedDid) {
  console.log('createWeb5Agent started');
  let agentDid;
  try {
    agentDid = await BearerDid.import({ portableDid: storedDid });
    // console.log('Imported DID:', agentDid.uri);
  } catch (error) {
    console.error('Error importing DID:', error);
    return;
  }

  let agent;
  try {
    agent = await Web5UserAgent.create({ agentDid });
    console.log('Web5 agent created and ready to interact with DWN');
  } catch (error) {
    console.error('Error creating Web5 agent:', error);
    return;
  }

  const web5Instance = new Web5({
    agent,
    connectedDid: agentDid.uri,
    sync: '5s',
    techPreview: {
      dwnEndpoints: ['http://localhost:3000'],
    },
  });
  // Call registerEndpoints here after creating the Web5 instance
  await registerEndpoints(
    web5Instance,
    agentDid.uri,
    ['http://localhost:3000'],
    {
      onSuccess() {
        console.log('DWN endpoints successfully registered.');
      },
      onFailure(error) {
        console.error('Failed to register DWN endpoints:', error);
      },
    }
  );

  console.log('createWeb5Agent finished');
  return web5Instance;
}

// Register endpoints function
async function registerEndpoints(
  web5Instance,
  did,
  dwnEndpoints = [],
  registration
) {
  try {
    for (const endpoint of dwnEndpoints) {
      const serverInfo = await web5Instance.agent.rpc.getServerInfo(endpoint);

      if (serverInfo.registrationRequirements.length === 0) {
        continue;
      }

      await DwnRegistrar.registerTenant(endpoint, did);
      // await DwnRegistrar.registerTenant(endpoint, identityDidUri);
    }

    if (registration && typeof registration.onSuccess === 'function') {
      registration.onSuccess();
    }
  } catch (error) {
    if (registration && typeof registration.onFailure === 'function') {
      registration.onFailure(error);
    }
  }
}

async function storeDataOnDWN(web5Instance) {
  try {
    console.log('storeDataOnDWN started');
    const { record } = await web5Instance.dwn.records.create({
      data: {
        content: 'Hello Web5s',
        description: 'Keep Building!',
      },
      message: { dataFormat: 'application/json' },
    });

    const response = await web5Instance.dwn.records.query({
      message: {
        filter: {
          dataFormat: 'application/json',
        },
      },
    });

    if (response.status.code === 200 && response.records.length > 0) {
      response.records.forEach(async (record) => {
        console.log(
          `recordID: ${record._recordId}=> `,
          await record.data.text()
        );
      });
      console.log('storeDataOnDWN finished');
    } else {
      console.log('error while posting record or no records found');
    }
  } catch (error) {
    console.error('Error storing data on DWN:', error);
  }
}

// Call the function to create and export the DID
const exportedDid = await createAndExportDid();

// Call the function to import and use the DID
importAndUsePortableDid(exportedDid);

// Call the function to create the Web5 agent
createWeb5Agent(exportedDid)
  .then(async (web5Instance) => {
    if (web5Instance) {
      let record_id = await storeDataOnDWN(web5Instance);
    }
  })
  .catch((err) => {
    console.log('createWeb5Agent', err);
  });
