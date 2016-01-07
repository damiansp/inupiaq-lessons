var englishPpns = { 
    firstSg: 'I', firstD: 'we (d)', firstPl: 'we (pl)', 
    secondSg: 'you (sg)', secondD: 'you (d)', secondPl: 'you (pl)', 
    thirdSg: ['he', 'she', 'it'], thirdD: 'they (d)', thirdPl: 'they (pl)' 
},
    inupiaqPpns = { 
	postConsonant: { 
	    firstSg: '+tun_a', firstD: '+tuguk', firstPl: '+tugut', 
	    secondSg: '+tutin', secondD: ['+tusik', '+tutik'], 
	    secondPl: '+tusi_', 
	    thirdSg: '+tuq', thirdD: '+tuk', thirdPl: '+tut'
	},
	postVowel: {
            firstSg: '+run_a', firstD: '+ruguk', firstPl: '+rugut',
            secondSg: '+rutin', secondD: ['+rusik', '+rutik'],
            secondPl: '+rusi_',
            thirdSg: '+ruq', thirdD: '+ruk', thirdPl: '+rut'
	}
    };

var vowels = /[a|e|i_+|o|u]+/;
var simpleConsonants = /b|ch|d|f|g|h|j|k|l|m|n|p|q|r|sr+|t|v|x|z/g;
var complexConsonant =
    /[b|ch|d|f|g\^+|h|j|k|l\^+_+|m|n[\^|_]+|p|q|r|sr+|t|v|x|z]+/;
var specialEndings = /\^|_/;

var vocab = [ 
    { eng: ['to go out', 'to exit', 'to be born'], inu: 'ani_-' },
    { eng: ['to get hurt', 'to hurt (sb/st)'], inu: 'anni_q-' },
    { eng: ['to get/catch (a game animal)', 'to catch up with (sb/st)', 
	    "to reach (sb's) height"],
      inu: 'an_u-' },
    { eng: ['to kick (sb/st)'], inu: 'aqi-'},
    { eng: ['to run (of a person)'], inu: 'aqpat-' },
    { eng: ['to wear a parka', 'to put a parka on (sb)'], inu: 'atigi-' },
    { eng: ['to cook (st)'], inu: 'iga-'},
    { eng: ['to get on board', 'to embark', 'to put (sb/st) on board'], 
      inu: 'iku-' },
    { eng: ['to put st in a store for sale', 'to place sb/st somewhere'],
      inu: 'il^i_-' },
    { eng: ['to study st', 'to practice st'], inu: 'il^isaq-' },
    { eng: ['to enter', 'to bring (st) inside'], inu: 'isiq-' },
    { eng: ['to put boots on', 'to put boots on (sb)'], inu: 'kamik-' },
    { eng: ['to stand up', 'to get out of bed', 'to set st upright'], 
      inu: 'makit-' },
    { eng: ["to put on one's hood", "to put (sb's) hood on"], inu: 'nasaq-' },
    { eng: ['to eat st'], inu: 'nig^i-' },
    { eng: ['to run on all fours', 'to gallop'], inu: 'pan_alik-' },
    { eng: ['to butcher', 'to cut (game meat)'], inu: 'pil^ak-' },
    { eng: ['to walk'], inu: 'pisuaq-' },
    { eng: ['to be smart', 'to be quick to learn'], inu: 'puqi_k-' },
    { eng: ['to swim underwater'], inu: 'puumit-' },
    { eng: ['to come', 'to come upon (sb/st)'], inu: 'qai-' },
    { eng: ["to turn one's head to look", 
	    "to turn one's head to look at (sb/st)"], inu: 'qivi_aq-' },
    { eng: ['to work', 'to be employed', 'to be working/functioning', 
	    'to work on (st)'], inu: 'savak-' },
    { eng: ['to step on a nail'], inu: 'sukki_t-' },
    { eng: ['to read st'], inu: 'taiguaq-' },
    { eng: ['to buy (st)'], inu: 'tauqsi_q' },
    { eng: ['to see (sb/st)'], inu: 'tautuk-' },
    { eng: ['to arrive', 'to reach (sb/st)'], inu: 'tiki_t-' },
    { eng: ['to fly away', 'to take off'], inu: 'tin_i-' },
    { eng: ['to pitch a tent', 'to set up a tent over (st)'], inu: 'tupiQ-' },
    { eng: ['to take a boat and set up a whaling camp'], inu: 'umi_aq-' }
];
	     
