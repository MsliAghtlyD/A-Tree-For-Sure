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
    baseResource: "questions", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent

    softcap: new Decimal("1e7"),
    
    doReset(resettingLayer) {
        let keep = [];
            if (hasMilestone('m', 2) && resettingLayer=="m") keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("c", keep)
        },


    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('m', 11)) mult = mult.add(1)
        if (hasChallenge('m', 11)) mult = mult.add(9)
        if (hasChallenge('m', 12)) mult = mult.add(90)
        if (hasUpgrade('c', 14)) mult = mult.times(upgradeEffect('c', 14))
        if (player.m.unlocked) mult = mult.times(temp["m"].effect)
        if (hasMilestone('fo', 0)) mult = mult.times(5)
        if (hasMilestone('fo', 1)) mult = mult.pow(1.25)
        if (hasUpgrade('t', 22)) mult = mult.times(upgradeEffect('t', 22)) 
        if (hasUpgrade("t", 23)) mult = mult.times(10)       
        if (hasMilestone('fo', 4) && hasUpgrade("c", 23)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade("c", 24)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade("c", 25)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade("c", 26)) mult = mult.times(1.5)
     //   if (hasUpgrade("m", 31)) mult = mult.pow(2)

        if (inChallenge('m',12 )) mult = mult.pow(0.5)
        if (inChallenge('m',13 )) mult = mult.pow(0.5)
        return mult
    },

    passiveGeneration(){
        let pg = new Decimal(0)
        if (hasChallenge('m', 13)) pg = pg.add(1)
        if (hasUpgrade('c', 31 )) pg = pg.times(upgradeEffect('c', 31))
        if (hasAchievement('a', 37)) pg = pg.times(upgradeEffect('c', 31)).times(0.1).add(1)
        if (pg ==0) return false 
        return pg
    },
    
    gainExp() { // Calculate the exponent on main currency from bonuses
        let exp = new Decimal(1)
     //   if (hasUpgrade("m", 31)) exp = exp.add(1)
        return exp

    },

    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for Cryptic Clues", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    branches: [["m", 1], ["d", 1]],

    upgrades:{
        11:{
            title: "Start playing",
            description: "Gain a question every second",
            cost: new Decimal(1),
        },
        12:{
            title: "Wonder what my name means",
            description: "Triple your questions gain",
            cost: new Decimal(3),
            unlocked() {if (hasUpgrade('c', 11)) return true},
        },
        13:{
            title: "Ask nicely what my name means",
            description: "Boost questions based on clues",
            cost: new Decimal(10),
            unlocked() {if (hasUpgrade('c', 12)) return true},
            effect() {
                let softlim = new Decimal ("1e15")
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff= player[this.layer].points.add(1).pow(0.5)
                if(hasUpgrade('c',15)) eff = eff.times(upgradeEffect('c', 15))
                if(hasUpgrade('fr', 22)) eff = eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.3))
                return softeff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14:{
            title: "Ask harshly what my name means",
            description: "Boost clues based on questions",
            cost: new Decimal(25),
            unlocked() {if (hasUpgrade('c', 13)) return true},
            effect() {
                let eff = player.points.add(1).pow(0.15)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        15:{
            title: "...back to the previous layer",
            description: "Boost questions based on clues by boosting third upgrade",
            cost: new Decimal(50),
            unlocked() {if (hasUpgrade('m', 11)) if(hasUpgrade('c', 14)) return true
                if (player.fo.unlocked ||player.fr.unlocked) if (hasUpgrade("c", 14)) return true},
            effect() {
                let softlim = new Decimal ("1e6")
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff = player[this.layer].points.add(1).pow(0.35)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.7))
                return softeff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        21:{
            title: "But wouldn't that imply that...?",
            description: "Boost questions based on questions",
            cost: new Decimal(250),
            unlocked() {if (hasUpgrade('c', 15)) return true},
            effect() {
                let softlim = new Decimal ("2e6")
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff = player.points.add(1).pow(0.26)                
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        22:{
            title: "Cookie time",
            description: "Nerf question gain for the Greater Good and reset clues and question",
            cost: new Decimal(1e7),
            unlocked() {
                if(inChallenge('m', 11)) return false
                if (player.m.best>=4) if (hasUpgrade('c', 21)) return true
                if(hasAchievement("a", 13)) if (hasUpgrade('c', 21)) return true
                
            },
            effect() {
                let eff = new Decimal (0.1)
                if(hasUpgrade('t', 11)) eff = eff.times(2.5)
                if(hasUpgrade('t', 21)) eff = eff.times(2)
                if(hasUpgrade('t', 51)) eff = eff.times(2.5)
                return eff
            },
            onPurchase() { 
                player.c.points = new Decimal(1)
                player.points = new Decimal(1)
            },
        },
        23:{
            title: "Cookie thyme",
            description: "Nerf question gain for the Greater Good, reset clues and questions",
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
                if (inChallenge('m', 12)) return false
                if (hasAchievement('a', 14)) if (hasUpgrade('c', 21)) return true},
        },
        25:{
            title: "That's the...",
            description: "Unlock another mystery challenge",
            cost: new Decimal(1e8),
            unlocked() {if (inChallenge('m', 12)) if (hasUpgrade('c', 21)) return true},
        },
        26:{
            title: "...next layer over there?",
            description: "Unlock more content",
            cost: new Decimal(1e9),
            unlocked() {if (hasChallenge('m', 12) && (hasUpgrade('c', 21))) return true
                        if (player.fo.unlocked ||player.fr.unlocked) if (hasUpgrade('c', 21)) return true},
        },
        31:{
            title: "No. No it's not.",
            description: "Unlock another mystery challenge <br> And get a boost on passive clue gain based on clue upgrades bought",
            cost: new Decimal(1e12),
            unlocked() {if (hasUpgrade('c', 26)) if(hasChallenge('m', 13)) return true
            if (player.fo.unlocked ||player.fr.unlocked) if (hasUpgrade('c', 26)) return true},
            effect() {
                let eff = new Decimal ("1.69")
                eff = eff.pow(player[this.layer].upgrades.length).add(1)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                if (hasUpgrade('t', 12)) return eff
                eff = new Decimal (player[this.layer].upgrades.length)
                eff = eff.add(1)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        
        },
        32:{
            title: "They're all in on it, and I'll prove it",
            description: "Give you the opportunity to do friends and forums resets. It's time to choose.",
            cost: new Decimal(1e15),
            unlocked() {
                if (inChallenge('m', 14)) return false
                if (hasUpgrade('c', 22)) return true},
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

    baseResource: "questions",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1000),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 2,                          // "normal" prestige gain is (currency^exponent).

    hotkeys: [
        {key: "m", description: "M: Reset for Mystery", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
   
    doReset(resettingLayer) {
        let keep = [];
            if (hasMilestone('fo', 3)) keep.push("challenges")
            if (hasMilestone('fo', 4)) keep.push("milestones")
            if (layers[resettingLayer].row > this.row) layerDataReset("m", keep)
    },

    effect() {
        let ueff = new Decimal (1)
        if(hasUpgrade("m", 11)) ueff = ueff.times(2)
        eff = player[this.layer].best.add(1).pow(0.75)
        let qEff = player.m.total.pow(0.6725).plus(1)
        eff = eff.times(qEff)
        if (hasMilestone("fo", 4)) eff = eff.times(ueff)
        if (hasUpgrade('fr', 21)) eff = eff.times(5)
        if (inChallenge("t", 11)) eff= eff.pow(0)
        return eff
        },
    effectDescription() {
        eff = this.effect();
        return " boosting your clue gain based on your max and current mysteries by "+format(eff)

    },

    canBuyMax() {
        if (hasMilestone('m', 1)) return true

    },

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let price= new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (hasUpgrade('t', 32)) price = price.times(0.00001)
        else if (player.m.points.gte(4)) price = price.times(1e10)
        if (hasUpgrade('m', 13)) price = price.times(0.01)
        if (hasMilestone('fo', 2)) price = price.times(0.001)

        return price
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        let price =  new Decimal(1)
        if (hasChallenge('m', 14)) price = price.add(1)
        if (hasChallenge('m', 14)) price = price.pow(3)
        if (hasMilestone('fo', 0)) price = price.pow(2)
        return price
    },

    layerShown() { 
        if(hasUpgrade('c', 14)||player.m.best.gte(1)||hasUpgrade('m', 11)|| player.fo.unlocked ||player.fr.unlocked) return true},          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11:{
            title: "If you takes those clues you get...",
            description: "greatly boost clues gain and new clue upgrades",
            cost: new Decimal(1),
        },
        12:{
            title: "Can I get another one?",
            description: "Boost questions based on questions",
            cost: new Decimal(4),
            unlocked() {if (hasUpgrade('c', 22)) return true
                        if (hasUpgrade('m', 12)) return true
                        if (hasChallenge('m', 11)) return true
                        if (player.fr.unlocked || player.fo.unlocked) return true
                    },
            effect() {
                let eff= player.points.add(1).pow(0.05)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13:{
            title: "I wanna make more clue upgrades",
            description: "Make yourself check the achievements and get more mysteries",
            cost: new Decimal(4),
            unlocked() {if (hasChallenge('m', 11)) if (hasUpgrade('m', 12)) return true
                        if (player.fr.unlocked || player.fo.unlocked) return true},
        },
        14:{
            title: "Can you ever afk here?",
            description: "Gain a modest passive 0.001% of friends on reset every second <br><i>Courtesy of Orlan</i>",
            cost: new Decimal(29),
            unlocked() {if (hasUpgrade('m', 13)) if (hasUpgrade('fr', 25)) return true},
            tooltip: "Next one will be on Theory layer",
        },
        31:{
            title: "I had to come back here again?",
            description: "The start of clue upgrades' softcap gets squared",
            cost: new Decimal(37),
            unlocked() {if (hasUpgrade('m', 14)) return true},
            tooltip: "Next one will be on Theory layer",
        },
    },

    challenges: {
        11: {
            name: "A waste of time",
            challengeDescription: `Get questions^0.8 <br> Or just use it to get out of 'Cookie Time'`,
            goalDescription:"get 1e7 questions.",
            rewardDescription:"clue base gets boosted",
            canComplete: function() {return player.points.gte(1e7)},
            unlocked() {if(hasAchievement('a', 13)) return true}
        },
        12: {
            name: `Yet somehow worse <br>than the previous one`,
            challengeDescription: `Get clue^0.5`,
            goalDescription:"get 100 questions while having 'Cookie time'",
            rewardDescription:"clue base gets boosted... again",
            canComplete: function() { return player.points.gte(100)&&hasUpgrade('c', 22)},
            unlocked() {if(hasUpgrade('c', 24)) return true
            if (inChallenge('m',12 ))return true
            if (hasChallenge('m', 12)) return true
            if (player.fr.unlocked || player.fo.unlocked) return true
            },
        },
        13: {
            name: `That doesn't seem <br>like a new layer`,
            challengeDescription: `Get questions AND clues^0.5`,
            goalDescription:"get 10 000 questions.",
            rewardDescription:`what base gets boosted? <br> <br> None, get 100% of clue gain every second though`,
            canComplete: function() {return player.points.gte(10000)},
            unlocked() {if(hasUpgrade('c', 26)) return true
            else if (inChallenge('m', 13))return true
            else if (hasChallenge('m', 13)) return true
            if (player.fr.unlocked || player.fo.unlocked) return true}
        },
        14: {
            name: "I need to nerf that",
            challengeDescription: `get questions^0.8`,
            goalDescription:"get 1e11 questions while in 'Cookie time'.",
            rewardDescription:"get a new milestone and boost mystery gain<br> But at a cost",
            canComplete: function() {return player.points.gte(1e11)&&hasUpgrade('c', 22)},
            unlocked() { if(hasChallenge('m', 14)) return false
                else if (inChallenge('m', 14)) return true
                else if(hasUpgrade('c', 31)) return true
                if (player.fr.unlocked || player.fo.unlocked) return true}
        },
    },

    milestones: {
        0: {
            requirementDescription: "4 mysteries",
            effectDescription: "No more mysteries. For now",
            done() { return player.m.points.gte(4) }
        },
        1: {
            requirementDescription: "Get the third mystery upgrade and 4 mysteries",
            effectDescription: "You can buy max mysteries",
            done() { return (hasUpgrade('m', 13))&& player.m.points.gte(4) }
        },
        2: {
            requirementDescription: "4th challenge completed",
            effectDescription: "Keep clue upgrades on mystery resets",
            done() { return hasChallenge('m', 14) }
        },
    }

})





addLayer("d", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#000099",                       // The color for this layer, which affects many elements.
    resource: "despair points",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: "questions",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(100),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.00000000000000000000000000000001,                          // "normal" prestige gain is (currency^exponent).
   
    hotkeys: [
        {key: "d", description: "D: Reset for Despair", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        return new Decimal(1)
    },

    doReset(resettingLayer) {
        let keep = [];
            keep.push("upgrades")
            keep.push("challenges")
            if (layers[resettingLayer].row > this.row) layerDataReset("d", keep)
    },

    canReset() {
        if (hasChallenge("m", 14)) if(hasUpgrade("c", 22))if (player.points.gte(100))  return true
        return false

    },

    layerShown() { 
        
        if (hasUpgrade("c", 22)) if(hasChallenge("m", 14))  return true 
        if(hasChallenge("d", 11))  return false
        if (hasUpgrade("d", 11))  return true
        return false},            // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        11:{
            title: "You",
            cost: new Decimal(1),
        },
        12:{
            title: "Need",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 11)) return true},
        },
        13:{
            title: "Out",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 12)) return true},
        },
        14:{
            title: "Of",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 13)) return true},
        },
        21:{
            title: "Cookie",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 14)) return true},
        },

        22:{
            title: "Time?",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 21)) return true},
        },
        23:{
            title: "Just",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 22)) return true},
        },
        24:{
            title: "Prestige",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 23)) return true},
        },

        31:{
            title: "Here",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 24)) return true},
        },
        32:{
            title: "Then",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 31)) return true},
        },
        33:{
            title: "(Upgrades",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 32)) return true},
        },
        34:{
            title: "Not",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 33)) return true},
        },
        41:{
            title: "Unlimited",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 34)) return true},
        },
        42:{
            title: "Though...",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 41)) return true},
        },
        43:{
            title: "Sorry!)",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 42)) return true},
        },
        44:{
            title: "See?",
            cost: new Decimal(1),
            unlocked() {if (hasUpgrade('d', 43)) return true},
        },
    },
    challenges: {
            11: {
                name: "A freebie, if you're patient that is",
                challengeDescription: `Permanent Cookie Time`,
                goalDescription:`get 1000 questions and leave this challenge<br>IF IT'S NOT YELLOW IT'S NOT OVER`,
                rewardDescription:"finally get that new layer.",
                canComplete: function() {return player.points.gte(1000)},
                unlocked() {if(hasUpgrade('d', 11)) return true}
            },
        
    },
})





