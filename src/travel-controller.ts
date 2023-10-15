/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import * as fs from "fs";
import * as config from "../config/config.json";
import * as playerSpawnpoints from "../config/player_spawnpoints.json";
import { ILocations } from "@spt-aki/models/spt/server/ILocations";
import { container } from "tsyringe";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

import { GetData } from "./useful-data";
import { IGlobals, Regeneration } from "@spt-aki/models/eft/common/IGlobals";
import { Item } from "@spt-aki/models/eft/common/tables/IItem";

const Get_Data = new GetData()
const logger = container.resolve<ILogger>("WinstonLogger");

export class TravelController{


    updateOffraidPos(exitName:string, statuses:any, statusesPath:string, profileItems: Item[]):void{

        let isDeath = false
        if (exitName === null){isDeath = true}

        if (isDeath){
            this.handleDeath(statuses, statusesPath, profileItems)
            return
        }

        this.handleExtraction(exitName, statuses, statusesPath)
    }

    handleDeath(statuses:any, statusesPath:string, profileItems: Item[]):void{

        if (!config.death_updates_offraid_position){
            logger.log("death_updates_offraid_position disabled, offraid position remains: "+statuses.offraid_position, "yellow")
            return
        }

        const checkpointVoucherId = "checkpoint_letter_id"
        const specSlotNames = [
            "SpecialSlot1",
            "SpecialSlot2",
            "SpecialSlot3"
        ]
        let checkpointVoucherEquipped = false

        for (const item in profileItems){
            if (!specSlotNames.includes(profileItems[item].slotId)){continue}
            if (profileItems[item]._tpl !== checkpointVoucherId){continue}
            
            logger.log("Checkpoint voucher found! Respawning at: "+statuses.checkpoint, "yellow")
            checkpointVoucherEquipped = true
            statuses.offraid_position = statuses.checkpoint
            fs.writeFileSync(statusesPath, JSON.stringify(statuses, null, 4))
            break
        }

        if (!checkpointVoucherEquipped){
            logger.log("No checkpoint voucher equipped, respawning at home", "yellow")
            statuses.offraid_position = config.home
            statuses.checkpoint = config.home
            fs.writeFileSync(statusesPath, JSON.stringify(statuses, null, 4))
        }
    }

    handleExtraction(exitName:string, statuses:any, statusesPath:string):void{

        const offraidPositions = config.offraid_positions
        for (const pos in offraidPositions){

            const accessViaMaps:object = offraidPositions[pos].access_via
            for (const mapName in accessViaMaps){

                if (!accessViaMaps[mapName].includes(exitName)){continue}

                //set offraid pos to this one
                statuses.offraid_position = pos
                
                //save checkpoint if it is one
                if (config.checkpoints.includes(pos) || pos === config.home){
                    statuses.checkpoint = pos
                }
                fs.writeFileSync(statusesPath, JSON.stringify(statuses, null, 4))
            }
        }
    }

    setInfilParams(offraidPos:string, dbLocations:ILocations):void{

        this.removeAllPlayerSpawns(dbLocations)

        const canInfilToMaps = config.offraid_positions[offraidPos].can_infil_to

        for (const mapName in canInfilToMaps){

            const mapBase = dbLocations[mapName].base
            const infilPoint = canInfilToMaps[mapName]
            const positionData = playerSpawnpoints[mapName]?.[infilPoint]?.Position
            const rotation = playerSpawnpoints[mapName]?.[infilPoint]?.Rotation

            if (positionData === undefined){
                logger.log("[Traveler]: Invalid infil point name! Check the config for errors!", "red")
                logger.log("[Traveler]: The infil points used in can_infil_to must match the names in player_spawnpoints.json", "red")
            }
            mapBase.SpawnPointParams.push(this.spawnPointParamConstructor(infilPoint, positionData, rotation))

        }
    }

