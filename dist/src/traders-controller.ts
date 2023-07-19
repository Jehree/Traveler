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
        for (const traderId in profileTraders){
            
            //loop thru traders in config
            for (const traderName in  configTraders){
                
                const configTraderId:string = configTraders[traderName].trader_id
                const configTraderAccessVia:Array<string> = configTraders[traderName].access_via
                const traderAccessEverywhere:boolean = configTraders[traderName].accessible_everywhere

                //if accessible_everywhere is false
                if (!traderAccessEverywhere){

                    //set to enabled if offraid pos matches, disabled if not
                    if (configTraderId === traderId){

                        if (configTraderAccessVia.includes(offraidPos)){
                            //do some checks for ragfair, if ragfair has offraid pos's, it will work like a trader
                            //if it doesn't, it won't ever be locked by the mod, meaning it will act like vanilla
                            if (traderId !== "ragfair"){

                                profileTraders[traderId].disabled = false

                            } else if (/*is ragfair*/configTraders[traderName]?.unlock_via_offraid_pos) {

                                globalsRagfair.minUserLevel = configTraders[traderName].unlock_level
                            }

                        } else {

                            //do some checks for ragfair, if ragfair has offraid pos's, it will work like a trader
                            //if it doesn't, it won't ever be locked by the mod, meaning it will act like vanilla
                            if (traderId !== "ragfair"){
    
                                profileTraders[traderId].disabled = true
    
                            } else if (/*is ragfair*/configTraders[traderName]?.unlock_via_offraid_pos) {
    
                                globalsRagfair.minUserLevel = 420
                            }
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

    //this doesn't work due to our checkpoint system :/
    /*updatePostRaidHealing(offraidPos:string, dbTraders: Record<string, ITrader>):void{
        
        const postHealConfig = config.post_raid_healing

        if (!postHealConfig.available_everywhere){

            const traderIds = Get_Data.getTraderIdsByName()
            const therapist = dbTraders[traderIds["therapist"]]

            if (postHealConfig.access_via.includes(offraidPos)){
                therapist.base.medic = true
            } else {therapist.base.medic = false}
        }
    }*/
}