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
exports.TradersController = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
const config = __importStar(require("../config/config.json"));
class TradersController {
    updateLockedTraders(offraidPos, profile, globalsRagfair) {
        const profileTraders = profile.characters.pmc.TradersInfo;
        const configTraders = config.trader_config;
        //loop thru traders in profile
        for (const profTraderId in profileTraders) {
            //loop thru traders in config
            for (const confTraderName in configTraders) {
                const confTraderId = configTraders[confTraderName].trader_id;
                const confTraderAccessVia = configTraders[confTraderName].access_via;
                const confTraderAccessEverywhere = configTraders[confTraderName].accessible_everywhere;
                //if accessible_everywhere is false
                //set to enabled if offraid pos matches, disabled if not
                if (confTraderId === profTraderId) {
                    if (confTraderAccessVia.includes(offraidPos) || confTraderAccessEverywhere) {
                        //do some checks for ragfair, if ragfair has offraid pos's, it will work like a trader
                        //if it doesn't, it won't ever be locked by the mod, meaning it will act like vanilla
                        if (profTraderId !== "ragfair") {
                            profileTraders[profTraderId].disabled = false;
                        }
                        else if ( /*is ragfair*/configTraders[confTraderName]?.unlock_via_offraid_pos) {
                            globalsRagfair.minUserLevel = configTraders[confTraderName].unlock_level;
                        }
                    }
                    else {
                        //do some checks for ragfair, if ragfair has offraid pos's, it will work like a trader
                        //if it doesn't, it won't ever be locked by the mod, meaning it will act like vanilla
                        if (profTraderId !== "ragfair") {
                            profileTraders[profTraderId].disabled = true;
                        }
                        else if ( /*is ragfair*/configTraders[confTraderName]?.unlock_via_offraid_pos) {
                            globalsRagfair.minUserLevel = 420;
                        }
                    }
                }
            }
        }
    }
    unlockAllTraders(profile) {
        //make dis unlock le traders
        const profileTraders = profile.characters.pmc.TradersInfo;
        for (const traderId in profileTraders) {
            if (traderId !== "ragfair") {
                profileTraders[traderId].disabled = false;
            }
        }
    }
}
exports.TradersController = TradersController;
