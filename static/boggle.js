class BoggleGame {
    constructor(boardId, secs = 60) {
        this.secs = secs;
        this.board = $(`#${boardId}`);
        this.score = 0;
        this.words = new Set();
        this.msg = $(".msg",this.board);

        this.showTimer();

        this.showScore();
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

    showMessage(msg, cls= "") {
        this.msg
            .text(msg)
            .removeClass()
            .addClass(`msg ${cls}`);
    }

    showTimer() {
        $(".timer", this.board).text(`Timer: ${this.secs}`);
    }

    /* Tick: handle a second passing in game */

    async tick() {
        this.secs -= 1;
        this.showTimer();

        if (this.secs === 0) {
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    showScore() {
        $(".score", this.board).text(`Score: ${this.score}`);
    }

    showWord(word) {
        this.words.add(word);
        let words = Array.from(this.words).join(', ');
        $(".words", this.board).text(`Found words: ${words}`);
    }

    async handleSubmit(evt) {
        evt.preventDefault();
        const $word = $(".word", this.board);

        let word = $word.val();

        if (!word) return;

        if (this.words.has(word)) {
            showMessage(`${word} has already been found!`);
            return;
        }
        const resp = await axios.get("/check-word", { params: { word: word } });
        if (resp.data.result === "not-word") {
            this.showMessage(`${word} is not a valid English word`, "err");
        } else if (resp.data.result === "not-on-board") {
            this.showMessage(`${word} is not a valid word on this board`, "err");
        } else {
            this.showWord(word);
            this.score += word.length;
            this.showScore();
            this.words.add(word);
            this.showMessage(`Added: ${word}`, "ok");
        }

        $word.val("").focus();
    }

    async scoreGame() {
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if (resp.data.brokeRecord) {
            this.showMessage(`New record: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }

}