    removeAllPlayerSpawns(dbLocations:ILocations):void{

        const validMapNames = Get_Data.getAllValidMapnames()

        for (const mapName in dbLocations){
            if (!validMapNames.includes(mapName)){continue}

            const spawnPointParams = dbLocations[mapName]?.base?.SpawnPointParams
            if (spawnPointParams === undefined){continue}

            //remove Player from Categories all SpawnPointParams
            //if Categories are empty after removing Player, remove the whole Param
            for (let param = spawnPointParams.length; param > 0; param--){

                const categories = spawnPointParams[param-1].Categories
                for (let i = categories.length; i > 0; i--){

                
                    if (categories[i-1] === "Player"){

                        spawnPointParams[param-1].Categories.splice(i-1,1)
                    }

                    if (categories.length === 0){

                        dbLocations[mapName].base.SpawnPointParams.splice(param-1, 1)
                    }
                }
            }
            
        }
    }

    spawnPointParamConstructor(spawnId:string, positionData:any, rot:number):object{

        const spawnPoint = 
            {
                Id: spawnId,
                Position: {
                    x: positionData[0],
                    y: positionData[1],
                    z: positionData[2]
                },
                Rotation: rot || 0.0,
                Sides: ["All"],
                Categories: ["Player"],
                Infiltration: "all",
                DelayToCanSpawnSec: 3,
                ColliderParams: {
                    _parent: "SpawnSphereParams",
                    _props: {
                        Center: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        Radius: 0.0
                    }
                },
                BotZoneName: ""
            }
        return spawnPoint
    }

    setExfilParams(dbLocations:ILocations):void{

        this.pushScavExtractsToDb(dbLocations)

        const carExtracts = Get_Data.getCarExtractsByMapname()
        const validMapNames = Get_Data.getAllValidMapnames()

        for (const i in validMapNames){

            const mapName = validMapNames[i]
            const map = dbLocations[mapName]
            const mapExits = map.base.exits
            const offraidPositions = config.offraid_positions
    
            for (const exit in mapExits){

                const exitName = mapExits[exit].Name
                
                //figure out if extract should be enabled
                let exitEnabled = false
    
                for (const pos in offraidPositions){
                    if (offraidPositions[pos].access_via[mapName]?.includes(exitName)){
                        exitEnabled = true
                    }
                }
    
                let passageReq = mapExits[exit].PassageRequirement ?? "None"
                
                if (passageReq !== "TransferItem" && passageReq !== "WorldEvent"){
                    passageReq = "None"
                }
    
                //set car extracts per config
                const configCarExfils = config.car_exfils
                let carCost = 0
    
                if (passageReq === "TransferItem"){

                    if (configCarExfils.all_cars_free || configCarExfils[carExtracts[exitName]] === 0){
    
                        passageReq = "None"
    
                    } else {

                        //don't change passageReq
                        carCost = configCarExfils[carExtracts[exitName]]
                    }
                }
    
                //set world extracts per config
                if (passageReq === "WorldEvent" && !config.world_event_exfil_requirements){

                    passageReq = "None"

                } //else don't change passageReq

                
                mapExits[exit] = this.setExfil(exitName, exitEnabled, passageReq, carCost)
            }
        }
    }

    setExfil(exitName:string, enabled:boolean, passageReq:string, carCost:number):object{

        //if extract is car extract but with cost of 0, make it "None"
        if (passageReq === "TransferItem" && carCost === 0){
            passageReq = "None"
        }

        //set car currency if price is above 0 
        let carCurrency:string 
        if (carCost > 0){

            const currencyIDs = Get_Data.getAllCurrencyIdsByName()

            carCurrency = config.car_exfils.car_currency
            Object.entries(currencyIDs).forEach(([key, val]) => {
                if (key === carCurrency){
                    carCurrency = val
                }
            })

        } else {carCurrency = ""}

        //set if enabled or not
        let exfilChance:number
        if (enabled){exfilChance = 100} else {exfilChance = 0}

        const exit = 
        {      
            Name: exitName,
            EntryPoints: "all",
            Chance: exfilChance,
            Count: carCost,
            Id: carCurrency,
            MinTime: 0,
            MaxTime: 0,
            ExfiltrationType: "Individual",
            PassageRequirement: passageReq,
            PlayersCount: 0,
            ExfiltrationTime: 10,
            RequiredSlot: "FirstPrimaryWeapon",
            RequirementTip: ""
        }
        return exit
    }

