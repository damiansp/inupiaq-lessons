var vocab, // a json object holiding the vocab
    // arrays of all items to appear on front and back of each card
    frontArray = [0], backArray = [0], 
    // arrays of all english and inupiatun terms (matched)
    inupiatunArray = [], englishArray = [],
    // arrays holding items to be shown again
    repFrontArray = [], repBackArray = [],
    lessons = [],
    maxCards = null;




$(document).ready(function() {


// Create a function that does an Ajax call to load data for a lesson
function loadLesson(lesson) {
    $.ajax({ 
        dataType: 'json',
	url: './vocab/lesson' + lesson + '.json',
	success: function(json) {
	    vocab = json;
	    for (k in vocab) {
		inupiatunArray.push(vocab[k].inupiatun);
		// Eng. may have multiple defs, if so split with br
		var english = vocab[k].english;
		if (Array.isArray(english)) {
		    english = english.join('<br />');
		}
		englishArray.push(english);
	    }
	},
	fail: function() {
	    $('#load-error').show();
	}
    });
};


$('#load-button').on('click', function() {
    // TO DO: When more chapters have been added, determine which and load only
    // those chapters
    $('input[name="lesson"]:checked').each(function() {
	lessons.push(this.value);
    });

    for (lesson in lessons) {
	loadLesson(lessons[lesson]);
    }

    // Transition to next screen
    $('#chapter-load').hide();
    $('#options').fadeIn();

});



$('#begin-button').on('click', function() {
    // Determine the front and back data to be shown
    var frontMatter = $('input[name="options"]:checked').val();
    if (frontMatter == 'inupiatun-text') {
	frontArray = inupiatunArray;
	backArray = englishArray;
    } else if (frontMatter == 'english-text') {
	frontArray = englishArray;
	backArray = inupiatunArray;
    } else if (frontMatter == 'both-text') {
	frontArray = inupiatunArray.concat(englishArray);
	backArray = englishArray.concat(inupiatunArray);
    }/** else if (frontMatter == 'inupiatun-audio') {
	 // TO DO: Add when audio data are available
      
	 } */ else {
	alert("I'm sorry, but the internets are broken");
    }

    // Randomize the data
    var shuffledData = resample(frontArray, backArray);
    frontArray = shuffledData[0];
    backArray = shuffledData[1];

    // Create the first card
    populateCard();

    // Transition
    $('#options').hide();
    $('#card-display').fadeIn();
});

$('#show-button').on('click', function() {
    // Hide Show Button
    $(this).hide();
    
    // Show Back of Card & Response Buttons
    $('#back').fadeIn();
    $('#response-button-div').fadeIn();
});

// Update based on which button for difficulty was pushed
$('#missed').on('click', function() {
    console.log('Missed!');
    nextCard('missed', $('#front-datum').html(), $('#back-datum').html());
});

$('#hard').on('click', function() {
    console.log('Hard,huh?');
    nextCard('hard', $('#front-datum').html(), $('#back-datum').html());
});

$('#ok').on('click', function() {
    console.log('A-OK');
    nextCard('ok', $('#front-datum').html(), $('#back-datum').html());
});


});






// Helper functions

// Shuffle an array using the Fisher-Yates algorithm, altered slightly here, to shuffle 2 arrays in
// exactly the same manner
function resample(array1, array2) {
    var currentIndex = array1.length, 
	temporaryValue1,
	temporaryValue2,
	randomIndex ;

    // While there remain elements to shuffle
    while (0 !== currentIndex) {

	// Pick a remaining element...
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex -= 1;

	// And swap it with the current element.
	temporaryValue1 = array1[currentIndex];
	temporaryValue2 = array2[currentIndex];
	array1[currentIndex] = array1[randomIndex];
	array2[currentIndex] = array2[randomIndex];
	array1[randomIndex] = temporaryValue1;
	array2[randomIndex] = temporaryValue2;
    }

    return [array1, array2];
};



function populateCard() {
    // TO DO: rescale font size according to length so cards do not become
    // too large
    $('#front-datum').html(frontArray.pop());
    $('#back-datum').html(backArray.pop());
};



function nextCard(difficulty, front, back) {
    var reps = 0;
    if (difficulty == 'hard') { reps = 1; }
    if (difficulty == 'missed') { reps = 2; }

    // See if any cards remain in frontArray
    if (frontArray.length > 0) {
	if (reps > 0) {
	    for (var i = 0; i < reps; i++) {
		repFrontArray.push(front);
		repBackArray.push(back);
	    }
	}

	populateCard();

	$('#response-button-div').hide();
	$('#show-button').fadeIn();
	$('#back').hide();
	

    } else if (repFrontArray.length > 0) { 
	// frontArray is empty, see if any remain in repFrontArray
	// if so, shuffle, and write to frontArray
	var shuffled = resample(repFrontArray, repBackArray);
	frontArray = shuffled[0];
	backArray = shuffled[1];

	// And reset rep arrays
	repFrontArray = [];
	repBackArray = [];

	populateCard();

    } else {
	// frontArray and repFrontArray are empty-- they're done!
	$('#card-display').hide();
	$('#finished').fadeIn();
    }


    
};