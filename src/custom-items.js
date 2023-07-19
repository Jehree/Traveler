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
exports.CustomItems = void 0;
const useful_data_1 = require("./useful-data");
const config = __importStar(require("../config/config.json"));
const Get_Data = new useful_data_1.GetData();
class CustomItems {
    customVoucherItem(dbTables, jsonUtil, bundlePath) {
        const handbook = dbTables.templates.handbook;
        const locales = Object.values(dbTables.locales.global);
        const traderIDs = Get_Data.getTraderIdsByName();
        const currencyIDs = Get_Data.getAllCurrencyIdsByName();
        const cpTraderConfig = config.checkpoint_trader_config;
        const cpItemId = "checkpoint_letter_id";
        const item = jsonUtil.clone(dbTables.templates.items["590c2d8786f774245b1f03f3"]);
        item._id = cpItemId;
        item._props.Width = 2;
        item._props.Height = 1;
        item._props.Prefab.path = bundlePath;
        item._props.ItemSound = "item_plastic_generic";
        if (config.checkpoint_letter_consume_upon_death) {
            item._parent = "5c99f98d86f7745c314214b3"; //key
            item._props.MaximumNumberOfUsage = config.checkpoint_letter_number_of_uses;
        }
        else {
            item._parent = "5447e0e74bdc2d3c308b4567"; //spec item
        }
        dbTables.templates.items[cpItemId] = item;
        for (const locale of locales) {
            locale[`${cpItemId} Name`] = "Marked Letter";
            locale[`${cpItemId} ShortName`] = "M. Letter";
            locale[`${cpItemId} Description`] = "A mysterious marked letter.\n\nPlace this letter in one of your special slots, and if you die you will respawn at your last visited checkpoint instead of home.";
        }
        handbook.Items.push({
            "Id": cpItemId,
            "ParentId": "5b47574386f77428ca22b343",
            "Price": 0
        });
        //add to config trader's inventory
        let traderToPushTo = cpTraderConfig.trader;
        Object.entries(traderIDs).forEach(([key, val]) => {
            if (key === cpTraderConfig.trader) {
                traderToPushTo = val;
            }
        });
        const trader = dbTables.traders[traderToPushTo];
        //do things for the user to make the unlimited stock setting behave logically
        let stockAmount = cpTraderConfig.stock_amount;
        if (cpTraderConfig.unlimited_stock) {
            stockAmount = 99999;
        }
        trader.assort.items.push({
            "_id": cpItemId,
            "_tpl": cpItemId,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "UnlimitedCount": cpTraderConfig.unlimited_stock,
                "StackObjectsCount": stockAmount
            }
        });
        let currency = cpTraderConfig.currency;
        Object.entries(currencyIDs).forEach(([key, val]) => {
            if (key === cpTraderConfig.currency) {
                currency = val;
            }
        });
        trader.assort.barter_scheme[cpItemId] = [
            [{
                    "count": cpTraderConfig.price,
                    "_tpl": currency
                }]
        ];
        trader.assort.loyal_level_items[cpItemId] = cpTraderConfig.loyalty_level;
        //push into spec slot filters
        const dbItems = dbTables.templates.items;
        const pocketsItem = dbItems["CustomPocket"] ?? dbItems["627a4e6b255f7527fb05a0f6"];
        const pocketSlots = pocketsItem._props.Slots;
        for (const slot in pocketSlots) {
            const slotFilter = pocketSlots[slot]._props.filters[0].Filter;
            slotFilter.push(cpItemId);
        }
    }
}
exports.CustomItems = CustomItems;
