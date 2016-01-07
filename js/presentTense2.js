var englishPpns = { 
    firstSg: 'I', firstD: 'we (two)', firstPl: 'we (pl)', 
    secondSg: 'you (sg)', secondD: 'you (two)', secondPl: 'you (pl)', 
    thirdSg: ['he', 'she', 'it'], thirdD: 'they (two)', thirdPl: 'they (pl)' 
},
    inupiaqPpns = { 
	postConsonant: { 
	    firstSg: ['+tuŋa'], firstD: ['+tuguk'], firstPl: ['+tugut'], 
	    secondSg: ['+tutin'], secondD: ['+tusik', '+tutik'], 
	    secondPl: ['+tusɪ'], 
	    thirdSg: ['+tuq'], thirdD: ['+tuk'], thirdPl: ['+tut']
	},
	postVowel: {
            firstSg: ['+ruŋa'], firstD: ['+ruguk'], firstPl: ['+rugut'],
            secondSg: ['+rutin'], secondD: ['+rusik', '+rutik'],
            secondPl: ['+rusɪ'],
            thirdSg: ['+ruq'], thirdD: ['+ruk'], thirdPl: ['+rut']
	}
    };

var vowels = /[a|e|ɪ|i|o|u]+/;
var simpleConsonants = /b|ch|d|f|g|h|j|k|l|m|n|p|q|r|sr+|t|v|x|z/g;
var complexConsonant =
    /[b|ch|d|f|g\^+|h|j|k|l\^+_+|m|n[\^|_]+|p|q|r|sr+|t|v|x|z]+/;
var specialEndings = /\^|_/;

var vocab = [ 
    { eng: ['to go out', 'to exit', 'to be born'], inu: 'anɪ-' },
    { eng: ['to get hurt', 'to hurt (sb/st)'], inu: 'annɪq-' },
    { eng: ['to get/catch (a game animal)', 'to catch up with (sb/st)', 
	    "to reach (sb's) height"],
      inu: 'aŋu-' },
    { eng: ['to kick (sb/st)'], inu: 'aqi-'},
    { eng: ['to run (of a person)'], inu: 'aqpat-' },
    { eng: ['to wear a parka', 'to put a parka on (sb)'], inu: 'atigi-' },
    { eng: ['to cook (st)'], inu: 'iga-'},
    { eng: ['to get on board', 'to embark', 'to put (sb/st) on board'], 
      inu: 'iku-' },
    { eng: ['to put st in a store for sale', 'to place sb/st somewhere'],
      inu: 'iḷɪ-' },
    { eng: ['to study st', 'to practice st'], inu: 'iḷisaq-' },
    { eng: ['to enter', 'to bring (st) inside'], inu: 'isiq-' },
    { eng: ['to put boots on', 'to put boots on (sb)'], inu: 'kamik-' },
    { eng: ['to stand up', 'to get out of bed', 'to set st upright'], 
      inu: 'makit-' },
    { eng: ["to put on one's hood", "to put (sb's) hood on"], inu: 'nasaq-' },
    { eng: ['to eat st'], inu: 'niġi-' },
    { eng: ['to run on all fours', 'to gallop'], inu: 'paŋalik-' },
    { eng: ['to butcher', 'to cut (game meat)'], inu: 'piḷak-' },
    { eng: ['to walk'], inu: 'pisuaq-' },
    { eng: ['to be smart', 'to be quick to learn'], inu: 'puqɪk-' },
    { eng: ['to swim underwater'], inu: 'puumit-' },
    { eng: ['to come', 'to come upon (sb/st)'], inu: 'qaɪ-' },
    { eng: ["to turn one's head to look", 
	    "to turn one's head to look at (sb/st)"], inu: 'qivɪaq-' },
    { eng: ['to work', 'to be employed', 'to be working/functioning', 
	    'to work on (st)'], inu: 'savak-' },
    { eng: ['to step on a nail'], inu: 'sukkɪt-' },
    { eng: ['to read st'], inu: 'taiguaq-' },
    { eng: ['to buy (st)'], inu: 'tauqsɪq-' },
    { eng: ['to see (sb/st)'], inu: 'tautuk-' },
    { eng: ['to arrive', 'to reach (sb/st)'], inu: 'tikɪt-' },
    { eng: ['to fly away', 'to take off'], inu: 'tiŋi-' },
    { eng: ['to pitch a tent', 'to set up a tent over (st)'], inu: 'tupiQ-' },
    { eng: ['to take a boat and set up a whaling camp'], inu: 'umɪaq-' }
];

