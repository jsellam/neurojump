
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



var neat = new Neat(
    4,
    1,
    null,
    {
      mutation: methods.mutation.ALL,
      popsize: marioCount,
      mutationRate: 0.6,
      elitism: Math.round(0.1 * marioCount),
      network: new architect.Random(
        4,
        24,
        1
      )
    })






var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container', { preload: preload, create: create, update: update });


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

    wall.body.x = Math.random()*200+400
    wall.body.y = Math.random()*300+400

    stop.x = wall.body.x
    stop.y = wall.body.y-wall.height/2-100
   




    var px = (wall.body.x-400)/200
    var py = (wall.body.x-400)/300
    for(var i=0;i<marioList.length;i++)
    {
        var genome = neat.population[i];
        var mario = marioList[i];
        mario.reset()
        mario.prepareJump(px,py,genome)
        
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


    neat.sort();
    var newPopulation = [];
    // Elitism
    for(var i = 0; i < neat.elitism; i++){
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