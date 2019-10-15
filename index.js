const API_BASE_URL = 'https://wordsapiv1.p.rapidapi.com'
const API_KEY = `22e0325feemshced4bcc1ee7fdf7p1f5b15jsn4420e54616f1`

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
		return `<div><span data-word="${wordAndScore.word}">${wordAndScore.word}</span> <span>${wordAndScore.score}</span></div>`
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
	STORE.loadingWords ? $('#loading').show() : $('#loading').hide()
}

function generateDictionaryDefinitionHTML(word, results) {
	let output = `<h2 class="text-2xl">${word}</h2>`
	output += `<ul>`
	output += results
		.map((result, index) => {
			return `<li class="definition-${index}"><span class="partOfSpeech">${result.partOfSpeech}</span> ${result.definition}</li>`
		})
		.join('')
	output += `</ul>`

	return output
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
				throw new Error(`Sorry, no dictionary results for that word.`)
			}

			throw new Error(res.statusText)
		})
		.then(res => {
			console.log(res)

			if (res.results === undefined) {
				throw new Error(`Sorry, no dictionary results for that word.`)
			}

			// update the modal text
			const output = generateDictionaryDefinitionHTML(word, res.results)
			$('#modal-body').html(output)
		})
		.catch(e => {
			console.log('error', e)
			$('#modal-body').html(`<p class="error">${e.message}</p>`)
		})
		.finally(() => {
			// loading
			// STORE.loadingDefinition = false
			// updateLoading()
		})
}

function handleSubmit() {
	$('#query').on('submit', e => {
		e.preventDefault()

		// empty/hide results
		$('#results')
			.hide()
			.empty()

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
				const output = generateWordHTML(res)
				$('#results')
					.show()
					.html(output)
			})
			.catch(e => {
				console.log(e)
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
}

$(() => {
	handleSubmit()
	handleWordClick()
	handleModalDismiss()
})
