/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/brace-style */
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";

import { GetData } from "./useful-data";
import * as config from "../config/config.json";

const Get_Data = new GetData()

export class CustomItems{

    customVoucherItem(dbTables:IDatabaseTables, jsonUtil:JsonUtil, bundlePath:string): void{
        const handbook = dbTables.templates.handbook;
        const locales = Object.values(dbTables.locales.global) as Record<string, string>[];
        const traderIDs = Get_Data.getTraderIdsByName()
        const currencyIDs = Get_Data.getAllCurrencyIdsByName()
        const cpTraderConfig = config.checkpoint_trader_config
        const cpItemId = "checkpoint_letter_id"

        const item = jsonUtil.clone(dbTables.templates.items["590c2d8786f774245b1f03f3"]);
        item._id = cpItemId
        item._props.Width = 2
        item._props.Height = 1
        item._props.Prefab.path = bundlePath
        item._props.ItemSound = "item_plastic_generic"
        item._parent = "5447e0e74bdc2d3c308b4567" //spec item
        

        dbTables.templates.items[cpItemId] = item;

        for (const locale of locales) {
            locale[`${cpItemId} Name`] = "Marked Letter"
            locale[`${cpItemId} ShortName`] = "M. Letter"
            locale[`${cpItemId} Description`] = "A mysterious marked letter.\n\nPlace this letter in one of your special slots, and if you die you will respawn at your last visited checkpoint instead of home."
        }

        handbook.Items.push(
            {
                "Id": cpItemId,
                "ParentId": "5b47574386f77428ca22b343",
                "Price": 0
            }
        );

        //add to config trader's inventory
        let traderToPushTo = cpTraderConfig.trader;
        Object.entries(traderIDs).forEach(([key, val]) => {
            if (key === cpTraderConfig.trader){
                traderToPushTo = val;
            }
        })
        const trader = dbTables.traders[traderToPushTo];

        //do things for the user to make the unlimited stock setting behave logically
        let stockAmount = cpTraderConfig.stock_amount
        if (cpTraderConfig.unlimited_stock){
            stockAmount = 99999
        }

        trader.assort.items.push({
            "_id": cpItemId,
            "_tpl": cpItemId,
            "parentId": "hideout",
            "slotId": "hideout",
            "upd":
            {
                "UnlimitedCount": cpTraderConfig.unlimited_stock,
                "StackObjectsCount": stockAmount
            }
        });

        let currency = cpTraderConfig.currency;
        Object.entries(currencyIDs).forEach(([key, val]) => {
            if (key === cpTraderConfig.currency){
                currency = val;
            }
        })

        trader.assort.barter_scheme[cpItemId] = [
            [{
                "count": cpTraderConfig.price,
                "_tpl": currency
            }]

        ];
        trader.assort.loyal_level_items[cpItemId] = cpTraderConfig.loyalty_level;
        
        //push into spec slot filters
        const dbItems = dbTables.templates.items
        const pocketsItem = dbItems["CustomPocket"] ?? dbItems["627a4e6b255f7527fb05a0f6"] 
        const pocketSlots = pocketsItem._props.Slots
        
        for (const slot in pocketSlots){
            const slotFilter = pocketSlots[slot]._props.filters[0].Filter
            slotFilter.push(cpItemId)
        }
    }
}