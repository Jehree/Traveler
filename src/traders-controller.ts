/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import * as config from "../config/config.json";
import { IAkiProfile } from "@spt-aki/models/eft/profile/IAkiProfile";
import { RagFair } from "@spt-aki/models/eft/common/IGlobals";


export class TradersController{

    updateLockedTraders(offraidPos:string, profile:IAkiProfile, globalsRagfair:RagFair):void{
        
        const profileTraders = profile.characters.pmc.TradersInfo
        const configTraders = config.trader_config

        //loop thru traders in profile
        for (const profTraderId in profileTraders){
            
            //loop thru traders in config
            for (const confTraderName in  configTraders){
                
                const confTraderId:string = configTraders[confTraderName].trader_id
                const confTraderAccessVia:Array<string> = configTraders[confTraderName].access_via
                const confTraderAccessEverywhere:boolean = configTraders[confTraderName].accessible_everywhere

                //if accessible_everywhere is false

                //set to enabled if offraid pos matches, disabled if not
                if (confTraderId === profTraderId){

                    if (confTraderAccessVia.includes(offraidPos) || confTraderAccessEverywhere){
                        //do some checks for ragfair, if ragfair has offraid pos's, it will work like a trader
                        //if it doesn't, it won't ever be locked by the mod, meaning it will act like vanilla
                        if (profTraderId !== "ragfair"){

                            profileTraders[profTraderId].disabled = false

                        } else if (/*is ragfair*/configTraders[confTraderName]?.unlock_via_offraid_pos) {

                            globalsRagfair.minUserLevel = configTraders[confTraderName].unlock_level
                        }

                    } else {

                        //do some checks for ragfair, if ragfair has offraid pos's, it will work like a trader
                        //if it doesn't, it won't ever be locked by the mod, meaning it will act like vanilla
                        if (profTraderId !== "ragfair"){

                            profileTraders[profTraderId].disabled = true

                        } else if (/*is ragfair*/configTraders[confTraderName]?.unlock_via_offraid_pos) {

                            globalsRagfair.minUserLevel = 420
                        }
                    }
                }
            }
        }
    }

    unlockAllTraders(profile:IAkiProfile):void{

        //make dis unlock le traders

        const profileTraders = profile.characters.pmc.TradersInfo

        for (const traderId in profileTraders){

            if (traderId !== "ragfair"){
                profileTraders[traderId].disabled = false
            }
        }
    }
}