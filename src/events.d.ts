//import Auth from "@eclesia/core-modules-pg/dist/cosmos.auth.v1beta1";
//import Bank from "@eclesia/core-modules-pg/dist/cosmos.bank.v1beta1";
//import Staking from "@eclesia/core-modules-pg/dist/cosmos.staking.v1beta1";
import { Types } from "@eclesia/indexer-engine";

import { Events } from "./modules/custommodule";

declare global {
   
  export interface EventMap
    extends /* Auth.Events,
    Bank.Events,
    Staking.Events,*/
    Events,
    Types.Events {}
}
