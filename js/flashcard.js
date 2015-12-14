var vocab, // a json object holding the vocab
    maxCards, // user-defined maximum no. of cards
    lessons = [], // user-selected lessons to include
    // Arrays to hold language-specific vocabulary 
    inupiatunArray = [], englishArray = [],
    // Type(s) of content to appear on each side
    frontData, backData,
    n, // number of cards remaining in the deck
    nextCard, // data for the next card to be displayed
    cardCounter, // to display progress
    maxFontSize = 7; // in em

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


// Load the selected lessons and transition to next screen
$('#load-button').on('click', function() {
    maxCards = parseInt($('#max-cards').val());

    $('input[name="lesson"]:checked').each(function() {
	lessons.push(this.value);
     });

    for (lesson in lessons) {
	loadLesson(lessons[lesson]);
     }

    // Transition to next screen                                               
    $('header').hide();
    $('#intro').hide();
    $('#authors').hide();
    $('#chapter-load').hide();
    $('footer').hide();
    $('#options').fadeIn();
});

/** 
 * Approach to generating random cards, and repeating misses:
 * If maxCards, first take a random subset of the data, and delete the
 * rest.  If maxCards AND both languages, randomly decide how many of each
 * from each language, then take random sample.
 *
 * Once the working deck has been so created (all or random subset), 
 * generate a random number on [0, deckLength - 1], and use that as the 
 * index for the next card.  If both langs, randomly select the front and
 * back.
 *
 * If answer is correct:
 * Remove card from deck
 * Decrement deckLength
 * Decrement new card counter
 *
 * If answer is 'hard':
 * Don't remove card.
 * Decrement new card counter
 * Increment repeat counter
 *
 * If missed:
 * Push a duplicate of the word to the end of the array
 # Decrement new card counter
 * Increment repeat counter +2
 */


// Determine content to be on front and back and begin
$('#begin-button').on('click', function() {
    var frontMatter = $('input[name="options"]:checked').val();

    if (frontMatter == 'inupiatun-text') {
	frontData = 'inupiatun';
	backData = 'english'
    } else if (frontMatter == 'english-text') {
	frontData = 'english';
	backData = 'inupiatun';
    } else if (frontMatter == 'both-text') {
	frontData = 'both';
	backData = 'both';
    } else if (frontMatter == 'inupiatun-audio') {
	frontData = 'inupiatunAudio';
	backData = 'english';
    } else {
	alert("I'm sorry, but the internets are broken");
    }


    n = maxCards || inupiatunArray.length;
    cardCounter = n;
    
    // if maxCards randomly select, and jettison the rest
    if (maxCards) {
	var inupiatunTemp = [], englishTemp = [];
	for (var i = 1; i <= maxCards; i++) {
	    var randIndex = Math.floor(Math.random() * inupiatunArray.length);
	    inupiatunTemp.push(inupiatunArray.splice(randIndex, 1)[0]);
	    englishTemp.push(englishArray.splice(randIndex, 1)[0]);
	}

	englishArray = englishTemp;
	inupiatunArray = inupiatunTemp;

    }


    // Choose and create next card
    nextCard = pickNextCard('ok', null);
    populateCard(frontData, nextCard);
    
    // Transition                                                             
    $('#options').hide();
    $('#card-display').fadeIn();
    $('#card-counter').html(cardCounter);
    $('#tracker').fadeIn();
});


// Randomly choose a card, and decide what to do with previous card (index)
// based on difficulty
function pickNextCard(difficulty, index) {
    // remove or replace previous card
    if (cardCounter <= 0) {
	console.log("All done");
	finish();
    }

    if (index || index == 0) {
	if (difficulty == 'ok') {
	    // Update arrays
	    // Splice will not reduce an array of length 1 to an empty array
	    if (inupiatunArray.length == 1) {
		console.log("Ended from here");
		finish();
	    }

	    inupiatunArray.splice(index, 1);
	    englishArray.splice(index, 1);

	    // Update n
	    n = n - 1;

	    // Update counters
	    cardCounter = Math.max(cardCounter - 1, 0);

	    if (cardCounter == 0) {
		console.log('Done, Daddio');
		finish();
	    }
	} else if (difficulty == 'hard') {
	    ; // do nothing
	} else if (difficulty == 'missed') {
	    // Update arrays
	    inupiatunArray.push(inupiatunArray[index]);
	    englishArray.push(englishArray[index]);
	    
	    // Update n
	    n = n + 1;

	    // Update counters
	    cardCounter = cardCounter + 1;
	}
    }

    // Select index for next card
    var randIndex = Math.floor(Math.random() * n);
    console.log(randIndex);

    return { 
	index: randIndex,
	inupiatun: inupiatunArray[randIndex],
	english: englishArray[randIndex]
    };
}


