addLayer("c", {
    name: "Cryptic Clues", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CC", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#175ABD",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Cryptic Clues", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent

    softcap: new Decimal("1e7"),
    
    doReset(resettingLayer) {
        let keep = [];
        if (hasChallenge("m", 14) && resettingLayer=="m") keep.push("upgrades")
        if (hasAchievement("a", 41)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset("p", keep)
    },

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('m', 11)) mult = mult.add(1)
        if (hasChallenge('m', 11)) mult = mult.add(9)
        if (hasChallenge('m', 12)) mult = mult.add(90)
        if (hasUpgrade('c', 14)) mult = mult.times(upgradeEffect('c', 14))
        let Meff = player.m.best.add(1).pow(0.75);
        let qEff = player.m.total.pow(0.6725).plus(1);
        Meff = Meff.times(qEff);
        mult=mult.times(Meff);
        if (inChallenge('m',12 )) mult = mult.pow(0.5)
        if (inChallenge('m',13 )) mult = mult.pow(0.5)
    
        
        return mult
    },

    passiveGeneration(){
        if (hasChallenge('m', 13)) return new Decimal (1)

    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },

    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for Cryptic Clues", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    branches: [["m", 1]],
    upgrades:{
        11:{
            title: "Start playing",
            description: "Gain a question every second.",
            cost: new Decimal(1),
        },
        12:{
            title: "Wonder what my name means",
            description: "Triple your point gain.",
            cost: new Decimal(3),
            unlocked() {if (hasUpgrade('c', 11)) return true},
        },
        13:{
            title: "Ask nicely what my name means",
            description: "Boost questions based on clues.",
            cost: new Decimal(10),
            unlocked() {if (hasUpgrade('c', 12)) return true},
            effect() {
                let eff= player[this.layer].points.add(1).pow(0.5)
                if(hasUpgrade('c',15)) eff=eff.times(upgradeEffect('c', 15))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14:{
            title: "Ask harshly what my name means",
            description: "Boost clues based on questions.",
            cost: new Decimal(26),
            unlocked() {if (hasUpgrade('c', 13)) return true},
            effect() {
                return player.points.add(1).pow(0.15)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15:{
            title: "...back to the previous layer",
            description: "Boost questions based on clues by boosting third upgrade.",
            cost: new Decimal(50),
            unlocked() {if (hasUpgrade('m', 11)) if(hasUpgrade('c', 14)) return true},
            effect() {
                return player[this.layer].points.add(1).pow(0.35)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        21:{
            title: "But wouldn't that imply that...?",
            description: "Boost questions based on questions.",
            cost: new Decimal(250),
            unlocked() {if (hasUpgrade('c', 15)) return true},
            effect() {
                return player.points.add(1).pow(0.26)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        22:{
            title: "Cookie time",
            description: "Nerf question gain for the Greater Good and reset clues and question.",
            cost: new Decimal(1e7),
            unlocked() {
                if(inChallenge('m', 11)) return false
                else if (player.m.best>=4) if (hasUpgrade('c', 21)) return true
                else if(hasAchievement("a", 13)) if (hasUpgrade('c', 21)) return true
                
            },
            onPurchase() { 
                player.c.points = new Decimal(1)
                player.points = new Decimal(1)
            },
        },
        23:{
            title: "Cookie thyme",
            description: "Nerf question gain for the Greater Good, reset clues and questions.",
            cost: new Decimal(1e7),
            unlocked() {
                if(inChallenge('m', 11)) if (hasUpgrade('c', 21)) return true               

            },

        },
        24:{
            title: "That's the...",
            description: "Unlock another mystery challenge",
            cost: new Decimal(1e10),
            unlocked() {
                if(inChallenge('m', 12)) return false
                else if (hasAchievement('a', 14)) return true},
        },
        25:{
            title: "That's the...",
            description: "Unlock another mystery challenge",
            cost: new Decimal(1e8),
            unlocked() {if (inChallenge('m', 12)) return true},
        },
        26:{
            title: "...next layer over there?",
            description: "Unlock more content",
            cost: new Decimal(1e9),
            unlocked() {if (hasChallenge('m', 12)) return true},
        },
        27:{
            title: "...next layer over there?",
            description: "Unlock more content",
            cost: new Decimal(1e9),
            unlocked() {if (hasChallenge('m', 14)) if(hasUpgrade('c', 22)) return true},
        },
        31:{
            title: "No. No it's not.",
            description: "Unlock another mystery challenge",
            cost: new Decimal(1e12),
            unlocked() {if (hasUpgrade('c', 26)) if(hasChallenge('m', 13)) return true},
        },
        32:{
            title: "It is called up-grade though",
            description: "Nerf clue gain for the Greater Good.",
            cost: new Decimal(1e15),
            unlocked() {if (hasUpgrade('c', 22)) return true},
        },
    },
})






addLayer("m", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#DBA571",                       // The color for this layer, which affects many elements.
    resource: "mysteries",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: "points",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1000),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 2,                          // "normal" prestige gain is (currency^exponent).

    hotkeys: [
        {key: "m", description: "M: Reset for Mystery", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
   
    effect() {
        eff = player[this.layer].best.add(1).pow(0.75);
        return eff
        },
    effectDescription() {
        eff = this.effect();
        return "your max mysteries boost your clue gain by "+format(eff)

    },

    canBuyMax() {
        if (hasMilestone('m', 1)) return true

    },

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let price= new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (player.m.points.gte(4)) price = price.times(1e10)
        return price
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    layerShown() { 
        if(hasUpgrade('c', 14)) return true 
        else  if (player.m.best.gte(1)) return true
        else if (hasUpgrade('m', 11)) return true
    },          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11:{
            title: "If you takes those clues you get...",
            description: "greatly boost clues gain and new clue upgrades.",
            cost: new Decimal(1),
        },
        12:{
            title: "The missing link",
            description: "Boost questions based on questions.",
            cost: new Decimal(4),
            unlocked() {if (hasUpgrade('c', 22)) return true
                        else if (hasUpgrade('m', 12)) return true
                    },
            effect() {
                let eff= player.points.add(1).pow(0.05)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13:{
            title: "I wanna make more clue upgrades",
            description: "Square clues gain and new upgrades.",
            cost: new Decimal(4),
            unlocked() {if (hasChallenge('m', 11)) if (hasUpgrade('m', 12)) return true},
        },
    },

    challenges: {
        11: {
            name: "A waste of time",
            challengeDescription: `Get questions^0.8 <br> Or just use it to get out of 'Cookie Time'`,
            goalDescription:"get 1e7 questions.",
            rewardDescription:"clue base gets boosted",
            canComplete: function() {return player.points.gte(1e7)},
            unlocked() {if(hasUpgrade('m', 12)) return true}
        },
        12: {
            name: "Yet somehow worse than the previous one",
            challengeDescription: `Get clue^0.5`,
            goalDescription:"get 100 questions while having 'Cookie time'",
            rewardDescription:"clue base gets boosted... again",
            canComplete: function() { return player.points.gte(100)&&hasUpgrade('c', 22)},
            unlocked() {if(hasUpgrade('c', 24)) return true
            else if (inChallenge('m',12 ))return true
            else if (hasChallenge('m', 12)) return true
            },
        },
        13: {
            name: "That doesn't seem like a new layer",
            challengeDescription: `Get questions AND clues^0.5`,
            goalDescription:"get 100000 questions.",
            rewardDescription:`what base gets boosted? <br> <br> None, get 100% of clue gain every second though`,
            canComplete: function() {return player.points.gte(10000)},
            unlocked() {if(hasUpgrade('c', 26)) return true
            else if (inChallenge('m', 13))return true
            else if (hasChallenge('m', 13)) return true}
        },
        14: {
            name: "A waste of time",
            challengeDescription: `get questions^0.8`,
            goalDescription:"get 1e11 questions.",
            rewardDescription:"clue base gets boosted",
            canComplete: function() {return player.points.gte(1e11)},
            unlocked() {if(hasUpgrade('c', 26)) if(hasChallenge('m', 13)) return true}
        },
    },

    milestones: {
        0: {
            requirementDescription: "4 mysteries",
            effectDescription: "No more. For now",
            done() { return player.m.points.gte(4) }
        },
        1: {
            requirementDescription: "Get the third mystery upgrade",
            effectDescription: "You can buy max mysteries",
            done() { return (hasUpgrade('m', 13))&& player.m.points==4 }
        },
        2: {
            requirementDescription: "4th challenge completed",
            effectDescription: "automate clue acquisition",
            done() { return hasChallenge('m', 14) }
        },
    }

})











addLayer("a", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: true,                     // You can add more variables here to add them to your layer.
    }},

    color: "#FFFF00",                       // The color for this layer, which affects many elements.
    row: "side",                                 // The row this layer is on (0 is the first row).

    layerShown() { return true },          // Returns a bool for if this layer's node should be visible in the tree.

    tooltip() { // Optional, tooltip displays when the layer is locked
        return ("Achievements")
    },
    tabFormat: [
        ["display-text",
            function() { return `You found ${player.a.achievements.length} Achievements` },
            {"font-size": "32px"}],
        "blank",
        "blank",
        "blank",
        "blank",
        "achievements",
    ],

    achievements: {
        11: {
            name: "First win!",
            done() {
				return (hasUpgrade('c', 12))
			},
            goalTooltip() {return"Get the second upgrade"},

            doneTooltip() {return"Reward: A fleeting feeling of accomplishment"},

        },
        12:{
            name: "Content",
            done() {
				return (player.m.points.gte(1))
			},
            goalTooltip() {return"Get the second layer"},

            doneTooltip() {return"Reward: The second layer"},
        },
        13: {
            name: "That's... not helping",
            done() {
				return (hasUpgrade('c', 22))
			},
            goalTooltip() {return"Get the the seventh clue upgrade"},

            doneTooltip() {return"Reward: A fleeting feeling of despair"},

        },
        14: {
            name: "Take a hint",
            done() {
				return (player.c.points.gte(1e10))
			},
            goalTooltip() {return"Get 1e10 clues"},

            doneTooltip() {return"Reward: Cookie time is no longer required to continue purchasing clue upgrades"},

        },
        15:{
            name: "That's... no, not this one",
            done() {return (hasUpgrade('c', 25))},

            goalTooltip() {return"While in second mystery challenge buy the upgrade that unlocks it"},

            doneTooltip() {return"Reward: Why would you get rewarded for that?"},
        },
        16: {
            name: "This achievement is not yet implemented",
            done() {
				return (hasUpgrade('c', 31))
			},
            goalTooltip() {return"Get a new update"},

            doneTooltip() {return"Reward: the time you wasted waiting"},

        },
        17: {
            name: "Wow so secret",
            done() {
				return (hasUpgrade('c', 23))
			},
            goalTooltip() {return"This doesn't seem right"},

            doneTooltip() {return"Reward: something, surely, sometime"},
            unlocked() {if (hasAchievement('a', 17)) return true
            },
        },

    },

})