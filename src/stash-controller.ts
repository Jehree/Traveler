/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import * as fs from "fs";
import * as config from "../config/config.json";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { IAkiProfile } from "@spt-aki/models/eft/profile/IAkiProfile";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { GetData } from "./useful-data";
import { HideoutController } from "./hideout-controller";

const Get_Data = new GetData()
const Hideout_Controller = new HideoutController()

export class StashController{

    

    setStashSize(profile:IAkiProfile, profileFolderPath:string, offraidPos:string): void{

        const stashesOrderedBySize = Get_Data.getStashIDsBySize()
        const profileInventory = profile.characters.pmc.Inventory
        const stashProfileInvenId = profileInventory.stash //get stash inven _id from the profile Inventory.stash
    
        this.removeStashSizeBonusesFromProfile(profile)

        let stashItemId:string = this.getStashNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "name")
        if (this.isStashProgressive(stashItemId)){
            const stashStationLevel = Hideout_Controller.getStashLevel(offraidPos, profileFolderPath)
            stashItemId = stashesOrderedBySize[stashStationLevel] ?? stashesOrderedBySize[0]
        }// else do nothing because the stashItemId is already correct

        //set the stash _tpl
        if (!stashItemId){return}
        for (const item in profileInventory.items){
            if (profileInventory.items[item]._id === stashProfileInvenId){
                profileInventory.items[item]._tpl = stashItemId
            }
        }
    }

    isStashProgressive(stashItemId:string):boolean{
        if (stashItemId === "TempStash_NoItemsSaved"){return false}
        if (config.stashes[stashItemId]?.size_h && config.stashes[stashItemId]?.size_v){return false}
        return true
    }

    removeStashSizeBonusesFromProfile(profile: IAkiProfile):void{
        //this may be needed in profiles created prior to Traveler install
        const profileBonuses = profile.characters.pmc.Bonuses
        for (let i = profile.characters.pmc.Bonuses.length; i > 0; i--){
            if (profile.characters.pmc.Bonuses[i-1].type === "StashSize"){
                profile.characters.pmc.Bonuses.splice(i-1, 1)
            }
        }
    }

    checkForItemChildren (profileItems:Array<any>, _id:string):Array<string> {

        const childrenItemsInStash = []

        for (const item in profileItems){

            const profItem_id = profileItems[item]?._id

            if (profileItems[item].parentId === _id){

                childrenItemsInStash.push(profItem_id)
                childrenItemsInStash.concat(this.checkForItemChildren(profileItems, profItem_id))
            }
        }
        return childrenItemsInStash
    }

    loadStashFile(profileItems:Array<any>, offraidPos:string, profileFolderPath:string, dbItems:Record<string, ITemplateItem>, Item_Helper:ItemHelper): Array<any>{


        const stashFilePath:string = this.getStashNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "path")

        //this array will contain the _id's of items with the "hideout" slotId, and any of their children
        let itemsInStash = []

        //store _id's of items with "hideout" slotId and also all of their children
        for (const item in profileItems){

            const profItem_id = profileItems[item]?._id

            if (profileItems[item].slotId === "hideout"){

                //findAndReturnChildrenByItems also returns the item itself
                itemsInStash = itemsInStash.concat(Item_Helper.findAndReturnChildrenByItems(profileItems, profItem_id))
            }
        }

        //loop again to empty profile items with "hideout" slotId and any children of those items in prep to recieve new stash items
        for (let i = profileItems.length; i > 0; i--){

            const profItem_tpl = profileItems[i-1]?._tpl
            const profItemId = profileItems[i-1]._id //this is the id for the item in the PROFILE not the item's actual _tpl id
            const isQuestItem = dbItems[profItem_tpl]?._props?.QuestItem

            if (itemsInStash.includes(profItemId) && !isQuestItem){

                profileItems.splice(i-1, 1)
            }
        }

        //push stashFile items to profile
        if (stashFilePath !== "TempStash_NoItemsSaved"){

            const stashFile = JSON.parse(fs.readFileSync(stashFilePath, "utf8"))
            profileItems = profileItems.concat(stashFile.Items)
        }

        return profileItems
    }

    saveToStashFile(profileItems:Array<any>, offraidPos:string, profileFolderPath:string, dbItems:Record<string, ITemplateItem>, Item_Helper:ItemHelper): void{

        const stashFilePath = this.getStashNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "path")

        //this array will contain the _id's of items with the "hideout" slotId, and any of their children
        let itemsInStash = []

        if (stashFilePath !== "TempStash_NoItemsSaved"){

            const tempItemsArr: Array<any> = []
            const stashFile = JSON.parse(fs.readFileSync(stashFilePath, "utf8"))

            //store _id's to identify this item and its children (if any)
            for (const item in profileItems){

                const profItem_id = profileItems[item]?._id
    
                if (profileItems[item].slotId === "hideout"){
    
                    //findAndReturnChildrenByItems also returns the item itself
                    itemsInStash = itemsInStash.concat(Item_Helper.findAndReturnChildrenByItems(profileItems, profItem_id))
                }
            }
    
            //loop again to push stash items
            for (const item in profileItems){

                const profItem_tpl = profileItems[item]?._tpl
                const profItemId = profileItems[item]._id //this is the id for the item in the PROFILE not the item's actual _tpl id
                const isQuestItem = dbItems[profItem_tpl]?._props?.QuestItem

                if (itemsInStash.includes(profItemId) && !isQuestItem){

                    tempItemsArr.push(profileItems[item])
                }
            }

            //overwrite stash file items with tempItemsArr
            stashFile.Items = [...tempItemsArr]

            //write back to the stash file
            fs.writeFileSync(stashFilePath, JSON.stringify(stashFile, null, 4))
        }
    }

    getArrOfCustomStashesToPushToDb(dbItems:Record<string, ITemplateItem>, jsonUtil:JsonUtil): Array<any>{

        const tempStash = jsonUtil.clone(dbItems["5811ce772459770e9e5f9532"])
        tempStash._name = "TempStash_NoItemsSaved"
        tempStash._id = "TempStash_NoItemsSaved"
        tempStash._props.Grids[0]._parent = "TempStash_NoItemsSaved"
        tempStash._props.Grids[0]._props.cellsH = 8
        tempStash._props.Grids[0]._props.cellsV = 8

        const configStashes = config.stashes
        const stashesToPushToDB: Array<object> = [tempStash]

        for (const stashName in configStashes){

            if (configStashes[stashName].size_h !== undefined){

                const customStash = jsonUtil.clone(dbItems["5811ce772459770e9e5f9532"])
                customStash._name = stashName
                customStash._id = stashName
                customStash._props.Grids[0]._parent = stashName
                customStash._props.Grids[0]._props.cellsH = configStashes[stashName].size_h
                customStash._props.Grids[0]._props.cellsV = configStashes[stashName].size_v

                stashesToPushToDB.push(customStash)
            }
        }
        return stashesToPushToDB
    }

    getStashNameOrPathFromOffraidPos(offraidPos:string, profileFolderPath:string, nameOrPath:string): string{
        const stashes = config.stashes
        let stashName = "TempStash_NoItemsSaved"

        //for each offraid pos, loop thru all stashes
        for (const st in stashes){

            //for each stash, loop thru all of its access vias
            const accessVias = stashes[st].access_via
            for (const acc in accessVias){

                //if the access via === the current offraid pos, return the stash name
                if (accessVias[acc] === offraidPos){

                    stashName = st
                }
            }
        }
        const stashPath = `${profileFolderPath}/stashes/${stashName}.json`

        if (nameOrPath === "name" || stashName === "TempStash_NoItemsSaved"){
            return stashName
        } else if (nameOrPath === "path"){
            return stashPath
        }
    }

    disableOORQuestStash(dbItems:Record<string, ITemplateItem>):void{

        const outOfRaidQuestStash = dbItems["5963866b86f7747bfa1c4462"]
        const OORstashGrid = outOfRaidQuestStash._props.Grids[0]._props

        OORstashGrid.cellsH = 8
        OORstashGrid.cellsV = 0
        OORstashGrid.filters = [
            {
                "Filter": [""],
                "ExcludedFilter": ["54009119af1c881c07000029"]
            }
        ]

        const inRaidQuestStash = dbItems["5963866286f7747bf429b572"]
        const IRstashGrid = inRaidQuestStash._props.Grids[0]._props
        IRstashGrid.cellsV = 20
    }
}