import { atomoneProtoRegistry } from "@atomone/atomone-types/atomone/client";
import { cosmosProtoRegistry } from "@atomone/atomone-types/cosmos/client";
import { PgIndexer, PgIndexerConfig } from "@eclesia/basic-pg-indexer";
//import { AuthModule, BankModule, Blocks, StakingModule} from "@eclesia/core-modules-pg";
import { Blocks} from "@eclesia/core-modules-pg";

import { CustomModule } from "./modules/custommodule";

const config: PgIndexerConfig = {
  startHeight: 1,
  batchSize: 500,
  modules: [],
  rpcUrl: process.env.RPC_ENDPOINT || "https://atomone-testnet-1-rpc.allinbits.services",
  logLevel: "verbose",
  usePolling: false,
  pollingInterval: 0,
  processGenesis: true,
  minimal: false,
  genesisPath: "./genesis.json",
  dbConnectionString: process.env.PG_CONNECTION_STRING || "postgres://postgres:password@localhost:5432/atomone",
};

const registry = cosmosProtoRegistry.concat(atomoneProtoRegistry);
const blocksModule = new Blocks.FullBlocksModule(registry);
//Uncomment as needed
/*
const authModule = new AuthModule(registry);
const bankModule = new BankModule(registry);
const stakingModule = new StakingModule(registry);
*/
const customModule = new CustomModule(registry);
const indexer = new PgIndexer(config,[blocksModule,/* authModule, bankModule, stakingModule,*/ customModule]);

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
  console.trace();
});
const run = async () => {
  try {
    await indexer.setup();
    await indexer.run();
  } catch (error) { 
    console.error("Error running indexer:", error);
  }
}
run();