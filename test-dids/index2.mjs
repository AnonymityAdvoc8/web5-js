import { Web5 } from '@web5/api';
import { DidJwk, DidDht, BearerDid } from '@web5/dids';
import { Web5UserAgent } from '@web5/user-agent';
import { DwnRegistrar, Oidc } from '@web5/agent';
import { Convert } from '@web5/common';
import { storage } from './helpers.js'; 

async function createAndExportDid() {
    let did;
    
    // Creating a DID using DidDht (you can use DidJwk if needed, just change the method)
    did = await DidDht.create({
      options: {
        method: 'dht',  // This can be changed to 'jwk' if you want to use DidJwk instead.
        algorithm: 'Ed25519'  // You can specify the cryptographic algorithm here (for DidJwk).
      }
    });
  
    // Exporting the DID (portable version)
    const exportedDid = await did.export();
    
    // Optionally, save the DID in storage (replace with your storage mechanism)
    storage.set('createdDid', exportedDid);
  
    // Output to console for now
    console.log('DID Created: ', exportedDid);
  
    return exportedDid;
  }

// Import and use the portable DID
async function importAndUsePortableDid() {
    // Retrieve the stored portable DID from storage
    const storedDid = storage.get('createdDid');
    
    if (!storedDid) {
      console.error('No portable DID found in storage.');
      return;
    }
  
    // Import the DID using BearerDid (or whichever DID method you used)
    let agentDid;
    try {
      agentDid = await BearerDid.import({ portableDid: storedDid });
      console.log('Imported DID:', agentDid);
    } catch (error) {
      console.error('Error importing DID:', error);
      return;
    }
  
    // Optionally, you can start using the DID for further operations
    console.log('DID is now imported and ready for use:',  agentDid.uri);
  
    // Example: You could now perform actions with the imported DID
    // E.g., interact with the agent, sign messages, etc.
    return agentDid;
  }
  
// Function to initialize and return the Web5 agent
async function createWeb5Agent() {
    const storedDid = storage.get('createdDid');
    
    if (!storedDid) {
      console.error('No portable DID found in storage.');
      return;
    }
  
    let agentDid;
    try {
      agentDid = await BearerDid.import({ portableDid: storedDid });
      console.log('Imported DID:', agentDid.uri);
    } catch (error) {
      console.error('Error importing DID:', error);
      return;
    }
  
    let agent;
    try {
      agent = await Web5UserAgent.create({ agentDid});
      console.log('Web5 agent created and ready to interact with DWN');
    } catch (error) {
      console.error('Error creating Web5 agent:', error);
      return;
    }

    const web5Instance = new Web5({
        agent,
        connectedDid: agentDid.uri,
        sync: '5s',
        registration: {
            onFailure(error) {
              console.log('Registration failed', error);
              // Registration failed, display an error message to the user, and pass in the registration object again to retry next time the user connects.
            },
            async onSuccess() {
              console.log('Registration succeeded');
            },
          },
        techPreview: {
            dwnEndpoints: ["http://localhost:3000"]
        }
    });
    // Call registerEndpoints here after creating the Web5 instance
    await registerEndpoints(web5Instance, ['http://localhost:3000'], {
      onSuccess() {
        console.log('DWN endpoints successfully registered.');
      },
      onFailure(error) {
        console.error('Failed to register DWN endpoints:', error);
      },
    });

    console.log('Web5 instance created and ready to interact with DWN:', web5Instance);
    
    return web5Instance;
  
  }

  // Register endpoints function
async function registerEndpoints(web5Instance, dwnEndpoints = [], registration) {
  try {
    const agentDidUri = web5Instance.agent.did.uri;
    const identityDidUri = web5Instance.connectedDid;

    for (const endpoint of dwnEndpoints) {
      const serverInfo = await web5Instance.agent.rpc.getServerInfo(endpoint);

      if (serverInfo.registrationRequirements.length === 0) {
        continue;
      }

      await DwnRegistrar.registerTenant(endpoint, agentDidUri);
      await DwnRegistrar.registerTenant(endpoint, identityDidUri);
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

  async function storeDataOnDWN(web5Instance, data) {
    try {
        const { record } = await web5Instance.dwn.records.create({
            data,
            message: {
                dataFormat: 'application/json',
            },
        });
        return record
    } catch (error) {
      console.error('Error storing data on DWN:', error);
    }
  }

// Call the function to create and export the DID
createAndExportDid();
  
// Call the function to import and use the DID
importAndUsePortableDid();

// Call the function to create the Web5 agent
createWeb5Agent().then(async (web5Instance) => {
    if (web5Instance) {
        const data = { message: 'Hello from Web5!' };
        let record_id = await storeDataOnDWN(web5Instance, data);
        console.log(record_id);
      }
});