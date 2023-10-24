/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { DependencyContainer } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import type { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostAkiLoadMod } from "@spt-aki/models/external/IPostAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import type {StaticRouterModService} from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import {SaveServer} from "@spt-aki/servers/SaveServer";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";

import * as path from "path";
import * as fs from "fs";
import * as config from "../config/config.json";

import { InitUtils } from "./init-utils";
import { StashController } from "./stash-controller";
import { FileConstructors } from "./file-constructors";
import { TravelController } from "./travel-controller";
import { TradersController } from "./traders-controller";
import { CustomItems } from "./custom-items";
import { MiscUtils } from "./misc-utils";
import { HideoutController } from "./hideout-controller";
import { KikiMarkFIR } from "./kiki-markfir";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IRagfairConfig } from "@spt-aki/models/spt/config/IRagfairConfig";
import { ITraderConfig } from "@spt-aki/models/spt/config/ITraderConfig";
import { ILocationBase } from "@spt-aki/models/eft/common/ILocationBase";
import { ILocations } from "@spt-aki/models/spt/server/ILocations";

const Stash_Controller = new StashController()
const File_Constructors = new FileConstructors()
const Travel_Controller = new TravelController()
const Traders_Controller = new TradersController()
const Hideout_Controller = new HideoutController()
const Custom_Items = new CustomItems()
const Utils = new MiscUtils()
const Mark_FIR = new KikiMarkFIR()
const Init = new InitUtils()

class Mod implements IPreAkiLoadMod, IPostAkiLoadMod, IPostDBLoadMod
{
    modPath: string = path.normalize(path.join(__dirname, ".."));
    profileFolderPath: string = path.normalize(path.join(__dirname, "..", "..", "..", "profiles"));
    container: DependencyContainer

    postAkiLoad(container: DependencyContainer): void {
        this.container = container
    }

    public postDBLoad(container: DependencyContainer): void {
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
        const configServer = container.resolve<ConfigServer>("ConfigServer")
        const dbRagfairConfig = configServer.getConfig<IRagfairConfig>(ConfigTypes.RAGFAIR)
        const dbTraderConfig = configServer.getConfig<ITraderConfig>(ConfigTypes.TRADER)
        const dbTables = databaseServer.getTables()
        const dbLocations = dbTables.locations
        const dbLocales = dbTables.locales.global
        const dbTraders = dbTables.traders
        const dbQuests = dbTables.templates.quests
        const dbItems = dbTables.templates.items
        const Stash_Controller = new StashController()
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil")

        const customStashesArr = Stash_Controller.getArrOfCustomStashesToPushToDb(dbTables.templates.items, jsonUtil)
        for (const stash in customStashesArr){

            dbTables.templates.items[customStashesArr[stash]._id] = customStashesArr[stash]
        }
        Custom_Items.customVoucherItem(dbTables, jsonUtil, "checkpoint_voucher/checkpoint_voucher.bundle")
        Travel_Controller.setExfilParams(dbLocations)
        if (config.flea_purchases_are_FIR) {dbRagfairConfig.dynamic.purchasesAreFoundInRaid = true}

        if (config.trader_purchases_are_FIR) {dbTraderConfig.purchasesAreFoundInRaid = true}

        if (config.disable_out_of_raid_quest_stash){
            Stash_Controller.disableOORQuestStash(dbItems)
            Init.disableOutOfRaidQuestStashLocales(dbLocales)
        }
       
        Init.removeStashSizeBonusesFromDB(dbTables.hideout.areas)
        Init.noRunThrough(dbTables.globals)
        Init.questFixes(dbQuests)
        Init.changeExfilLocales(dbLocales)
        Init.changeTraderLocales(dbLocales)
        Init.setMedics(dbTraders)
    }

