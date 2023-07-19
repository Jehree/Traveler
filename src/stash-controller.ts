/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import * as fs from "fs";
import * as config from "../config/config.json";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { ITemplateItem } from "@spt-aki/models/eft/common/tables/ITemplateItem";
import { IAkiProfile } from "@spt-aki/models/eft/profile/IAkiProfile";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";

export class StashController{

    

    setStashSize(profile:IAkiProfile, profileFolderPath:string, offraidPos:string): void{

        /*this code is dumb and confusing so let me explain lol. We check if the custom stash we are switching to
        is a static secondary one, or has its size tied to the hideout stash station. If it isn't progressive, nbd,
        we just grab the stash item in the profile inventory and swap its _tpl id for the custom one that we pushed
        to the db. If we are switching to a progressive stash, however, it gets a little messy. We first grab all
        the stashes present in the bonuses of the profile. We won't change any of these but it is a good place to
        see which stashes have been unlocked. We then use the ordered stashes object and some spit to figure out
        which of the present stashes in the bonuses is the biggest one. THEN, we set the stash to that one, since
        the biggest one should always be the current one that is unlocked (unless some masochist makes a mod that
        reduces stash size when you upgrade it or smtn lol)*/

        const stashesOrderedBySize = {
            "566abbc34bdc2d92178b4576": 1,
            "5811ce572459770cba1a34ea": 2,
            "5811ce662459770f6f490f32": 3,
            "5811ce772459770e9e5f9532": 4
        }

        const profileInventory = profile.characters.pmc.Inventory
        const profileBonuses = profile.characters.pmc.Bonuses
        let stashIsProgressive:boolean
        let stashItemId:string = this.getStashNameOrPathFromOffraidPos(offraidPos, profileFolderPath, "name")
        const stashProfileInvenId = profileInventory.stash //get stash inven _id from the profile Inventory.stash


        if (stashItemId === "TempStash_NoItemsSaved"){
            stashIsProgressive = false //stash is temporary
        } else if (config.stashes[stashItemId]?.size_h === undefined){
            stashIsProgressive = true //stash is progressive
        } else {
            stashIsProgressive = false //stash is static
        }

        if (stashIsProgressive){
            const stashSizeNumbersToCompare:Array<number> = []
            //loop thru bonuses in profile
            for (const bonus in profileBonuses){

                //if they have the "StashSize" type, push their weight number to the arr
                if (profileBonuses[bonus].type === "StashSize"){

                    const weightedStashesKey = profileBonuses[bonus].templateId
                    const stashWeight = stashesOrderedBySize[weightedStashesKey]
                    stashSizeNumbersToCompare.push(stashWeight)
                }
            }
            //use biggest stash's item id from the bonuses to get item id for stash
            for (const id in stashesOrderedBySize){
                if (stashesOrderedBySize[id] === Math.max(...stashSizeNumbersToCompare)){
                    stashItemId = id
                }
            }
        } //else we do nothing since static and temporary stashes will be correct at declaration of stashItemId

        //set the _tpl at the _id we got to the item id of the stash with the new size we want
        for (const item in profileInventory.items){
            if (profileInventory.items[item]._id === stashProfileInvenId){
                profileInventory.items[item]._tpl = stashItemId
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