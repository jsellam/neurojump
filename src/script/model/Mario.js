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

        prepareJump(input,genome,outputs)
        {
            genome.score = 0
            this.genome = genome;
            var result = this.genome.activate(input);
            if(this.id == 0) console.log("result : ",result)
            var maxResult = 0
            var maxResultIndex = 0
            for(var i=0;i<result.length;i++)
            {
                if(result[i] > maxResult)
                {
                    maxResult = result[i]
                    maxResultIndex = i
                }
            }

            if(this.id == 0)
            {
                console.log("max : ",maxResult,"index max : ",maxResultIndex)
                console.log("fire : ",outputs[maxResultIndex])
            }
            this.game.time.events.add(this.id*100,()=>{
                this.mario.body.moveUp(outputs[maxResultIndex].up);
                this.mario.body.moveRight(outputs[maxResultIndex].right);
            })
             //   this.jump(obstacleX,obstacleHeight,genome)
            

        }

        jump(input,genome)
        {
            this.genome = genome
            this.genome.score = 0
            var best = {up:0,right:0,score:0}

   
            var bestInput = []
            for(var up=300;up<500;up+=20)
            {
                for(var right=100;right<300;right+=20)
                {
                    input[2] = (up-300)/200
                    input[3] = (right-100)/200
                    var score = this.genome.noTraceActivate(input)[0];

                    if(this.id == 0)
                    {
                        console.log("up:",up,"right:",right,"score:",score)
                    }

                    if(score > best.score){
                        best.score = score;
                        best.up = up
                        best.right = right
                        bestInput = input.concat([])
                    }
                }
            }
            this.genome.activate(bestInput)
            if(this.id == 0)
            {
                console.log(bestInput)
                console.log("best score : ",best.score)
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