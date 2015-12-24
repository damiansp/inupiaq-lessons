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
    maxFontSize = 10, // in em default value--change below for screen sizes
    // range of card widths in chars at maxFontSize
    minCharWidth = 4, maxCharWidth = 15,
    // width of card sizes over range of different devices
    cardMin = 252, cardMax = 842, // px
    //wMin = 335, wMax = 995, // range of window widths to be handled
    specialCharEntities, specialCharAudioFileFormat; // for translating between


specialCharEntities = [
    /&#x0121;/g, /&#x026a;/g, /&#x0142;&#x0323;/g, /&#x0142;/g, /&#x1e37;/g,
    /&#x00f1;/g, /&#x014b;/g, /\<small\>Q\<\/small\>/g, /&#177;/g, /&#247;/g,
    /\-|\+|\/|\:|\[|\]|\(|\)/g, /  |\<br \/*\>/g
]; 
    
specialCharAudioFileFormat = [
    'g^',        'i',         'l^_',               'l_',       'l^',       
    'n^',        'n_',        'q',                      '',        '',
    '',                         ' '
];




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
	    $('#load-error-ajax').show();
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
    
    if (lessons.length < 1) {
	$('#load-error-no-lesson').show();
    } else {
	// Transition to next screen
	$('header').hide();
	$('#intro').hide();
	$('#authors').hide();
	$('#chapter-load').hide();
	$('.load-error').hide();
	$('footer').hide();
	$('#options').fadeIn();
    }
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
	finish();
    }

    if (index || index == 0) {
	if (difficulty == 'ok') {
	    // Update arrays
	    // Splice will not reduce an array of length 1 to an empty array
	    if (inupiatunArray.length == 1) {
		finish();
	    }

	    inupiatunArray.splice(index, 1);
	    englishArray.splice(index, 1);

	    // Update n
	    n = n - 1;

	    // Update counters
	    cardCounter = Math.max(cardCounter - 1, 0);

	    if (cardCounter == 0) {
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
    
    return { 
	index: randIndex,
	inupiatun: inupiatunArray[randIndex],
	english: englishArray[randIndex]
    };
}


function populateCard(front, card) {
    var audioPath = 'audio/' + translateEntity(card.inupiatun) + '.m4a';

    if (front == 'both') {
	var chooseFront = Math.random();
	front = chooseFront > 0.50 ? 'inupiatun' : 'english';
    }

    // Scale text to be as large as possible, but still fit on the card
    var inSize = scaleText(card.inupiatun) + 'em',
	engSize = scaleText(card.english) + 'em';

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

function scaleText(input) {
    var cardWidth,
	textData = getTextLength(input),
	maxCharsAtMaxFontSize,
	scaledFontSize;
    
    if ($('#card-display').css('display', 'none')) {
	$('#card-display').show();
	cardWidth = $('#front-datum').width();
    } else {
	cardWidth = $('#front-datum').width();
    }
    
    maxCharsAtMaxFontSize = Math.floor(
        rescale(cardWidth, cardMin, cardMax, minCharWidth, maxCharWidth)
    );

    // scale by longest line
    var timesOver = Math.floor(textData.maxChars / maxCharsAtMaxFontSize);
    console.log('Chars: ' + textData.maxChars);
    console.log('Max chars per line: ' + maxCharsAtMaxFontSize);
    console.log('Times over: ' + timesOver);

    if (timesOver >= 1) {
	scaledFontSize = maxFontSize / (Math.sqrt(timesOver) + 1);
    }

    console.log('Font size before breaks: ' + scaledFontSize);
    console.log('Breaks: ' + textData.nLines);
    // scale by line breaks
    if (textData.nLines) {
	scaledFontSize /= Math.sqrt(textData.nLines + 1);
    }

    return scaledFontSize;
}

function getTextLength(input) {
    var maxChars = 0,
	lineBreaks = input.match(/<br \/*>/g);

    // HTML has line-break
    if (lineBreaks) {
        lineBreaks = lineBreaks.length;

	var lines = input.split('<br />');
	var specialChars;

        for (l in lines) {
            if (lines[l].length > maxChars) {
                maxChars = translateEntity(stripHTML(lines[l])).length;
		specialChars = input.match(
		    /&#247;|&#177;|\-|\+|\(|\)|\[|\]|\:/g
		);
		if (specialChars) {
		    maxChars += specialChars.length;
		}
            }
        }

    } else {
        // No line-breaks
        input = translateEntity(stripHTML(input));
        maxChars = input.length;
	specialChars = input.match(
	   /&#247;|&#177;|\-|\+|\(|\)|\[|\]|\:/g
	);
	if (specialChars) {
	    maxChars += specialChars.length;
	}

    }
    
    return { maxChars: maxChars, nLines: lineBreaks };
}

// Linearly transform from one range to another:
function rescale(x, inMin, inMax, outMin, outMax) {
    return (outMin * (1 - (x - inMin) / (inMax - inMin)) + 
	    outMax * ((x - inMin) / (inMax - inMin)))
}


// Strip HTML from string
function stripHTML(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}


// Translate between HTML Entities and text used in the audio file names
function translateEntity(str) {
    for (i in specialCharEntities) {
	str = str.replace(specialCharEntities[i], 
			  specialCharAudioFileFormat[i]);
    }

    return str;
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