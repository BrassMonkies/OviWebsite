//global variables
var goals;
var previousGoals;
var game_id;
var playlength;
var current_date;
//var tomorrow;
var current_time;
var game_start_time;

game_day = false;
game_active = false;
commercial_break = false;

const intermission = []; 
const commercials = [];
const goals_in_game = []; 



//fetch loads current goal total upon webpage open
function career_total(){
  fetch("https://api-web.nhle.com/v1/player/8471214/landing")
  .then((response) => response.json())
  .then((data) => {
    //Stores total goals to local storage
    goals = data.careerTotals.regularSeason.goals;

    //Sets HTML to Ovechkins career total goals
    document.getElementById("Ovtotalgoals").innerHTML = goals;
    checkrecord(goals)

})
  .catch((error) => console.error(error));
}



//gets current date
function get_current_date(){
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  current_date = `${year}-${month}-${day}`;
  //tomorrow = `${year}-${month}-${parseInt(day) + 1}`;
  console.log("Today: " + current_date);
  //console.log("Tomorrow: " + tomorrow);
}

//Executes when Ovi scores
function goalScored() {
  goals += 1;
  document.getElementById("Ovtotalgoals").innerHTML = goals
  resetTimer();
  startTimer();
  checkrecord(goals);
}

//Checks if there is a game on the current date
async function CheckGameDay() {
  try {
    const response = await fetch("https://api-web.nhle.com/v1/club-schedule-season/WSH/now") //Checks Capitals game schedule
    .then((response) => response.json())
    .then((data) => {
      //console.log(data.games)
      let game_schedule = data.games; //Sets game schedule to variable
      career_total()
      get_current_date() //Gets todays date

      for (const i of game_schedule){            
        if (i.gameDate === current_date){
          //console.log("date matches");
          game_id = i.id;
          game_day = true;
          break
        }
      }
      if (game_day){
        console.log("There is a game today")
        CheckCurrentGameStatus() 
      }
      else {
        console.log("There is no game today")
        setTimeout(CheckCurrentGameStatus, 43200000); //Checks every 12 hours
      }
    })
  } 

  catch (error) {
    console.error("Error fetching goal data:", error);
  }
} //End function CheckGameDay

//Gets current time
function get_current_time(){
  let today = new Date();
  let hours = today.getHours();
  let minutes = today.getMinutes();
  let seconds = today.getSeconds();

  // current_time = console.log(`Current Time: ${hours}:${minutes}:${seconds}`);

  // Get the current time in UTC
  const currentTimeUTC = new Date().toISOString();

  // Check if the current time is equal to or past midnight UTC minus 5 hours
  if (currentTimeUTC >= game_start_time){ 
    console.log("The game will start soon");
    game_active = true;
    setTimeout(GameActive, 480000)  //calls CheckCurrentGameStatus after 8 minutes to account for pregame/national anthem
    // GameActive() //Bypass 8 minute delay
  }
  else {
    // console.log("Game is not currently active")
    // console.log(game_start_time)
    // console.log(currentTimeUTC)
    setTimeout(get_current_time, 60000)
  }
}

