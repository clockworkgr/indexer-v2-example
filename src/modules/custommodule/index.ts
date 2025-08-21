import fs from "node:fs";

import { GeneratedType } from "@cosmjs/proto-signing";
import { PgIndexer } from "@eclesia/basic-pg-indexer";
import { EcleciaIndexer, Types } from "@eclesia/indexer-engine";

// Use the type below to register the type information for the events you're interested in
// both in the genesis file and from the blockchain
export type Events = {
   
  "genesis/value/consensus_params.block.max_bytes": { value: string };
  "/cosmos.staking.v1beta1.MsgDelegate": { value: Types.TxResult<Uint8Array> };

};

export class CustomModule implements Types.IndexingModule {
  indexer!: EcleciaIndexer;

  private pgIndexer!: PgIndexer;

  private registry: [string, GeneratedType][];

  public name: string = "my.custom.module";

  public depends: string[] = [];

  public provides: string[] = ["my.custom.module"];

  constructor(registry: [string, GeneratedType][]) {
    this.registry = registry;
  }

  async setup() {

    await this.pgIndexer.beginTransaction();
    const client = this.pgIndexer.getInstance();        
    // The query here should check whether the necessary tables in module.sql are already present in the db  
    const exists = await client.query(
      "SELECT EXISTS ( SELECT FROM pg_tables WHERE  schemaname = 'public' AND tablename  = 'accounts')"
    );
    if (!exists.rows[0].exists) {
      this.indexer.log.warn("Database not configured");    
      const base = fs.readFileSync(__dirname + "/./sql/module.sql").toString();
      try {
        await client.query(base);
        this.indexer.log.info("DB has been set up");
        this.pgIndexer.endTransaction(true);
      } catch (e) {
        this.pgIndexer.endTransaction(false);
        throw new Error("" + e);
      } 
    } else {
      this.pgIndexer.endTransaction(true);
    }
  }

  init(pgIndexer: PgIndexer): void {

    this.pgIndexer = pgIndexer;
    this.indexer = pgIndexer.indexer;
    const registryMap: Map<string, (typeof this.registry)[0][1]> = new Map();
    for (let i = 0; i < this.registry.length; i++) {
      registryMap.set(this.registry[i][0], this.registry[i][1]);
    }

    this.indexer.on("/cosmos.staking.v1beta1.MsgDelegate", async (event): Promise<void> => {
      this.indexer.log.verbose("MsgDelegate event received: "+event.value);
      
    });
    this.indexer.on(
      "genesis/value/consensus_params.block.max_bytes", async(event): Promise<void> => {

          this.indexer.log.verbose("Consensus params max_bytes in genesis is: "+ event.value);

      }
    );
  }
}