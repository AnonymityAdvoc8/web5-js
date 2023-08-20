import chai, { expect } from 'chai';
import { Convert } from '@web5/common';
import chaiAsPromised from 'chai-as-promised';
import {
  Dwn,
  RecordsRead,
  RecordsReadReply,
  RecordsQueryReply,
  UnionMessageReply,
  RecordsQueryMessage,
  RecordsWriteMessage,
  RecordsDeleteMessage,
} from '@tbd54566975/dwn-sdk-js';

import { testDwnUrl } from './test-config.js';
import { TestAgent } from './utils/test-agent.js';
import { DwnManager } from '../src/dwn-manager.js';
import { ManagedIdentity } from '../src/identity-manager.js';
import { TestManagedAgent } from '../src/test-managed-agent.js';

// NOTE: @noble/secp256k1 requires globalThis.crypto polyfill for node.js <=18: https://github.com/paulmillr/noble-secp256k1/blob/main/README.md#usage
// Remove when we move off of node.js v18 to v20, earliest possible time would be Oct 2023: https://github.com/nodejs/release#release-schedule
import { webcrypto } from 'node:crypto';

// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto;

chai.use(chaiAsPromised);

let testDwnUrls: string[] = [testDwnUrl];

describe('DwnManager', () => {

  describe('constructor', () => {
    it('accepts a custom DWN instance', async () => {
      const mockDwn = ({} as unknown) as Dwn;

      // Instantiate DWN Manager with custom DWN instance.
      const dwnManager = await DwnManager.create({ dwn: mockDwn });

      expect(dwnManager).to.exist;
      // @ts-expect-error because a private property is being accessed.
      expect(dwnManager._dwn).to.exist;
    });
  });

  describe('get agent', () => {
    it(`returns the 'agent' instance property`, () => {
      // @ts-expect-error because we are only mocking a single property.
      const mockAgent: Web5ManagedAgent = {
        agentDid: 'did:method:abc123'
      };
      const mockDwn = ({} as unknown) as Dwn;
      const dwnManager = new DwnManager({ agent: mockAgent, dwn: mockDwn });
      const agent = dwnManager.agent;
      expect(agent).to.exist;
      expect(agent.agentDid).to.equal('did:method:abc123');
    });

    it(`throws an error if the 'agent' instance property is undefined`, async () => {
      const mockDwn = ({} as unknown) as Dwn;
      const dwnManager = await DwnManager.create({ dwn: mockDwn });
      expect(() =>
        dwnManager.agent
      ).to.throw(Error, 'Unable to determine agent execution context');
    });
  });

  describe(`with dwn data stores`, () => {
    let testAgent: TestManagedAgent;

    before(async () => {
      testAgent = await TestManagedAgent.create({
        agentClass  : TestAgent,
        agentStores : 'dwn'
      });
    });

    after(async () => {
      await testAgent.clearStorage();
      await testAgent.closeStorage();
    });

    describe('processRequest()', () => {
      let identity: ManagedIdentity;

      beforeEach(async () => {
        await testAgent.clearStorage();
        await testAgent.createAgentDid();
        // Creates a new Identity to author the DWN messages.
        identity = await testAgent.agent.identityManager.create({
          name      : 'Alice',
          didMethod : 'key',
          kms       : 'local'
        });
      });

      xit('handles EventsGet');
      xit('handles MessagesGet');
      xit('handles ProtocolsConfigure');
      xit('handles ProtocolsQuery');

      it('handles RecordsDelete messages', async () => {
      // Create test data to write.
        const dataBytes = Convert.string('Hello, world!').toUint8Array();

        // Write a record that can be deleted.
        let { message, reply: { status: writeStatus } } = await testAgent.agent.dwnManager.processRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsWrite',
          messageOptions : {
            dataFormat : 'text/plain',
            schema     : 'https://schemas.xyz/example'
          },
          dataStream: new Blob([dataBytes])
        });
        expect(writeStatus.code).to.equal(202);
        const writeMessage = message as RecordsWriteMessage;

        // Attempt to process the RecordsRead.
        const deleteResponse = await testAgent.agent.dwnManager.processRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsDelete',
          messageOptions : {
            recordId: writeMessage.recordId
          }
        });

        // Verify the response.
        expect(deleteResponse).to.have.property('message');
        expect(deleteResponse).to.have.property('messageCid');
        expect(deleteResponse).to.have.property('reply');

        const deleteMessage = deleteResponse.message as RecordsDeleteMessage;
        expect(deleteMessage).to.have.property('authorization');
        expect(deleteMessage).to.have.property('descriptor');

        const deleteReply = deleteResponse.reply as UnionMessageReply;
        expect(deleteReply).to.have.property('status');
        expect(deleteReply.status.code).to.equal(202);
      });

      it('handles RecordsQuery messages', async () => {
      // Create test data to write.
        const dataBytes = Convert.string('Hello, world!').toUint8Array();

        // Write a record that can be queried for.
        let { message, reply: { status: writeStatus } } = await testAgent.agent.dwnManager.processRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsWrite',
          messageOptions : {
            dataFormat : 'text/plain',
            schema     : 'https://schemas.xyz/example'
          },
          dataStream: new Blob([dataBytes])
        });
        expect(writeStatus.code).to.equal(202);
        const writeMessage = message as RecordsWriteMessage;

        // Attempt to process the RecordsQuery.
        const queryResponse = await testAgent.agent.dwnManager.processRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsQuery',
          messageOptions : {
            filter: {
              schema: 'https://schemas.xyz/example'
            }
          }
        });

        // Verify the response.
        expect(queryResponse).to.have.property('message');
        expect(queryResponse).to.have.property('messageCid');
        expect(queryResponse).to.have.property('reply');

        const queryMessage = queryResponse.message as RecordsQueryMessage;
        expect(queryMessage).to.have.property('authorization');
        expect(queryMessage).to.have.property('descriptor');

        const queryReply = queryResponse.reply as RecordsQueryReply;
        expect(queryReply).to.have.property('status');
        expect(queryReply.status.code).to.equal(200);
        expect(queryReply.entries).to.exist;
        expect(queryReply.entries).to.have.length(1);
        expect(queryReply.entries?.[0]).to.have.property('descriptor');
        expect(queryReply.entries?.[0]).to.have.property('encodedData');
        expect(queryReply.entries?.[0]).to.have.property('recordId', writeMessage.recordId);
      });

      it('handles RecordsRead messages', async () => {
      // Create test data to write.
        const dataBytes = Convert.string('Hello, world!').toUint8Array();

        // Write a record that can be read.
        let { message, reply: { status: writeStatus } } = await testAgent.agent.dwnManager.processRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsWrite',
          messageOptions : {
            dataFormat : 'text/plain',
            schema     : 'https://schemas.xyz/example'
          },
          dataStream: new Blob([dataBytes])
        });
        expect(writeStatus.code).to.equal(202);
        const writeMessage = message as RecordsWriteMessage;

        // Attempt to process the RecordsRead.
        const readResponse = await testAgent.agent.dwnManager.processRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsRead',
          messageOptions : {
            recordId: writeMessage.recordId
          }
        });

        // Verify the response.
        expect(readResponse).to.have.property('message');
        expect(readResponse).to.have.property('messageCid');
        expect(readResponse).to.have.property('reply');

        const readMessage = readResponse.message;
        expect(readMessage).to.have.property('authorization');
        expect(readMessage).to.have.property('descriptor');

        const readReply = readResponse.reply as RecordsReadReply;
        expect(readReply).to.have.property('status');
        expect(readReply.status.code).to.equal(200);
        expect(readReply).to.have.property('record');
        expect(readReply.record).to.have.property('data');
        expect(readReply.record).to.have.property('descriptor');
        expect(readReply.record).to.have.property('recordId', writeMessage.recordId);
      });

      it('handles RecordsWrite messages', async () => {
      // Create test data to write.
        const dataBytes = Convert.string('Hello, world!').toUint8Array();

        // Attempt to process the RecordsWrite
        let writeResponse = await testAgent.agent.dwnManager.processRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsWrite',
          messageOptions : {
            dataFormat: 'text/plain'
          },
          dataStream: new Blob([dataBytes])
        });

        // Verify the response.
        expect(writeResponse).to.have.property('message');
        expect(writeResponse).to.have.property('messageCid');
        expect(writeResponse).to.have.property('reply');

        const writeMessage = writeResponse.message as RecordsWriteMessage;
        expect(writeMessage).to.have.property('authorization');
        expect(writeMessage).to.have.property('descriptor');
        expect(writeMessage).to.have.property('recordId');

        const writeReply = writeResponse.reply;
        expect(writeReply).to.have.property('status');
        expect(writeReply.status.code).to.equal(202);
      });
    });

    describe('sendDwnRequest()', () => {
      let identity: ManagedIdentity;

      before(async () => {
        await testAgent.createAgentDid();

        const services = [{
          id              : 'dwn',
          type            : 'DecentralizedWebNode',
          serviceEndpoint : {
            encryptionKeys : ['#dwn-enc'],
            nodes          : testDwnUrls,
            signingKeys    : ['#dwn-sig']
          }
        }];

        // Creates a new Identity to author the DWN messages.
        identity = await testAgent.agent.identityManager.create({
          name       : 'Alice',
          didMethod  : 'ion',
          didOptions : { services },
          kms        : 'local'
        });
      });

      after(async () => {
        await testAgent.clearStorage();
      });

      it('throws an exception if target DID cannot be resolved', async () => {
        await expect(
          testAgent.agent.sendDwnRequest({
            author         : identity.did,
            target         : 'did:test:abc123',
            messageType    : 'RecordsQuery',
            messageOptions : {
              filter: {
                schema: 'https://schemas.xyz/example'
              }
            }
          })
        ).to.eventually.be.rejectedWith(Error, 'DwnManager: methodNotSupported: Method not supported: test');
      });

      it('throws an exception if target DID has no #dwn service endpoints', async () => {
        const identity = await testAgent.agent.identityManager.create({
          name       : 'Alice',
          didMethod  : 'ion',
          didOptions : { services: [] },
          kms        : 'local'
        });

        await expect(
          testAgent.agent.sendDwnRequest({
            author         : identity.did,
            target         : identity.did,
            messageType    : 'RecordsQuery',
            messageOptions : {
              filter: {
                schema: 'https://schemas.xyz/example'
              }
            }
          })
        ).to.eventually.be.rejectedWith(Error, `has no service endpoints with ID '#dwn'`);
      });

      it('handles RecordsDelete Messages', async () => {
        const response = await testAgent.agent.sendDwnRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsDelete',
          messageOptions : {
            recordId: 'abcd123'
          }
        });

        expect(response.reply).to.exist;
        expect(response.reply.status).to.exist;
        expect(response.reply.status.code).to.equal(404);
      });

      it('handles RecordsQuery Messages', async () => {
        const response = await testAgent.agent.sendDwnRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsQuery',
          messageOptions : {
            filter: {
              schema: 'https://schemas.xyz/example'
            }
          }
        });

        expect(response.reply).to.exist;
        expect(response.message).to.exist;
        expect(response.messageCid).to.exist;
        expect(response.reply.status).to.exist;
        expect(response.reply.entries).to.exist;
        expect(response.reply.status.code).to.equal(200);
      });

      it('handles RecordsRead Messages', async () => {
        const dataBytes = Convert.string('Hi').toUint8Array();

        let response = await testAgent.agent.sendDwnRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsWrite',
          messageOptions : {
            dataFormat : 'text/plain',
            data       : dataBytes
          },
          dataStream: new Blob([dataBytes])
        });

        const message = response.message as RecordsWriteMessage;

        response = await testAgent.agent.sendDwnRequest({
          author         : identity.did,
          target         : identity.did,
          messageType    : 'RecordsRead',
          messageOptions : {
            recordId: message.recordId
          }
        });

        expect(response.reply.status.code).to.equal(200);
        expect(response.message).to.exist;

        const readMessage = response.message as RecordsRead['message'];
        expect(readMessage.descriptor.method).to.equal('Read');
        expect(readMessage.descriptor.interface).to.equal('Records');

        const readReply = response.reply as RecordsReadReply;
        expect(readReply.record).to.exist;

        const record = readReply.record as unknown as RecordsWriteMessage & { data: ReadableStream };
        expect(record.recordId).to.equal(message.recordId);

        expect(record.data).to.exist;
        expect(record.data instanceof ReadableStream).to.be.true;

        const { value } = await record.data.getReader().read();
        expect(dataBytes).to.eql(value);
      });

      it('throws an error when DwnRequest fails validation', async () => {
        await expect(
          testAgent.agent.sendDwnRequest({
            author         : identity.did,
            target         : identity.did,
            messageType    : 'RecordsQuery',
            messageOptions : {
              filter: true
            }
          })
        ).to.eventually.be.rejectedWith(Error, '/descriptor/filter: must NOT have fewer than 1 properties');
      });
    });
  });
});