//Checks the status of the game
async function CheckCurrentGameStatus(){
  try{
    const response = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game_id}/play-by-play`)

      .then((response) => response.json())
      .then((data) => {
        console.log('I am checking game satus');
        game_start_time = data.startTimeUTC
        get_current_time();
      })
    }
    catch (error) {
      console.error("Error fetching goal data:", error);
    }
} //End CheckCurrentGameStatus

//Checks if Ovi scores in active game
async function GameActive() {
  try{
    const response = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game_id}/play-by-play`)

      .then((response) => response.json())
      .then((data) => {
        //console.log(data)
        let active_play = data.plays //Lists all current plays of the game
        period_end = false
        regulation_end = false
        overtime = false
        shootout = false
        

        if (game_active){
          //console.log('I am checking play by play')
          console.log(`I am starting at array index ${playlength - 1}`)

          for (let p of active_play.slice(playlength - 1)){ //Loops through object in data.play array
            //console.log(`The event id checked is ${p.eventId}`)

            if (p.typeDescKey === "game-end"){ //checks for end of game
              console.log("the game has ended")
              game_active = false;
              break
            }
            
            else if (p.typeDescKey === "period-end"){
              //console.log(`End of period eventid ${p.eventId}`) //logs eventid of each period end

              if (intermission.includes(p.eventId)){ //checks if period end eventid has already occurd. 
                console.log("Intermission eventID has already occurred")
                //pass. Skip for excisting eventId
              }

              else if (intermission.length < 2){ //checks if periods 1 and 2 have ended
                  period_end = true;
                  intermission.push(p.eventId)
                  console.log(intermission.length) 
                  break
              }          

              else if (intermission.length = 2){ //checks if regulation has ended
                regulation_end = true;
                intermission.push(p.eventId)
                console.log(intermission.length)
              }

              else if (p.periodDescriptor.periodType === 'OT'){ //Check if OT has ended and end game_active
                game_active = false;
                break
              }
            }//End else if period end

            else if (p.typeCode === 516){ //checks for stoppage
              if (p.details.reason){
                if (p.details.secondaryReason === "tv-timeout"){
                  if (commercials.includes(p.eventId)){ //checks if commercial eventid has already occurd.
                    console.log("Commercial eventID has already occurred") 
                    //pass. Skip for excisting eventId
                  }
                  else{
                    commercials.push(p.eventId)
                    commercial_break = true;
                    break  
                  }
                }  
              }
            } //End check stoppage

            //Check for goal scored
            else if (p.typeCode === 505){
              if (p.details.scoringPlayerId === 8471214){ //Checks if Ovi scores playerid 8471214
                if (goals_in_game.includes(p.eventId)){ //checks if goal eventid has already occurd. 
                  console.log("Reviewed goal eventID has already occurred") 
                  //pass. Skip for excisting eventId
                }
                else{
                  goals_in_game.push(p.eventId)
                console.log(`Ovi has scored goal number ${(goals + 1)}`)
                goalScored(); //resets timer and updates Ovechkins total goals  
                }
              } //End if OVI scores
            } //End else if goal scored
          } //End for loop of game events

          if (!game_active){
            regulation_end = false;
            GameActive()
          }

          else if (regulation_end){
            regulation_end = false;
            console.log("Regulation has ended. Checking back in 3 minutes")
            setTimeout(GameActive, 180000); //180000 = 3 minutes pass 
            //setTimeout(GameActive, 15000); //use 15000 for 15 seconds
          }

          else if (period_end){
            console.log("Period end")
            period_end = false;
            console.log("I will check in 15 minutes")
            setTimeout(GameActive, 900000); //use 900000 for 15 minutes
            // setTimeout(GameActive, 15000); //use 15000 for 15 seconds
          }

          else if (commercial_break) {
            commercial_break = false;
            console.log('Commercial break')
            setTimeout(GameActive, 120000); //check back in 2 minutes
            // setTimeout(GameActive, 15000); //use 15000 for 15 seconds
          }     

          else{
            setTimeout(GameActive, 15000);
          }

          playlength = active_play.length
          console.log(active_play)
        } //End if game_active true

        else{ //reviews game data for missed ovechkin goals
          console.log("Reviewing the game for missed goals")

          for (p of active_play){
            // console.log("Checking active_play Array")

            //Check for goal scored
            if (p.typeCode === 505){
              if (p.details.scoringPlayerId === 8471214){ //Checks if Ovi scores playerid 8471214
                if (goals_in_game.includes(p.eventId)){ //checks if goal eventid has already occurd. 
                  console.log("Goal eventID has already occurred") 
                }
                else{
                console.log(`Review found a missed goal. Ovi has scored goal number ${(goals + 1)}`)
                goals_in_game.push(p.eventId)
                goalScored(); //resets timer and updates Ovechkins total goals  
                }
              } //End if OVI scores
            } //end if goal
          } //end for loop

          if (goals_in_game.length > 0) {
            for (let g of goals_in_game) {
              // console.log("Checking goals_in_game Array");
              if (!active_play.some(p => p.eventId === g)) {
                console.log("Review found a false goal");
                goals -= 1;
                document.getElementById("Ovtotalgoals").innerHTML = goals
              } 
              else {
                console.log("Goal eventID has already been accounted for");
              }
            }
          } else {
            console.log("No goals in goals_in_game, skipping loop.");
          }

          playlength = 0;
          intermission.length = 0; 
          commercials.length = 0;
          goals_in_game.length = 0; 
          console.log(`Intermission array: ${intermission.length}`)
          console.log(`Intermission array: ${commercials.length}`)
          console.log(`Intermission array: ${goals_in_game.length}`)
          console.log("Checking game day in 12 hours")
          setTimeout(CheckGameDay, 60 * 60 * 12000)
        }//end game review
      }) //End .then(data)
  } //End try
   
  catch (error) {
    console.error("Error fetching goal data:", error);
  }
} //End GameActive

// Start the timer initially
startTimer();

//Fetch goal data every minute (60,000 milliseconds)
//setInterval(CheckGameDay, 10000);

CheckGameDay();
//CheckCurrentGameStatus(); //used to test on off days