addLayer("t", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#6FAE20",                       // The color for this layer, which affects many elements.
    resource: "Theories",            // The name of this layer's main prestige resource.
    row: 1,                                 // The row this layer is on (0 is the first row).

    baseResource: "cryptic clues",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1e12),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "normal",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.25,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here.
        mult = mult.times(buyableEffect("t", 11))
        return mult                                       
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    branches: [["c", 0]],

    doReset(resettingLayer) {
        let keep = [];
            if (hasUpgrade('fr', 24)) keep.push("challenges")
            if (layers[resettingLayer].row > this.row) layerDataReset("t", keep)
    },

    effect() {
        eff = player[this.layer].points.add(1).pow(0.375)
        if (hasChallenge("t", 11)) eff = eff.times(3.21)
        if (hasUpgrade('fr', 21)) eff = eff.times(5)

        if (inChallenge("t", 11)) eff = eff.pow(0)
        return eff
        },

    effectDescription() {
        eff = this.effect();
        if (hasChallenge("t", 11)) return "<b>generously</b> boosting your question gain based on your current theories by "+format(eff)
        return "boosting your question gain based on your current theories by "+format(eff)

    },

    canReset() {
        if (inChallenge("m", 14)) return false
        if (player.c.points > 1e12) return true

    },

    hotkeys: [
        {key: "t", description: "T: Reset for Theory", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() { 
        
        if (hasChallenge('d', 11) || player.fo.unlocked ||player.fr.unlocked)return true },            // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        11:{
            title: "Hang in there, we're gonna do this Cookie in",
            description: "First nerf on Cookie Time",
            cost: new Decimal(1),
        },
        12:{
            title: "It's time to get faster",
            description: "Boosts <b>No. No it's not.</b>'s formula",
            unlocked() {if (hasUpgrade('t', 11)) return true},
            cost: new Decimal(1),
        },
        13:{
            title: "Back to basics",
            description: "Unlock a buyable<br>First level will cost you 5 theories",
            unlocked() {if (hasUpgrade('t', 12)) return true},
            cost: new Decimal(20),
        },
        21:{
            title: "Soon, soon he'll be a Good Boy again",
            description: "Second nerf on Cookie Time and unlocks two new layers",
            cost: new Decimal(1000),
        },
        22:{
            title: "A little more might be needed",
            description: "Your clues boost your clues",
            effect() {
                let eff = player.c.points.pow(0.1).add(1)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {if (hasChallenge('t', 11)) return true},
            cost: new Decimal(2500),
        },
        23:{
            title: "Would a little boost help?",
            description: "A small but trustworthy 100x boost to question gain and 10x gain to clues gain",
            unlocked() {if (hasUpgrade('t', 22)) return true},
            cost: new Decimal(5000),
        },
        31:{
            title: "A new theory",
            description: "Unlocks a new buyable",
            unlocked() {if (hasUpgrade('m', 14)) return true},
            cost: new Decimal(1e12),
        },
        32:{
            title: "It's like you're never gonna figure out those clues",
            description: "Mysteries just keep on coming<br>Finally completely annihilate the jump in cost at 4 mysteries",
            unlocked() {if (hasUpgrade('t', 31)) return true},
            cost: new Decimal(1e17),
        },
        33:{
            title: "Is it finally grinding time?",
            description: "Double Friends gain",
            unlocked() {if (hasUpgrade('m', 31)) return true},
            cost: new Decimal(1e30),
        },
        51:{
            title: "Ladies and Gentlemen, we got him",
            description: "Cookie Time finally does a boost instead of a nerf",
            cost: new Decimal(1e308),
        },

    },
    buyables: {
        11: {
            title: "It was always just a dream?",
            unlocked() { return hasUpgrade("t", 13) },
            cost(x) {
                let base= new Decimal (5)
                base = base.add(buyableEffect("t", 12))
                return new Decimal(5).mul(base.pow(x)).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " theories" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Theory gain by x" + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            tooltip() { 
                let softcap = new Decimal ("1e15")
                let push = new Decimal ("1e5")
                push = push.pow(buyableEffect("t", 12))
                softcap = softcap.times(push)
                return"Will definitely get softcapped past x"+softcap
        
            },
            effect(x) {
                let softlim = new Decimal ("1e15")
                let push = new Decimal ("1e5")
                push = push.pow(buyableEffect("t", 12))
                softlim = softlim.times(push)
                let base1 = new Decimal(3)
                let base2 = x
                base1 = base1.add(buyableEffect("t", 12))
                let eff = base1.pow(base2)
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff
            },
        },
        12: {
            title: "They're insane and it's all in their head?",
            unlocked() { return hasUpgrade("t", 31) },
            cost(x) {
                let base= new Decimal (1e12)
                return new Decimal(1e12).mul(base.pow(x)).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " theories" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost first buyable's effect and cost per purchase's base by +" + format(buyableEffect(this.layer, this.id)) + "<br>And also pushes back its softcap by 1e5<br>Although this will reset the first buyable's level"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                setBuyableAmount(this.layer, 11, getBuyableAmount(this.layer, 11).times(0))
            },
            effect(x) {
                let base1 = new Decimal(0)
                let base2 = x
                let eff = base1.add(base2)
                return eff
            },
        },
    },
    challenges: {
        11: {
            name: "Ness is comic?",
            challengeDescription: `No more mystery or theory layers bonuses for the likes of you`,
            goalDescription:"get 1e7 cryptic clues while in Cookie time:",
            rewardDescription:"Theory layer's boost's formula is much more generous",
            canComplete: function() {return player.c.points.gte(1e7)&&hasUpgrade('c', 22)},
            unlocked() {if(hasAchievement('a', 25)) return true}
        },
    },
})






