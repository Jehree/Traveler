"use strict";
/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetData = void 0;
class GetData {
    getHideoutTypeNumbers() {
        const hideoutTypeNumbers = {
            "vents": 0,
            "security": 1,
            "lavatory": 2,
            "stash": 3,
            "generator": 4,
            "heating": 5,
            "water collector": 6,
            "med station": 7,
            "nutrition": 8,
            "rest space": 9,
            "workbench": 10,
            "intel center": 11,
            "shooting range": 12,
            "library": 13,
            "scav case": 14,
            "lights": 15,
            "place of fame": 16,
            "air filter": 17,
            "solar": 18,
            "booze": 19,
            "bitcoin farm": 20,
            "christmas tree": 21,
            "defective wall": 22,
            "gym": 23
        };
        return hideoutTypeNumbers;
    }
    getHideoutAreasDefaultState() {
        const profileHideoutAreasDefaultState = [
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 1,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 3
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 0
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 1
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 2
            },
            {
                "active": false,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [
                    {
                        "locationIndex": 0
                    },
                    {
                        "locationIndex": 1
                    },
                    {
                        "locationIndex": 2
                    },
                    {
                        "locationIndex": 3
                    },
                    {
                        "locationIndex": 4
                    },
                    {
                        "locationIndex": 5
                    },
                    {
                        "locationIndex": 6
                    },
                    {
                        "locationIndex": 7
                    }
                ],
                "type": 4
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 5
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [
                    {
                        "locationIndex": 0
                    },
                    {
                        "locationIndex": 1
                    },
                    {
                        "locationIndex": 2
                    }
                ],
                "type": 6
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 7
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 8
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 9
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 1,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 10
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 11
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 12
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 13
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 14
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 15
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 16
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": false,
                "slots": [
                    {
                        "locationIndex": 0
                    },
                    {
                        "locationIndex": 1
                    },
                    {
                        "locationIndex": 2
                    },
                    {
                        "locationIndex": 3
                    },
                    {
                        "locationIndex": 4
                    }
                ],
                "type": 17
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 18
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 19
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [
                    {
                        "locationIndex": 0
                    },
                    {
                        "locationIndex": 1
                    },
                    {
                        "locationIndex": 2
                    },
                    {
                        "locationIndex": 3
                    },
                    {
                        "locationIndex": 4
                    },
                    {
                        "locationIndex": 5
                    },
                    {
                        "locationIndex": 6
                    },
                    {
                        "locationIndex": 7
                    },
                    {
                        "locationIndex": 8
                    },
                    {
                        "locationIndex": 9
                    },
                    {
                        "locationIndex": 10
                    },
                    {
                        "locationIndex": 11
                    },
                    {
                        "locationIndex": 12
                    },
                    {
                        "locationIndex": 13
                    },
                    {
                        "locationIndex": 14
                    },
                    {
                        "locationIndex": 15
                    },
                    {
                        "locationIndex": 16
                    },
                    {
                        "locationIndex": 17
                    },
                    {
                        "locationIndex": 18
                    },
                    {
                        "locationIndex": 19
                    },
                    {
                        "locationIndex": 20
                    },
                    {
                        "locationIndex": 21
                    },
                    {
                        "locationIndex": 22
                    },
                    {
                        "locationIndex": 23
                    },
                    {
                        "locationIndex": 24
                    },
                    {
                        "locationIndex": 25
                    },
                    {
                        "locationIndex": 26
                    },
                    {
                        "locationIndex": 27
                    },
                    {
                        "locationIndex": 28
                    },
                    {
                        "locationIndex": 29
                    },
                    {
                        "locationIndex": 30
                    },
                    {
                        "locationIndex": 31
                    },
                    {
                        "locationIndex": 32
                    },
                    {
                        "locationIndex": 33
                    },
                    {
                        "locationIndex": 34
                    },
                    {
                        "locationIndex": 35
                    },
                    {
                        "locationIndex": 36
                    },
                    {
                        "locationIndex": 37
                    },
                    {
                        "locationIndex": 38
                    },
                    {
                        "locationIndex": 39
                    },
                    {
                        "locationIndex": 40
                    },
                    {
                        "locationIndex": 41
                    },
                    {
                        "locationIndex": 42
                    },
                    {
                        "locationIndex": 43
                    },
                    {
                        "locationIndex": 44
                    },
                    {
                        "locationIndex": 45
                    },
                    {
                        "locationIndex": 46
                    },
                    {
                        "locationIndex": 47
                    },
                    {
                        "locationIndex": 48
                    },
                    {
                        "locationIndex": 49
                    }
                ],
                "type": 20
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 21
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 22
            },
            {
                "active": true,
                "completeTime": 0,
                "constructing": false,
                "lastRecipe": "",
                "level": 0,
                "passiveBonusesEnabled": true,
                "slots": [],
                "type": 23
            }
        ];
        return profileHideoutAreasDefaultState;
    }
    getFormattedTime() {
        const today = new Date();
        const y = today.getFullYear();
        // JavaScript months are 0-based.
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const h = today.getHours();
        const mi = today.getMinutes();
        const s = today.getSeconds();
        return "d=" + m + "." + d + "." + y + " t=" + h + "." + mi + "." + s;
    }
    firTweakItemBlacklist() {
        return [
            "544a11ac4bdc2d470e8b456a",
            "5732ee6a24597719ae0c0281",
            "5857a8b324597729ab0a0e7d",
            "5c0a794586f77461c458f892",
            "59db794186f77448bc595262",
            "5857a8bc2459772bad15db29",
            "5c093ca986f7740a1867ab12",
            "checkpoint_letter_id"
        ];
    }
    getAllCurrencyIdsByName() {
        return {
            "roubles": "5449016a4bdc2d6f028b456f",
            "euros": "569668774bdc2da2298b4568",
            "dollars": "5696686a4bdc2da3298b456a"
        };
    }
    getAllValidMapnames() {
        return [
            "bigmap",
            "factory4_day",
            "factory4_night",
            "interchange",
            "laboratory",
            "lighthouse",
            "rezervbase",
            "shoreline",
            "tarkovstreets",
            "woods"
        ];
    }
    getCarExtractsByMapname() {
        return {
            "Dorms V-Ex": "customs",
            "PP Exfil": "interchange",
            " V-Ex_light": "lighthouse",
            "E7_car": "streets",
            "South V-Ex": "woods"
        };
    }
    getTraderIdsByName() {
        return {
            "mechanic": "5a7c2eca46aef81a7ca2145d",
            "skier": "58330581ace78e27b8b10cee",
            "peacekeeper": "5935c25fb3acc3127c3d8cd9",
            "therapist": "54cb57776803fa99248b456e",
            "prapor": "54cb50c76803fa8b248b4571",
            "jaeger": "5c0647fdd443bc2504c2d371",
            "ragman": "5ac3b934156ae10c4430e83c"
        };
    }
    getMapExfilNames(mapName) {
        const bigmapExfils = {
            mapName: ["bigmap"],
            pmc: [
                "Crossroads",
                "Smuggler's Boat",
                "RUAF Roadblock",
                "ZB-1012",
                "ZB-1011",
                "Trailer Park",
                "Old Gas Station",
                "Dorms V-Ex",
                "EXFIL_ZB013"
            ],
            scav: [
                "Shack",
                "Beyond Fuel Tank",
                "Railroad To Military Base",
                "Old Road Gate",
                "Sniper Roadblock",
                "Railroad To Port",
                "Trailer Park Workers Shack",
                "Railroad To Tarkov",
                "RUAF Roadblock_scav",
                "Warehouse 17",
                "Factory Shacks",
                "Warehouse 4",
                "Old Azs Gate",
                "Factory Far Corner",
                "Administration Gate",
                "Military Checkpoint"
            ]
        };
        const factoryExfils = {
            mapName: ["factory4_day", "factory4_night"],
            pmc: [
                "Cellars",
                "Gate 3",
                "Gate 0",
                "Gate m"
            ],
            scav: [
                "Camera Bunker Door",
                "Office Window"
            ]
        };
        const interchangeExfils = {
            mapName: ["interchange"],
            pmc: [
                "NW Exfil",
                "SE Exfil",
                "PP Exfil",
                "Saferoom Exfil",
                "Hole Exfill",
                "Interchange Cooperation"
            ],
            scav: []
        };
        const laboratoryExfils = {
            mapName: ["laboratory"],
            pmc: [
                "lab_Parking_Gate",
                "lab_Hangar_Gate",
                "lab_Elevator_Med",
                "lab_Under_Storage_Collector",
                "lab_Elevator_Main",
                "lab_Vent",
                "lab_Elevator_Cargo"
            ],
            scav: []
        };
        const lighthouseExfils = {
            mapName: ["lighthouse"],
            pmc: [
                "EXFIL_Train",
                "Alpinist_light",
                "tunnel_shared",
                "Nothern_Checkpoint",
                "Coastal_South_Road",
                "Shorl_free",
                " V-Ex_light"
            ],
            scav: [
                "Shorl_free_scav",
                "Scav_Coastal_South",
                "Scav_Underboat_Hideout",
                "Scav_Hideout_at_the_grotto",
                "Scav_Industrial_zone"
            ]
        };
        const rezervbaseExfils = {
            mapName: ["rezervbase"],
            pmc: [
                "EXFIL_Train",
                "Alpinist",
                "EXFIL_ScavCooperation",
                "EXFIL_Bunker",
                "EXFIL_BUNKER_D2",
                "EXFIL_vent"
            ],
            scav: [
                "Exit1",
                "Exit2",
                "Exit3",
                "Exit4"
            ]
        };
        const shorelineExfils = {
            mapName: ["shoreline"],
            pmc: [
                "Tunnel",
                "Rock Passage",
                "Pier Boat",
                "CCP Temporary",
                "Road to Customs",
                "Lighthouse_pass",
                "Road_at_railbridge"
            ],
            scav: [
                "Scav Road to Customs",
                "Lighthouse",
                "Wrecked Road",
                "Svetliy Dead End",
                "Ruined House Fence",
                "South Fence Passage",
                "RWing Gym Entrance",
                "Adm Basement"
            ]
        };
        const tarkovstreetsExfils = {
            mapName: ["tarkovstreets"],
            pmc: [
                "E1",
                "E2",
                "E3",
                "E4",
                "E5",
                "E6",
                "E7_car",
                "E8_yard",
                "E9_sniper"
            ],
            scav: [
                "scav_e1",
                "scav_e2",
                "scav_e3",
                "scav_e4"
            ]
        };
        const woodsExfils = {
            mapName: ["woods"],
            pmc: [
                "ZB-016",
                "Outskirts",
                "UN Roadblock",
                "RUAF Gate",
                "ZB-014",
                "South V-Ex",
                "Factory Gate",
                "un-sec"
            ],
            scav: [
                "Outskirts Water",
                "Dead Man's Place",
                "The Boat",
                "Scav House",
                "East Gate",
                "Mountain Stash",
                "West Border",
                "Old Station",
                "RUAF Roadblock"
            ]
        };
        const maps = [
            bigmapExfils,
            factoryExfils,
            interchangeExfils,
            laboratoryExfils,
            lighthouseExfils,
            rezervbaseExfils,
            shorelineExfils,
            tarkovstreetsExfils,
            woodsExfils
        ];
        for (const m in maps) {
            if (maps[m].mapName.includes(mapName)) {
                return maps[m];
            }
        }
    }
}
exports.GetData = GetData;
