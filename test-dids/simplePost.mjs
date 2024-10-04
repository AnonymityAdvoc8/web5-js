import { Web5 } from '@web5/api';
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
let dwnEndpoint = process.env.DWN_BASE_URL
  ? `http://localhost:${process.env.DWN_BASE_URL}`
  : 'http://localhost:3000';
const { did, web5 } = await Web5.connect({
  sync: '5s',
  techPreview: {
    dwnEndpoints: [dwnEndpoint],
  },
  registration: {
    onFailure(error) {
      console.log('Registration failed', error);
    },
    async onSuccess() {
      console.log('Registration succeeded');
    },
  },
});

const { record } = await web5.dwn.records.create({
  data: {
    content: 'Hello Web5',
    description: 'Keep Building!',
  },
  message: { published: true, dataFormat: 'application/json' },
});

const response = await web5.dwn.records.query({
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
} else {
  console.log('error while posting record');
}