    public preAkiLoad(container: DependencyContainer): void {
        const staticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService")
        const saveServer = container.resolve<SaveServer>("SaveServer")
        const logger = container.resolve<ILogger>("WinstonLogger")

        if (config.kiki_markFIR){Mark_FIR.kikiMarkFIR(container)}

        //game start
        staticRouterModService.registerStaticRouter(
            "On_Game_Start_Traveler",
            [{
                url: "/client/game/start",
                action: (url, info, sessionId, output) => {

                    const profile = saveServer.getProfile(sessionId)
                    const profileId = profile.info.id
                    const profileFolderName:string = profile.info.username + "_" + profileId
                    const profileInventory = profile.characters.pmc.Inventory
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`
                    const profilePMCElement = profile.characters.pmc
                    const Item_Helper = container.resolve<ItemHelper>("ItemHelper")

                    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
                    const dbTables = databaseServer.getTables()
                    const dbItems = dbTables.templates.items
                    const dbLocations = dbTables.locations
                    const dbGlobals = dbTables.globals
                    const globalsRagfair = dbGlobals.config.RagFair

                    let firstTimeLoad = false
                    if (profileInventory?.items === undefined){firstTimeLoad = true}
            

                    File_Constructors.profileFolderConstructor(profile.info.username + "_" + profile.info.id, profile)

                    const statusesPath = `${profileFolderPath}/statuses.json`
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"))
                    const sysmemPath = `${profileFolderPath}/sysmem.json`
                    const sysmem = JSON.parse(fs.readFileSync(sysmemPath, "utf8"))
                    //the sysmem file saves some important settings so that the mod can see if they've been changed on game load.
                    //this allows Traveler to dynamically know if it needs to load a hideout, stash, etc.
                    
                    Travel_Controller.updateLockedMaps(statuses.offraid_position, dbLocations)
                    Travel_Controller.setInfilParams(statuses.offraid_position, dbLocations)
                    Travel_Controller.updateRegen(statuses.offraid_position, dbGlobals)

                    if (!firstTimeLoad){

                        const multiStash = config.multi_stash
                        const multiHideout = config.multi_stash
                        const restrictTraders = config.trader_access_restriction
                        const sysmOffraidPos = sysmem.sysmem_offraid_position
                        const sysmMultiStash = sysmem.sysmem_multi_stash
                        const sysmMultiHideout = sysmem.sysmem_multi_hideout
                        const sysmForceLoad = sysmem.force_load

                        if (multiStash && (sysmOffraidPos !== statuses.offraid_position || sysmMultiStash !== multiStash || sysmForceLoad)){

                            Stash_Controller.setStashSize(profile, profileFolderPath, statuses.offraid_position)
                            profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper)

                        } else if (!multiStash && sysmMultiStash !== multiStash || sysmForceLoad){

                            Stash_Controller.setStashSize(profile, profileFolderPath, config.home)
                            profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper)
                        }

                        if (config.multi_hideout && (sysmOffraidPos !== statuses.offraid_position || sysmMultiHideout !== multiHideout || sysmForceLoad)){

                            profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, statuses.offraid_position, profileFolderPath)

                        } else if (!multiHideout && sysmMultiHideout !== multiHideout || sysmForceLoad){

                            profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, config.home, profileFolderPath)
                        }

                        if (config.multi_hideout){Hideout_Controller.updateLockedHideoutStations(dbTables, statuses.offraid_position)}

                        if (restrictTraders){Traders_Controller.updateLockedTraders(statuses.offraid_position, profile, globalsRagfair)
                        } else                               {Traders_Controller.unlockAllTraders(profile)}
                        
                        if (config.uninstall){Utils.uninstallTraveler(profile, profileFolderPath, statusesPath, dbItems, Item_Helper)}
                        Utils.updateSysmem(sysmem, sysmemPath, statuses) //update all settings in sysmem
                        Utils.duplicateItemSplicer(profileInventory, logger)
                    }

                    Utils.backupProfile(logger, profileId, profileFolderName, "Game Start", "")
                    return output
                }
            }],
            "aki"
        );

        //profile create (after setting username)
        staticRouterModService.registerStaticRouter(
            "On_Profile_Create_Traveler",
            [{
                url: "/client/game/profile/create",
                action: (url, info, sessionId, output) => {

                    const profile = saveServer.getProfile(sessionId)
                    const profileId = profile.info.id
                    const profileFolderName:string = profile.info.username + "_" + profileId
                    const profileInventory = profile.characters.pmc.Inventory
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`

                    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
                    const dbTables = databaseServer.getTables()
                    const dbItems = dbTables.templates.items
                    const globalsRagfair = dbTables.globals.config.RagFair
                    const Item_Helper = container.resolve<ItemHelper>("ItemHelper")

                    Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper)
                    Hideout_Controller.saveToHideoutFile(profile, config.home, profileFolderPath)
                    Hideout_Controller.updateLockedHideoutStations(dbTables, config.home)
                    if (config.trader_access_restriction){Traders_Controller.updateLockedTraders(config.home, profile, globalsRagfair)}
                    //else don't do anything with the traders

                    return output
                }
            }],
            "aki"
        );

