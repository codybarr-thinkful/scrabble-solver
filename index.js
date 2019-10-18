const API_BASE_URL = 'https://wordsapiv1.p.rapidapi.com'
const API_KEY = `22e0325feemshced4bcc1ee7fdf7p1f5b15jsn4420e54616f1`

const ERRORS = {
	NO_DEFINITION_FOUND: 'NoDefinitionError',
	NO_WORDS_FOUND: 'NoWordsFoundError'
}

const SORT = {
	SCORE: 'score',
	LENGTH: 'length'
}

const SCRABBLE_VALUES = {
	a: 1,
	b: 3,
	c: 3,
	d: 2,
	e: 1,
	f: 4,
	g: 2,
	h: 4,
	i: 1,
	j: 8,
	k: 5,
	l: 1,
	m: 3,
	n: 1,
	o: 1,
	p: 3,
	q: 10,
	r: 1,
	s: 1,
	t: 1,
	u: 1,
	v: 4,
	w: 4,
	x: 8,
	y: 4,
	z: 10
}

const STORE = {
	sort: SORT.SCORE, // default sort is by score
	loadingWords: false,
	loadingDefinition: false,
	results: []
}

function createLengthWordList(words) {
	return words.reduce((acc, curr) => {
		if (!acc[curr.length]) acc[curr.length] = []
		acc[curr.length].push(curr)
		return acc
	}, {})
}

function getWordScore(word) {
	return word.split('').reduce((acc, curr) => {
		return (acc += SCRABBLE_VALUES[curr])
	}, 0)
}

function createScoreWordList(words) {
	let wordScores = words.map(word => {
		return { word, score: getWordScore(word) }
	})

	return wordScores.sort((a, b) => (a.score > b.score ? -1 : 1))
}

function generateScoreResultsHTML(words) {
	let wordListWithScores = createScoreWordList(words)

	return wordListWithScores.map(wordAndScore => {
		return `<button data-word="${wordAndScore.word}"><span class="word">${wordAndScore.word}</span> <p class="score flex items-center">${wordAndScore.score} <span class="label ml-2">score</p></button>`
	})
}

function generateLengthResultsHTML(words) {
	let wordList = createLengthWordList(words)
	let output = ``
	Object.keys(wordList).forEach(count => {
		output += `<h3 class="word-length">${count}</h3>`

		wordList[count].forEach(word => {
			output += `<span class="word" data-word="${word}">${word}</span>`
		})
	})
	return output
}

function generateWordHTML(words) {
	return STORE.sort === SORT.SCORE
		? generateScoreResultsHTML(words)
		: generateLengthResultsHTML(words)
}

// shows/hides loading icon
function updateLoading() {
	STORE.loadingWords
		? $('#results-loader').show()
		: $('#results-loader').hide()

	STORE.loadingDefinition
		? $('#definition-loader').show()
		: $('#definition-loader').hide()
}

function generateDictionaryDefinitionHTML(word, results) {
	let output = `<h2>${word}</h2>`
	output += `<ul>`
	output += results
		.map((result, index) => {
			return `<li class="definition-${index} mt-2"><span class="label mr-2">${result.partOfSpeech}</span> ${result.definition}</li>`
		})
		.join('')
	output += `</ul>`
	output += `<a href="https://www.wordnik.com/words/${word}" target="_blank" class="inline-block mt-2">More info at Wordnik</a>`

	return output
}

function throwError(name) {
	let message = name === ERRORS.NO_DEFINITION_FOUND 
		? `Sorry, no dictionary results for that word.`
		: `Sorry, no valid words were found.`
	
	let e = new Error(message)
	e.name = name
	throw e
}

function loadDictionaryDefinition(word) {
	const URL = `${API_BASE_URL}/words/${word}`

	const OPTIONS = {
		headers: new Headers({
			'X-RapidAPI-Key': API_KEY,
			'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
		})
	}

	fetch(URL, OPTIONS)
		.then(res => {
			if (res.ok) {
				return res.json()
			} else if (res.status === 404) {
				throwError(ERRORS.NO_DEFINITION_FOUND)
			}

			throw new Error(res.statusText)
		})
		.then(res => {
			console.log(res)

			if (res.results === undefined) {
				throwError(ERRORS.NO_DEFINITION_FOUND)
			}

			// update the modal text
			const output = generateDictionaryDefinitionHTML(word, res.results)
			$('#modal-body').html(output)
		})
		.catch(e => {
			console.log('error', e)
			let output = [`<h2>Error</h2>`, `<p class="error">${e.message}</p>`]

			if (e.name === ERRORS.NO_DEFINITION_FOUND) {
				output.push(
					`<a href="https://www.wordnik.com/words/${word}" target="_blank">Look for definition on Wordnik</a>`
				)
			}

			$('#modal-body').html(output)
		})
		.finally(() => {
			// loading
			STORE.loadingDefinition = false
			updateLoading()
		})
}

function handleSubmit() {
	$('#query').on('submit', e => {
		e.preventDefault()

		// empty/hide results
		$('#results')
			.hide()
			.empty()
		
		// hide error
		$('#results-error').hide()

		// update loading
		STORE.loadingWords = true
		updateLoading()

		const letters = $('#letters')
			.val()
			.toLowerCase()

		fetch(`https://scrabble.now.sh/api?letters=${letters}`)
			.then(res => {
				if (res.ok) {
					return res.json()
				}

				throw new Error(res.statusText)
			})
			.then(res => {
				console.log('scrabble words', res)

				if (res.length < 1) throwError(ERRORS.NO_WORDS_FOUND)

				const output = generateWordHTML(res)
				$('#results')
					.show()
					.html(output)
			})
			.catch(e => {
				console.log(e)
				$('#results-error').show()
				$('#results-error p').text(e.message)
			})
			.finally(() => {
				STORE.loadingWords = false
				updateLoading()
			})
	})
}

function handleWordClick() {
	$('#results').on('click', '[data-word]', function() {
		console.log($(this).data('word')) // debugging
		const word = $(this).data('word')

		$('#modal-body').empty()
		$('#dictionary-modal').show()
		STORE.loadingDefinition = true
		updateLoading()
		loadDictionaryDefinition(word)
	})
}

function handleModalDismiss() {
	// hides modal when overlay is clicked
	$('#overlay').on('click', e => {
		$('#dictionary-modal').hide()
	})

	// also listen for click of "x" in top right corner of modal
	$('button#close-modal').on('click', e => {
		$('#dictionary-modal').hide()
	})

	// also listen for 'esc' key pressed
	$('body').keydown(function(event) {
		if (event.keyCode === 27) {
			$('#dictionary-modal').hide()
		}
	})
}

$(() => {
	handleSubmit()
	handleWordClick()
	handleModalDismiss()
})