$(document).ready(function() {


function addSuffix(base, suffix) {
    // If base has combining maker '-', remove
    if (base[base.length - 1] == '-') {
	base = base.slice(0, base.length - 1);
    }

    var joinType = suffix[0];
    suffix = suffix.slice(1);

    baseEnding = base.slice(base.length - 1);
    if (baseEnding.match(specialEndings)) {
	baseEnding = base.slice(base.length - 2);
    }

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
		    console.log('Vowel suffix');
		    // k > g, q > g^
		    if (base[base.length - 1] == 'k') {
			base = base.slice(0, base.length - 1) + 'g';
		    }

		    if  (base[base.length - 1] == 'q' || 
			 base[base.length - 1] == 'Q') {
			base = base.slice(0, base.length - 1) + 'g^';
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


    var combined = base + suffix;

    return combined
}


function presentIndicative(root, form) {
    // If root has combining maker '-', remove
    if (root[root.length - 1] == '-') {
        root = root.slice(0, root.length - 1);
    }

    // Determine if root ends in vowel
    var type = 'postConsonant';

    if (root[root.length - 1].match(vowels) || 
	root.slice(root.length - 2).match(/i_/)) {
	type = 'postVowel';
    }
    
    suffix = inupiaqPpns[type][form];
    out = "";

    if (typeof(suffix) === 'string') {
	out = addSuffix(root, suffix) + '<br />';
    } else {
	for (s in suffix) {
	    out += (addSuffix(root, suffix[s]) + '<br />');
	}
    }


    return assimilate(out);

}

function assimilate(word) {
    // Condense into fewer regexes
    word = word.replace(/[q|Q]l/g, 'g^l');
    word = word.replace(/kl/g, 'gl');
    word = word.replace(/tn/g, 'nn');
    word = word.replace(/kn/g, 'gn');
    word = word.replace(/[q|Q]n/g, 'g^n');
    word = word.replace(/tl/g, 'll');
    word = word.replace(/tl^/g, 'l^l^');
    word = word.replace(/tv/g, 'rv');
    word = word.replace(/tg/g, 'rg');
    word = word.replace(/i_tg/g, 'i_yg');
    word = word.replace(/tm/g, 'nm');
    word = word.replace(/[q|Q]l/g, 'g^l');

    word = word.replace(/i_l/g, 'i_l^');
    word = word.replace(/i_t$/g, 'i_t/ch');
    word = word.replace(/i_n/g, 'in^');

    word = word.replace(/i_tchk/g, 'i_tk');
    word = word.replace(/i_tchq/g, 'i_tq');
    word = word.replace(/i_tchp/g, 'i_tp');

    word = word.replace(/i_ta/g, 'i_sa');
    word = word.replace(/i_ti/g, 'i_si');
    word = word.replace(/i_tu/g, 'i_su');

    word = word.replace(/i_kt/g, 'i_ks');
    word = word.replace(/i_qt/g, 'i_qs');
    word = word.replace(/i_Qt/g, 'i_Qs');
    word = word.replace(/i_tt/g, 'i_ts');

    word = word.replace(/ts/g, 'tch');

    return word;
}


/** 1. Auto-Assimilator */
$('#assimilate-button').on('click', function() {
    // console.log('button works');
    var out = assimilate($('#assimilate-text').val().split(', ').join(''));
    $('#assimilate-output').text(out);
});


/** 2. Add appropriate ending, e.g., given 'katak-' and 'he/she', produce 
 * 'kataktuq'
 */
$('#ending-button').on('click', function() {
	//    e.preventDefault();
	//Event.stop(e);
    console.log("ending button clicked");
    //    return false;
}):


// 3. Translate I > E: given 'kataktuq' produce he/she/it falls

// 4. Translate E > I: given 'I fall', produce 'kataktun_a'

});