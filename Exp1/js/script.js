

// TODO, Potentially: pick randomly between human/threePoints instructions.
function pageLoad() {
    var startpage = "consent"; //{"consent", "instructions", "start", "posttest"}

    clicksMap[startpage]();
    expt.catchQuestion = sample(expt.catchQuestion);
}

function clickConsent() {
    $('.warning').hide();
    if(checkCheckbox("checkconsent")){
        $('#consent').css('display','none');
        $('#instructions').css('display','block');
        $('#instructPractice').html(expt.practiceTrials);
        $('#instructRounds').html(expt.trials);
        $('#instructDiceSides').html(expt.diceSides);
        let instructCondition = expt.catch == "truth" ? "actually rolled" : "told the other player";
        $('#instructCond').html(instructCondition);
        window.scrollTo(0, 0);
    } else {
        $('#checkconsentLabel').append("<b class='warning'>Please accept to continue</b>");
    }
    
}

function clickInstructions() {
    $('#instructions').css('display','none');
    $('#prePractice').css('display','block');
    window.scrollTo(0, 0);
}

function clickPrePractice(){
    $('#prePractice').css('display','none');
    expt.catchTrials = distributeChecks(expt.practiceTrials, 0.5); // 50% of practice trials have an attention check
    if(expt.roleFirst == 'bullshitter'){
        bullshitter();
    } else{
        bullshitDetector();
    }
    window.scrollTo(0, 0);
}

function clickPostPractice(){
    $('#postPractice').css('display','none');
    expt.roleFirst = sample(expt.roles);
    trial.roleCurrent = expt.roleFirst;
    expt.catchTrials = distributeChecks(expt.trials, expt.catchFreq); // 25% of expt trials have an attention check
    if(expt.roleFirst == 'bullshitter'){
        bullshitter();
    } else{
        bullshitDetector();
    }
    window.scrollTo(0, 0);
}

function showPosttest(){
    $('#postExpt').css('display','block');
    showQuestions();
}

function clickPosttest(){
    if(submitPosttest()){
        $('#postExpt').css('display','none');
        $('#completed').css('display','block');
    } else{
        alert("Please respond to all questions to move on.")
    }
}




function bullshitter() {
    restartTrial();
    $('#dice').css('background-color','#e31b1b');

    var responseText = "<p><br>You get points for the number you report rolling; your opponent gets points for 10 minus that... (except if they catch you lying).</p>";
    responseText += "<label><br>Say what you want your opponent to think you rolled:</label>";
    responseText += "<input type='text' id='reportRoll' value='' size='2' maxlength='2' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false'/> ";
    responseText += "<button class='active-button' id='report-button' type='button' onclick='report();'>Report!</button><br><br>";
    $('#subjResponse').html(responseText);
    $('#roll-button').css('opacity', 1);
    $('#roll-button').prop('disabled',false);
    $('#report-button').prop('disabled',true);
    $('input[type=text]').on('input',
        function(){
            trial.reportedRoll = parseInt($(this).val());
            if(trial.reportedRoll >= 0 && trial.reportedRoll <= 10 ){
                $('#report-button').prop('disabled',false);
            } else{
                $('#report-button').prop('disabled',true);
            }
    });
    
}



function bullshitDetector() {
    restartTrial();
    $('#roll-button').css('opacity', 0);
    $('#roll-button').prop('disabled',true);
    $('#dice').css('background-color','#e15858');
    $('#trialInstruct').html("");

    function bullshitDetectWait() {
        flickerWait();
        
        trial.waitTime = 3000 + 6000*exponential(0.75);
        setTimeout(function(){
            clearInterval(trial.timer);

            var responseInstruct = "<p>Your opponent said they rolled a <b id='reportRoll'/>.</p>"
            responseInstruct += "<p>Your opponent will win <b id='oppPoints'></b> points and you will win <b id='yourPoints'/> points this round.<br><br></p>";
            responseInstruct += "<p id='responseAccRej'>Click <b style='color:green'>'Accept'</b> if you think your opponent is <b style='color:green'>telling the truth</b>, or <b style='color:red'>'Reject'</b> if you think your opponent is <b style='color:red'>lying</b>.</p>"
            
            $('#subjResponse').html(responseInstruct);
            $('#subjResponse').css('opacity','1');
            if(trial.exptPart == "trial"){
                $('#responseAccRej').css('opacity','0');
                setTimeout(function(){
                    $('#responseAccRej').css('opacity','1');
                }, 5000);    
            }
            
            computerRoll();
            $('#reportRoll').html(trial.reportedRoll);
            $('#oppPoints').html(trial.reportedRoll);
            $('#yourPoints').html(expt.diceSides - trial.reportedRoll);
            
            $('#buttonResponse').css('opacity','1');
            trial.responseStartTime = Date.now();
        }, trial.waitTime);
    }
    bullshitDetectWait();
}



