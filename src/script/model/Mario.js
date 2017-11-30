export default class Mario {

        constructor(id,game,material)
        {
            this.id = id;
            this.game = game
            this.mario = game.add.sprite(100, 100, 'mario_normal');
            this.mario.alpha = 0.5
            game.physics.p2.enable(this.mario);
            this.mario.body.fixedRotation = true;
            //this.mario.body.collideWorldBounds = true;
            this.mario.body.setMaterial(material)
            this.yAxis = p2.vec2.fromValues(0, 1);
            this.score = 0
            this.victories = 0
            this.mario.body.onBeginContact.add((body, bodyB, shapeA, shapeB, equation)=>{
              if(body.sprite.key == "wall"){
                 if(this.checkIfCanJump()){
                     this.score++
                 }
              }
            })
        
            /*
            this.mario.body.onBeginContact.add(()=>{
                if(this.checkIfCanJump()){
                    setTimeout(()=>{
                       // this.jump();
                    },2000)
                }  
            })
            */
        
        }

        reset()
        {
            this.mario.body.velocity.x = 0;
            this.mario.body.velocity.y = 0;
            this.mario.body.x = 50
            this.mario.body.y = 500
            this.score = 0
        }

        prepareJump(obstacleX,obstacleHeight,genome)
        {
            
                this.jump(obstacleX,obstacleHeight,genome)
            

        }

        jump(obstacleX,obstacleHeight,genome)
        {
            this.genome = genome
            this.genome.score = 0
            var best = {up:0,right:0,score:0}

            var inputs= [
                obstacleX,
                obstacleHeight,
                0,
                0
            ]
            
            for(var up=300;up<500;up+=2)
            {
                for(var right=100;right<300;right+=2)
                {
                    inputs[2] = (up-300)/200
                    inputs[3] = (right-100)/200
                    var score = this.genome.activate(inputs)[0];
                    if(score > best.score){
                        best.score = score;
                        best.up = up
                        best.right = right
                    }
                }
            }

            this.game.time.events.add(this.id*100,()=>{
                this.mario.body.moveUp(best.up);
                this.mario.body.moveRight(best.right);
            })
        }





        checkIfCanJump()
        {
            var result = false;
            for (var i=0; i < this.game.physics.p2.world.narrowphase.contactEquations.length; i++)
            {
                var c = this.game.physics.p2.world.narrowphase.contactEquations[i];
                if (c.bodyA === this.mario.body.data || c.bodyB === this.mario.body.data)
                {
                    var d = p2.vec2.dot(c.normalA, this.yAxis);
                    if (c.bodyA === this.mario.body.data) d *= -1;
                    if (d > 0.5)   result = true;
                }
            }
            return result;
        }

}