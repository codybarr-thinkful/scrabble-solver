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
	loading: false,
	showModal: false,
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
	let wordScores = words.reduce((acc, curr) => {
		acc.push({ word: curr, score: getWordScore(curr) })
		return acc
	}, [])

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
	STORE.loading ? $('#loading').show() : $('#loading').hide()
}

function handleSubmit() {
	$('#query').on('submit', e => {
		e.preventDefault()

		// empty/hide results
		$('#results')
			.hide()
			.empty()

		// update loading
		STORE.loading = true
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
				const output = generateWordHTML(res)
				$('#results')
					.show()
					.html(output)
			})
			.catch(e => {
				alert(e.message)
			})
			.finally(() => {
				STORE.loading = false
				updateLoading()
			})
	})
}

function handleWordClick() {
	$('#results').on('click', '[data-word]', function() {
		console.log($(this).data('word'))
	})
}

function handleModalDismiss() {
	// hides modal when overlay is clicked
	$('#overlay').on('click', e => {
		$('#dictionary-modal').hide()
	})

	// also listen for click of "x" in top right corner of modal

	// also listen for 'esc' key pressed
}

$(() => {
	handleSubmit()
	handleWordClick()
	handleModalDismiss()
})