addLayer("fo", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#FF1D1D",                       // The color for this layer, which affects many elements.
    resource: "Forums",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).

    baseResource: "cryptic clues",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points },  // A function to return the current amount of baseResource.

    requires(){let req = new Decimal(1e16) 
                if (hasAchievement('a', 27)) req = req.pow(2) 
                return req},              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 1,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (hasAchievement('a', 27)) mult = mult.times(2)
        return mult                                       
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        let mult = new Decimal(0.25)
        if (hasAchievement('a', 27)) mult = mult.pow(20) 
        return mult
    },
    branches: [["t", 1]],

    effect() {
        eff = player[this.layer].points.add(1).pow(3);
        return eff
        },

    effectDescription() {
        eff = this.effect();
        if (!player.fr.unlocked) return "boosting your time wasted by "+format(eff)
        //return "boosting your friends gain by "+format(eff)
        return "boosting your time wasted by "+format(eff)

    },

    canReset() {
        if (player.fr.unlocked) if (!hasUpgrade('fr', 26)) return false
        if (player.c.points.gte(temp.fo.nextAt)) if (hasUpgrade('c', 32)) return true
        return false
        
    },

    

    hotkeys: [
        {key: "f", description: "F: Reset for forum", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() { 
        if (hasUpgrade("fr", 26)) return true
        if (hasAchievement('a', 27) && !hasAchievement('a', 31)) return false
        if (hasUpgrade('t', 21) )return true 
        else if (player.fo.best.gte(1)) return true},            // Returns a bool for if this layer's node should be visible in the tree.

    milestones:{
        0: {
            requirementDescription: "1 forum",
            effectDescription: "Join a Cookie Clicker forum to understand His motivations <br> You gain more clues, but also more mysteries <br> <i>where does the bite of '87 and Ash Ketchum even come from???</i>",
            done() { return player.fo.points.gte(1) }
        },
        1: {
            requirementDescription: "2 forums",
            effectDescription: "Join an ARG forum to understand the lore <br> You gain more clues, but also more questions <br> <i>and they do all of this stuff for fun???</i>",
            done() { return player.fo.points.gte(2) },
            unlocked() {if (hasMilestone('fo', 0)) return true},
        },
        2: {
            requirementDescription: "3 forums",
            effectDescription: "Join a prestige tree forum to understand the game <br> You gain more questions, and also more mysteries <br> <i>Oh. so I <b>had</b> to reset to start the game??</i>",
            done() { return player.fo.points.gte(3) },
            unlocked() {if (hasMilestone('fo', 1)) return true},
        },
        3: {
            requirementDescription: "4 forums",
            effectDescription: "Join an incremental game forum to understand math <br> Keep Mystery challenges on 3rd layer reset <br> <i>What does QoL means? Quarry of Limes? Questions on Lost?</i>",
            done() { return player.fo.points.gte(4) },
            unlocked() {if (hasMilestone('fo', 2)) return true},
        },
        4: {
            requirementDescription: "5 forums",
            effectDescription: "Join an googology forum to understand all those numbers <br> Keep Mystery milestones, and, every upgrade that unlock upgrades or challenges now lightly boosts their respective layers <br> <i>The e was not just a decoration?</i>",
            done() { return player.fo.points.gte(5) },
            unlocked() {if (hasMilestone('fo', 3)) return true},
        },
        5: {
            requirementDescription: "6 forums",
            effectDescription: "Join an google + forum to rekindle with your friends <br> You can do friends reset again, but be kind to them <br> <i>I was too harsh on them, I'll need their help too actually</i>",
            done() { return player.fo.points.gte(6) },
            unlocked() {if (hasMilestone('fo', 4)) return true},
        },

        

    },
   
})