    updateLockedMaps(offraidPos:string, dbLocations:ILocations):void{

        const configCanInfilTo:Array<object> = config.offraid_positions[offraidPos].can_infil_to
        const unlockedMaps:Array<string> = Object.keys(configCanInfilTo)

        for (const locKey in dbLocations){

            const lockedParam = dbLocations[locKey]?.base?.Locked

            if (lockedParam !== undefined){

                if (unlockedMaps.includes(locKey)){

                    dbLocations[locKey].base.Locked = false
                } else {

                    dbLocations[locKey].base.Locked = true
                }
            }
        }
    }

    pushScavExtractsToDb(dbLocations:ILocations):void{

        for (const locKey in dbLocations){

            const mapBase = dbLocations[locKey].base
            const allMapExfils = Get_Data.getMapExfilNames(locKey)
            const scavExfils = allMapExfils?.scav

            if (scavExfils){
                for (const exfil in scavExfils){
                    mapBase.exits.push(this.setExfil(scavExfils[exfil], false, "None", 0))
                }
            }

        }
    }

    updateRegen(offraidPos:string, dbGlobals:IGlobals):void{

        const dbRegen = dbGlobals.config.Health.Effects.Regeneration
        let health_regen = false
        let energy_regen = false
        let hydration_regen = false


        if (!config.regen.health_regen.available_everywhere){

            if (config.regen.health_regen.access_via.includes(offraidPos)){
                health_regen = true
            }
            this.enableDisableHealthRegen(dbRegen, health_regen)
        }

        if (!config.regen.energy_regen.available_everywhere){

            if (config.regen.energy_regen.access_via.includes(offraidPos)){
                energy_regen = true
            }
            this.enableDisableEnergyRegen(dbRegen, energy_regen)
        }

        if (!config.regen.hydration_regen.available_everywhere){

            if (config.regen.hydration_regen.access_via.includes(offraidPos)){
                hydration_regen = true
            }
            this.enableDisableHydrationRegen(dbRegen, hydration_regen)
        }

    }

    enableDisableHealthRegen(dbRegen:Regeneration, enabled:boolean):void{

        let head_rate = config.regen.health_regen.head_rate
        let chest_rate = config.regen.health_regen.chest_rate
        let stomach_rate = config.regen.health_regen.stomach_rate
        let left_arm_rate = config.regen.health_regen.left_arm_rate
        let right_arm_rate = config.regen.health_regen.right_arm_rate
        let left_leg_rate = config.regen.health_regen.left_leg_rate
        let right_leg_rate = config.regen.health_regen.right_leg_rate
        
        if (!enabled){
            head_rate = 0
            chest_rate = 0
            stomach_rate = 0
            left_arm_rate = 0
            right_arm_rate = 0
            left_leg_rate = 0
            right_leg_rate = 0
        }

        const bodyHealth = dbRegen.BodyHealth

        bodyHealth.Head.Value = head_rate
        bodyHealth.Chest.Value = chest_rate
        bodyHealth.Stomach.Value = stomach_rate
        bodyHealth.LeftArm.Value = left_arm_rate
        bodyHealth.RightArm.Value = right_arm_rate
        bodyHealth.LeftLeg.Value = left_leg_rate
        bodyHealth.RightLeg.Value = right_leg_rate
    }

    enableDisableEnergyRegen(dbRegen:Regeneration, enabled:boolean):void{

        let rate = config.regen.energy_regen.rate
        
        if (!enabled){
            rate = 0
        }

        dbRegen.Energy = rate
    }

    enableDisableHydrationRegen(dbRegen:Regeneration, enabled:boolean):void{
        
        let rate = config.regen.hydration_regen.rate
        
        if (!enabled){
            rate = 0
        }

        dbRegen.Hydration = rate
    }

    //turns out I don't think I need to use this, but I'm keeping it just in case
    /*fixMapnames(mapNames:Array<string>):Array<string>{
        for (const name in mapNames){
            if (mapNames[name] === "interchange"){
                mapNames[name] = "Interchange"
            }
            if (mapNames[name] === "lighthouse"){
                mapNames[name] = "Lighthouse"
            }
            if (mapNames[name] === "rezervbase"){
                mapNames[name] = "RezervBase"
            }
            if (mapNames[name] === "tarkovstreets"){
                mapNames[name] = "TarkovStreets"
            }
            if (mapNames[name] === "woods"){
                mapNames[name] = "Woods"
            }
        }
        return mapNames
    }*/
}