function populateCard(front, card) {
    /** 
     * TO DO:  Works, but cannot find audio files for words with special 
     * characters. SO: 
     * (1) write helper function to change the html (card.inupiatun) into a 
     * format that can be loaded (e.g _n for eng (&#x014b;))
     * (2) update all the audio file names to match
     */
    

    var audioPath = 'audio/1/' + card.inupiatun + '.m4a';

    if (front == 'both') {
	var chooseFront = Math.random();
	front = chooseFront > 0.50 ? 'inupiatun' : 'english';
    }
    
    // Scale text to be as large as possible, but still fit on the card
    var inSize = scaleText(card.inupiatun),
	engSize = scaleText(card.english);

    if (front == 'inupiatun') {
	$('#front-datum').html(card.inupiatun).css('font-size', inSize);
	$('#back-datum').html(card.english).css('font-size', engSize);
	$('.audio-source').attr('src', audioPath);
	$('audio').load();
	$('#back-audio').hide();
	$('#front-audio').show();
    } else if (front == 'english') {
	$('#front-datum').html(card.english).css('font-size', engSize);
	$('#back-datum').html(card.inupiatun).css('font-size', inSize);
	$('.audio-source').attr('src', audioPath);
	$('audio').load();
	$('#back-audio').show();
	$('#front-audio').hide();
    } else if (front == 'inupiatunAudio') {
	$('#front-datum').hide();
	$('#back-datum').html(card.english).css('font-size', engSize);
	$('.audio-source').attr('src', audioPath);
	$('audio').load();
	$('#front-audio').show();
	$('#back-audio').hide();
    }

    // Transistion to next card
    $('#response-button-div').hide();
    $('#show-button').fadeIn();
    $('#back').hide();
}


// Helper function to resize text to maximize size but still fit on card
function scaleText(input) {
    var output = maxFontSize,
	maxChars = 0, // number of characters for the longest line on card
	scalar = 0.87, // multipler for text size by no. of line // 0.87
	lengthScalar = 0.85, // ...and by line length           // 0.85
	// longest no. of characters that will fit on a line at maxFontSize
        maxAllowed = 10; 

    var lineBreaks = input.match(/<br \/>/g);

    // HTML has line-breaks
    if (lineBreaks) {
	lineBreaks = lineBreaks.length;
	
	// rescale by line breaks
	for (var i = 1; i <= lineBreaks; i++) {
	    output = output * scalar;
	}

	var lines = input.split('<br />');
	for (l in lines) {
	    if (lines[l].length > maxChars) {
		maxChars = lines[l].length;
	    }
	}

    } else {
	// No line-breaks
	input = stripHTML(input);
	maxChars = input.length;
    }	

    if (maxChars > maxAllowed) {
	output = lengthScale(output, maxChars, maxAllowed, lengthScalar);
    }

    output = output + 'em';

    return output
}


// Strip HTML from string
function stripHTML(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}


// Helper function to rescale text based on line length
function lengthScale(out, cs, allowed, scalar) {
    var times = Math.ceil(cs / allowed);

    for (var i = 1; i <= times; i++) {
	out = out * scalar;
    }

    return out;
}


// Show the reverse side
$('#show-button').on('click', function() {
    // Hide Show Button 
    $(this).hide();

    // Show Back of Card & Response Buttons               
    $('#back').fadeIn();
    $('#response-button-div').fadeIn();
});



// Respond to difficulty selected
$('#missed').on('click', function() {
    // Choose and create next card
    nextCard = pickNextCard('missed', nextCard.index);
    populateCard(frontData, nextCard);
    updateCounter();
});

$('#hard').on('click', function() {
    nextCard = pickNextCard('hard', nextCard.index);
    populateCard(frontData, nextCard);
    updateCounter();
});

$('#ok').on('click', function() {
    nextCard = pickNextCard('ok', nextCard.index);
    populateCard(frontData, nextCard);
    updateCounter();
});

// Update counters
function updateCounter() {
    $('#card-counter').html(cardCounter);
}

});



// Finished
function finish() {
    $('#card-display').hide();
    $('#tracker').hide();
    $(finished).fadeIn();
}