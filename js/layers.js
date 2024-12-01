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
    softcap() {if(!hasUpgrade('fr', 34))return new Decimal("1e7")
                else return new Decimal ("e1e7")},
    doReset(resettingLayer) {
        let keep = [];
            if (hasMilestone('m', 2) && resettingLayer=="m") keep.push("upgrades")
            if (hasMilestone('fo', 6) && resettingLayer=='fo')keep.push("upgrades")
            if (hasMilestone('fo', 6) && resettingLayer=='fr')keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset("c", keep)
        },


    repare: new Decimal (0),
    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade('m', 11)) mult = mult.add(1)
        if (hasChallenge('m', 11)) mult = mult.add(9)
        if (hasChallenge('m', 12)) mult = mult.add(90)
        if (hasUpgrade('c', 14)) mult = mult.times(upgradeEffect('c', 14))
        if (player.m.unlocked) mult = mult.times(temp["m"].effect)
        if (hasMilestone('fo', 0)) mult = mult.times(5)
        if (hasMilestone('fo', 1)) mult = mult.pow(1.25)
        if (hasUpgrade('t', 23)) mult = mult.times(upgradeEffect('t', 23)) 
        if (hasUpgrade('t', 24)) mult = mult.times(10)       
        if (hasMilestone('fo', 4) && hasUpgrade("c", 23)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade("c", 24)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade("c", 25)) mult = mult.times(1.5)
        if (hasMilestone('fo', 4) && hasUpgrade("c", 26)) mult = mult.times(1.5)
        if (hasUpgrade('fo', 13)) mult = mult.times(upgradeEffect('fo', 13))
	    if (player.fo.unlocked && hasMilestone('fo', 7)) mult = mult.times(temp["fo"].effect)

        if (inChallenge('m',12 )) mult = mult.pow(0.5)
        if (inChallenge('m',13 )) mult = mult.pow(0.5)
        return mult
    },

    passiveGeneration(){
        let pg = new Decimal(0)
        if (hasChallenge('m', 13)) pg = pg.add(1)
        if (hasUpgrade('c', 31 )) pg = pg.times(upgradeEffect('c', 31))
        if (hasAchievement('a', 39)) pg = pg.times(upgradeEffect('c', 31).log(10)).add(1)
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
            unlocked() {return (hasUpgrade('c', 11))},
        },
        13:{
            title: "Ask nicely what my name means",
            description: "Boost questions based on clues",
            cost: new Decimal(10),
            unlocked() {return(hasUpgrade('c', 12))},
            effect() {
                if (!hasUpgrade('fr', 34)) {let softlim = new Decimal ("1e15")
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff= player[this.layer].points.add(1).pow(0.5)
                if(hasUpgrade('c',15)) eff = eff.times(upgradeEffect('c', 15))
                if(hasUpgrade('fr', 22)) eff = eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.3))
                return softeff}
                weff = player.c.points.add(1) .pow(0.1)               
                if(hasUpgrade('c',15)) weff = weff.times(upgradeEffect('c', 15))
                if(hasUpgrade('fr', 22)) weff = weff.times(upgradeEffect('fr', 22))
                return weff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        14:{
            title: "Ask harshly what my name means",
            description: "Boost clues based on questions",
            cost: new Decimal(25),
            unlocked() {return(hasUpgrade('c', 13)) },
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
            unlocked() {if (hasUpgrade('m', 11) && hasUpgrade('c', 14)) return true
                return((player.fo.unlocked || player.fr.unlocked) &&hasUpgrade("c", 14))},
            effect() {
                if (!hasUpgrade('fr', 34)){let softlim = new Decimal ("1e6")
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff = player[this.layer].points.add(1).pow(0.35)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.7))
                if(hasUpgrade('c',33)) softeff = softeff.times(upgradeEffect('c', 33))
                return softeff}
                weff = player.c.points.add(1).pow(0.1)
                if(hasUpgrade('fr', 22)) weff=weff.times(upgradeEffect('fr', 22))
                return weff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        21:{
            title: "But wouldn't that imply that...?",
            description: "Boost questions based on questions",
            cost: new Decimal(250),
            unlocked() {return(hasUpgrade('c', 15))},
            effect() {
                if (!hasUpgrade('fr', 34)) {let softlim = new Decimal ("2e6")
                if (hasUpgrade('m', 31)) softlim = softlim.pow(2)
                let eff = player.points.add(1).pow(0.26)                
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff}
                weff = player.points.add(1).pow(0.05)
                return weff

            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        22:{
            title: "Cookie time",
            description: "Nerf question gain for the Greater Good and reset clues and question",
            cost: new Decimal(1e7),
            unlocked() {
                if(inChallenge('m', 11)) return false
                return((player.m.best.gte(4) && hasUpgrade('c', 21)) || (hasAchievement("a", 13) && hasUpgrade('c', 21)))},
            effect() {
                let eff = new Decimal (0.1)
                if(hasUpgrade('t', 12)) eff = eff.times(2.5)
                if(hasUpgrade('t', 21)) eff = eff.times(2)
                if(hasUpgrade('t', 53)) eff = eff.times(2.5)
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
                return (inChallenge('m', 11) && hasUpgrade('c', 21))},

        },
        24:{
            title: "That's the...",
            description: "Unlock another mystery challenge",
            cost: new Decimal(1e10),
            unlocked() {
                if (inChallenge('m', 12)) return false
                return(hasAchievement('a', 14) && hasUpgrade('c', 21))},
        },
        25:{
            title: "That's the...",
            description: "Unlock another mystery challenge",
            cost: new Decimal(1e8),
            unlocked() {return (inChallenge('m', 12) && hasUpgrade('c', 21))},
        },
        26:{
            title: "...next layer over there?",
            description: "Unlock more content",
            cost: new Decimal(1e9),
            unlocked() {if (hasChallenge('m', 12) && (hasUpgrade('c', 21))) return true
                        return((player.fo.unlocked ||player.fr.unlocked) &&hasUpgrade('c', 21))},
        },
        31:{
            title: "No. No it's not.",
            description: "Unlock another mystery challenge <br> And get a boost on passive clue gain based on clue upgrades bought",
            cost: new Decimal(1e12),
            unlocked() {if (hasUpgrade('c', 26) && hasChallenge('m', 13)) return true
            return((player.fo.unlocked ||player.fr.unlocked) && hasUpgrade('c', 26))},
            effect() {
                let eff = new Decimal ("1.69")
                eff = eff.pow(player[this.layer].upgrades.length).add(1)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                if (hasUpgrade('t', 13)) return eff
                eff = new Decimal.add(player[this.layer].upgrades.length, 1)
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
                return(hasUpgrade('c', 22))},
        },
        33:{
            title() {if(!hasUpgrade("fr", 34)) return"How long has it been since the last upgrade here?"
            if(!tmp.c.repare.gte(100)) return "The now useless upgrade"
            if(hasAchievement('a', 51))return "The now useful upgrade"},
            description() {if(!hasUpgrade("fr", 34)) return "Boost questions based on clues based on friends by pushing the fifth upgrade's softcap.<br><i>It's starting to be a bit convoluted</i>"
                            if(hasAchievement('a', 51))return "You fixed me, many thanks dear player. <br> I will now boost forum's effect based on forums"
                            if(!tmp.c.repare.gte(100)) return "That's not fair, I was just made ! <br> I can't do anything anymore, help me, I need to feel your touch"},
            cost: new Decimal(1e122),
            unlocked() {return hasUpgrade('fo', 14)},
            effect() {if (!hasUpgrade('fr', 34)){
                let eff = new Decimal (player.fr.points)
                eff = eff.log(3).pow(7).plus(1)
                return eff}
                if(hasAchievement('a', 51)) {
                    let eff = new Decimal(player.fo.points.log(6).add(1))
                    return eff
                }
                return false},
            onClick(){if (!hasUpgrade('fr', 34)) return
            tmp.c.repare = tmp.c.repare.add(1)},
            colormaker(){if(!hasUpgrade('fr', 34))color = "#77BF5F"},
            effectDisplay() { if (!hasUpgrade('fr', 34)) return format(upgradeEffect(this.layer, this.id))+"x" 
            if(hasAchievement('a', 51)) return "^" + format(upgradeEffect(this.layer, this.id))
            return tmp.c.repare + "%"}, // Add formatting to the effect
            style() {const style = {}; if (hasUpgrade("fr", 34) && !tmp.c.repare.gte(100) && hasUpgrade("c", 33)) style["background-color"] = tmp.c.colormaker; return style}
        },
    },

    colormaker(){if(!hasUpgrade('fr', 34)|| tmp.c.repare.gte(100)||hasAchievement("a", 51))return "#77BF5F"
                c1 = Decimal.sub(255, Decimal.div(136, 100).mul(tmp.c.repare)).ceil().toNumber().toString(16).toUpperCase() 
                if(c1.length == 1) c1 = "0" + c1
                c2 = Decimal.sub(255, Decimal.div(64, 100).mul(tmp.c.repare)).ceil().toNumber().toString(16).toUpperCase()
                if(c2.length == 1) c2 = "0" + c2
                c3 = Decimal.sub(255, Decimal.div(160, 100).mul(tmp.c.repare)).ceil().toNumber().toString(16).toUpperCase()
                if(c3.length == 1) c3 = "0" + c3
                c = "#" + c1 + c2 + c3
            return c},
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
    repare: new Decimal(0),
    hotkeys: [
        {key: "m", description: "M: Reset for Mystery", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
   
    doReset(resettingLayer) {
        let keep = [];
            if (hasMilestone('fo', 3)) keep.push("challenges")
            if (hasMilestone('fo', 4)) keep.push("milestones")
            if (hasMilestone('fo', 6) && resettingLayer=='fo')keep.push("upgrades")
            if (hasMilestone('fo', 6) && resettingLayer=='fr')keep.push("upgrades")
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
        if (hasUpgrade('m', 32)) eff = eff.pow(3)
        eff = eff.times(new Decimal(buyableEffect('t', 21)).pow(2))
        if (inChallenge('t', 11)) eff= eff.pow(0)
        return eff
        },
    effectDescription() {
        eff = this.effect();
        return " boosting your clue gain based on your max and current mysteries by "+format(eff)

    },

    autoPrestige() {return hasUpgrade('fo', 12)},

    resetsNothing() {return hasUpgrade('fo', 12)},

    canBuyMax() {
        return(hasMilestone('m', 1))

    },

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let price= new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (hasUpgrade('t', 32)) price = price.times(0.00001)
        else if (player.m.points.gte(4)) price = price.times(1e10)
        if (hasUpgrade('m', 13)) price = price.times(0.01)
        if (hasMilestone('fo', 2)) price = price.times(0.001)
	    if (player.fo.unlocked&& hasMilestone('fo', 7)) price = price.div(temp["fo"].effect)
        price = price.div(buyableEffect('m', 11))

        return price
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        let price =  new Decimal(1)
        if (hasChallenge('m', 14)) price = price.add(1)
        price = price.add(buyableEffect('m', 12))
        if (hasChallenge('m', 14)) price = price.pow(3)
        if (hasMilestone('fo', 0)) price = price.pow(2)
        return price
    },

    layerShown() { 
        if(hasUpgrade('c', 14)||player.m.best.gte(1)||hasUpgrade('m', 11)|| player.fo.unlocked ||player.fr.unlocked) return true},          // Returns a bool for if this layer's node should be visible in the tree.

    upgrades: {
        11:{
            title: "If you take those clues you get...",
            description: "greatly boosts clues gain and new clue upgrades",
            cost: new Decimal(1),
        },
        12:{
            title: "Can I get another one?",
            description: "Boost questions based on questions",
            cost: new Decimal(4),
            unlocked() {return(hasUpgrade('c', 22) || hasUpgrade('m', 12) || hasChallenge('m', 11) || player.fr.unlocked || player.fo.unlocked)},
            effect() {
                if(!hasUpgrade('fr', 34)){let eff= player.points.add(1).pow(0.05)
                let softlim = new Decimal(1e15)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff}
                weff = player.points.add(1).pow(0.01)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return weff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13:{
            title: "I wanna make more clue upgrades",
            description: "Make yourself check the achievements and get more mysteries",
            cost: new Decimal(4),
            unlocked() {return((hasChallenge('m', 11) && hasUpgrade('m', 12))||player.fr.unlocked || player.fo.unlocked)},
        },
        14:{
            title: "Can you ever afk here?",
            description: "Gain a modest passive 0.001% of friends on reset every second <br><i>Courtesy of Orlan</i>",
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(225)
                return new Decimal(29)} ,
            unlocked() {return(hasUpgrade('m', 13) && hasUpgrade('fr', 25))},
            tooltip: "Next one will be on Theory layer",
        },
        31:{
            title() {if(!hasUpgrade("fr", 34)) return "I had to come back here again?"
                        return "I had to come back here again ,again?"},
            description() {if(!hasUpgrade("fr", 34)) return "The start of clue upgrades' softcap gets squared"
                            return "What am I supposed to do with my life now?"},
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(3700)
                return new Decimal(37)} ,
            onClick(){if (!hasUpgrade('fr', 34)) return
            tmp.m.repare = tmp.m.repare.add(1)},
            unlocked() {return(hasUpgrade('t', 32))},
            tooltip() {return"Next one will be on Theory layer"},
        },
        32:{
            title: "That looks a bit pricey",
            description: "Mystery effect finally gets good",
            cost: new Decimal(185),
            unlocked() {return(hasUpgrade('m', 31))},
            tooltip: "Next one will be on Theory layer",
        },
        33:{
            title: "What use is a buyable that can never be bought?",
            description: "Unlock another mystery buyable",
            cost: new Decimal(550),
            unlocked() {return(hasUpgrade('fo', 14))},
            tooltip: "Too expensive for you? You might need a clue then?",
        },
    },

    challenges: {
        11: {
            name: "A waste of time",
            challengeDescription: `Get questions^0.8 <br> Or just use it to get out of 'Cookie Time'`,
            goalDescription:"get 1e7 questions.",
            rewardDescription:"clue base gets boosted",
            canComplete: function() {return player.points.gte(1e7)},
            unlocked() {if(hasAchievement('a', 13)) return true},
            onComplete() {tmp.a.seam = tmp.a.seam.add(1)},
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 19)) style["background-color"] = "#004400"; return style}
        },
        12: {
            name: `Yet somehow worse <br>than the previous one`,
            challengeDescription: `Get clue^0.5`,
            goalDescription:"get 100 questions while having 'Cookie time'",
            rewardDescription:"clue base gets boosted... again",
            canComplete: function() { return player.points.gte(100)&&hasUpgrade('c', 22)},
            unlocked() {return(hasUpgrade('c', 24) || inChallenge('m',12 ) || hasChallenge('m', 12) || player.fr.unlocked || player.fo.unlocked)
            },
        },
        13: {
            name: `That doesn't seem <br>like a new layer`,
            challengeDescription: `Get questions AND clues^0.5`,
            goalDescription:"get 10 000 questions.",
            rewardDescription:`what base gets boosted? <br> <br> None, get 100% of clue gain every second though`,
            canComplete: function() {return player.points.gte(10000)},
            unlocked() {return(hasUpgrade('c', 26) || inChallenge('m', 13) || hasChallenge('m', 13) || player.fr.unlocked || player.fo.unlocked)}
        },
        14: {
            name: "I need to nerf that",
            challengeDescription: `get questions^0.8`,
            goalDescription:"get 1e11 questions while in 'Cookie time'.",
            rewardDescription:"get a new milestone and boost mystery gain<br> But at a cost",
            canComplete: function() {return player.points.gte(1e11)&&hasUpgrade('c', 22)},
            unlocked() { if(hasChallenge('m', 14)) return false
                return(inChallenge('m', 14) || hasUpgrade('c', 31) || player.fr.unlocked || player.fo.unlocked)}
        },
    },

    milestones: {
        0: {
            requirementDescription: "4 mysteries",
            effectDescription: "No more mysteries. For now",
            done() { return player.m.points.gte(4) },
            unlocked() {return(hasMilestone('m', 0))}
        },
        1: {
            requirementDescription: "Get the third mystery upgrade and 4 mysteries",
            effectDescription: "You can buy max mysteries",
            done() { return (hasUpgrade('m', 13))&& player.m.points.gte(4) },
            unlocked() {return(hasMilestone('m', 0) || hasMilestone('m', 1))}
        },
        2: {
            requirementDescription: "4th challenge completed",
            effectDescription: "Keep clue upgrades on mystery resets",
            done() { return hasChallenge('m', 14) },
            unlocked() {return (hasMilestone('m', 1) || hasMilestone('m', 2))}
        },
    },
    buyables: {
        11: {
            title: "You're so cheap",
            unlocked() { return hasUpgrade('fo', 11) },
            cost(x) {
                let base= new Decimal (2)
                return new Decimal(2).mul(base.pow(x)).div(buyableEffect("m", 21)).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " mysteries" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Divide mystery cost by " + format(buyableEffect(this.layer, this.id)) + "<br> based on forums"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(player.fo.points)
                let base2 = x
                let powa = new Decimal (3)
                if (hasUpgrade("fo", 14)) powa = powa.add(player.fo.points).times(0.75)
                base1 = base1.pow(powa)
                let eff = new Decimal (base1.pow(base2))
                return eff
            },
        },
        12: {
            title: "You can be cheaper",
            unlocked() { return hasUpgrade('fo', 11) },
            cost(x) {
                let base= new Decimal (5)
                return new Decimal(5).mul(base.pow(x)).div(buyableEffect("m", 21)).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " mysteries<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Add " + format(buyableEffect(this.layer, this.id)) + " to mystery exponent base"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal("0.1")
                let base2 = x
                let eff = new Decimal (base1.times(base2))
                return eff
            },
        },
        21: {
            title: "You can be cheapest",
            unlocked() { return hasUpgrade('m', 33) },
            cost(x) {
                let base= new Decimal (100)
                return new Decimal(10).mul(base.pow(x)).div(buyableEffect("m", 21)).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " mysteries<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: All second layer buyables get their cost divided by " + format(buyableEffect(this.layer, this.id)) + ". Even this one"
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal("10")
                let base2 = x
                let eff = new Decimal (base1.pow(base2))
                return eff
            },
        },
    },

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
        return(hasChallenge("m", 14) && hasUpgrade("c", 22) &&player.points.gte(100))
    },

    layerShown() { 
        
        if (hasUpgrade("c", 22) && hasChallenge("m", 14))  return true 
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
            unlocked() {return(hasUpgrade('d', 11)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        13:{
            title: "Out",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 12)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        14:{
            title: "Of",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 13)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        21:{
            title: "Cookie",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 14)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },

        22:{
            title: "Time?",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 21)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        23:{
            title: "Just",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 22)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        24:{
            title: "Prestige",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 23)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },

        31:{
            title: "Here",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 24)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        32:{
            title: "Then",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 31)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        33:{
            title: "(Upgrades",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 32)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        34:{
            title: "Not",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 33)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        41:{
            title: "Unlimited",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 34)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        42:{
            title: "Though...",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 41)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        43:{
            title: "Sorry!)",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 42)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style}
        },
        44:{
            title: "See?",
            cost: new Decimal(1),
            unlocked() {return(hasUpgrade('d', 43)) },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 29)) style["background-color"] = "#004400"; return style},
            onPurchase(){tmp.a.seam = tmp.a.seam.add(1)}
        },
    },
    challenges: {
            11: {
                name: "A freebie, if you're patient that is",
                challengeDescription: `Permanent Cookie Time`,
                goalDescription:`get 1000 questions and leave this challenge<br>IF IT'S NOT YELLOW IT'S NOT OVER`,
                rewardDescription:"finally get that new layer.",
                canComplete: function() {return player.points.gte(1000)},
                unlocked() {return(hasUpgrade('d', 11))}
            },
        
    },
})