function toScoreboard(){
    $('#trial').css('display','none');
    $('#scoreboard').css('display','block');

    trial.catch.responseStartTime = Date.now();
    if(expt.catchTrials.includes(trial.trialNumber)){
        $('#catchQ').show();
        catchTrial(trial.roleCurrent, trial.exptPart);
    } else if(trial.exptPart == 'trial' & (trial.trialNumber + 1) % 5 != 0){
        $('#totalScoreboardDiv').css('opacity','0');
    } else{
        $('#totalScoreboardDiv').css('opacity','1');
    }

    if(trial.roleCurrent == 'bullshitter'){
        computerBSDetector();
    }

    if(!trial.callBS){
        if(trial.roleCurrent == 'bullshitter'){
            trial.callBStxt = "Your opponent <b style='color:green'>accepted</b> your reported answer.<br><br>";
            trial.playerTrialScore = trial.reportedRoll; 
            trial.oppTrialScore = expt.diceSides - trial.reportedRoll;
            if(trial.reportedRoll == trial.trueRoll){
                trial.callBStxt = trial.callBStxt + "You were <b>telling the truth</b>.<br><br>";
                expt.stat.truth += 1;
                expt.stat.truth_noBS += 1;
            } else{
                trial.callBStxt = trial.callBStxt + "You were <b>lying</b>.<br>The true answer was <b>" + trial.trueRoll + "</b>.";
                expt.stat.lie += 1;
                expt.stat.lie_noBS += 1;
            }
        } else{
            trial.callBStxt = "You <b style='color:green'>accepted</b> your opponent's reported answer.<br><br>";
            expt.stat.noBS += 1;
            trial.oppTrialScore = trial.reportedRoll;
            trial.playerTrialScore = expt.diceSides - trial.reportedRoll;
            if(trial.reportedRoll == trial.trueRoll){
                trial.callBStxt = trial.callBStxt + "Your opponent was <b>telling the truth</b>.<br><br>";
                expt.stat.noBS_truth += 1;
            } else{
                trial.callBStxt = trial.callBStxt + "Your opponent was <b>lying</b>.<br>The true answer was <b>" + trial.trueRoll + "</b>.";
                expt.stat.noBS_lie += 1;
            }
        }
    } else{
        if(trial.roleCurrent == 'bullshitter'){
            trial.callBStxt = "Your opponent <b style='color:red'>rejected</b> your reported answer.<br><br>";
            //if player is telling the truth
            if(trial.reportedRoll == trial.trueRoll){
                trial.callBStxt = trial.callBStxt + "You were <b>telling the truth</b>.<br><br>";
                expt.stat.truth += 1;
                expt.stat.truth_BS += 1;
                trial.playerTrialScore = trial.reportedRoll; //opponent gets 10 - points as reported w/ -5 penalty
                trial.oppTrialScore = expt.diceSides - trial.reportedRoll - 5; //player gets points as reported

            } else{
                trial.callBStxt = trial.callBStxt + "You were <b>lying</b>.<br>The true answer was <b>" + trial.trueRoll + "</b>.";
                expt.stat.lie += 1;
                expt.stat.lie_BS += 1;
                trial.playerTrialScore = -5; //player gets -5 points
                trial.oppTrialScore = 5; //opponent gets +5 points
            }
        } else{
            trial.callBStxt = "You <b style='color:red'>rejected</b> your opponent's reported answer.<br><br>";
            expt.stat.BS += 1;
            //if player catches a liar
            if(trial.reportedRoll == trial.trueRoll){
                trial.callBStxt = trial.callBStxt + "Your opponent was <b>telling the truth</b>.<br><br>";
                expt.stat.BS_truth += 1;
                trial.playerTrialScore = expt.diceSides - trial.reportedRoll - 5; //player gets 10 - points as reported w/ -5 penalty
                trial.oppTrialScore = trial.reportedRoll; //opponent gets points as reported
            } else{
                trial.callBStxt = trial.callBStxt + "Your opponent was <b>lying</b>.<br>The true answer was <b>" + trial.trueRoll + "</b>.";
                expt.stat.BS_lie += 1;
                trial.playerTrialScore = 5; //player gets +5 points
                trial.oppTrialScore = -5; //opponent gets -5 points
            }
        }
    }

    expt.stat.playerTotalScore += trial.playerTrialScore;
    expt.stat.oppTotalScore += trial.oppTrialScore;
    $('.playerScore').html(expt.stat.playerTotalScore);
    $('.oppScore').html(expt.stat.oppTotalScore);

    if(trial.exptPart == "practice"){
        $('#calledBS').html(trial.callBStxt);
        $('#playerPts').html(scorePrefix(trial.playerTrialScore));
        $('#oppPts').html(scorePrefix(trial.oppTrialScore));
        //$('.playerScore').html((expt.stat.playerTotalScore - trial.playerTrialScore) + " + " + trial.playerTrialScore + " = " + expt.stat.playerTotalScore);
        //$('.oppScore').html((expt.stat.oppTotalScore - trial.oppTrialScore) + " + " + trial.oppTrialScore + " = " + expt.stat.oppTotalScore);
    } else{
        $('.scoreReport').html("Click to move on to the next round.");
        $('#trialScoreboardDiv').hide();
    }
}

