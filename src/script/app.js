
window.PIXI = require('phaser/build/custom/pixi')
window.p2 = require('phaser/build/custom/p2')
window.Phaser = require('phaser/build/custom/phaser-split')


require('../styles/app.scss');

var Neat    = neataptic.Neat;
var methods = neataptic.methods;
var Config  = neataptic.Config;
var architect = neataptic.architect;

import Mario from './model/Mario'
var marioCount = 50;

var namesField
var scoresField


var outputs = []
for(var up=0;up<15;up++){
    for(var right=0;right<15;right++)
    {
        outputs.push({up:up*10+380,
                    right:right*10+200})
    }
}


var neat = new Neat(
    2,
    outputs.length,
    null,
    {
        mutation: [
            methods.mutation.ADD_NODE,
            methods.mutation.SUB_NODE,
            methods.mutation.ADD_CONN,
            methods.mutation.SUB_CONN,
            methods.mutation.MOD_WEIGHT,
            methods.mutation.MOD_BIAS,
            methods.mutation.MOD_ACTIVATION,
            methods.mutation.ADD_GATE,
            methods.mutation.SUB_GATE,
            methods.mutation.ADD_SELF_CONN,
            methods.mutation.SUB_SELF_CONN,
            methods.mutation.ADD_BACK_CONN,
            methods.mutation.SUB_BACK_CONN
          ],
      popsize: marioCount,
      mutationRate: 0.6,
      elitism: Math.round(0.2 * marioCount),
      network: new architect.Random(
        2,
        outputs.length,
        outputs.length
      )
    })




var config = {
    width:800,
    height:600,
    renderer: Phaser.AUTO,
    parent: 'game-container',
    state: {preload: preload, create: create, update: update },
    transparent: false,
    antialias: false,
   //forceSetTimeOut:true,
    disableVisibilityChange:true,
    scaleMode: Phaser.ScaleManager.EXACT_FIT
}
var game =  new Phaser.Game(config)
//var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container', {preload: preload, create: create, update: update });
//game.raf.forceSetTimeOut = true
console.log("raf : ",game.raf)
var mario;
var wall
var stop
var marioList = []


function preload() {
    game.load.image('mario_jump', 'img/mario_jump.png');
    game.load.image('mario_normal', 'img/mario_normal.png');
    game.load.image('background', 'img/background.jpg');
    game.load.image('ground', 'img/ground.png');
    game.load.image('wall', 'img/wall.png');
    game.load.image('stop', 'img/stop.png');
}

function create() {

    
   // game.stage.disableVisibilityChange = true;
    console.log("stage ",game.stage.disableVisibilityChange)

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.restitution = 0.5;
    game.physics.p2.gravity.y = 300;

    var worldMaterial = game.physics.p2.createMaterial('worldMaterial');
    game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, true);


    game.add.sprite(0, 0, 'background');

    wall = game.add.sprite(500,400, 'wall');
    game.physics.p2.enable(wall);
    wall.body.static = true;
    var wallMaterial = game.physics.p2.createMaterial('wallMaterial', wall.body);

    //ground
    var ground = game.add.sprite(400, game.world.height-53/2, 'ground');
    game.physics.p2.enable(ground);
    ground.body.static = true;
    var groundMaterial = game.physics.p2.createMaterial('groundMaterial', ground.body);
    


    stop = game.add.sprite(10, 10, 'stop');

    var worldGroup = game.physics.p2.createCollisionGroup();
    var marioGroup = game.physics.p2.createCollisionGroup();
   
    ground.body.setCollisionGroup(worldGroup)
    wall.body.setCollisionGroup(worldGroup)
    var marioMaterial = game.physics.p2.createMaterial('spriteMaterial');
    var mario
    for(var i=0;i<marioCount;i++)
    {
        mario = new Mario(i,game,marioMaterial)
        mario.mario.body.setCollisionGroup(marioGroup)
        mario.mario.body.collides(worldGroup)
        marioList.push(mario)
    }
    //game.physics.p2.updateBoundsCollisionGroup();
    ground.body.collides(marioGroup)
    wall.body.collides(marioGroup)
    
    var style = { font: "bold 13px Arial", fill: "#fff",align: 'left'};
    game.add.text(650, 20, "#rank / id / good jump", style);

    style = { font: "11px Arial", fill: "#fff",align: 'left', wordWrap: true, wordWrapWidth: 50};
    namesField = game.add.text(700, 50, "", style);
    namesField.lineSpacing = -5
    scoresField = game.add.text(750, 50, "", style);
    scoresField.lineSpacing =-5


    //mario.body.setMaterial(marioMaterial)

    var contactMaterial1 = game.physics.p2.createContactMaterial(marioMaterial, worldMaterial,{restitution:0,friction:10});
    var contactMaterial1 = game.physics.p2.createContactMaterial(marioMaterial, groundMaterial,{restitution:0,friction:10});
    var contactMaterial2 = game.physics.p2.createContactMaterial(marioMaterial, wallMaterial,{restitution:0,friction:50});

    startGeneration()
}


function startGeneration()
{

    var x = Math.floor(Math.random()*5)
    var y = Math.floor(Math.random()*10)
    var inputBase = [0,0]
    inputBase[0] = x/5
    inputBase[1] = y/5

    wall.body.x = x*40+300
    wall.body.y = 750-y*40

    stop.x = wall.body.x
    stop.y = wall.body.y-wall.height/2-100
   




    var px = (wall.body.x-400)/200
    var py = (wall.body.x-400)/300
    for(var i=0;i<marioList.length;i++)
    {
        var genome = neat.population[i];
        var mario = marioList[i];
        mario.reset()
        mario.prepareJump(inputBase,genome,outputs)
        
    }

    game.time.events.add(8000,()=>{
        evaluateGeneration()
    })

}

function evaluateGeneration()
{
   

    var target = {
        x:wall.body.x,
        y:wall.body.y-wall.height/2
    }
    var winCount = 0
    var maxVictories = 0
    var bestMario = null
    for(var i=0;i<marioList.length;i++)
    {
        var mario = marioList[i];
        var dx = target.x-mario.mario.body.x
        var dy = target.y-mario.mario.body.y
        var dist = Math.sqrt(dx*dx+dy*dy)
    
      
        mario.genome.score = mario.score
        if(mario.victories > 0) mario.genome.score+=0.5
        if(mario.mario.body.y <wall.body.y-wall.height/2 && mario.score > 0 && mario.checkIfCanJump())
        {
            mario.genome.score +=15
            mario.victories++
            winCount++
        } 
        if(mario.victories > maxVictories){
            maxVictories = mario.victories 
            bestMario = mario
        }
    }
    
    //neat.evaluate()
    neat.sort();
    console.log('Generation:', neat.generation, '- average score:', neat.getAverage());
    var newPopulation = [];
    // Elitism
    for(var i = 0; i < neat.elitism; i++){
        console.log("keep sorted ",neat.population[i].score)
        newPopulation.push(neat.population[i]);
      }

    // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring());
  }
  neat.population = newPopulation;
  neat.mutate();

  neat.generation++;
    startGeneration()
    updateRanking()
    
}



function update() {
   
}


function updateRanking()
{
    var names = ""
    var scores = ""
    var rank = marioList.sort((a,b)=> b.victories - a.victories)

    for(var i=0;i<rank.length/2;i++)
    {
        names+="#"+(i+1)+" id"+rank[i].id+"\n"
        scores+=rank[i].victories+"\n"
    }

    namesField.text = names
    scoresField.text = scores
}