addLayer('t', {
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
        mult = mult.times(buyableEffect('t', 11))
	    if (player.fo.unlocked&& hasMilestone('fo', 7)) mult = mult.times(temp["fo"].effect)
        if (hasUpgrade("t", 51)) mult = mult.div(100)
        return mult                                       
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    branches: [["c", 0]],

    doReset(resettingLayer) {
        //let holdonu = []; //make new array to track extra upgrades you want to keep
        // if (hasUpgrade("t",25)&&!hasUpgrade('fr')) holdonu.push(25);
        let holdonc = [];
        if (hasUpgrade('fr', 24)) holdonc.push(11);
        let keptChallenges = {};
        if (hasUpgrade('fr', 24)) keptChallenges[11] = challengeCompletions(this.layer, 11);
        if (hasUpgrade('fr', 24)) keptChallenges[12] = challengeCompletions(this.layer, 12);
            
    
        let keep = [];
            if (hasUpgrade('fr', 33) && !(resettingLayer=="g")) keep.push("upgrades")
            if (layers[resettingLayer].row > this.row) layerDataReset('t', keep)
        for (const [id, completions] of Object.entries(keptChallenges)) {
            player[this.layer].challenges[id] = completions;
            }
    },
    baf: new Decimal(0),
    passiveGeneration(){
        let pg = new Decimal(0)
        if (hasUpgrade('fr', 32)) pg = pg.add(0.1)
        pg = pg.times(buyableEffect('t', 21))
        if (pg ==0) return false 
        if (!temp.t.canReset) return false
        else return pg
    },

    effect() {
        eff = player[this.layer].points.add(1).pow(0.375)
        if (hasChallenge('t', 11)) eff = eff.times(3.21)
        if (hasUpgrade('fr', 21)) eff = eff.times(5)

        if (inChallenge('t', 11)) eff = eff.pow(0)
        return eff
        },

    effectDescription() {
        eff = this.effect();
        if (hasChallenge('t', 11)) return "<b>generously</b> boosting your question gain based on your current theories by "+format(eff)
        return "boosting your question gain based on your current theories by "+format(eff)

    },

    canReset() {
        if (inChallenge("m", 14)) return false
        if (player.c.points > 1e12) return true

    },

    hotkeys: [
        {key: 't', description: "T: Reset for Theory", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() { 
        
        return(hasChallenge('d', 11) || player.fo.unlocked ||player.fr.unlocked)},            // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        12:{
            title: "Hang in there, we're gonna do this Cookie in",
            description: "First nerf on Cookie Time",
            cost: new Decimal(1),
        },
        13:{
            title: "It's time to get faster",
            description: "Boosts <b>No. No it's not.</b>'s formula",
            unlocked() {return(hasUpgrade('t', 12)) },
            cost: new Decimal(1),
        },
        14:{
            title: "Back to basics",
            description: "Unlock a buyable",
            unlocked() {return(hasUpgrade('t', 13)) },
            cost: new Decimal(20),
            tooltip: "First level will cost you 5 theories"
        },
        15:{
            title: "A vertical...",
            description: "Unlock a theory challenge to keep the content coming your way",
            unlocked() {return(hasUpgrade('t', 41)) },
            cost: new Decimal(1e86),
            currencyDisplayName: "Cryptic clues",
            currencyInternalName: "points",
            currencyLayer: "c",
        },
        21:{
            title: "Soon, soon he'll be a Good Boy again",
            description: "Second nerf on Cookie Time and unlocks two new layers",
            cost: new Decimal(1000),
        },
        23:{
            title: "A little more might be needed",
            description: "Your clues boost your clues",
            effect() {
                let eff = player.c.points.pow(0.1).add(1)
                if(hasUpgrade('fr', 22)) eff=eff.times(upgradeEffect('fr', 22))
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return(hasChallenge('t', 11)) },
            cost: new Decimal(2500),
        },
        24:{
            title: "Would a little boost help?",
            description: "A small but trustworthy 100x boost to question gain and 10x gain to clues gain",
            unlocked() {return(hasUpgrade('t', 23)) },
            cost: new Decimal(5000),
        },
        25:{
            title: "...layer of...",
            description: "<i>If I'm online friends with someone and friends irl, doesn't it counts as two friends?</i><br>Friends limit is doubled",
            unlocked() {return (hasUpgrade('t', 15) || hasUpgrade('t', 25))},
            cost: new Decimal(5),
            tooltip: "Will not actually cost you the forums, but you still need to have them for some reason",
            currencyDisplayName: "Forums",
            currencyInternalName: "points",
            currencyLayer: "fo",
            pay() {return false},
            onPurchase(){
                if(hasUpgrade("t", 45)) player.t.upgrades.splice(player.t.upgrades.indexOf(45), 1)
            },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 41)&&hasUpgrade("t", 45)) style["background-color"] = "#004400"; return style},
        },
        31:{
            title: "A new theory",
            description: "Unlocks a new buyable",
            unlocked() {return(hasUpgrade('m', 14)) },
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1e28)
                return new Decimal(1e12)} ,
        },
        32:{
            title: "It's like you're never gonna figure out those clues",
            description: "Mysteries just keep on coming<br>Finally completely annihilate the jump in cost at 4 mysteries",
            unlocked() {return(hasUpgrade('t', 31)) },
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1e45)
                return new Decimal(1e17)} ,
        },
        34:{
            title: "Is it finally grinding time?",
            description: "Double Friends gain",
            unlocked() {return(hasUpgrade('m', 31)) },
            cost: new Decimal(1e30),
        },
        35:{
            title: "...upgrades though",
            description: "Unlocks yet another theorem buyable<br><i>The T actually stands for buyable</i>",
            unlocked() {return(hasUpgrade('t', 25)||hasUpgrade('t', 45)) },
            tooltip: "Really precise cost for some reason",
            cost: new Decimal(1.24578954541236541235496957865245e65),
        },
        41:{
            title: "Going back is not easy",
            description: "To help with the forums, unlock a new layer",
            unlocked() {return(hasUpgrade('t', 34)) },
            cost: new Decimal(1e55),
        },
        42:{
            title: "Out with the chores",
            description: "Automate <b>It was always just a dream?</b>'s purchase and it cost nothing<br><i>Where did that idea go again?</i>",
            unlocked() {return(hasUpgrade('t', 41)) },
            cost: new Decimal(5e102),
        },
        43:{
            title: "Buy a cork board from Orlan",
            description: "Theory upgrades boost <b>They're insane and it's all in their head?</b>'s base<br><i>It's on the tip of my tongue</i>",
            unlocked() {return(hasUpgrade('t', 42)) },
            cost: new Decimal(5e103),
            effect() {
                let eff = Decimal.mul(player.t.upgrades.length, 0.1)
                return eff
            },
            onPurchase(){
                setBuyableAmount('t', 11, new Decimal(0))
            },
            effectDisplay() { return format( upgradeEffect(this.layer, this.id)) + "+" }, // Add formatting to the effect
        },
        45:{
            title: "Not so alone anymore",
            description: "<i>Is it really the same friend if it's a different forum?</i><br>Friends limit is multiplied by your number of forums<br><i>There's my idea !</i>",
            unlocked() {return(hasUpgrade('t', 43)) },
            cost: new Decimal(1e110),
            onPurchase(){
                if (hasAchievement('a', 41)) return
                if(hasUpgrade("t", 25)) player.t.upgrades.splice(player.t.upgrades.indexOf(25), 1)
                if(tmp.t.baf==0) tmp.a.seam = tmp.a.seam.add(1)
                tmp.t.baf = tmp.t.baf.add(1)
            },
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 41)&&hasUpgrade("t", 25)) style["background-color"] = "#004400"; return style},
            effectDisplay() { return format( player.fo.points) + "x" }, // Add formatting to the effect
        },
        51:{
            title: "Unearth a greater mystery",
            description: "Trade a x100 multiplier on Theory points for a x100 mutliplier on Clue gains and unlock a new layer <i>Will I ever truly get that next upgrade?</i>",
            cost: new Decimal(1e284),
            unlocked() {return(player.t.points.gte(1e283) || hasAchievement("a", 52))},
        },
        53:{
            title: "Ladies and Gentlemen, we got him",
            description: "Cookie Time finally does a boost instead of a nerf",
            cost: new Decimal(1e308),
        },

    },
    buyables: {
        11: {
            title: "It was always just a dream?",
            unlocked() { return hasUpgrade('t', 14) },
            cost(x) {
                let base= new Decimal (5)
                base = base.add(buyableEffect('t', 12))
                return new Decimal(5).mul(base.pow(x)).div(buyableEffect("m", 21)).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " theories" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost Theory gain by x" + format(buyableEffect(this.layer, this.id))
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                if (!hasUpgrade("t", 42))player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            tooltip() { 
                let softcap = new Decimal ("1e15")
                let push = new Decimal ("1e5")
                push = push.pow(getBuyableAmount('t', 12))
                softcap = softcap.times(push)
                return"Will definitely get softcapped past x"+softcap
        
            },
            effect(x) {
                let softlim = new Decimal ("1e15")
                let push = new Decimal ("1e5")
                push = push.pow(getBuyableAmount('t', 12))
                softlim = softlim.times(push)
                let base1 = new Decimal(3)
                let base2 = x
                base1 = base1.add(buyableEffect('t', 12))
                let eff = base1.pow(base2)
                softeff = softcap(eff, softlim, new Decimal(0.25))
                return softeff
            },
        },
        12: {
            title: "They're insane and it's all in their head?",
            unlocked() { return hasUpgrade('t', 31) },
            cost(x) {
                let base= new Decimal (1e12)
                return new Decimal(1e12).mul(base.pow(x)).div(buyableEffect("m", 21)).floor()
            },
            display() {
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " theories" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost first buyable's effect and cost per purchase's base by +" + format(buyableEffect(this.layer, this.id)) + "<br>And also pushes back its softcap by "+ format(Decimal.pow(1e5, getBuyableAmount(this.layer, this.id))) +"<br>Although this will reset the first buyable's level"
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
                let base1 = new Decimal(1)
                if (hasUpgrade('t', 43)) base1 = base1.add(upgradeEffect('t', 43))
                let base2 = x
                let eff = base1.mul(base2)

                return eff
            },
        },
        21: {
            title: "The hero was actually a bad guy?",
            unlocked() { return hasUpgrade('t', 35) },
            cost(x) {
                let base= new Decimal (1e25)
                return new Decimal(1e25).mul(base.pow(x)).div(buyableEffect("m", 21)).floor()
            },
            display() { let myseff = new Decimal(buyableEffect(this.layer, this.id)).pow(2)
                return "Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " theories" + "<br>Bought: " + getBuyableAmount(this.layer, this.id) + "<br>Effect: Boost passive theorem generation by x" + format(buyableEffect(this.layer, this.id)) + "<br>Also boosts the mystery layer's effect by x" + format(myseff)
            },
            canAfford() {
                return player[this.layer].points.gte(this.cost())
            },
            buy() {
                let cost = new Decimal (1)
                player[this.layer].points = player[this.layer].points.sub(this.cost().mul(cost))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                let base1 = new Decimal(4)
                let base2 = x
                let eff = base1.pow(base2)
                return eff
            },
        },
    },

    update(){
        if(hasUpgrade('t', 42)){
            if(tmp.t.buyables[11].canAfford) setBuyableAmount("t", 11, player.t.points.div(5).mul(buyableEffect('m', 21)).log(buyableEffect('t', 12).add(5)).floor().add(1))
        }




    },
    challenges: {
        11: {
            name: "Ness is comic?",
            challengeDescription: `No more mystery or theory layers bonuses for the likes of you`,
            goalDescription:"get 1e7 cryptic clues while in Cookie time:",
            rewardDescription:"Theory layer's boost's formula is much more generous",
            canComplete: function() {return player.c.points.gte(1e7)&&hasUpgrade('c', 22)},
            unlocked() {return(hasAchievement('a', 25)) },
            onComplete(){tmp.a.seam = tmp.a.seam.add(1)},
            style() {const style = {}; if (player.a.clickables[12]==1 && !hasAchievement("a", 39)) style["background-color"] = "#004400"; return style}
        },
        12: {
            name: "The characters are<br> actually the seven deadly sins??",
            challengeDescription: `You ate Hector's favourite snack, he's gonna be tired of you for a while`,
            goalDescription:"get 1e40 questions while in Cookie time",
            rewardDescription: function() {return `Hector's effect is boosted and its softcap's pushed back. <i>Oh that's<br>not gonna help with future<br>completions.</i><br>Completions: ${challengeCompletions('t',12)}/5`},            
            canComplete: function() {return player.points.gte(1e40)&&hasUpgrade('c', 22)},
            completionLimit:5,
            unlocked() {return(hasUpgrade('t', 15))},
            tooltip:"Fifth completion will unlock a forum upgrade"
        },
    },
})

