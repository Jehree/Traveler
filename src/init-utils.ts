/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";
import { IGlobals } from "@spt-aki/models/eft/common/IGlobals";
import { IHideoutArea } from "@spt-aki/models/eft/hideout/IHideoutArea";
import { ITrader } from "@spt-aki/models/eft/common/tables/ITrader";

import * as config from "../config/config.json";
import * as exfilTooltips from "../config/exfil_tooltips.json";

export class InitUtils{
    changeExfilLocales(dbLocales:Record<string, Record<string, string>>):void{

        const locales = dbLocales[`${config.locale_language}`]
        const exfilLocalesToChange = exfilTooltips.Extracts

        for (const locName in exfilLocalesToChange){
            if (exfilLocalesToChange[locName] !== ""){
                locales[locName] = exfilLocalesToChange[locName]
            }
        }
    }

    disableOutOfRaidQuestStashLocales(dbLocales:Record<string, Record<string, string>>):void{

        const locales = dbLocales[`${config.locale_language}`]
        const stashLocalesToChange = exfilTooltips.OOR_Quest_Stash_Disable

        for (const locKey in stashLocalesToChange){
            if (stashLocalesToChange[locKey] !== ""){
                locales[locKey] = stashLocalesToChange[locKey]
            }
        }
    }

    changeTraderLocales(dbLocales:Record<string, Record<string, string>>):void{

        const locales = dbLocales[config.locale_language]
        const configTraders = config.trader_config

        for (const trName in configTraders){

            const traderId = configTraders[trName].trader_id
            const configTraderDesc = configTraders[trName].trader_description_text
            const configTraderLoca = configTraders[trName].trader_location_text

            if (configTraderDesc !== ""){
                locales[`${traderId} Description`] = configTraderDesc
            }

            if (configTraderLoca !== ""){
                locales[`${traderId} Location`] = configTraderLoca
            }
        }
    }

    setMedics(dbTraders: Record<string, ITrader>):void{

        const configTraders = config.trader_config
        for (const trader in configTraders){

            if (!config.post_raid_healing_enabled){
                const traderId = configTraders[trader].trader_id
                dbTraders[traderId].base.medic = false
                continue
            }

            if (configTraders[trader].is_medic){
                const traderId = configTraders[trader].trader_id
                dbTraders[traderId].base.medic = true
            }
        }
    }

    noRunThrough(dbGlobals: IGlobals):void{
        dbGlobals.config.exp.match_end.survived_exp_requirement = 0;
        dbGlobals.config.exp.match_end.survived_seconds_requirement = 0;
    }

    questFixes(dbQuests: Record<string, IQuest>):void{
        
        //change Dangerous Road quest to require an underpass extraction instead of streets car
        //tweak to the locale in the extraction_tooltips.json file
        const dangerousRoadQuest = dbQuests["63ab180c87413d64ae0ac20a"]
        dangerousRoadQuest.conditions.AvailableForFinish[0]._props.counter.conditions[2]._props["exitName"] = "E7"
    }

    removeStashSizeBonusesFromDB(dbHideoutAreas: IHideoutArea[]):void{
        const stashStationTypeNumber = 3
        for (const area in dbHideoutAreas){
            if (dbHideoutAreas[area].type !== stashStationTypeNumber){continue}

            const stages = dbHideoutAreas[area].stages
            for (const st in stages){
                stages[st].bonuses = []
            }
        }
    }
}