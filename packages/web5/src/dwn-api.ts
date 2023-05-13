import type { Web5Agent } from '@tbd54566975/web5-agent';
import type {
  MessageReply,
  ProtocolsConfigureOptions,
  ProtocolsQueryOptions,
  RecordsDeleteOptions,
  RecordsQueryOptions,
  RecordsReadOptions,
  RecordsReadReply,
  RecordsWriteDescriptor,
  RecordsWriteMessage,
  RecordsWriteOptions,
} from '@tbd54566975/dwn-sdk-js';

import { DwnInterfaceName, DwnMethodName, DataStream } from '@tbd54566975/dwn-sdk-js';

import { Record } from './record.js';
import { dataToBytes, isDataSizeUnderCacheLimit, isEmptyObject } from './utils.js';

export type ProtocolsConfigureRequest = {
  message: Omit<ProtocolsConfigureOptions, 'authorizationSignatureInput'>;
}

export type ProtocolsQueryRequest = {
  message: Omit<ProtocolsQueryOptions, 'authorizationSignatureInput'>
}

export type RecordsDeleteRequest = {
  message: Omit<RecordsDeleteOptions, 'authorizationSignatureInput'>;
}

export type RecordsCreateRequest = RecordsWriteRequest;

export type RecordsCreateResponse = RecordsWriteResponse;

export type RecordsCreateFromRequest = {
  author: string;
  data: unknown;
  message?: Omit<RecordsWriteOptions, 'authorizationSignatureInput'>;
  record: Record;
}

export type RecordsDeleteResponse = {
  status: MessageReply['status'];
};

// TODO: Export type RecordsQueryReplyEntry and EncryptionProperty from dwn-sdk-js.
export type RecordsQueryReplyEntry = {
  recordId: string,
  contextId?: string;
  descriptor: RecordsWriteDescriptor;
  encryption?: RecordsWriteMessage['encryption'];
  encodedData?: string;
};

export type RecordsQueryRequest = {
  message: Omit<RecordsQueryOptions, 'authorizationSignatureInput'>;
}

export type RecordsQueryResponse = {
  status: MessageReply['status'];
  records: Record[]
};

export type RecordsReadRequest = {
  message: Omit<RecordsReadOptions, 'authorizationSignatureInput'>;
}

export type RecordsReadResponse = {
  status: MessageReply['status'];
  record: Record;
};

export type RecordsWriteRequest = {
  data: unknown;
  message?: Omit<RecordsWriteOptions, 'authorizationSignatureInput'>;
}

export type RecordsWriteResponse = {
  status: MessageReply['status'];
  record?: Record
};

type SendRecordOptions =
  ({ method: 'write' } & RecordsWriteRequest) |
  ({ method: 'read' } & RecordsReadRequest) |
  ({ method: 'query' } & RecordsQueryRequest) |
  ({ method: 'delete' } & RecordsDeleteRequest)

type SendResponseMap = {
  write: RecordsWriteResponse;
  read: RecordsReadResponse;
  query: RecordsQueryResponse;
  delete: RecordsDeleteResponse;
};

type SendRecordRequest<T extends SendRecordOptions> = {
  target: string;
} & T;

type SendRecordResponse<T extends SendRecordOptions> = SendResponseMap[T['method']];

/**
 * TODO: Document class.
 */
export class DwnApi {
  constructor(private web5Agent: Web5Agent, private connectedDid: string) {}

  /**
 * TODO: Document namespace.
 */
  get protocols() {
    return {
      /**
       * TODO: Document method.
       */
      configure: async (request: ProtocolsConfigureRequest) => {
        return await this.web5Agent.processDwnRequest({
          target         : this.connectedDid,
          author         : this.connectedDid,
          messageOptions : request.message,
          messageType    : DwnInterfaceName.Protocols + DwnMethodName.Configure
        });
      },

      /**
       * TODO: Document method.
       */
      query: async (request: ProtocolsQueryRequest) => {
        return await this.web5Agent.processDwnRequest({
          author         : this.connectedDid,
          messageOptions : request.message,
          messageType    : DwnInterfaceName.Protocols + DwnMethodName.Query,
          target         : this.connectedDid
        });
      }
    };
  }

