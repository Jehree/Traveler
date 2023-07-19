"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config = __importStar(require("../config/config.json"));
const stash_controller_1 = require("./stash-controller");
const file_constructors_1 = require("./file-constructors");
const travel_controller_1 = require("./travel-controller");
const traders_controller_1 = require("./traders-controller");
const custom_items_1 = require("./custom-items");
const misc_utils_1 = require("./misc-utils");
const hideout_controller_1 = require("./hideout-controller");
const kiki_markfir_1 = require("./kiki-markfir");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const Stash_Controller = new stash_controller_1.StashController();
const File_Constructors = new file_constructors_1.FileConstructors();
const Travel_Controller = new travel_controller_1.TravelController();
const Traders_Controller = new traders_controller_1.TradersController();
const Hideout_Controller = new hideout_controller_1.HideoutController();
const Custom_Items = new custom_items_1.CustomItems();
const Utils = new misc_utils_1.MiscUtils();
const Mark_FIR = new kiki_markfir_1.KikiMarkFIR();
class Mod {
    constructor() {
        this.modPath = path.normalize(path.join(__dirname, ".."));
        this.profileFolderPath = path.normalize(path.join(__dirname, "..", "..", "..", "profiles"));
    }
    postAkiLoad(container) {
        this.container = container;
    }
    postDBLoad(container) {
        const databaseServer = container.resolve("DatabaseServer");
        const configServer = container.resolve("ConfigServer");
        const dbRagfairConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.RAGFAIR);
        const dbTraderConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.TRADER);
        const dbTables = databaseServer.getTables();
        const dbLocations = dbTables.locations;
        const dbLocales = dbTables.locales.global;
        const dbTraders = dbTables.traders;
        const dbQuests = dbTables.templates.quests;
        const dbItems = dbTables.templates.items;
        const Stash_Controller = new stash_controller_1.StashController();
        const jsonUtil = container.resolve("JsonUtil");
        const customStashesArr = Stash_Controller.getArrOfCustomStashesToPushToDb(dbTables.templates.items, jsonUtil);
        for (const stash in customStashesArr) {
            dbTables.templates.items[customStashesArr[stash]._id] = customStashesArr[stash];
        }
        Custom_Items.customVoucherItem(dbTables, jsonUtil, "checkpoint_voucher/checkpoint_voucher.bundle");
        Travel_Controller.setExfilParams(dbLocations);
        if (!config.post_raid_healing_enabled) {
            dbTraders["54cb57776803fa99248b456e"].base.medic = false;
        }
        if (config.flea_purchases_are_FIR) {
            dbRagfairConfig.dynamic.purchasesAreFoundInRaid = true;
        }
        if (config.trader_purchases_are_FIR) {
            dbTraderConfig.purchasesAreFoundInRaid = true;
        }
        if (config.disable_out_of_raid_quest_stash) {
            Stash_Controller.disableOORQuestStash(dbItems);
            Utils.disableOutOfRaidQuestStashLocales(dbLocales);
        }
        Utils.noRunThrough(dbTables.globals);
        Utils.questFixes(dbQuests);
        Utils.changeExfilLocales(dbLocales);
        Utils.changeTraderLocales(dbLocales);
    }
    preAkiLoad(container) {
        const staticRouterModService = container.resolve("StaticRouterModService");
        const saveServer = container.resolve("SaveServer");
        const logger = container.resolve("WinstonLogger");
        if (config.kiki_markFIR) {
            Mark_FIR.kikiMarkFIR(container);
        }
        //game start
        staticRouterModService.registerStaticRouter("On_Game_Start_Traveler", [{
                url: "/client/game/start",
                action: (url, info, sessionId, output) => {
                    const profile = saveServer.getProfile(sessionId);
                    const profileId = profile.info.id;
                    const profileFolderName = profile.info.username + "_" + profileId;
                    const profileInventory = profile.characters.pmc.Inventory;
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`;
                    const profilePMCElement = profile.characters.pmc;
                    const Item_Helper = container.resolve("ItemHelper");
                    const databaseServer = container.resolve("DatabaseServer");
                    const dbTables = databaseServer.getTables();
                    const dbItems = dbTables.templates.items;
                    const dbLocations = dbTables.locations;
                    const dbGlobals = dbTables.globals;
                    const globalsRagfair = dbGlobals.config.RagFair;
                    let firstTimeLoad = false;
                    if (profileInventory?.items === undefined) {
                        firstTimeLoad = true;
                    }
                    File_Constructors.profileFolderConstructor(profile.info.username + "_" + profile.info.id, profile);
                    const statusesPath = `${profileFolderPath}/statuses.json`;
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"));
                    const sysmemPath = `${profileFolderPath}/sysmem.json`;
                    const sysmem = JSON.parse(fs.readFileSync(sysmemPath, "utf8"));
                    //the sysmem file saves some important settings so that the mod can see if they've been changed on game load.
                    //this allows Traveler to dynamically know if it needs to load a hideout, stash, etc.
                    Travel_Controller.updateLockedMaps(statuses.offraid_position, dbLocations);
                    Travel_Controller.setInfilParams(statuses.offraid_position, dbLocations);
                    Travel_Controller.updateRegen(statuses.offraid_position, dbGlobals);
                    if (!firstTimeLoad) {
                        const multiStash = config.multi_stash;
                        const multiHideout = config.multi_stash;
                        const restrictTraders = config.trader_access_restriction;
                        const sysmOffraidPos = sysmem.sysmem_offraid_position;
                        const sysmMultiStash = sysmem.sysmem_multi_stash;
                        const sysmMultiHideout = sysmem.sysmem_multi_hideout;
                        const sysmForceLoad = sysmem.force_load;
                        if (multiStash && (sysmOffraidPos !== statuses.offraid_position || sysmMultiStash !== multiStash || sysmForceLoad)) {
                            Stash_Controller.setStashSize(profile, profileFolderPath, statuses.offraid_position);
                            profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper);
                        }
                        else if (!multiStash && sysmMultiStash !== multiStash || sysmForceLoad) {
                            Stash_Controller.setStashSize(profile, profileFolderPath, config.home);
                            profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper);
                        }
                        if (config.multi_hideout && (sysmOffraidPos !== statuses.offraid_position || sysmMultiHideout !== multiHideout || sysmForceLoad)) {
                            profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, statuses.offraid_position, profileFolderPath);
                        }
                        else if (!multiHideout && sysmMultiHideout !== multiHideout || sysmForceLoad) {
                            profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, config.home, profileFolderPath);
                        }
                        if (config.multi_hideout) {
                            Hideout_Controller.updateLockedHideoutStations(dbTables, statuses.offraid_position);
                        }
                        if (restrictTraders) {
                            Traders_Controller.updateLockedTraders(statuses.offraid_position, profile, globalsRagfair);
                        }
                        else {
                            Traders_Controller.unlockAllTraders(profile);
                        }
                        if (config.uninstall) {
                            Utils.uninstallTraveler(profile, profileFolderPath, statusesPath, dbItems, Item_Helper);
                        }
                        Utils.updateSysmem(sysmem, sysmemPath, statuses); //update all settings in sysmem
                        Utils.duplicateItemSplicer(profileInventory, logger);
                    }
                    Utils.backupProfile(logger, profileId, profileFolderName, "Game Start", "");
                    return output;
                }
            }], "aki");
        //profile create (after setting username)
        staticRouterModService.registerStaticRouter("On_Profile_Create_Traveler", [{
                url: "/client/game/profile/create",
                action: (url, info, sessionId, output) => {
                    const profile = saveServer.getProfile(sessionId);
                    const profileId = profile.info.id;
                    const profileFolderName = profile.info.username + "_" + profileId;
                    const profileInventory = profile.characters.pmc.Inventory;
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`;
                    const databaseServer = container.resolve("DatabaseServer");
                    const dbTables = databaseServer.getTables();
                    const dbItems = dbTables.templates.items;
                    const globalsRagfair = dbTables.globals.config.RagFair;
                    const Item_Helper = container.resolve("ItemHelper");
                    Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper);
                    Hideout_Controller.saveToHideoutFile(profile, config.home, profileFolderPath);
                    Hideout_Controller.updateLockedHideoutStations(dbTables, config.home);
                    if (config.trader_access_restriction) {
                        Traders_Controller.updateLockedTraders(config.home, profile, globalsRagfair);
                    }
                    //else don't do anything with the traders
                    return output;
                }
            }], "aki");
        //raid start
        staticRouterModService.registerStaticRouter("On_Raid_Start_Traveler", [{
                url: "/client/raid/configuration",
                action: (url, info, sessionId, output) => {
                    const databaseServer = container.resolve("DatabaseServer");
                    const dbTables = databaseServer.getTables();
                    const dbItems = dbTables.templates.items;
                    const Item_Helper = container.resolve("ItemHelper");
                    const profile = saveServer.getProfile(sessionId);
                    const profileId = profile.info.id;
                    const profileFolderName = profile.info.username + "_" + profileId;
                    const profileInventory = profile.characters.pmc.Inventory;
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`;
                    const statusesPath = `${profileFolderPath}/statuses.json`;
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"));
                    if (config.multi_stash) {
                        Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper);
                    }
                    else {
                        Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper);
                    }
                    Utils.backupProfile(logger, profileId, profileFolderName, "Raid Start ", info.location);
                    return output;
                }
            }], "aki");
        //raid end
        staticRouterModService.registerStaticRouter("On_Raid_End_Traveler", [{
                url: "/client/match/offline/end",
                action: (url, info, sessionId, output) => {
                    const databaseServer = container.resolve("DatabaseServer");
                    const dbTables = databaseServer.getTables();
                    const dbItems = dbTables.templates.items;
                    const dbLocations = dbTables.locations;
                    const dbGlobals = dbTables.globals;
                    const globalsRagfair = dbGlobals.config.RagFair;
                    const Item_Helper = container.resolve("ItemHelper");
                    const profile = saveServer.getProfile(sessionId);
                    const profilePMCElement = profile.characters.pmc;
                    const profileId = profile.info.id;
                    const profileFolderName = profile.info.username + "_" + profileId;
                    const profileInventory = profile.characters.pmc.Inventory;
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`;
                    const statusesPath = `${profileFolderPath}/statuses.json`;
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"));
                    const sysmemPath = `${profileFolderPath}/sysmem.json`;
                    const sysmem = JSON.parse(fs.readFileSync(sysmemPath, "utf8"));
                    //get prev stash path, and save current stash to it (before changing offraid pos)
                    if (config.multi_stash) {
                        Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper);
                    }
                    else {
                        Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper);
                    }
                    if (config.multi_hideout) {
                        Hideout_Controller.saveToHideoutFile(profile, statuses.offraid_position, profileFolderPath);
                    }
                    else {
                        Hideout_Controller.saveToHideoutFile(profile, config.home, profileFolderPath);
                    }
                    //change offraid pos to new pos based on exit name & config
                    const updateOffraidPosReturnObject = Travel_Controller.updateOffraidPos(info.exitName, statuses, statusesPath, profileInventory.items);
                    statuses.offraid_position = updateOffraidPosReturnObject.newOffraidPos;
                    profileInventory.items = updateOffraidPosReturnObject.updatedProfileItems;
                    //overwrite current stash with stash file from new offraid pos
                    if (config.multi_stash) {
                        profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper);
                        Stash_Controller.setStashSize(profile, profileFolderPath, statuses.offraid_position);
                    } //else no need to load a stash or set a size because it will be correct from game load
                    if (config.multi_hideout) {
                        profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, statuses.offraid_position, profileFolderPath);
                        Hideout_Controller.updateLockedHideoutStations(dbTables, statuses.offraid_position);
                    } //else no need to load a hideout because it will be correct from game load
                    Travel_Controller.updateLockedMaps(statuses.offraid_position, dbLocations);
                    Travel_Controller.setInfilParams(statuses.offraid_position, dbLocations);
                    Travel_Controller.updateRegen(statuses.offraid_position, dbGlobals);
                    //if (config.items_marked_fir_upon_exfil){Utils.markItemsOnPmcFIR(info.exitName, dbItems, profile)}
                    if (config.trader_access_restriction) {
                        Traders_Controller.updateLockedTraders(statuses.offraid_position, profile, globalsRagfair);
                    }
                    //else do nothing since they would be unlocked from game start
                    logger.log("[Traveler]: exitName: " + info.exitName, "green");
                    logger.log("[Traveler]: New offraid pos: " + statuses.offraid_position, "green");
                    Utils.updateSysmem(sysmem, sysmemPath, statuses, true); //update sysmem file offraid pos only
                    Utils.duplicateItemSplicer(profileInventory, logger);
                    Utils.backupProfile(logger, profileId, profileFolderName, "Raid End ", info.exitName);
                    return output;
                }
            }], "aki");
        //raid save
        staticRouterModService.registerStaticRouter("On_Game_Save_Traveler", [{
                url: "/raid/profile/save",
                action: (url, info, sessionId, output) => {
                    const databaseServer = container.resolve("DatabaseServer");
                    const dbTables = databaseServer.getTables();
                    const dbItems = dbTables.templates.items;
                    const Item_Helper = container.resolve("ItemHelper");
                    const profile = saveServer.getProfile(sessionId);
                    const profileFolderName = profile.info.username + "_" + profile.info.id;
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`;
                    const profileInventory = profile.characters.pmc.Inventory;
                    const statusesPath = `${profileFolderPath}/statuses.json`;
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"));
                    //save on profile/save
                    if (config.multi_stash) {
                        Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper);
                    }
                    else {
                        Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper);
                    }
                    return output;
                }
            }], "aki");
        //logout
        staticRouterModService.registerStaticRouter("On_Logout_Traveler", [{
                url: "/client/game/logout",
                action: (url, info, sessionId, output) => {
                    const databaseServer = container.resolve("DatabaseServer");
                    const dbTables = databaseServer.getTables();
                    const dbItems = dbTables.templates.items;
                    const Item_Helper = container.resolve("ItemHelper");
                    const profile = saveServer.getProfile(sessionId);
                    const profileFolderName = profile.info.username + "_" + profile.info.id;
                    const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`;
                    const profileInventory = profile.characters.pmc.Inventory;
                    const statusesPath = `${profileFolderPath}/statuses.json`;
                    const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"));
                    //save on logout
                    if (config.multi_stash) {
                        Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper);
                    }
                    else {
                        Stash_Controller.saveToStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper);
                    }
                    Hideout_Controller.saveToHideoutFile(profile, statuses.offraid_position, profileFolderPath);
                    return output;
                }
            }], "aki");
    }
}
module.exports = { mod: new Mod() };