//Those two movies are actually set in the same world




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
        if (hasAchievement('a', 35)) req = req
        else if (hasAchievement('a', 27)) req = req.pow(2) 
                return req},              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 1,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here. 
        return mult                                       
    },
    gainExp() {                             // Returns your exponent to your gain of the prestige resource.
        let mult = new Decimal(0.25)
        let ttp = new Decimal(1.5)
        ttp = ttp.pow(2) 
        if (hasAchievement('a', 35)) mult = mult
        else if (hasAchievement('a', 27)) mult = mult.pow(ttp) 
        ttp = new Decimal (1)
        if (hasMilestone('fo', 8)) if(player.fo.points.gte(25))ttp = ttp.add(new Decimal(0.05).times(new Decimal(player.fo.points).minus(25)))
        if (hasMilestone('fo', 8)) if(player.fo.points.gte(25)) mult = mult.pow(ttp)
        return mult
    },
    branches: [['t', 1]],

    autoPrestige() {return hasMilestone('fo', 8)},

    resetsNothing() {return hasMilestone('fo', 8)},

    effect() {
        eff = player[this.layer].points.pow(3).add(1);
        if (hasUpgrade("c", 33) && hasAchievement("a", 51)) eff = eff.pow(upgradeEffect("c", 33))
        return eff
        },

    effectDescription() {
        eff = this.effect();
        if (!player.fr.unlocked) return "boosting your time wasted by "+format(eff)
        if (hasUpgrade('fr', 23)) return "boosting your point gain by "+format(eff)
        return "boosting your time wasted by "+format(eff)

    },

    canReset() {
        if (player.fr.unlocked) if (!hasUpgrade('fr', 26)&&!hasAchievement('a', 26)) return false
        return(player.c.points.gte(temp.fo.nextAt) && hasUpgrade('c', 32))
        
    },
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        "resource-display",
        "blank",
        "buyables",
        "blank",
        "milestones",
        "blank",
        ["display-text", () => "Upgrades with forum as cost will require them, but never spend them. Because I said so."],
        "upgrades",
    ],
    hotkeys: [
        {key: "f", description: "F: Reset for forum", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown() { 
        if (hasUpgrade("fr", 26)) return true
        if (hasAchievement('a', 27) && !hasAchievement('a', 31)) return false
        if (hasUpgrade('t', 21) || player.fo.best.gte(1))return true},            // Returns a bool for if this layer's node should be visible in the tree.

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
            unlocked() {return (hasMilestone('fo', 0)) },
        },
        2: {
            requirementDescription: "3 forums",
            effectDescription: "Join a prestige tree forum to understand the game <br> You gain more questions, and also more mysteries <br> <i>Oh. so I <b>had</b> to reset to start the game??</i>",
            done() { return player.fo.points.gte(3) },
            unlocked() {return (hasMilestone('fo', 1)) },
        },
        3: {
            requirementDescription: "4 forums",
            effectDescription: "Join an incremental game forum to understand math <br> Keep Mystery challenges on 3rd layer reset <br> <i>What does QoL means? Quarry of Limes? Questions on Lost?</i>",
            done() { return player.fo.points.gte(4) },
            unlocked() {return (hasMilestone('fo', 2)) },
        },
        4: {
            requirementDescription: "5 forums",
            effectDescription: "Join an googology forum to understand all those numbers <br> Keep Mystery milestones, and, every upgrade that unlock upgrades or challenges now lightly boosts their respective layers <br> <i>The e was not just a decoration?</i>",
            done() { return player.fo.points.gte(5) },
            unlocked() {return (hasMilestone('fo', 3)) },
        },
        5: {
            requirementDescription: "6 forums",
            effectDescription: "Join an google + forum to rekindle with your friends <br> You can do friends reset again, but be kind to them <br> <i>I was too harsh on them, I'll need their help too actually</i>",
            done() { return player.fo.points.gte(6) },
            unlocked() {return (hasMilestone('fo', 4)) },
        },
        6: {
            requirementDescription: "10 forums",
            effectDescription: "Join a cookie forum to let your computer remember<br> You now keep clue and mystery upgrades upon forums and friends<br> <i>Oh, I get it, it's because you need to Click on our kittens in every state !</i>",
            done() { return player.fo.points.gte(10) },
            unlocked() {return (hasMilestone('fo', 5)) },
        },
        7: {
            requirementDescription: "20 forums",
            effectDescription: "Join a helpdesk forum to share all good things you have<br>Forum layer's effect is now branching out and affects clues, theories and mystery gains too<br> <i>So kind of them to help me with my bank account... wait a minu</i>",
            done() { return player.fo.points.gte(20) },
            unlocked() {return (hasMilestone('fo', 6)) },
        },
        8: {
            requirementDescription: "25 forums",
            effectDescription: "Join an Nft forum to gain constant passive income <br> You now gain forums automatically and they reset nothing, but Forums start being softcapped <br> <i>So you mean I could also lose all my money and need to check it every once in a while? Feels scammy</i>",
            done() { return player.fo.points.gte(25) },
            unlocked() {return (hasMilestone('fo', 7)) },
        },
    },
    upgrades: {
        11:{
            title: "The road to a billion friends starts with a single buyable",
            description: "Discover brand new mystery buyables to help you stop being so lonely",
            cost: new Decimal(6),
            unlocked() {return(hasUpgrade('fr', 35)) },
            pay() {return false},
        },
        12:{
            title: "Orlan strikes again",
            description: "You auto-get mysteries and they reset nothing <br><i>What do you mean you've never heard of him?</i>",
            cost: new Decimal(7),
            unlocked() {return(hasUpgrade('fo', 11)) },
            pay() {return false},
        },
        13:{
            title: "Does this layer ever hands out boosts?",
            description: "Boosts clue gain based on forums",
            cost: new Decimal(9),
            pay() {return false},
            unlocked() {return(hasUpgrade('fo', 12)) },
            effect() {
                let eff = new Decimal (player.fo.points)
                eff = new Decimal (3.1415).pow(eff)
                return eff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            
        },
        14:{
            title: "Done being challenged",
            description: "<b>You're so cheap</b>'s effect starts being actually good<br><i>I feel like an idea is coming</i>",
            cost: new Decimal(35),
            unlocked() {return (hasAchievement('a', 36))},
            pay() {return false},
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
        if (hasAchievement('a', 35)) req = req
        else if (hasAchievement('a', 26)) req = req.times(1e7) 
        return req},                // The amount of the base needed to  gain 1 of the prestige currency.
                                                // Also the amount required to unlock the layer.

    type: "normal",                             // Determines the formula used for calculating prestige currency.
    exponent: 0.4,                             // "normal" prestige gain is (currency^exponent).

    gainMult() {                                // Returns your multiplier to your gain of the prestige resource.
        let mult = new Decimal(1)               // Factor in any bonuses multiplying gain here.
        if (hasUpgrade('t', 34)) mult = mult.times(2)
	    if (player.fo.unlocked&& hasUpgrade('fr', 23)) mult = mult.times(temp["fo"].effect)
        return mult                                       
    },
    gainExp() {                                 // Returns your exponent to your gain of the prestige resource.
        exp = new Decimal(1)
        if (hasAchievement('a', 26)&& !hasUpgrade("fr", 26)) exp.times(0.25)
        return exp

    },
    branches: [['t', 1]],
    
    update() {
        let max = new Decimal (8000000000)
        if (hasUpgrade("t", 25)) max = max.times(2)
        if (hasUpgrade("t", 45)) max = max.times(player.fo.points)
        if (player.fr.points.gte(max)) player.fr.points= new Decimal (max);
        player.fr.stohp = max
        tmp.fr.softcap = Decimal.minus(max, player.fr.points)
        tmp.fr.softcapPower = new Decimal(0)
    },

    effect() {
        eff = player[this.layer].points.add(1).pow(0.35);
        return eff
        },

    effectDescription() {
        eff = this.effect();
        return "boosting your theory gain based on your current friends by "+format(eff)

    },

    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        "resource-display",
        ["display-text", () => "You will not gain any more friends after " + format(player.fr.stohp) + " because the planet has a limit"],
        "blank",
        "buyables",
        "blank",
        "upgrades",
    ],

    canReset() {
        if (player.fo.unlocked) if(!hasAchievement('a', 27)) if(!hasMilestone('fo', 5)) return false
        return (player.c.points.gte(temp.fr.requires) && hasUpgrade("c", 32))

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
        if (hasUpgrade('t', 21) || player.fr.best.gte(1))return true},             // Returns a bool for if this layer's node should be visible in the tree.

    upgrades:{
        11:{
            title: "You came back?",
            description: "Theory gain is multiplied by 1e400",
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        12:{
            title: "We missed you so much",
            description: "Mystery gain is boosted by 2eeee4",
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        13:{
            title: "We love you so much",
            description: "clue gain is put to the power of 1e100",
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        14:{
            title: "come here pal",
            description: "question are put to infinity",
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        15:{
            title: "it s all gonna be fine",
            description: "you win now do it now",
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        16:{
            title: "come here we said.",
            description: "do it now you coward reset.",
            cost: new Decimal(1),
            unlocked() {return(player.fo.unlocked && !(player.fr.unlocked))},
        },
        21:{
            title: "Charlie",
            description: "Boosts mystery and theory effect by 5x",
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1)
                return new Decimal(1)} ,
            unlocked() {return(!(hasAchievement("a", 26) && !player.fr.unlocked))}
        },
        22:{
            title: "Hector",
            description: "Boosts every upgrade based on number of current friends and bought friends upgrades",
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(50)
                return new Decimal(5)} ,
            effect() {
                let eff = new Decimal (player.fr.upgrades.length)
                let softlim = new Decimal ("2e5")
                let powef = new Decimal (0.5)
                let helpme = new Decimal (0.1)
                powef = powef.add(helpme.times(challengeCompletions('t',12)))
                eff = eff.times(player.fr.points.pow(powef).add(1))
                if(inChallenge('t', 12)) eff = eff.div(eff.times(eff).times(10))
                softlim = softlim.times(new Decimal(challengeCompletions('t',12)).add(1))
                softeff = softcap(eff, new Decimal(softlim), new Decimal(0.25))
                return softeff
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            unlocked() {return((hasUpgrade('fr', 21) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || hasAchievement("a", 26) && hasUpgrade('fr', 24))},
            tooltip: "But only works on pre forum/friends upgrades",
            style() {
                const style = {};
                if (hasUpgrade(this.layer,this.id) && inChallenge('t', 12)) style["background-color"] = "#FF1D1D";
                return style;
              },
        },
        23:{
            title: "Orlan",
            description() {if (player.fo.unlocked) return "Unlocks Forum layer's effect. What do you mean that's... not that bad<br><i>God damn it Orlan, you're full of wonders</i>"
                else return"Unlocks Forum layer's effect. What do you mean that's useless?<br><i>God damn it Orlan</i>"},
                cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(100000000)
                    return new Decimal(5)} ,
            unlocked() {return(hasUpgrade('fr', 22) && (hasAchievement('a', 27)||hasAchievement('a', 35)))},
        },
        24:{
            title: "Orlan",
            description() {if(hasUpgrade("t", 15)) return "Keep theory challenge on 3rd layer reset. That's still not very useful<br><i>God damn it Orlan, and you didn't think about other challenges?</i>"
                    if(hasAchievement("a", 26) && !hasAchievement('a', 35)) return "Keep theory challenge on 3rd layer reset. That's still not very useful<br><i>God damn it Orlan, and you didn't think about other challenges?</i>"
                return"Keep theory challenge on Friends and Forums resets. That's still not very useful<br><i>God damn it Orlan, and you're getting expensive too</i>"},
                cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(5)
                    return new Decimal(250)} ,
            unlocked() {return((hasUpgrade('fr', 23) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || (hasAchievement("a", 26)&& hasUpgrade('fr', 21) && !hasAchievement("a", 35)))},
            tooltip: "Next upgrade is gonna cost you 1000 friends",
        },
        25:{
            title: "Susie",
            description: "Unlocks new upgrades here and there<br><i>The S actually stands for New Content</i>",
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(1000000)
                return new Decimal(1000)} ,
                unlocked() {return((hasUpgrade('fr', 24) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || (hasAchievement("a", 26) && !hasAchievement('a', 35)&& hasUpgrade('fr', 22)))},
        },
        26:{
            title: "Ethan",
            description: "Unlock Forum layer again (and ability to reset it)<br><i>He fixed your internet after asking nicely</i>",
            cost() { if (hasAchievement('a', 26) && !hasAchievement('a', 35)) return new Decimal(8e9)
                return new Decimal(10000000)} ,
            unlocked() {return((hasUpgrade('fr', 25) && (hasAchievement('a', 27)||hasAchievement('a', 35))) || (hasAchievement("a", 26) && !hasAchievement('a', 35)&&hasUpgrade('fr', 25)))},
        },
        32:{
            title: "Orlan",
            description: "Passively gain 10% of theory on reset <i>God damn Orlan, you're not playing around</i>",
            cost: new Decimal(8e9),
            unlocked() {return (hasAchievement('a', 33))},
        },
        33:{
            title: "Orlan",
            description: "Keep theory upgrades on 3rd layer resets <i>That's not fair Orlan, Mystery has been waiting for it longer</i>",
            cost: new Decimal(16e9),
            unlocked() {return (hasUpgrade('fr', 32))},
        },
        34:{
            title: "Kylian",
            description() { if (hasUpgrade("fr", 34)) return "Completely destroys all softcaps in the game, except for Hector's. As a result, all of the affected formulas will be nerfed <br><i>Wait, all of those things were softcapped?</i>"
                return "Completely destroys all softcaps in the game, except for Hector's and forum'. As a result, all of the affected formulas will be nerfed <br><i>Does not really seem fair, and what's with that cost?</i>"},
            cost: new Decimal("2.5e11"),
            unlocked() {return (hasUpgrade('fr', 35))},
        },
        35:{
            title: "Ismelda",
            description: "Unlocks new upgrades in the forum layer<br><i>The I actually stands for Forum Are Very Extraordinary (or J.U.N.E. for short)</i>",
            cost: new Decimal(1),
            unlocked() {return ((hasUpgrade('fr', 21) && hasAchievement('a', 26)) || (hasAchievement('a', 35) && hasUpgrade('fr', 21)))},
        },
        /*36:{
            title: "Ethan",
            description: "Unlock Forum layer again(?)<br>Forum scaling acts as if you chose it first<br><i>No flavour texts here, keep going</i>",
            cost: new Decimal(16e9),
            unlocked() {return (hasUpgrade('fr', 33))},
        },*/

    },
    
})

addLayer("g", {
    startData() { return {                  // startData is a function that returns default data for a layer. 
        unlocked: false,                     // You can add more variables here to add them to your layer.
        points: new Decimal(0),             // "points" is the internal name for the main resource of the layer.
    }},

    color: "#EDD258",                       // The color for this layer, which affects many elements.
    resource: "Global Conspiracy",            // The name of this layer's main prestige resource.
    row: 2,                                 // The row this layer is on (0 is the first row).
    branches: [['m', 1]],

    position: 0,

    effect() {
        eff = player[this.layer].points.add(1).pow(0.05);
        return eff
        },

    effectDescription() {
        eff = this.effect();
        return "boosting next update's content by "+format(eff)+"%"

    },

    canReset(){if(player.g.unlocked) return false
        return(player.m.points.gte(temp.g.nextAt))
    },

    baseResource: "mysteries",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.m.points },  // A function to return the current amount of baseResource.

    requires: new Decimal(1623),              // The amount of the base needed to  gain 1 of the prestige currency.
                                            // Also the amount required to unlock the layer.

    type: "static",                         // Determines the formula used for calculating prestige currency.
    exponent: 0.5,                          // "normal" prestige gain is (currency^exponent).

    gainMult() {                            // Returns your multiplier to your gain of the prestige resource.
        return new Decimal(1)               // Factor in any bonuses multiplying gain here.
    },
    gainExp() {                             // Returns the exponent to your gain of the prestige resource.
        return new Decimal(1)
    },
    upgrades: {
        11:{
            title: "No content yet",
            description: "Just wait a little, would you",
            cost: new Decimal(1e175),
        },
    },

    layerShown() {if(hasUpgrade('t', 51) || player.g.unlocked) return true
    },             // Returns a bool for if this layer's node should be visible in the tree.

    
    hotkeys: [
        {key: "g", description: "g: Reset for Global Conspiracies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
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
    tabFormat:[
        ["display-text",
            function() { return `You found ${player.a.achievements.length} Achievements <br>
             boosting your self esteem by `+format(eff)},
            {"font-size": "32px"}],
        ["display-text",
            function(){if(player.a.clickables[11]==1) return `You found ${tmp.a.sea}/${tmp.a.seam} Secret Achievements <br>`}],
        "blank",
        "blank",
        "clickables",
        ["display-text",
            function() {if(tmp.a.clicon==1 && player.a.clickables[12]==1) return `You chose the easy path, look for oddities and there shall be your prizes`},
            {"font-size": "32px"}],
        ["display-text",
            function() {if(tmp.a.clicon!=1 && player.a.clickables[21]!=1) return `Hard mode needs you to have never used any other achievement clickable`},
            {"font-size": "32px"}],
        "blank","blank",
        "achievements",
        ["display-text",
            function(){return `Pressing shift while hovering above an achievement will display it's goal tooltip (if you completed the achievement)`}],
    ],
    
    sea : new Decimal (0),

    seam : new Decimal (0),

    clicon : 0,

    effect() {
        eff = new Decimal(player.a.achievements.length)
        eff = eff.pow(eff.times(tmp.a.sea.add(1)))
        return eff
        },

    clickables: {
        11: {
            title: "Show how many secrets are currently achievable?",
            display() {
                if(player.a.clickables[11]==1){return "Yes"}
                return "No"},
            canClick(){return true},
            onClick(){
                if(player.a.clickables[11]==1)player.a.clickables[11]=0
                else player.a.clickables[11]=1
                if(tmp.a.clicon==0) tmp.a.clicon=1},
            unlocked(){if(player.a.clickables[21]==1) return false
            else return true},
            style() {const style = {}; if (player.a.clickables[11]==1) style["background-color"] = "#00FF00"
            else style["background-color"] = "#FF0000"
            return style}

    },
    12: {
        title: "Enable help for the secrets?",
        display() {
            if(player.a.clickables[12]==1){return "Yes"}
            return "No"},
        canClick(){return true},
        onClick(){
            if(player.a.clickables[12]==1)player.a.clickables[12]=0
            else player.a.clickables[12]=1
            if(tmp.a.clicon==0) tmp.a.clicon=1},
        unlocked(){if(player.a.clickables[21]==1) return false
        else return true},
        style() {const style = {}; if (player.a.clickables[12]==1) style["background-color"] = "#00FF00"
        else style["background-color"] = "#FF0000"
        return style}
},
    21: {
        title: "Play Hard mode: disable the two upmost clickables, no help <i>ever</i> for you",
        display() {
            if(player.a.clickables[21]==1){return "Yes"}
            return "No"},
        canClick(){return true},
        onClick(){
            if(player.a.clickables[21]==1)player.a.clickables[21]=0
            else player.a.clickables[21]=1},
        unlocked(){if(tmp.a.clicon==1 || player.a.clickables[21]==1) return false
        return true},
        style() {const style = {}; if (player.a.clickables[21]==0) style["background-color"] = "#FF0000"; return style},

},
    22: {
        title: "Play Hardest mode, and win against all odds",
        display() {
            if(player.a.clickables[22]==1){return "Yes"}
            return "No"},
        canClick(){return true},
        onClick(){
            if(player.a.clickables[22]==1)player.a.clickables[22]=0
            else player.a.clickables[22]=1
            player.points = player.points.times(0)
            player.c.points = player.c.points.times(0)},
        unlocked(){if (hasUpgrade('c', 11) || hasAchievement('a', 11) || player.a.clickables[22]==1) return false
                return true},
                style() {const style = {};style["background-color"] = "#FF0000"; return style},

    },


},
    
    achievements: {
        11: {
            name: "First win!",
            done() {
				return (hasUpgrade('c', 12))
			},
            goalTooltip() {return"Get the second upgrade"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : A fleeting feeling of accomplishment"},

        },
        12:{
            name: "Content",
            done() {
				return (player.m.points.gte(1))
			},
            goalTooltip() {return"Get the second layer"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : The second layer"},
        },
        13: {
            name: "That's... not helping",
            done() {
				return (hasUpgrade('c', 22))
			},
            goalTooltip() {return"Get the the seventh clue upgrade"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : A fleeting feeling of despair and a mystery challenge"},

        },
        14: {
            name: "Take a hint",
            done() {
				return (player.c.points.gte(1e10))
			},
            goalTooltip() {return"Get 1e10 clues"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : Cookie time is no longer required to continue purchasing clue upgrades"},

        },
        15:{
            name: "That's... no, not this one",
            done() {return (hasUpgrade('c', 25))},

            goalTooltip() {return"While in second mystery challenge buy the upgrade that unlocks it"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : Why would you get rewarded for that?"},
        },
        16: {
            name: "You have been bamboozled",
            done() {
				return (hasUpgrade('c', 26))
			},
            goalTooltip() {return"Get a new layer"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : not a new layer but more of those pesky challenges"},

        },
        19: {
            name: "Wow so secret",
            done() {return (hasUpgrade('c', 23))},
            goalTooltip() {return"This doesn't seem right"},

            doneTooltip() {return"Reward : A way to boost passive clue gain later on (but don't forget to buy it back after resets)"},
            unlocked() {return (hasAchievement('a', 19))},
            onComplete(){tmp.a.sea = tmp.a.sea.add(1)},
            
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style["background-color"] = "#A75FBF"; return style}
        },
        21: {
            name: "You win some you lose some",
            done() {
				return(hasChallenge("m", 14))
			},
            goalTooltip() {return"Finish mystery challenge 4"},

            doneTooltip() {if (player.shiftin) return
                return"Guess that's nerfed enough"},

        },
        22: {
            name: "That was a mistake",
            done() {
				if(hasChallenge("m", 14)) return (hasUpgrade('c', 22))
			},
            goalTooltip() {return"Get stuck in Cookie Time"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : A new layer but only to get out of Cookie Time"},

        },
        23: {
            name: "That mistake seems useful",
            done() {
				return (hasChallenge('d', 11))
			},
            goalTooltip() {return"Finish the Despair Challenge"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : The promised new layer is finally unlocked"},

        },

        24: {
            name: "But hey, that's just a ",
            done() {
				return (player.t.points.gte(1))
			},
            goalTooltip() {return"Get your first theory"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : Erm, this achievement I guess?"},

        },

        25: {
            name: "Wow new layers?",
            done() {
				return (hasUpgrade('t', 21))
			},
            goalTooltip() {return"Buy fourth Theory upgrade"},

            doneTooltip() {if (player.shiftin) return
                return"Funny story, you can't reset them... Would a theory challenge cheer you up?"},

        }, 

        26: {
            name: "You chose... correctly",
            done() {
				return (!hasAchievement("a", 27) && (player.fo.unlocked))
			},
            goalTooltip() {return"Do a third layer reset"},

            doneTooltip() {if (player.shiftin) return
                return"Choose the superior new layer, forums. You have pledged your loyalty to them, removing your ability to use the other"},
            unlocked() {return (!hasAchievement('a', 27))},

        },

        27: {
            name: "You chose... correctly",
            done() {
				return (!hasAchievement("a", 26) && (player.fr.unlocked))
			},
            goalTooltip() {return"Do a third layer reset"},

            doneTooltip() {if (player.shiftin) return
                return"Choose the superior new layer, friends. You have pledged your loyalty to them, removing your ability to use the other"},
            unlocked() {return (hasAchievement('a', 27))},

        },

        29: {
            name: "Secrets all around",
            done() {
				return (hasUpgrade('d', 44))
			},
            goalTooltip() {return"Why so desperate?"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : something, surely, sometime"},
            unlocked() {return (hasAchievement('a', 29))},
            onComplete(){tmp.a.sea = tmp.a.sea.add(1)},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style["background-color"] = "#A75FBF"; return style}

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
				if (hasAchievement('a', 31)) return"Unlock the Friend layer again"
                return "find your friends again they love you and you love them so much"
			},

            doneTooltip() {if (player.shiftin) return
                return"You will pay for abandoning them. For a long time."},
            unlocked() {return (hasAchievement('a', 26))},

        },

        32: {
            name: "Back to dating 'e-girls'",
            done() {
				return (hasAchievement("a", 27) && (player.fo.unlocked))
			},
            goalTooltip() {return"Get your internet up and running again"},

            doneTooltip() {if (player.shiftin) return
                return"You got an old new layer back, yet you still desire more? Despicable"},
            unlocked() {return (hasAchievement('a', 27))},
        },
        33: {
            name: `A world of [friends]`,
            done() {
				return (player.fr.points.gte(8e9))
			},
            goalTooltip() {return"Get everybody in the whole wide world to be your buddy"},

            doneTooltip() {if (player.shiftin) return
                return"There is no more friends to be found<br>Reward : Orlan"},
        },
        34: {
            name() {
				if (hasAchievement('a', 34)) return"You have been bamboozled again"
                return "New layered"
			},
            done() {
				return (hasUpgrade("t", 41))
			},
            goalTooltip() {
				if (hasAchievement('a', 34)) return"Unlock a Theory layer of upgrade"
                return "The title says it all, no?"
			},

            doneTooltip() {if (player.shiftin) return
                return"I swear it works every time (but maybe because you have no other choices)"},

        },
        35: {
            name: `Choosing is for nerds`,
            done() {return((hasMilestone('fo', 5) && hasAchievement('a', 32)) || (hasUpgrade('fr', 26) && hasAchievement('a', 31)))},
            goalTooltip() {return"Unlock the layer that you have already have unlocked eons ago<br><i>That's so dumb omg</i>"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : The layer that let you unlock the already unlocked layer now decides that it want to act as if it was chosen first or something"},
        },
        36: {
            name: `Challenge conqueror`,
            done() {return (challengeCompletions('t', 12)==5)},
            goalTooltip() {return"See that theory challenge? Well beat it five times"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : A new Forum upgrade <br><i> Woaw, an actual reward? How rare</i>"},
        },
        37: {
            name: `Like oil and water`,
            done() {return(hasUpgrade('t', 45))},
            goalTooltip() {return"Set your standards to the floor"},

            doneTooltip() {if (player.shiftin) return
                return"Reward : My pity <br><i>Are you really that desperate?</i>"},
        },
        38: {
            name: `That's not even a secret`,
            done() {return (hasUpgrade("t", 53) && !(player.g.unlocked))},
            goalTooltip() {return"Get a positive effect from Cookie before unlocking Global Conspiracies"},
            unlocked() {return (hasAchievement('a', 41))},
            doneTooltip() {if (player.shiftin) return
                return"I genuinely do not believe you reached in here without cheating. If you did, in fact, not cheat, please contact me, this is not supposed to happen"},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style["background-color"] = "#A75FBF"; return style}
        },
        39: {
            name: "Why would you even bother?",
            done() {
				if (inChallenge('t', 11))return (hasUpgrade('c', 31))
			},
            goalTooltip() {return"Try to buy something way too expensive in theory challenge"},

            doneTooltip() {if (player.shiftin) return
                return"That was a pain guess I'll make part of <b>No. No it's not.</>'s base take effect even when not bought yet. You deserve it"},
            unlocked() {return (hasAchievement('a', 39))},
            onComplete(){tmp.a.sea = tmp.a.sea.add(1)},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style["background-color"] = "#A75FBF"; return style}

        },

        41: {
            name: `Master Fidgetor`,
            done() {return (tmp.t.baf>30)},
            goalTooltip() {return"Fidget with the mutually repulsive theory upgrades"},
            unlocked() {return (hasAchievement('a', 41))},
            doneTooltip() {if (player.shiftin) return
                return"Can't blame you, it felt good playing with it <br><br> You get to keep both upgrades I guess then"},
            onComplete(){tmp.a.sea = tmp.a.sea.add(1)},
            style() {const style = {}; if (hasAchievement(this.layer,this.id)) style["background-color"] = "#A75FBF"; return style}
        },

        51: {
            name: `The Upgrade Nurse`,
            done() {return (tmp.c.repare.gte(100))},
            goalTooltip() {if(player.a.clickables[12]==1)return"Repare a lost upgrade"
                return "If you have Kylian, you can figure it out"},
            doneTooltip() {if (player.shiftin) return
                return"I mean, it was so enticing... Reward : you get a new effect for this upgrade"},
            onComplete(){tmp.a.sea = tmp.a.sea.add(1)},
        },

        52: {
            name: `I think you're onto something`,
            done() {return (hasUpgrade("t", 51))},
            goalTooltip() {return "Uncover the new layer"},
            doneTooltip() {if (player.shiftin) return
                return"Come on, don't sulk, you will have that upgrade one day"},
            onComplete(){tmp.a.sea = tmp.a.sea.add(1)},
        },



    },

})
//doPopup(style= "default", text = "This is a test popup.", title = "?", timer = 3, color = "#ffbf00")