        //raid start
        staticRouterModService.registerStaticRouter(
            "On_Raid_Start_Traveler",
            [{
                url: "/client/raid/configuration",
                action: (url, info, sessionId, output) => {

                    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
                    const dbTables = databaseServer.getTables()
                    const dbItems = dbTables.templates.items
                    const Item_Helper = container.resolve<ItemHelper>("ItemHelper")

                    const profile = saveServer.getProfile(sessionId)
                    const profileId = profile.info.id
                    const profileFolderName:string = profile.info.username + "_" + profileId
                    const profileInventory = profile.characters.pmc.Inventory
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`
                    const statusesPath = `${profileFolderPath}/statuses.json`
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"))


                    if (config.multi_stash){Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper)
                    } else                 {Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper)}

                    Utils.backupProfile(logger, profileId, profileFolderName, "Raid Start ", info.location)
                    return output
                }
            }],
            "aki"
        );
        
        //raid end
        staticRouterModService.registerStaticRouter(
            "On_Raid_End_Traveler",
            [{
                url: "/client/match/offline/end",
                action: (url, info, sessionId, output) => {

                    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
                    const dbTables = databaseServer.getTables()
                    const dbItems = dbTables.templates.items
                    const dbLocations = dbTables.locations
                    const dbGlobals = dbTables.globals
                    const globalsRagfair = dbGlobals.config.RagFair
                    const Item_Helper = container.resolve<ItemHelper>("ItemHelper")

                    const profile = saveServer.getProfile(sessionId)
                    const profilePMCElement = profile.characters.pmc
                    const profileId = profile.info.id
                    const profileFolderName:string = profile.info.username + "_" + profileId
                    const profileInventory = profile.characters.pmc.Inventory
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`

                    const statusesPath = `${profileFolderPath}/statuses.json`
                    let statuses = Utils.readFile(statusesPath)
                    const sysmemPath = `${profileFolderPath}/sysmem.json`
                    const sysmem = Utils.readFile(sysmemPath)


                    //get prev stash path, and save current stash to it (before changing offraid pos)
                    if (config.multi_stash){Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper)}
                    else                   {Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper)}

                    if (config.multi_hideout){Hideout_Controller.saveToHideoutFile(profile, statuses.offraid_position, profileFolderPath)}
                    else                     {Hideout_Controller.saveToHideoutFile(profile, config.home, profileFolderPath)}

                    //change offraid pos to new pos based on exit name & config
                    Travel_Controller.updateOffraidPos(info.exitName, statuses, statusesPath, profileInventory.items)
                    statuses = Utils.readFile(statusesPath) //reread statuses file to get the updates in memory

                    //overwrite current stash with stash file from new offraid pos
                    if (config.multi_stash){
                        profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper)
                        Stash_Controller.setStashSize(profile, profileFolderPath, statuses.offraid_position)
                    } //else no need to load a stash or set a size because it will be correct from game load

                    if (config.multi_hideout){
                        profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, statuses.offraid_position, profileFolderPath)
                        Hideout_Controller.updateLockedHideoutStations(dbTables, statuses.offraid_position)
                    } //else no need to load a hideout because it will be correct from game load

