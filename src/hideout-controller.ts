/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import * as fs from "fs";
import * as config from "../config/config.json";
import { IAkiProfile } from "@spt-aki/models/eft/profile/IAkiProfile";
import { Hideout } from "@spt-aki/models/eft/common/tables/IBotBase";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";

import { GetData } from "./useful-data";

const Get_Data = new GetData()


export class HideoutController{

    updateLockedHideoutStations(dbTables:IDatabaseTables, offraidPos:string):void{

        const dbHideoutAreas = dbTables.hideout.areas
        const configHideouts = config.hideouts
        const hideoutTypeNumbersByName = Get_Data.getHideoutTypeNumbers()

        let thisHideoutStations
        let noHideoutHere:boolean
        const allHideoutTypes = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
        const requiredHideoutTypes = [4,6,17,23,24,25]
        let thisHideoutTypeNumbers = requiredHideoutTypes //these stations are needed or error go brr

        for (const hdKey in configHideouts){
            if (configHideouts[hdKey].access_via.includes(offraidPos)){
                thisHideoutStations = configHideouts[hdKey].stations
                break
            }
        }

        if (thisHideoutStations === undefined){noHideoutHere = true}

        if (!noHideoutHere){
            for (const stName in thisHideoutStations){
                if (stName === "all_stations" && thisHideoutStations[stName] === true){

                    thisHideoutTypeNumbers = allHideoutTypes
                } else if (stName !== "all_stations" && thisHideoutStations[stName] === true){

                    thisHideoutTypeNumbers.push(hideoutTypeNumbersByName[stName])
                } else if (stName !== "all_stations" && thisHideoutStations[stName] === false && !requiredHideoutTypes.includes(hideoutTypeNumbersByName[stName])){

                    for (let i = thisHideoutTypeNumbers.length; i > 0; i--){
                        if (hideoutTypeNumbersByName[stName] === thisHideoutTypeNumbers[i-1]){
                            thisHideoutTypeNumbers.splice(i-1, 1)
                        }
                    }
                }
            }
        } else {
            thisHideoutTypeNumbers.push(10)
        }

        for (const hdKey in dbHideoutAreas){
            if (thisHideoutTypeNumbers.includes(dbHideoutAreas[hdKey].type)){
                dbHideoutAreas[hdKey].enabled = true
            } else {
                dbHideoutAreas[hdKey].enabled = false
            }
        }
    }

    saveToHideoutFile(profile:IAkiProfile, offraidPos:string, profileFolderPath:string): void{

        const hideoutFilePath = this.getHideoutNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "path")

        if (hideoutFilePath === "NoHideoutHere") return

        const hideoutFile = JSON.parse(fs.readFileSync(hideoutFilePath, "utf8"))
        const profileHideoutElement = profile.characters.pmc.Hideout
        const areas = profileHideoutElement.Areas
        const improvements = profileHideoutElement.Improvements
        const production = profileHideoutElement.Production


        //overwrite hideout file
        hideoutFile.Areas = areas
        hideoutFile.Improvements = improvements
        hideoutFile.Production = production

        //write back to the hideout file
        fs.writeFileSync(hideoutFilePath, JSON.stringify(hideoutFile, null, 4))
        
    }

    loadHideoutFile(profile:IAkiProfile, offraidPos:string, profileFolderPath:string):Hideout{

        const hideoutFilePath = this.getHideoutNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "path")

        const profileHideoutElement = profile.characters.pmc.Hideout

        if (hideoutFilePath !== "NoHideoutHere"){
            const hideoutFile = JSON.parse(fs.readFileSync(hideoutFilePath, "utf8"))
            profileHideoutElement.Areas = hideoutFile.Areas
            profileHideoutElement.Improvements = hideoutFile.Improvements
            profileHideoutElement.Production = hideoutFile.Production 
        } else {
            const hideoutAreasDefaultState = Get_Data.getHideoutAreasDefaultState()
            for (const areaKey in hideoutAreasDefaultState){
                if (hideoutAreasDefaultState[areaKey].type === 10){
                    hideoutAreasDefaultState[areaKey].level = 1
                }
            }
            profileHideoutElement.Areas = hideoutAreasDefaultState
            profileHideoutElement.Improvements = {}
            profileHideoutElement.Production = {}
        }

        return profileHideoutElement
    }

    getHideoutNameOrPathFromOffraidPos(offraidPos:string, profileFolderPath:string, nameOrPath:string): string{
        const hideouts = config.hideouts
        let hideoutName = "NoHideoutHere"

        //for each offraid pos, loop thru all hideouts
        for (const hd in hideouts){

            //for each hideout, loop thru all of its access vias
            const accessVias = hideouts[hd].access_via
            if (accessVias.includes(offraidPos)){
                hideoutName = hd
            }
        }
        const hideoutPath = `${profileFolderPath}/hideouts/${hideoutName}.json`


        if (nameOrPath === "name" || hideoutName === "NoHideoutHere"){
            return hideoutName
        } else if (nameOrPath === "path"){
            return hideoutPath
        }
    }

    getStashLevel(offraidPos:string, profileFolderPath:string):number{

        const hideoutFilePath = this.getHideoutNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "path")

        if (hideoutFilePath === "NoHideoutHere"){
            console.error("Tried to access hideout file with an offraidPos that has no hideout!")
            return
        }

        const hideoutFile = JSON.parse(fs.readFileSync(hideoutFilePath, "utf8"))
        const areas = hideoutFile.Areas

        for (const i in areas){
            if (areas[i].type === 3){
                return areas[i].level
            }
        }
    }
}