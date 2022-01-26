var postResponse = {};
var postQhtml = "";



  ///////////////////////
 // Posttest questions//
///////////////////////

function showQuestions(){
	for(i in postQs){
		let qNum = parseInt(i) + 1;
		postQhtml += "<b style='font-size:18px'>" + qNum + ". </b>"
		switch(postQs[i]["type"]) {
			case "slider":
				postQhtml += addSlider(postQs[i]);
				break;
			case "radio":
				postQhtml += addRadio(postQs[i]);
				break;
			case "free":
				postQhtml += addFree(postQs[i]);
				break;
		}
		postQhtml += "<br><br><br><br>";
	}
	$("#posttestSurvey").html(postQhtml);

	setupSlider();
}

function addSlider(qi){
	let id = qi["id"];
	let ans = qi["answers"];
	let questionHTML = "<label id=" + id + ">" + qi["question"];
	let sliderHTML = "<div class='sliderContainer'>" +
					 "<input id=" + id + "Slider name=" + id + "Slider class='slider inactiveSlider' type='range' min='0' max='100' value=''>" +
					 "<div class='min'><p>" + ans[0] + "</p></div>" + 
					 "<div class='max'><p>" + ans[1] + "</p></div>" +
					 "</div>";
	return(questionHTML + sliderHTML + "</label>")
}

function addRadio(qi){
	let id = qi["id"];
	let ans = qi["answers"];
	let questionHTML = "<label id=" + id + ">" + qi["question"] + " ";
	let radioHTML = "";
	for(a in ans){
		radioHTML += "<input type='radio' name=" + id + "Radio value=" + ans[a] + "><label for=" + ans[a] + ">" + ans[a] + "</label>"
	}
	return(questionHTML + radioHTML + "</label>");
}

function addFree(qi){
	let id = qi["id"];
	let questionHTML = "<label id=" + id + ">" + qi["question"] + "</label><br><br>";
	let responseHTML = "<textarea class='textbox' id='" + id + "Textbox'></textarea>";
	return(questionHTML + responseHTML);
}

function setupSlider(){
	$('.slider').on('click input',
        function(){
            $(this).removeClass('inactiveSlider');
            $(this).addClass('activeSlider');
        });
}

function submitPosttest(){
	let checkResponse = true;
	for(i in postQs){
		let id = postQs[i]["id"];
		switch(postQs[i]["type"]) {
			case "slider":
				postResponse[id] = $("#"+id+"Slider").val(); 
				if($('#'+id+'Slider').hasClass('inactiveSlider')){
					checkResponse = false;
				}
				break;
			case "radio":
				postResponse[id] = $("input[name = " + id + "Radio]:checked").val(); 
				if($("input[name = " + id + "Radio]:checked").val() == undefined){
					checkResponse = false;
				}
				break;
			case "free":
				postResponse[id] = $("#"+id+"Textbox").val();
				if($("#"+id+"Textbox").val() == ''){
					checkResponse = false;
				}
				break; 
		}
	}
	client.posttest = postResponse;
	data = {client: client, expt: expt, trials: trialData};
  writeServer(data);
	return(checkResponse);
}





function checkCheckbox(question){
	return($('input[name = "'+question+'"]').prop("checked"));
}