var nVocab = vocab.length;





	     
$(document).ready(function() {


function addSuffix(base, suffix) {
    // If base has combining maker '-', remove
    if (base[base.length - 1] == '-') {
	base = base.slice(0, base.length - 1);
    }

    baseEnding = base.slice(base.length - 1);
    if (baseEnding.match(specialEndings)) {
	baseEnding = base.slice(base.length - 2);
    }

    joinType = suffix[0];
    suffix = suffix.slice(1);

    switch(joinType) {
        case '-':
	    // Stem ends in V
	    if (baseEnding.match(vowels)) {
		// check if 2 Vs
		if (base.slice(base.length - 2, base.length).match(vowels)) {
		    if(suffix[0].match(vowels)) {
			base = base + 'g';
		    }
		}
	    } else {
		// Stem ends in C
		base = base.slice(0, base.length - 1);
	    }
	    break;
	    
        case '+':
	    // Stem ends in V
	    if (baseEnding.match(vowels)) {
		// check if 2 Vs
		if (base.slice(base.length - 2, base.length).match(vowels)) {
		    if(suffix[0].match(vowels)) {
			base = base + 'g';
		    }
		}
	    } else {
		// Stem ends in C
		// Check if suffix starts with V
		if (suffix[0].match(vowels)) {
		    // k > g, q > ġ
		    if (base[base.length - 1] == 'k') {
			base = base.slice(0, base.length - 1) + 'g';
		    }
		    
		    if  (base[base.length - 1] == 'q' || 
			     base[base.length - 1] == 'Q') {
			base = base.slice(0, base.length - 1) + 'ġ';
		    }
		} else {
		    // Suffix starts with C
		    // Prevent triple C clusters
		    if (base.slice(base.length - 2).match(simpleConsonants)
			.length > 1) {
			suffix = suffix.slice(1);
		    }
		}
	    }      
	    break;

        default:
	    console.log("Error: join type not specified for suffix");
	    break;
    }

    combined = base + suffix;
    return combined
}


function presentIndicative(root, form) {
    var out = [];
    // If root has combining maker '-', remove
    if (root[root.length - 1] == '-') {
	root = root.slice(0, root.length - 1);
    }
	
    // Determine if root ends in vowel
    var type = 'postConsonant';
	
    if (root[root.length - 1].match(vowels)) {
	type = 'postVowel';
    }
	
    suffix = inupiaqPpns[type][form];
	
	//	if (typeof(suffix) === 'string') {
	//    out = addSuffix(root, suffix) + '<br />';
	//} else {
	//    for (s in suffix) {
	//	out += (addSuffix(root, suffix[s]) + '<br />');
	//    }
	//}
    for (f in suffix) {
	out.push(assimilate(addSuffix(root, suffix[f])));
    }

    return out;

}

function assimilate(word) {
    // Condense into fewer regexes
    word = word.replace(/ɪkl/g, 'ɪgḷ');
    word = word.replace(/ɪkn/g, 'ɪgñ');
    word = word.replace(/ɪql/g, 'ɪġḷ');
    word = word.replace(/ɪqn/g, 'ɪġñ');

    word = word.replace(/[q|Q]l/g, 'ġl');
    word = word.replace(/kl/g, 'gl');
    word = word.replace(/tn/g, 'nn');
    word = word.replace(/kn/g, 'gn');
    word = word.replace(/[q|Q]n/g, 'ġn');
    word = word.replace(/tl/g, 'll');
    word = word.replace(/tł/g, 'łł');
    word = word.replace(/tv/g, 'rv');
    word = word.replace(/tg/g, 'rg');
    word = word.replace(/ɪtg/g, 'ɪyg');
    word = word.replace(/tm/g, 'nm');
    word = word.replace(/[q|Q]l/g, 'ġl');

    word = word.replace(/ɪl/g, 'ɪḷ');
    word = word.replace(/ɪt$/g, 'ɪt/ch');
    word = word.replace(/ɪn/g, 'iñ');

    word = word.replace(/ɪtchk/g, 'ɪtk');
    word = word.replace(/ɪtchq/g, 'ɪtq');
    word = word.replace(/ɪtchp/g, 'ɪtp');

    word = word.replace(/ɪta/g, 'ɪsa');
    word = word.replace(/ɪti/g, 'ɪsi');
    word = word.replace(/ɪtu/g, 'ɪsu');

    word = word.replace(/ɪkt/g, 'ɪks');
    word = word.replace(/ɪqt/g, 'ɪqs');
    word = word.replace(/ɪQt/g, 'ɪQs');
    word = word.replace(/ɪtt/g, 'ɪts');

    word = word.replace(/ts/g, 'tch');

    return word;
}


/**
var testset = ['aiviQlu', 'kamiklu', 'aqpatniaqtuq', 'kamikniaqtuq', 
	       'iḷisaqniaqtuq', 'aqpatluni', 'makitłuni', 'aqpatvɪk',
	       'aġnatguuq', 'siksrɪɪtguuq', 'makitman', 'aġnamlu', 
	       'aŋunlu', 'iġġɪlu', 'iġġɪt', 'iġġɪtiaq', 'iġġɪn',
	       'tikɪtiqtuq', 'makitiqtuq', 'qimmɪqtigun', 'qimmiŋɪta',
	       'puqɪktuq', 'tauqsɪqtuq', 'tikɪttuq'];

for (t in testset) {
    console.log(assimilate(testset[t]));
}

console.log(presentIndicative('niġi-', 'firstSg'));
*/
//console.log(presentIndicative('katak-', 'secondD'));
//console.log(presentIndicative('sukkɪt-', 'thirdPl'));



/** 1. Auto-Assimilator */
$('#assimilate-button').on('click', function() {
    var out = assimilate($('#assimilate-text').val().split(', ').join(''));
    $('#assimilate-output').text(out);
});


/** 2. Add appropriate ending, e.g., given 'katak-' and 'he/she', produce 
 * 'kataktuq'
 */

var root = 'katak-', 
    subj = 'thirdSg',
    rootEnd = 'postConsonant',
    subjE, subjI, vocabSelector, subjSelector, correctAnswer, userAnswer;

correctAnswer = presentIndicative(root, subj)

    

$("#ending-button").on('click', function() {
    userAnswer = $("#ending-answer").val();
    var answerFound = false;

    for (answer in correctAnswer) {
	if (userAnswer.toLowerCase() == correctAnswer[answer]) {
	    $('#ending-answer').toggleClass('bg-success');
	    $('#ending-feedback').text('Correct!');
	    answerFound = true;
	}
    }
    
    if (!answerFound) {
	$('#ending-answer').toggleClass('bg-danger');
	$('#ending-feedback').html('The correct answer is: <em>' +
				   correctAnswer + '</em>');
    }
    setTimeout(nextWord, 2000);

    function nextWord() {
	// Randomly select next root
	vocabSelector = Math.floor(Math.random() * nVocab);
	root = vocab[vocabSelector].inu;

	// Determine if root ends in C or V
	if (root.replace('-', '').slice(root.length - 2).match(vowels)) {
	    rootEnding = 'postVowel';
	} else {
	    rootEnding = 'postConsonant';
	}

	// Randomly select subj and get both Eng and Inu forms
	subjSelector = Math.floor(Math.random() * 9);
	subj = Object.keys(englishPpns)[subjSelector];
	subjE = englishPpns[subj];
	subjI = inupiaqPpns[rootEnding][subj];

	correctAnswer = presentIndicative(root, subj)
	$('#inu-v-root').text(root);
	$('#subj').text('(' + subjE + ')');
	$('#ending-answer').val('').removeClass('bg-danger bg-success')
	    .attr('placeholder', '');
	$('#ending-feedback').html('');
    }
});


// 3. Translate I > E: given 'kataktuq' produce he/she/it falls


// 4. Translate E > I: given 'I fall', produce 'kataktuŋa'


// 5. Auto-Conjugator
$('#conjugate-button').on('click', function(e) {
    e.preventDefault();
    var root = $('#conjugate-text').val();
    var finalLetter, subjs,
	form = 'postConsonant';
    
    // Strip connectors, if any from root, and obtain final letter
    root = root.replace(/\-$/, '');
    finalLetter = root.slice(root.length - 1);
    if (finalLetter.match(vowels)) {
	form = 'postVowel';
    }
    
    subjs = Object.keys(inupiaqPpns[form]);
    out = {};

    // loop through subjs, conjugate root for each, and push into out in the
    // form subj: conjugated form, so that out will be, e.g.
    // {firstSq: kataktuŋa, firstD: kataktutin, ...}
    for (s in subjs) {
	out[subjs[s]] = presentIndicative(root, subjs[s]);
    }

    // Populate the html table
    for (s in out) {
	$('#' + s).html(out[s].join(' <em>or</em><br />'));
    }

});






});