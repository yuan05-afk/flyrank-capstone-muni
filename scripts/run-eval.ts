import { evalService } from "../services/eval.service";

async function main() {
  const result = await evalService.run();
  console.log(JSON.stringify(result, null, 2));
  if (result.groundedAccuracy < 0.8 || result.refusalRecall < 0.8) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
