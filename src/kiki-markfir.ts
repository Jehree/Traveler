/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import * as config from "../config/config.json";

import type { DependencyContainer } from "tsyringe"
import { InRaidHelper } from "@spt-aki/helpers/InRaidHelper"
import { InraidController } from "@spt-aki/controllers/InraidController"
import { ISaveProgressRequestData } from "@spt-aki/models/eft/inRaid/ISaveProgressRequestData";

export class KikiMarkFIR{

    private container: DependencyContainer

    kikiMarkFIR(container:DependencyContainer):void{
        this.container = container

        container.afterResolution("InraidController", (_t, result: InraidController) => 
        {
            
            // eslint-disable-next-line
            // @ts-ignore: we don't care that the prop is protected. 
            result.markOrRemoveFoundInRaidItems = (offraidData: ISaveProgressRequestData, pmcData: IPmcData, isPlayerScav: boolean): void => 
            {
                return this.InRaidControllerReplacement(offraidData, pmcData, isPlayerScav)
            }
        }, {frequency: "Always"})
        
        if (config.kiki_markFIR === true){
            container.afterResolution("InRaidHelper", (_t, result: InRaidHelper) => 
            {
                result.addSpawnedInSessionPropertyToItems = (preRaidProfile: IPmcData, postRaidProfile: IPmcData/*, isPlayerScav: boolean*/): IPmcData => 
                {
                    return this.InRaidHelperReplacement(preRaidProfile, postRaidProfile/*, isPlayerScav*/)
                }
            }, {frequency: "Always"})
        }
    }
  
    private InRaidControllerReplacement(offraidData: ISaveProgressRequestData, pmcData: IPmcData, isPlayerScav: boolean): void
    {
        const InRaidHelper = this.container.resolve<InRaidHelper>("InRaidHelper")
        offraidData.profile = InRaidHelper.addSpawnedInSessionPropertyToItems(pmcData, offraidData.profile, isPlayerScav)
    }
        
    private InRaidHelperReplacement(preRaidProfile: IPmcData, postRaidProfile: IPmcData/*, isPlayerScav: boolean*/): IPmcData
    {
        for (const item of postRaidProfile.Inventory.items)
        {
            if ("upd" in item)
            {
                item.upd.SpawnedInSession = true
            }
            else
            {
                item.upd = { SpawnedInSession: true }
            }
        }

        return postRaidProfile;
    }
}

