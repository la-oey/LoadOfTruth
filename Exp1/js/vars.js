// https://ucsd.sona-systems.com/webstudy_credit.aspx?experiment_id=1465&credit_token=c6393dd431374ab48035c7fafafced2e&survey_code=XXXX
// experiment settings
var expt = {
    saveURL: 'submit.simple.php',
    trials: 100, //switch to 100
    practiceTrials: 4, //how many practice trials //switch to 4
    diceSides: 10, //sides on dice
    roles: ['bullshitter', 'bullshitDetector'],
    roleFirst: 'bullshitter', //roles: {'bullshitter','bullshitDetector'}
    catchQuestion: ['truth', 'report'],
    catchTrials: [],
    stat: {
        playerTotalScore: 0,
        oppTotalScore: 0,
        truth: 0,
        truth_noBS: 0,
        truth_BS: 0,
        lie: 0,
        lie_noBS: 0,
        lie_BS: 0,
        noBS: 0,
        noBS_truth: 0,
        noBS_lie: 0,
        BS: 0,
        BS_truth: 0,
        BS_lie: 0
    },
    sona: {
        experiment_id: 1505,
        credit_token: 'b20092f9d3b34a378ee654bcc50710ea'
    },
    debug: false
};
var trial = {
    exptPart: 'practice', //parts: {'practice','trial'}
    roleCurrent: 'bullshitter',
    trialNumber: 0,
    startTime: 0,
    trialTime: 0,
    waitTime: 0,
    responseStartTime: 0,
    responseTime: 0,
    timer: 0,
    trueRoll: 0,
    reportedRoll: 0,
    compLie: 0,
    compUnifLie: false,
    callBS: false,
    callBStxt: '',
    catch: {
        question: '',
        response: 0,
        key: 0,
        responseStartTime: 0,
        responseTime: 0
    },
    playerTrialScore: 0,
    oppTrialScore: 0
};
var turn = {
    rolled: false
}
var client = parseClient();
var trialData = []; // store of all trials

