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
exports.KikiMarkFIR = void 0;
const config = __importStar(require("../config/config.json"));
class KikiMarkFIR {
    kikiMarkFIR(container) {
        this.container = container;
        container.afterResolution("InraidController", (_t, result) => {
            // eslint-disable-next-line
            // @ts-ignore: we don't care that the prop is protected. 
            result.markOrRemoveFoundInRaidItems = (offraidData, pmcData, isPlayerScav) => {
                return this.InRaidControllerReplacement(offraidData, pmcData, isPlayerScav);
            };
        }, { frequency: "Always" });
        if (config.kiki_markFIR === true) {
            container.afterResolution("InRaidHelper", (_t, result) => {
                result.addSpawnedInSessionPropertyToItems = (preRaidProfile, postRaidProfile /*, isPlayerScav: boolean*/) => {
                    return this.InRaidHelperReplacement(preRaidProfile, postRaidProfile /*, isPlayerScav*/);
                };
            }, { frequency: "Always" });
        }
    }
    InRaidControllerReplacement(offraidData, pmcData, isPlayerScav) {
        const InRaidHelper = this.container.resolve("InRaidHelper");
        offraidData.profile = InRaidHelper.addSpawnedInSessionPropertyToItems(pmcData, offraidData.profile, isPlayerScav);
    }
    InRaidHelperReplacement(preRaidProfile, postRaidProfile /*, isPlayerScav: boolean*/) {
        for (const item of postRaidProfile.Inventory.items) {
            if ("upd" in item) {
                item.upd.SpawnedInSession = true;
            }
            else {
                item.upd = { SpawnedInSession: true };
            }
        }
        return postRaidProfile;
    }
}
exports.KikiMarkFIR = KikiMarkFIR;
