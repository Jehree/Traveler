The Pre-Release version 0.2.0 for my Traveler mod is ready for testing! Please make note of these few things before you play.

This, at its core, is a rewrite of Path To Tarkov, so it is similar to that mod in many ways. That said, some of its systems have
been designed completely differently, new features have been added, etc. so keep that in mind!

Almost everything below is configurable. Change anything you don't like!

Source code for PTTExtracts.dll plugin:
https://github.com/guillaumearm/PathToTarkov/tree/master/PTT-Extracts

:: New features that weren't in PTT! ::
-The flea can be locked behind locations! By default it is available everywhere there is base game trader (except home).

-If you are at a location that has no stash, you will have a small 8x8 stash. It is only there to aid in buying and selling
at any traders that may be at that location, any items left here will NOT be saved.

-Checkpoint system! All vanilla traders are checkpoints. Your last visited checkpoint will be saved. If you have bought a
Marked Letter from Therapist LL1 and it is equipped in a special slot, and you die, it will be consumed (configurable) and
you will respawn at that checkpoint instead of back at home. If you leave the letter outside of your special slots, it won't
be consumed and you will still be respawned at home. This allows you to decide where you want to respawn in the event that you die. 
(If you would have respawned at home anyway, the marked letter will not be consumed)

-Hulti Hideout system! Every location that has a trader, as well as Interchange Saferoom and Customs ZB013, has a fully separate hideout.
These locations can have their hideout stations leveled up independently from the other locations, as well as have their own independently
crafting items. This means you could have multiple workbench crafts, bitcoin farms, etc. The only station that non-home hideouts don't have
is the stash size station.
A rebalance of the unlock requirements for each hideout station may come in the future to take this system to the next level. Currently with
how interconnected each hideout station is to one another, having most or all stations available at each location is necessary. Hopefully 
that can change in the future!

-Profile backup system! The mod will automatically backup your profile .json file, as well as your Traveler profile folder to Traveler/profiles/.profile backups.
This will happen on game load, raid start, and raid end up to 100 backups (configurable).

-All items on your pmc will be marked FIR upon exiting a raid (except death, disconnecting, etc).



:: Features that are currently missing ::
-Scav extracts will currently be a bit broken. I plan to make a second offraid pos for scavs and a separate stash that your pmc has
to specifically go somewhere to get. Somewhere from fence maybe? Not sure yet. 



:: Quirks ::
-Adding items to your profile with the profile editor should work okay now. The mod is able to detect by itself if a reload is needed to avoid item overwrites.
If you are adding items via profile editor, make sure you don't also manually change any settings before loading the game to ensure that it works. I also am
not sure how editing your hideout with the profile editor will behave. Just be careful! 

-I have done a lot of work to try and safeguard against any profile corruption or item overwriting, but I could have missed something.
If you notice anything weird disappearing from your stashes, any errors, etc., please tell me so I can look into it. Having a safe profile
system is my highest priority to make sure you guys don't lose your runs. (yay for auto backup system!)