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
exports.HideoutController = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
const fs = __importStar(require("fs"));
const config = __importStar(require("../config/config.json"));
const useful_data_1 = require("./useful-data");
const Get_Data = new useful_data_1.GetData();
class HideoutController {
    updateLockedHideoutStations(dbTables, offraidPos) {
        const dbHideoutAreas = dbTables.hideout.areas;
        const configHideouts = config.hideouts;
        const hideoutTypeNumbersByName = Get_Data.getHideoutTypeNumbers();
        let thisHideoutStations;
        let noHideoutHere;
        const allHideoutTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        const requiredHideoutTypes = [4, 6, 17, 23];
        let thisHideoutTypeNumbers = requiredHideoutTypes; //these 4 stations are needed or error go brr
        for (const hdKey in configHideouts) {
            if (configHideouts[hdKey].access_via.includes(offraidPos)) {
                thisHideoutStations = configHideouts[hdKey].stations;
                break;
            }
        }
        if (thisHideoutStations === undefined) {
            noHideoutHere = true;
        }
        if (!noHideoutHere) {
            for (const stName in thisHideoutStations) {
                if (stName === "all_stations" && thisHideoutStations[stName] === true) {
                    thisHideoutTypeNumbers = allHideoutTypes;
                }
                else if (stName !== "all_stations" && thisHideoutStations[stName] === true) {
                    thisHideoutTypeNumbers.push(hideoutTypeNumbersByName[stName]);
                }
                else if (stName !== "all_stations" && thisHideoutStations[stName] === false && !requiredHideoutTypes.includes(hideoutTypeNumbersByName[stName])) {
                    for (let i = thisHideoutTypeNumbers.length; i > 0; i--) {
                        if (hideoutTypeNumbersByName[stName] === thisHideoutTypeNumbers[i - 1]) {
                            thisHideoutTypeNumbers.splice(i - 1, 1);
                        }
                    }
                }
            }
        }
        else {
            thisHideoutTypeNumbers.push(10);
        }
        for (const hdKey in dbHideoutAreas) {
            if (thisHideoutTypeNumbers.includes(dbHideoutAreas[hdKey].type)) {
                dbHideoutAreas[hdKey].enabled = true;
            }
            else {
                dbHideoutAreas[hdKey].enabled = false;
            }
        }
    }
    saveToHideoutFile(profile, offraidPos, profileFolderPath) {
        const hideoutFilePath = this.getHideoutNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "path");
        if (hideoutFilePath !== "NoHideoutHere") {
            const hideoutFile = JSON.parse(fs.readFileSync(hideoutFilePath, "utf8"));
            const profileHideoutElement = profile.characters.pmc.Hideout;
            const areas = profileHideoutElement.Areas;
            const improvements = profileHideoutElement.Improvements;
            const production = profileHideoutElement.Production;
            //overwrite hideout file
            hideoutFile.Areas = areas;
            hideoutFile.Improvements = improvements;
            hideoutFile.Production = production;
            //write back to the hidout file
            fs.writeFileSync(hideoutFilePath, JSON.stringify(hideoutFile, null, 4));
        }
    }
    loadHideoutFile(profile, offraidPos, profileFolderPath) {
        const hideoutFilePath = this.getHideoutNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "path");
        const profileHideoutElement = profile.characters.pmc.Hideout;
        if (hideoutFilePath !== "NoHideoutHere") {
            const hideoutFile = JSON.parse(fs.readFileSync(hideoutFilePath, "utf8"));
            profileHideoutElement.Areas = hideoutFile.Areas;
            profileHideoutElement.Improvements = hideoutFile.Improvements;
            profileHideoutElement.Production = hideoutFile.Production;
        }
        else {
            const hideoutAreasDefaultState = Get_Data.getHideoutAreasDefaultState();
            for (const areaKey in hideoutAreasDefaultState) {
                if (hideoutAreasDefaultState[areaKey].type === 10) {
                    hideoutAreasDefaultState[areaKey].level = 1;
                }
            }
            profileHideoutElement.Areas = hideoutAreasDefaultState;
            profileHideoutElement.Improvements = {};
            profileHideoutElement.Production = {};
        }
        return profileHideoutElement;
    }
    getHideoutNameOrPathFromOffraidPos(offraidPos, profileFolderPath, nameOrPath) {
        const hideouts = config.hideouts;
        let hideoutName = "NoHideoutHere";
        //for each offraid pos, loop thru all hideouts
        for (const hd in hideouts) {
            //for each hideout, loop thru all of its access vias
            const accessVias = hideouts[hd].access_via;
            if (accessVias.includes(offraidPos)) {
                hideoutName = hd;
            }
        }
        const hideoutPath = `${profileFolderPath}/hideouts/${hideoutName}.json`;
        if (nameOrPath === "name" || hideoutName === "NoHideoutHere") {
            return hideoutName;
        }
        else if (nameOrPath === "path") {
            return hideoutPath;
        }
    }
}
exports.HideoutController = HideoutController;
