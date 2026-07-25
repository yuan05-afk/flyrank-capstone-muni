import { workerService } from "../services/worker.service";

async function main() {
  const result = await workerService.drain();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