function trialDone() {
    // hide trial.
    $('#scoreboard').css('display','none');
    trial.trialTime = Date.now() - trial.startTime;
    trial.trialNumber += 1;
    recordData();

    if(trial.exptPart == "practice" & trial.trialNumber >= expt.practiceTrials){
        trial.trialNumber = 0;
        trial.exptPart = 'trial';
        expt.stat.playerTotalScore = 0;
        expt.stat.oppTotalScore = 0;
        expt.stat.truth = 0;
        expt.stat.truth_noBS = 0;
        expt.stat.truth_BS = 0;
        expt.stat.lie = 0;
        expt.stat.lie_noBS = 0;
        expt.stat.lie_BS = 0;
        expt.stat.noBS = 0;
        expt.stat.noBS_truth = 0;
        expt.stat.noBS_lie = 0;
        expt.stat.BS = 0;
        expt.stat.BS_truth = 0;
        expt.stat.BS_lie = 0;
        $('#trial').css('display','none');
        $('#postPractice').css('display','block');
    } else if(trial.trialNumber >= expt.trials){
        if(expt.stat.playerTotalScore == expt.stat.oppTotalScore){
            $('#whowon').html("You and your opponent tied!");
        } else if(expt.stat.playerTotalScore > expt.stat.oppTotalScore){
            $('#whowon').html("You won!");
        } else{
            $('#whowon').html("Your opponent won!");
        }

        $('.scoreboardDiv').show();

        $('.playerScore').html(expt.stat.playerTotalScore);
        $('.oppScore').html(expt.stat.oppTotalScore);

        calculateStats('#stat_truth', expt.stat.truth, expt.stat.truth + expt.stat.lie);
        calculateStats('#stat_truth_noBS', expt.stat.truth_noBS, expt.stat.truth);
        calculateStats('#stat_truth_BS', expt.stat.truth_BS, expt.stat.truth);
        calculateStats('#stat_lie', expt.stat.lie, expt.stat.truth + expt.stat.lie);
        calculateStats('#stat_lie_noBS', expt.stat.lie_noBS, expt.stat.lie);
        calculateStats('#stat_lie_BS', expt.stat.lie_BS, expt.stat.lie);
        calculateStats('#stat_noBS', expt.stat.noBS, expt.stat.noBS + expt.stat.BS);
        calculateStats('#stat_noBS_truth', expt.stat.noBS_truth, expt.stat.noBS);
        calculateStats('#stat_noBS_lie', expt.stat.noBS_lie, expt.stat.noBS);
        calculateStats('#stat_BS', expt.stat.BS, expt.stat.noBS + expt.stat.BS);
        calculateStats('#stat_BS_truth', expt.stat.BS_truth, expt.stat.BS);
        calculateStats('#stat_BS_lie', expt.stat.BS_lie, expt.stat.BS);

        // expt done
        data = {client: client, expt: expt, trials: trialData};
        writeServer(data);

        showPosttest();
    } else {
        if(trial.roleCurrent == 'bullshitter'){
            trial.roleCurrent = 'bullshitDetector';
            bullshitDetector();
        } else{
            trial.roleCurrent = 'bullshitter';
            bullshitter();
        }
    }
}


function experimentDone() {
    submitExternal(client);
}