                    Travel_Controller.updateLockedMaps(statuses.offraid_position, dbLocations)
                    Travel_Controller.setInfilParams(statuses.offraid_position, dbLocations)
                    Travel_Controller.updateRegen(statuses.offraid_position, dbGlobals)
                    //if (config.items_marked_fir_upon_exfil){Utils.markItemsOnPmcFIR(info.exitName, dbItems, profile)}
                    if (config.trader_access_restriction){Traders_Controller.updateLockedTraders(statuses.offraid_position, profile, globalsRagfair)}
                    //else do nothing since they would be unlocked from game start

                    logger.log("[Traveler]: exitName: " + info.exitName, "green")
                    logger.log("[Traveler]: New offraid pos: " + statuses.offraid_position, "green")
            
                    Utils.updateSysmem(sysmem, sysmemPath, statuses, true) //update sysmem file offraid pos only
                    Utils.duplicateItemSplicer(profileInventory, logger)
                    Utils.backupProfile(logger, profileId, profileFolderName, "Raid End ", info.exitName)
                    return output
                }
            }],
            "aki"
        );

        //raid save
        staticRouterModService.registerStaticRouter(
            "On_Game_Save_Traveler",
            [{
                url: "/raid/profile/save",
                action: (url, info, sessionId, output) => {

                    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
                    const dbTables = databaseServer.getTables()
                    const dbItems = dbTables.templates.items
                    const Item_Helper = container.resolve<ItemHelper>("ItemHelper")

                    const profile = saveServer.getProfile(sessionId)
                    const profileFolderName:string = profile.info.username + "_" + profile.info.id
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`
                    const profileInventory = profile.characters.pmc.Inventory
                    const statusesPath = `${profileFolderPath}/statuses.json`
                    const statuses = Utils.readFile(statusesPath)
            
                    //save on profile/save
                    if (config.multi_stash){Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper)}
                    else                   {Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper)}

                    return output
                }
            }],
            "aki"
        );
        
        //logout
        staticRouterModService.registerStaticRouter(
            "On_Logout_Traveler",
            [{
                url: "/client/game/logout",
                action: (url, info, sessionId, output) => {

                    const databaseServer = container.resolve<DatabaseServer>("DatabaseServer")
                    const dbTables = databaseServer.getTables()
                    const dbItems = dbTables.templates.items
                    const Item_Helper = container.resolve<ItemHelper>("ItemHelper")

                    const profile = saveServer.getProfile(sessionId)
                    const profileFolderName:string = profile.info.username + "_" + profile.info.id
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`
                    const profileInventory = profile.characters.pmc.Inventory
                    const statusesPath = `${profileFolderPath}/statuses.json`
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"))
            
                    //save on logout
                    if (config.multi_stash){Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper)}
                    else                   {Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper)}
                    Hideout_Controller.saveToHideoutFile(profile, statuses.offraid_position, profileFolderPath)

                    return output
                }
            }],
            "aki"
        );
    }

    logAllMapAndExtractNames(dbLocations:ILocations):void{
        const extractList = {}
        for (const loc in dbLocations){

            const thisLocExits = dbLocations[loc]?.base?.exits
            if (!thisLocExits) continue

            extractList[loc] = []

            for (const e in thisLocExits){
                const thisExit = thisLocExits[e]
                extractList[loc].push(thisExit.Name)
            }
            
        }

        console.log(extractList)

    }
}
module.exports = {mod: new Mod()}
