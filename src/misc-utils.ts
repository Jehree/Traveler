/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { IAkiProfile } from "@spt-aki/models/eft/profile/IAkiProfile";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { Inventory } from "@spt-aki/models/eft/common/tables/IBotBase";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { IQuest } from "@spt-aki/models/eft/common/tables/IQuest";
import { IGlobals } from "@spt-aki/models/eft/common/IGlobals";
import * as path from "path";
import * as fse from "fs-extra";
import * as fs from "fs";

import * as config from "../config/config.json";
import * as exfilTooltips from "../config/exfil_tooltips.json";
import { GetData } from "./useful-data";
import { StashController } from "./stash-controller";
import { HideoutController } from "./hideout-controller";
import { TradersController } from "./traders-controller";

const Get_Data = new GetData()
const Stash_Controller = new StashController()
const Hideout_Controller = new HideoutController()
const Trader_Controller = new TradersController()

export class MiscUtils{
    modPath: string = path.normalize(path.join(__dirname, ".."));
    profileFolderPath: string = path.normalize(path.join(__dirname, "..", "..", "..", "profiles"));

    noRunThrough(dbGlobals: IGlobals):void{
        dbGlobals.config.exp.match_end.survived_exp_requirement = 0;
        dbGlobals.config.exp.match_end.survived_seconds_requirement = 0;
    }

    questFixes(dbQuests: Record<string, IQuest>):void{
        
        //change Dangerous Road quest to require an underpass extraction instead of streets car
        //tweak to the locale in the extraction_tooltips.json file
        const dangerousRoadQuest = dbQuests["63ab180c87413d64ae0ac20a"]
        dangerousRoadQuest.conditions.AvailableForFinish[0]._props.counter.conditions[2]._props["exitName"] = "E1"
    }

    uninstallTraveler(profile:IAkiProfile, profileFolderPath:string, statusesPath:string, dbItems:Record<string, ITemplateItem>, Item_Helper:ItemHelper):void{

        const profilePMCElement = profile.characters.pmc
        const profileInventory = profilePMCElement.Inventory

        const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"))

        //save current stash and hideout
        Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper)
        Hideout_Controller.saveToHideoutFile(profile, statuses.offraid_position, profileFolderPath)

        //change offraid pos to home in statuses file
        statuses.offraid_position = config.home
        fs.writeFileSync(statusesPath, JSON.stringify(statuses, null, 4))

        Trader_Controller.unlockAllTraders(profile)
        Stash_Controller.setStashSize(profile, profileFolderPath, config.home)
        profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper)
        profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, config.home, profileFolderPath)

        const idsToRemove = Object.keys(config.stashes).concat([
            "checkpoint_letter_id"
        ])

        const profileItems = profileInventory.items
        for (let i = profileItems.length; i > 0; i--){
            if (idsToRemove.includes(profileItems[i-1]?._tpl)){
                profileInventory.items.splice(i-1,1)
            }
        }
    }
    
    updateSysmem(sysmem:any, sysmemPath:string, statuses:any, offraidPosOnly?:boolean):void{

        sysmem.sysmem_offraid_position = statuses.offraid_position

        if (!offraidPosOnly){
            sysmem.sysmem_multi_stash = config.multi_stash
            sysmem.sysmem_multi_hideout = config.multi_hideout
        }

        fs.writeFileSync(sysmemPath, JSON.stringify(sysmem, null, 4))
    }

    getArrOfFilePaths(folderPath:string):Array<string>{
        const filePaths = []  

        fs.readdirSync(folderPath).forEach(file => {

            const newPath = `${folderPath}/${file}`
            filePaths.push(newPath)
        });
        return filePaths;
    }

    backupProfile(logger:ILogger, profileId:string, trvProfileFolderName:string, backupType:string, addInfo:string):void{

        const profilePath = `${this.profileFolderPath}/${profileId}.json`
        const trvProfileFolderPath = `${this.modPath}/profiles/${trvProfileFolderName}`
        const trvProfileBackupsFolderPath = `${this.modPath}/profiles/.profile backups`
        const thisProfileBackupFolderPath = `${trvProfileBackupsFolderPath}/${trvProfileFolderName}`
        const dateTime = Get_Data.getFormattedTime()

        if (addInfo === null){addInfo = "death"}

        //create the backup folders
        const backupPath = `${thisProfileBackupFolderPath}/[${dateTime}][${backupType}${addInfo}]/${trvProfileFolderName}`
        if (!fs.existsSync(backupPath)) {fs.mkdirSync(backupPath, {recursive: true})}

        //copy files to it
        try {
            fse.copySync(trvProfileFolderPath, backupPath, {overwrite: false})
            fs.copyFileSync(profilePath, `${thisProfileBackupFolderPath}/[${dateTime}][${backupType}${addInfo}]/${profileId}.json`);
            logger.log(`[Traveler]: ${profileId}.json file and Traveler profile folder backed up to the "Traveler/profiles/.profile backups" folder!`, "green")
        } catch (err){console.log(err)}

        //check number of backups that exist for profile
        const thisProfileBackupPathsArr = this.getArrOfFilePaths(thisProfileBackupFolderPath)

        if (thisProfileBackupPathsArr.length > config.number_of_profile_backups){

            let highestBirthTime:number
            let oldestProfileFolderPath = thisProfileBackupPathsArr[0]

            for (let i = 0; i < thisProfileBackupPathsArr.length; i++){

                const thisFolderStats = fs.statSync(thisProfileBackupPathsArr[i])
                const birthTimeMS = thisFolderStats["birthtimeMs"]
                
                if (birthTimeMS < highestBirthTime){
                    highestBirthTime = birthTimeMS
                    oldestProfileFolderPath = thisProfileBackupPathsArr[i]
                }

                thisProfileBackupPathsArr.splice(i,1)
            }
            fs.rmSync(oldestProfileFolderPath, {recursive: true, force: true})
        }
    }

    duplicateItemSplicer(profileInventory:Inventory, logger:ILogger):void{

        //this func splices any duplicate items loaded into the profile to protect against corruption
        const profileItems = profileInventory.items
        for (let itemTOP = profileItems.length; itemTOP > 0; itemTOP--){
            const topItemId = profileItems[itemTOP-1]._id

            for (let itemBOT = profileItems.length; itemBOT > 0; itemBOT--){
                const botItemId = profileItems[itemBOT-1]._id
                
                if (itemBOT !== itemTOP && topItemId === botItemId){
                    profileInventory.items.splice(+itemBOT-1, 1)
                    logger.log("Duplicate item deleted from profile!", "red")
                }
            }
        }
    }

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
}