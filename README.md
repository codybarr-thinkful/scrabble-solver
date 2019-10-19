# Scrabble Solver

**Live App**: https://codybarr-thinkful.github.io/scrabble-solver/

Simple scrabble solver app with built in dictionary definitions. Allows for sorting by word length and scrabble score.

# Screenshot

![Scrabble Solver](/images/screenshot.png?raw=true)

# Technology Used

-   HTML
-   CSS
-   JavaScript
-   jQuery

# APIs Used

## `scrabble.now.sh`

https://github.com/codybarr/scrabble-api

Simple serverless function to return valid words from provided scrabble tiles / letters (basically our anagram solver).

## `wordsapi`

https://www.wordsapi.com/

Used to look up dictionary definitions when clicking on word results. Generous results.

## `wordnik`

https://www.wordnik.com/

Wordnik has an amazing collection of dictionary definitions, but their API has some
hidden/restrictive limits, so instead of using them for our main dictionary definition
lookups, we provide a link to their site if our main dictionary API isn't able to
find a word.
