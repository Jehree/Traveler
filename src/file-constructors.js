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
exports.FileConstructors = void 0;
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const config = __importStar(require("../config/config.json"));
const useful_data_1 = require("./useful-data");
const Get_Data = new useful_data_1.GetData();
class FileConstructors {
    constructor() {
        this.modPath = path.normalize(path.join(__dirname, ".."));
    }
    profileFolderConstructor(profileFolderName, profile) {
        //set profile folder path and create it if it doesn't exist
        const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`;
        const profileBackupFolder = `${this.modPath}/profiles/.profile backups/${profileFolderName}`;
        const stashesFolderPath = `${profileFolderPath}/stashes`;
        const hideoutsFolderPath = `${profileFolderPath}/hideouts`;
        if (!fs.existsSync(profileFolderPath)) {
            fs.mkdirSync(profileFolderPath);
        }
        if (!fs.existsSync(profileBackupFolder)) {
            fs.mkdirSync(profileBackupFolder);
        }
        if (!fs.existsSync(stashesFolderPath)) {
            fs.mkdirSync(stashesFolderPath);
        }
        if (!fs.existsSync(hideoutsFolderPath)) {
            fs.mkdirSync(hideoutsFolderPath);
        }
        //create profile files if they don't already exist
        this.statusesFileConstructor(profileFolderPath);
        this.sysmemFileConstructor(profileFolderPath);
        this.stashFilesConstructor(profileFolderPath, profile);
        this.hideoutFilesConstructor(profileFolderPath, profile);
    }
    statusesFileConstructor(profileFolderPath) {
        const statusesFileLayout = {
            "offraid_position": config.home,
            "checkpoint": config.home
        };
        this.fileConstructor(`${profileFolderPath}/statuses.json`, statusesFileLayout);
    }
    sysmemFileConstructor(profileFolderPath) {
        const sysmemFileLayout = {
            "WARNING": "DO NOT MANUALLY CHANGE ANY `sysmem_` SETTING",
            "!----!----!": "!----!----!",
            "force_load": false,
            "sysmem_offraid_position": config.home,
            "sysmem_multi_stash": config.multi_stash,
            "sysmem_multi_hideout": config.multi_hideout
        };
        this.fileConstructor(`${profileFolderPath}/sysmem.json`, sysmemFileLayout);
    }
    stashFilesConstructor(profileFolderPath, profile) {
        const configStashes = config.stashes;
        const profileItems = profile.characters.pmc.Inventory?.items ?? [];
        const stashesFolderPath = `${profileFolderPath}/stashes`;
        const statuses = JSON.parse(fs.readFileSync(`${profileFolderPath}/statuses.json`, "utf8"));
        for (const stashName in configStashes) {
            const items = [];
            //if we are home and we are creating the stash file for home, fill it with our stash
            //me from the future... do we need this? I don't think we do since we save the stash
            //file upon profile create. Leaving for now since my brain is currently on the hideout
            //system. Will revisit.
            //.. me from future again. I remembered why we had this. It is so if, after profile creation
            //has already been completed, the stash file is deleted for some reason, it'll get
            //repopulated (if we are also at home). This is so you could set your offraid pos to home,
            //load the game, exit, then delete all stash files to get them to regen without losing
            //your home stash. Probably unnecessary.. but it isn't hurting anything so I'm leaving it.
            //ME FROM FURTHER INTO THE FUTURE. This allows previously created profiles to work correctly. Def keep.
            if (configStashes[stashName].access_via.includes(statuses.offraid_position)) {
                for (let i = profileItems.length; i > 0; i--) {
                    if (profileItems[i - 1].slotId === "hideout") {
                        items.push(profileItems[i - 1]);
                    }
                }
            }
            const stashFileLayout = {
                "Name": stashName,
                "Items": items
            };
            this.fileConstructor(`${stashesFolderPath}/${stashName}.json`, stashFileLayout);
        }
    }
    hideoutFilesConstructor(profileFolderPath, profile) {
        const hideoutsFolderPath = `${profileFolderPath}/hideouts`;
        const hideouts = config.hideouts;
        const defaultAreas = Get_Data.getHideoutAreasDefaultState();
        const statuses = JSON.parse(fs.readFileSync(`${profileFolderPath}/statuses.json`, "utf8"));
        for (const hideoutName in hideouts) {
            let areas = [];
            if (hideouts[hideoutName].access_via.includes(statuses.offraid_position)) {
                areas = profile.characters.pmc?.Hideout?.Areas ?? defaultAreas;
            }
            else {
                areas = defaultAreas;
            }
            const hideoutFileLayout = {
                "Name": hideoutName,
                "Areas": [...areas],
                "Improvements": {},
                "Production": {}
            };
            this.fileConstructor(`${hideoutsFolderPath}/${hideoutName}.json`, hideoutFileLayout);
        }
    }
    fileConstructor(filePath, fileData) {
        const fileDataJson = JSON.stringify(fileData, null, 2);
        if (!fs.existsSync(`${filePath}`)) {
            fs.writeFileSync(`${filePath}`, fileDataJson);
        }
    }
}
exports.FileConstructors = FileConstructors;
