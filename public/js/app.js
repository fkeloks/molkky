import Vue from 'vue'
import Draggable from 'vuedraggable'
import Screenfull from 'screenfull'

import css from '../css/app.scss'

var app = new Vue({
    el: '#main',
    data: {
        state: 'players',
        errors: [],
        flash: null,
        players: [],
        playername: null,
        current: {
            tour: 1,
            player: {
                id: 0,
                name: null
            },
            pins: [],
            points: 0
        },
        show: {
            scores: false,
            end: false
        },
        scores: {}
    },
    methods: {
        addPlayer() {
            let playername = this.playername
            if (playername != null && playername.length >= 2) {
                if (this.players.indexOf(playername) === -1) {
                    this.players.push(playername)
                    this.playername = null
                } else {
                    this.setFlash('error', 'Un joueur avec ce nom est déjà présent dans la partie.')
                }
            } else {
                this.setFlash('error', 'Le nom du joueur dois contenir au moins 2 lettres.')
            }
        },
        removePlayer(playername) {
            if (this.state === 'players') {
                this.players = this.players.filter(player => player !== playername)
            } else {
                this.setFlash('error', 'Impossible de retirer un joueur si la partie est commencée.')
            }
        },
        startGame(start = true) {
            if (start) {
                if (this.players.length >= 2) {
                    this.state = 'game'
                    this.current.player.name = this.players[0]
                } else {
                    this.setFlash('error', 'Le nombre de joueurs dois être de minimum 2.')
                }
            } else {
                this.state = 'players'
            }
        },
        restartGame() {
            this.state = 'players'
            this.flash = null
            this.playername = null
            this.scores = {}
            this.current = {
                tour: 1,
                player: {
                    id: 0,
                    name: null
                },
                pins: [],
                points: 0
            }
            this.show = {
                scores: false,
                end: false
            }

            this.resetPins()
        },
        nextTour() {
            let currentPlayerId = this.current.player.id
            let currentPlayerName = this.players[currentPlayerId]

            if (this.scores[currentPlayerName] === undefined) {
                this.scores[currentPlayerName] = []
            }

            this.scores[currentPlayerName].push({
                tour: this.current.tour,
                points: this.current.points
            })

            let check = this.checkScore(currentPlayerName);

            if (check.exceeds) {
                this.scores[currentPlayerName].push({
                    tour: this.current.tour,
                    points: 0 - (check.score - 25)
                })
            }

            currentPlayerId = this.current.player.id + 1
            if (currentPlayerId >= this.players.length) {
                currentPlayerId = 0
                this.current.tour++
            }
            currentPlayerName = this.players[currentPlayerId]

            this.current.player.id = currentPlayerId
            this.current.player.name = currentPlayerName
            this.resetPins()
        },
        getScore(playerName) {
            let playerScore = this.scores[playerName]

            return playerScore.reduce((sc, score) => sc + score.points, 0)
        },
        checkScore(currentPlayerName) {
            let score = this.getScore(currentPlayerName)
            if (score === 50) {
                this.show.end = true
                this.setFlash('success', 'Le joueur "' + currentPlayerName + '" a atteint les 50 points !')
            } else if (score > 50) {
                this.setFlash('success', 'Le joueur "' + currentPlayerName + '" a dépassé les 50 points, retour à 25 points !')
            }

            return {
                exceeds: score > 50,
                score: score
            }
        },
        showScores() {
            this.show.scores = !this.show.scores
        },
        getPoints(scoreObject, total = false) {
            if (total) {
                let scoreValids = scoreObject.filter(score => score.points >= 0)

                return scoreValids.reduce((totalScore, score) => totalScore += score.points, 0)
            } else {
                return scoreObject.map((score) => score.points >= 0 ? score.points : null)
            }
        },
        checkPin(pinNumber, event) {
            let pin = this.current.pins.find((pin => pin.number === pinNumber))
            let index = this.current.pins.indexOf(pin)
            let check = this.current.pins[index].checked

            this.current.pins[index].checked = !check

            let targetPin = event.target.classList.contains('pin-number') ? event.target.parentNode : event.target
            if (check) {
                targetPin.classList.remove('checked')
            } else {
                targetPin.classList.add('checked')
            }
        },
        resetPins() {
            this.current.pins = []
            for (let p = 1; p <= 12; p++) {
                this.current.pins.push({
                    number: p,
                    checked: false
                })
            }

            let domPins = document.querySelectorAll('.pin-item')
            domPins.forEach(pin => {
                pin.classList.remove('checked')
            })
        },
        setFlash(type, message) {
            if (type === 'error') {
                let time = new Date().getMilliseconds()
                this.errors.push({time, message})
                setTimeout(() => {
                    this.errors = this.errors.filter(item => item.time !== time)
                }, 3000)
            } else {
                this.flash = message
            }
        },
        closePopup() {
            this.show.end = false
            this.show.scores = false
            this.flash = null
        },
        fullscreen() {
            if (Screenfull.enabled) {
                Screenfull.toggle();
            } else {
                this.setFlash('error', 'Impossible d\'activer le mode plein écran.')
            }
        }
    },
    watch: {
        current: {
            handler: function (current) {
                if (this.state === 'game') {
                    let pinsCheck = current.pins.filter(pin => pin.checked)
                    this.current.points = pinsCheck.reduce((points, pin) => points + pin.number, 0)
                }
            }, deep: true
        }
    },
    mounted: function () {
        this.resetPins()
    },
    components: {
        Draggable
    }
})