addLayer("fr", {
    startData() { return {                   // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),              // "points" is the internal name for the main resource of the layer.
    }},

    color: "#ED57D9",                       // The color for this layer, which affects many elements.
    resource: "Friends",                    // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).

    baseResource: "cryptic clues",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.c.points },       // A function to return the current amount of baseResource.

    requires(){let req = new Decimal(1e16) 
        if (hasAchievement('a', 26)) req = req.times(1e7) 
        return req},                // The amount of the base needed to  gain 1 of the prestige currency.
                                                // Also the amount required to unlock the layer.

    type: "normal",                             // Determines the formula used for calculating prestige currency.
    exponent: 0.4,                             // "normal" prestige gain is (currency^exponent).

    gainMult() {                                // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (hasUpgrade('t', 33)) mult = mult.times(2)
        return mult                                       
    },
    gainExp() {                                 // Returns your exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    branches: [["t", 1]],

    effect() {
        eff = player[this.layer].points.add(1).pow(0.35);
        return eff
        },

    effectDescription() {
        eff = this.effect();
        return "boosting your theory gain based on your current friends by "+format(eff)

    },

    canReset() {
        if (player.fo.unlocked) if(!hasMilestone('fo', 5)) return false
        if (player.c.points.gte(temp.fr.requires)) if(hasUpgrade("c", 32)) return true
        return false

    },

    hotkeys: [
        {key: "F", description: "Shift + f: Reset for Friends", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    passiveGeneration(){
        let pg = new Decimal(0)
        if (hasUpgrade('m', 14)) pg = pg.add(0.00001)
        if (pg ==0) return false 
        if (!temp.fr.canReset) return false
        else return pg
    },

    layerShown() { 
        if (hasMilestone('fo', 5)) return true
        if (hasAchievement('a', 26) && !hasAchievement('a', 32)) return false        
        if (hasUpgrade('t', 21) )return true 
        else if (player.fr.best.gte(1)) return true},             // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        11:{
            title: "You came back?",
            description: "Theory gain is multiplied by 1e400",
            cost: new Decimal(1),
            unlocked() {if (player.fr.unlocked) return false
                if(player.fo.unlocked) return true
                else return false},
        },
        12:{
            title: "We missed you so much",
            description: "Mystery gain is boosted by 2eeee4",
            cost: new Decimal(1),
            unlocked() {if (player.fr.unlocked) return false
                if(player.fo.unlocked) return true
                else return false},
        },
        13:{
            title: "We love you so much",
            description: "clue gain is put to the power of 1e100",
            cost: new Decimal(1),
            unlocked() {if (player.fr.unlocked) return false
                if(player.fo.unlocked) return true
                else return false},
        },
        14:{
            title: "come here pal",
            description: "question are put to infinity",
            cost: new Decimal(1),
            unlocked() {if (player.fr.unlocked) return false
                if(player.fo.unlocked) return true
                else return false},
        },
        15:{
            title: "it s all gonna be fine",
            description: "you win now do it now",
            cost: new Decimal(1),
            unlocked() {if (player.fr.unlocked) return false
                if(player.fo.unlocked) return true
                else return false},
        },
        16:{
            title: "come here we said.",
            description: "do it now you coward reset.",
            cost: new Decimal(1),
            unlocked() {if (player.fr.unlocked) return false
                if(player.fo.unlocked) return true
                else return false},
        },
        21:{
            title: "Charlie",
            description: "Boosts mystery and theory effect by 5x",
            cost: new Decimal(1),
            unlocked() {if (hasAchievement("a", 26) && !player.fr.unlocked) return false
                else return true}
        },
        22:{
            title: "Hector",
            description: "Boosts every upgrade based on number of current friends and bought friends upgrades",
            cost: new Decimal(5),
            effect() {
                let eff = new Decimal (player.fr.upgrades.length)
                eff = eff.times(player.fr.points.pow(0.5).add(1))
                softeff = softcap(eff, new Decimal("2e5"), new Decimal(0.25))
                return softeff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return (hasUpgrade('fr', 21))},
            tooltip: "But do not work on future upgrades",
        },
        23:{
            title: "Orlan",
            description() {if (player.fo.unlocked) return "Unlocks Forum layer's effect. What do you mean that's... not that bad<br><i>God damn it Orlan, you've improved</i>"
                else return"Unlocks Forum layer's effect. What do you mean that's useless?<br><i>God damn it Orlan</i>"},
            cost: new Decimal(5),
            unlocked() {return (hasUpgrade('fr', 22))},
        },
        24:{
            title: "Orlan",
            description: "Keep theory challenge on 3rd layer reset. That's still not very useful<br><i>God damn it Orlan, and you're getting expensive too</i>",
            cost: new Decimal(250),
            unlocked() {return (hasUpgrade('fr', 23))},
            tooltip: "Next upgrade is gonna cost you 1000 friends",
        },
        25:{
            title: "Susie",
            description: "Unlocks new upgrades here and there<br><i>The S actually stands for New Content</i>",
            cost: new Decimal(1000),
            unlocked() {return (hasUpgrade('fr', 24))},
        },
        26:{
            title: "Ethan",
            description: "Unlock Forum layer again (and ability to reset it)<br><i>He fixed your internet after asking nicely</i>",
            cost: new Decimal(10000000),
            unlocked() {return (hasUpgrade('fr', 25))},
        },

    },
    
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
            function() { return `You found ${player.a.achievements.length} Achievements <br>
             boosting your self esteem by `+format(eff.pow(1.75))},
            {"font-size": "32px"}],
        "blank",
        "blank",
        "blank",
        "blank",
        "achievements",
    ],
    
    effect() {
        eff = new Decimal(player.a.achievements.length)
        return eff
        },
    
    achievements: {
        11: {
            name: "First win!",
            done() {
				return (hasUpgrade('c', 12))
			},
            goalTooltip() {return"Get the second upgrade"},

            doneTooltip() {return"Reward : A fleeting feeling of accomplishment"},

        },
        12:{
            name: "Content",
            done() {
				return (player.m.points.gte(1))
			},
            goalTooltip() {return"Get the second layer"},

            doneTooltip() {return"Reward : The second layer"},
        },
        13: {
            name: "That's... not helping",
            done() {
				return (hasUpgrade('c', 22))
			},
            goalTooltip() {return"Get the the seventh clue upgrade"},

            doneTooltip() {return"Reward : A fleeting feeling of despair and a mystery challenge"},

        },
        14: {
            name: "Take a hint",
            done() {
				return (player.c.points.gte(1e10))
			},
            goalTooltip() {return"Get 1e10 clues"},

            doneTooltip() {return"Reward : Cookie time is no longer required to continue purchasing clue upgrades"},

        },
        15:{
            name: "That's... no, not this one",
            done() {return (hasUpgrade('c', 25))},

            goalTooltip() {return"While in second mystery challenge buy the upgrade that unlocks it"},

            doneTooltip() {return"Reward : Why would you get rewarded for that?"},
        },
        16: {
            name: "You have been bamboozled",
            done() {
				return (hasUpgrade('c', 26))
			},
            goalTooltip() {return"Get a new layer"},

            doneTooltip() {return"Reward : not a new layer but more of those pesky challenges"},

        },
        17: {
            name: "Wow so secret",
            done() {
				return (hasUpgrade('c', 23))
			},
            goalTooltip() {return"This doesn't seem right"},

            doneTooltip() {return"Reward : A way to boost passive clue gain later on (but don't forget to buy it back after resets)"},
            unlocked() {if (hasAchievement('a', 17)) return true
            },
        },
        21: {
            name: "You win some you lose some",
            done() {
				return(hasChallenge("m", 14))
			},
            goalTooltip() {return"Finish mystery challenge 4"},

            doneTooltip() {return"Guess that's nerfed enough"},

        },
        22: {
            name: "That was a mistake",
            done() {
				if(hasChallenge("m", 14)) return (hasUpgrade('c', 22))
			},
            goalTooltip() {return"Get stuck in Cookie Time"},

            doneTooltip() {return"Reward : A new layer but only to get out of Cookie Time"},

        },
        23: {
            name: "That mistake seems useful",
            done() {
				return (hasChallenge('d', 11))
			},
            goalTooltip() {return"Finish the Despair Challenge"},

            doneTooltip() {return"Reward : The promised new layer is finally unlocked"},

        },

        24: {
            name: "But hey, that's just a ",
            done() {
				return (player.t.points.gte(1))
			},
            goalTooltip() {return"Get your first theory"},

            doneTooltip() {return"Reward : Erm, this achievement I guess?"},

        },

        25: {
            name: "Wow new layers?",
            done() {
				return (hasUpgrade("t", 21))
			},
            goalTooltip() {return"Buy fourth Theory upgrade"},

            doneTooltip() {return"Funny story, you can't reset them... Would a theory challenge cheer you up?"},

        }, 

        26: {
            name: "You chose... correctly",
            done() {
				return (!hasAchievement("a", 27) && (player.fo.unlocked))
			},
            goalTooltip() {return"Maybe I'm cheating, but..."},

            doneTooltip() {return"Choose the superior new layer. You have pledged your loyalty to them, removing your ability to use the other"},
            unlocked() {if (hasAchievement('a', 26)) return true
        },

        },

        27: {
            name: "You chose... correctly",
            done() {
				return (!hasAchievement("a", 26) && (player.fr.unlocked))
			},
            goalTooltip() {return"...if you read this, so are you"},

            doneTooltip() {return"Choose the superior new layer. You have pledged your loyalty to them, removing your ability to use the other"},
            unlocked() {if (hasAchievement('a', 27)) return true
        },

        },

        28: {
            name: "Secrets all around",
            done() {
				return (hasUpgrade('d', 44))
			},
            goalTooltip() {return"Why so desperate?"},

            doneTooltip() {return"Reward : something, surely, sometime"},
            unlocked() {if (hasAchievement('a', 28)) return true
            },

        },

        31: {
            name() {
				if (hasAchievement('a', 31)) return"Felt fishy anyways"
                return "find your friends again they love you and you love them so much"
			},
            done() {
				return (hasAchievement("a", 26) && (player.fr.unlocked))
			},
            goalTooltip() {
				if (hasAchievement('a', 31)) return"Cheaters never prosper, you know?"
                return "find your friends again they love you and you love them so much"
			},

            doneTooltip() {return"You will pay for abandoning them. For a long time."},
            unlocked() {if (hasAchievement('a', 26)) return true
        },

        },

        32: {
            name: "Back to dating 'e-girls'",
            done() {
				return (hasAchievement("a", 27) && (player.fo.unlocked))
			},
            goalTooltip() {return"Get your internet up and running again"},

            doneTooltip() {return"You got an old new layer back, yet you still desire more? Despicable"},
            unlocked() {if (hasAchievement('a', 27)) return true
        },

        },

        37: {
            name: "Why would you even bother?",
            done() {
				if (inChallenge("t", 11))return (hasUpgrade('c', 31))
			},
            goalTooltip() {return"Try to buy something way too expensive in theory challenge"},

            doneTooltip() {return"That was a pain guess I'll make part of <b>No. No it's not.</>'s base take effect even when not bought yet. You deserve it"},
            unlocked() {if (hasAchievement('a', 37)) return true
            },

        },


    },

})