  /**
   * TODO: Document namespace.
   */
  get records() {
    return {
      /**
       * TODO: Document method.
       */
      create: async (request: RecordsCreateRequest): Promise<RecordsCreateResponse> => {
        return this.records.write(request);
      },

      /**
       * TODO: Document method.
       */
      createFrom: async (request: RecordsCreateFromRequest): Promise<RecordsWriteResponse> => {
        const { author: inheritedAuthor, ...inheritedProperties } = request.record.toJSON();

        // Remove target from inherited properties since target is being explicitly defined in method parameters.
        delete inheritedProperties.target;


        // If `data` is being updated then `dataCid` and `dataSize` must not be present.
        if (request.data !== undefined) {
          delete inheritedProperties.dataCid;
          delete inheritedProperties.dataSize;
        }

        // If `published` is set to false, ensure that `datePublished` is undefined. Otherwise, DWN SDK's schema validation
        // will throw an error if `published` is false but `datePublished` is set.
        if (request.message?.published === false && inheritedProperties.datePublished !== undefined) {
          delete inheritedProperties.datePublished;
          delete inheritedProperties.published;
        }

        // If the request changes the `author` or message `descriptor` then the deterministic `recordId` will change.
        // As a result, we will discard the `recordId` if either of these changes occur.
        if (!isEmptyObject(request.message) || (request.author && request.author !== inheritedAuthor)) {
          delete inheritedProperties.recordId;
        }

        return this.records.write({
          data    : request.data,
          message : {
            ...inheritedProperties,
            ...request.message,
          },
        });
      },

      /**
       * TODO: Document method.
       */
      delete: async (request: RecordsDeleteRequest): Promise<RecordsDeleteResponse> => {
        const { message: requestMessage } = request;

        const messageOptions: Partial<RecordsDeleteOptions> = {
          ...requestMessage
        };

        const agentResponse = await this.web5Agent.processDwnRequest({
          author      : this.connectedDid,
          messageOptions,
          messageType : DwnInterfaceName.Records + DwnMethodName.Delete,
          target      : this.connectedDid
        });

        const { reply: { status } } = agentResponse;

        return { status };
      },

      /**
       * TODO: Document method.
       */
      query: async (request: RecordsQueryRequest): Promise<RecordsQueryResponse> => {
        const { message: requestMessage } = request;

        const messageOptions: Partial<RecordsQueryOptions> = {
          ...requestMessage
        };

        const agentResponse = await this.web5Agent.processDwnRequest({
          author      : this.connectedDid,
          messageOptions,
          messageType : DwnInterfaceName.Records + DwnMethodName.Query,
          target      : this.connectedDid
        });

        const { reply: { entries, status } } = agentResponse;

        const records = entries.map((entry: RecordsQueryReplyEntry) => {
          const recordOptions = {
            author : this.connectedDid,
            target : this.connectedDid,
            ...entry as RecordsWriteMessage
          };
          const record = new Record(this.web5Agent, recordOptions);
          return record;
        });

        return { records, status };
      },

      /**
       * TODO: Document method.
       */
      read: async (request: RecordsReadRequest): Promise<RecordsReadResponse> => {
        const { message: requestMessage } = request;

        const messageOptions: Partial<RecordsReadOptions> = {
          ...requestMessage
        };

        const agentResponse = await this.web5Agent.processDwnRequest({
          author      : this.connectedDid,
          messageOptions,
          messageType : DwnInterfaceName.Records + DwnMethodName.Read,
          target      : this.connectedDid
        });

        const { reply } = agentResponse;
        const { record: responseRecord, status } = reply as RecordsReadReply;

        let record: Record;
        if (200 <= status.code && status.code <= 299) {
          const recordOptions = {
            author : this.connectedDid,
            target : this.connectedDid,
            ...responseRecord,
          };

          record = new Record(this.web5Agent, recordOptions);
        }

        return { record, status };
      },

      /**
       * TODO: Document method.
       *
       * As a convenience, the Record instance returned will cache a copy of the data if the
       * data size, in bytes, is less than the DWN 'max data size allowed to be encoded'
       * parameter of 10KB. This is done to maintain consistency with other DWN methods,
       * like RecordsQuery, that include relatively small data payloads when returning
       * RecordsWrite message properties. Regardless of data size, methods such as
       * `record.data.stream()` will return the data when called even if it requires fetching
       * from the DWN datastore.
       */
      write: async (request: RecordsWriteRequest): Promise<RecordsWriteResponse> => {
        const { data, message: requestMessage } = request;

        const messageOptions: Partial<RecordsWriteOptions> = {
          ...requestMessage
        };

        let dataStream: _Readable.Readable;

        if (data instanceof Blob || data instanceof ReadableStream) {
          //! TODO: get dataSize and dataCid of data
        } else {
          const { dataBytes, dataFormat } = dataToBytes(request.data, messageOptions.dataFormat);
          messageOptions.data = dataBytes;
          messageOptions.dataFormat = dataFormat;
          dataStream = DataStream.fromBytes(dataBytes);
        }

        const agentResponse = await this.web5Agent.processDwnRequest({
          author      : this.connectedDid,
          dataStream  : dataStream as any,
          messageOptions,
          messageType : DwnInterfaceName.Records + DwnMethodName.Write,
          target      : this.connectedDid
        });

        const { message, reply: { status } } = agentResponse;
        const responseMessage = message as RecordsWriteMessage;

        let record: Record;
        if (200 <= status.code && status.code <= 299) {
          // As a convenience, store a copy of relatively small data with the Record instance.
          const encodedData = isDataSizeUnderCacheLimit(responseMessage.descriptor.dataSize) ? messageOptions.data : null;

          const recordOptions = {
            author : this.connectedDid,
            encodedData,
            target : this.connectedDid,
            ...responseMessage,
          };

          record = new Record(this.web5Agent, recordOptions);
        }

        return { record, status };
      },

      /**
       * sends a record to a remote DWN
       * @param _request
       * @returns
       */
      send: async <T extends SendRecordOptions>(request: SendRecordRequest<T>): Promise<SendRecordResponse<T>> => {
        const author = this.connectedDid;

        if (request.method === 'query') {
          const agentResponse = await this.web5Agent.sendDwnRequest({
            author,
            target         : request.target,
            messageOptions : request.message,
            messageType    : DwnInterfaceName.Records + DwnMethodName.Query,
          });

          // TODO: (Moe -> Frank) figure out error handling
          if (agentResponse.error) {}

          return this.#parseRecordsQueryResult(agentResponse.result, author, request.target) as any;
        } else if (request.method === 'write') {
          // TODO: (Moe) resume here
          return undefined;
        }
      },
    };
  }

  #parseRecordsQueryResult(recordsQueryResult: { reply: MessageReply }, author: string, target: string): RecordsQueryResponse {
    const { reply: { entries, status } } = recordsQueryResult;

    const records = entries.map((entry: RecordsQueryReplyEntry) => {
      const recordOptions = {
        author,
        target,
        ...entry as RecordsWriteMessage
      };
      const record = new Record(this.web5Agent, recordOptions);
      return record;
    });

    return { records, status };
  }
}