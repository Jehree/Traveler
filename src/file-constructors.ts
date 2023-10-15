/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
import * as path from "path";
import * as fs from "fs";
import * as config from "../config/config.json";
import { IAkiProfile } from "@spt-aki/models/eft/profile/IAkiProfile";

import { GetData } from "./useful-data";

const Get_Data = new GetData()


export class FileConstructors{

    modPath: string = path.normalize(path.join(__dirname, ".."));


    profileFolderConstructor(profileFolderName:string, profile:IAkiProfile): void{

        //set profile folder path and create it if it doesn't exist
        const profileFolderPath = `${this.modPath}/profiles/${profileFolderName}`
        const profileBackupFolder = `${this.modPath}/profiles/.profile backups/${profileFolderName}`
        const stashesFolderPath = `${profileFolderPath}/stashes`
        const hideoutsFolderPath = `${profileFolderPath}/hideouts`
        if (!fs.existsSync(profileFolderPath)) {fs.mkdirSync(profileFolderPath)}
        if (!fs.existsSync(profileBackupFolder)) {fs.mkdirSync(profileBackupFolder)}
        if (!fs.existsSync(stashesFolderPath)) {fs.mkdirSync(stashesFolderPath)}
        if (!fs.existsSync(hideoutsFolderPath)) {fs.mkdirSync(hideoutsFolderPath)}

        //create profile files if they don't already exist
        this.statusesFileConstructor(profileFolderPath)
        this.sysmemFileConstructor(profileFolderPath)
        this.stashFilesConstructor(profileFolderPath, profile)
        this.hideoutFilesConstructor(profileFolderPath, profile) 
    }

    statusesFileConstructor(profileFolderPath:string): void{

        const statusesFileLayout = {
            "offraid_position": config.home,
            "checkpoint": config.home
        }

        this.fileConstructor(`${profileFolderPath}/statuses.json`, statusesFileLayout)
    }

    sysmemFileConstructor(profileFolderPath:string): void{

        const sysmemFileLayout = {
            "WARNING": "DO NOT MANUALLY CHANGE ANY `sysmem_` SETTING",
            "!----!----!": "!----!----!",
            "force_load": false,
            "sysmem_offraid_position": config.home,
            "sysmem_multi_stash": config.multi_stash,
            "sysmem_multi_hideout": config.multi_hideout
        }

        this.fileConstructor(`${profileFolderPath}/sysmem.json`, sysmemFileLayout)
    }

    stashFilesConstructor(profileFolderPath:string, profile:IAkiProfile): void{

        const configStashes = config.stashes
        const profileItems = profile.characters.pmc.Inventory?.items ?? []
        const stashesFolderPath = `${profileFolderPath}/stashes`
        const statuses = JSON.parse(fs.readFileSync(`${profileFolderPath}/statuses.json`, "utf8")) 

        for (const stashName in configStashes){

            const items = []

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
            if (configStashes[stashName].access_via.includes(statuses.offraid_position)){

                for (let i = profileItems.length; i > 0; i--){
                    if (profileItems[i-1].slotId === "hideout"){
                        items.push(profileItems[i-1])
                    }
                }
            }

            const stashFileLayout = {
                "Name": stashName,
                "Items": items
            }

            this.fileConstructor(`${stashesFolderPath}/${stashName}.json`, stashFileLayout)
        }
    }

    hideoutFilesConstructor(profileFolderPath:string, profile:IAkiProfile): void{

        const hideoutsFolderPath = `${profileFolderPath}/hideouts`
        const hideouts = config.hideouts
        const defaultAreas = Get_Data.getHideoutAreasDefaultState()
        const statuses = JSON.parse(fs.readFileSync(`${profileFolderPath}/statuses.json`, "utf8")) 

        for (const hideoutName in hideouts){

            let areas = []

            if (hideouts[hideoutName].access_via.includes(statuses.offraid_position)){
                areas = profile.characters.pmc?.Hideout?.Areas ?? defaultAreas
            } else {areas = defaultAreas}

            const hideoutFileLayout = {
                "Name": hideoutName,
    
                "Areas": [...areas],

                "Improvements": {},

                "Production": {}
            }

            this.fileConstructor(`${hideoutsFolderPath}/${hideoutName}.json`, hideoutFileLayout)
        }
    }

    fileConstructor(filePath:string, fileData:any): void{

        const fileDataJson = JSON.stringify(fileData, null, 2)

        if (!fs.existsSync(`${filePath}`)){

            fs.writeFileSync(`${filePath}`, fileDataJson)
        }
    }
}