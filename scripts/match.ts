import { runMatching } from "../src/matching/run";

runMatching()
  .then(({ merged, queued }) => {
    console.log(`انتهت المطابقة: ${merged} ربط تلقائي، ${queued} بانتظار المراجعة.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
