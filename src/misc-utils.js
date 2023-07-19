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
exports.MiscUtils = void 0;
const path = __importStar(require("path"));
const fse = __importStar(require("fs-extra"));
const fs = __importStar(require("fs"));
const config = __importStar(require("../config/config.json"));
const exfilTooltips = __importStar(require("../config/exfil_tooltips.json"));
const useful_data_1 = require("./useful-data");
const stash_controller_1 = require("./stash-controller");
const hideout_controller_1 = require("./hideout-controller");
const traders_controller_1 = require("./traders-controller");
const Get_Data = new useful_data_1.GetData();
const Stash_Controller = new stash_controller_1.StashController();
const Hideout_Controller = new hideout_controller_1.HideoutController();
const Trader_Controller = new traders_controller_1.TradersController();
class MiscUtils {
    constructor() {
        this.modPath = path.normalize(path.join(__dirname, ".."));
        this.profileFolderPath = path.normalize(path.join(__dirname, "..", "..", "..", "profiles"));
    }
    noRunThrough(dbGlobals) {
        dbGlobals.config.exp.match_end.survived_exp_requirement = 0;
        dbGlobals.config.exp.match_end.survived_seconds_requirement = 0;
    }
    questFixes(dbQuests) {
        //change Dangerous Road quest to require an underpass extraction instead of streets car
        //tweak to the locale in the extraction_tooltips.json file
        const dangerousRoadQuest = dbQuests["63ab180c87413d64ae0ac20a"];
        dangerousRoadQuest.conditions.AvailableForFinish[0]._props.counter.conditions[2]._props["exitName"] = "E1";
    }
    uninstallTraveler(profile, profileFolderPath, statusesPath, dbItems, Item_Helper) {
        const profilePMCElement = profile.characters.pmc;
        const profileInventory = profilePMCElement.Inventory;
        const statuses = JSON.parse(fs.readFileSync(statusesPath, "utf8"));
        //save current stash and hideout
        Stash_Controller.saveToStashFile(profileInventory.items, statuses.offraid_position, profileFolderPath, dbItems, Item_Helper);
        Hideout_Controller.saveToHideoutFile(profile, statuses.offraid_position, profileFolderPath);
        //change offraid pos to home in statuses file
        statuses.offraid_position = config.home;
        fs.writeFileSync(statusesPath, JSON.stringify(statuses, null, 4));
        Trader_Controller.unlockAllTraders(profile);
        Stash_Controller.setStashSize(profile, profileFolderPath, config.home);
        profileInventory.items = Stash_Controller.loadStashFile(profileInventory.items, config.home, profileFolderPath, dbItems, Item_Helper);
        profilePMCElement.Hideout = Hideout_Controller.loadHideoutFile(profile, config.home, profileFolderPath);
        const idsToRemove = Object.keys(config.stashes).concat([
            "checkpoint_letter_id"
        ]);
        const profileItems = profileInventory.items;
        for (let i = profileItems.length; i > 0; i--) {
            if (idsToRemove.includes(profileItems[i - 1]?._tpl)) {
                profileInventory.items.splice(i - 1, 1);
            }
        }
    }
    updateSysmem(sysmem, sysmemPath, statuses, offraidPosOnly) {
        sysmem.sysmem_offraid_position = statuses.offraid_position;
        if (!offraidPosOnly) {
            sysmem.sysmem_multi_stash = config.multi_stash;
            sysmem.sysmem_multi_hideout = config.multi_hideout;
        }
        fs.writeFileSync(sysmemPath, JSON.stringify(sysmem, null, 4));
    }
    getArrOfFilePaths(folderPath) {
        const filePaths = [];
        fs.readdirSync(folderPath).forEach(file => {
            const newPath = `${folderPath}/${file}`;
            filePaths.push(newPath);
        });
        return filePaths;
    }
    backupProfile(logger, profileId, trvProfileFolderName, backupType, addInfo) {
        const profilePath = `${this.profileFolderPath}/${profileId}.json`;
        const trvProfileFolderPath = `${this.modPath}/profiles/${trvProfileFolderName}`;
        const trvProfileBackupsFolderPath = `${this.modPath}/profiles/.profile backups`;
        const thisProfileBackupFolderPath = `${trvProfileBackupsFolderPath}/${trvProfileFolderName}`;
        const dateTime = Get_Data.getFormattedTime();
        if (addInfo === null) {
            addInfo = "death";
        }
        //create the backup folders
        const backupPath = `${thisProfileBackupFolderPath}/[${dateTime}][${backupType}${addInfo}]/${trvProfileFolderName}`;
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }
        //copy files to it
        try {
            fse.copySync(trvProfileFolderPath, backupPath, { overwrite: false });
            fs.copyFileSync(profilePath, `${thisProfileBackupFolderPath}/[${dateTime}][${backupType}${addInfo}]/${profileId}.json`);
            logger.log(`[Traveler]: ${profileId}.json file and Traveler profile folder backed up to the "Traveler/profiles/.profile backups" folder!`, "green");
        }
        catch (err) {
            console.log(err);
        }
        //check number of backups that exist for profile
        const thisProfileBackupPathsArr = this.getArrOfFilePaths(thisProfileBackupFolderPath);
        if (thisProfileBackupPathsArr.length > config.number_of_profile_backups) {
            let highestBirthTime;
            let oldestProfileFolderPath = thisProfileBackupPathsArr[0];
            for (let i = 0; i < thisProfileBackupPathsArr.length; i++) {
                const thisFolderStats = fs.statSync(thisProfileBackupPathsArr[i]);
                const birthTimeMS = thisFolderStats["birthtimeMs"];
                if (birthTimeMS < highestBirthTime) {
                    highestBirthTime = birthTimeMS;
                    oldestProfileFolderPath = thisProfileBackupPathsArr[i];
                }
                thisProfileBackupPathsArr.splice(i, 1);
            }
            fs.rmSync(oldestProfileFolderPath, { recursive: true, force: true });
        }
    }
    duplicateItemSplicer(profileInventory, logger) {
        //this func splices any duplicate items loaded into the profile to protect against corruption
        const profileItems = profileInventory.items;
        for (let itemTOP = profileItems.length; itemTOP > 0; itemTOP--) {
            const topItemId = profileItems[itemTOP - 1]._id;
            for (let itemBOT = profileItems.length; itemBOT > 0; itemBOT--) {
                const botItemId = profileItems[itemBOT - 1]._id;
                if (itemBOT !== itemTOP && topItemId === botItemId) {
                    profileInventory.items.splice(+itemBOT - 1, 1);
                    logger.log("Duplicate item deleted from profile!", "red");
                }
            }
        }
    }
    changeExfilLocales(dbLocales) {
        const locales = dbLocales[`${config.locale_language}`];
        const exfilLocalesToChange = exfilTooltips.Extracts;
        for (const locName in exfilLocalesToChange) {
            if (exfilLocalesToChange[locName] !== "") {
                locales[locName] = exfilLocalesToChange[locName];
            }
        }
    }
    disableOutOfRaidQuestStashLocales(dbLocales) {
        const locales = dbLocales[`${config.locale_language}`];
        const stashLocalesToChange = exfilTooltips.OOR_Quest_Stash_Disable;
        for (const locKey in stashLocalesToChange) {
            if (stashLocalesToChange[locKey] !== "") {
                locales[locKey] = stashLocalesToChange[locKey];
            }
        }
    }
    changeTraderLocales(dbLocales) {
        const locales = dbLocales[config.locale_language];
        const configTraders = config.trader_config;
        for (const trName in configTraders) {
            const traderId = configTraders[trName].trader_id;
            const configTraderDesc = configTraders[trName].trader_description_text;
            const configTraderLoca = configTraders[trName].trader_location_text;
            if (configTraderDesc !== "") {
                locales[`${traderId} Description`] = configTraderDesc;
            }
            if (configTraderLoca !== "") {
                locales[`${traderId} Location`] = configTraderLoca;
            }
        }
    }
}
exports.MiscUtils = MiscUtils;
