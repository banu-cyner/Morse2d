<script>


// ====================================
// DATA MORSE
// ====================================

const MORSE = {

  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",

  0: "-----",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----."

};


// ====================================
// GAME STATE
// ====================================

let playerId = "";
let username = "";

let score = 0;

let correct = 0;
let wrong = 0;

let questionIndex = 0;

let startTime = 0;

let currentAnswer = "";

let questions = [];


// ====================================
// ELEMENT
// ====================================

function el(id) {
  return document.getElementById(id);
}


// ====================================
// SCREEN
// ====================================

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(function(screen) {

      screen.classList.remove("active");

    });

  el(id).classList.add("active");
}


// ====================================
// START GAME
// ====================================

function startGame() {

  const name =
    el("username").value.trim();

  const wa =
    el("whatsapp").value.trim();

  if (!name) {

    el("loginMessage").textContent =
      "Masukkan username.";

    return;
  }

  if (!wa) {

    el("loginMessage").textContent =
      "Masukkan nomor WhatsApp.";

    return;
  }


  el("loginMessage").textContent =
    "Menyiapkan permainan...";


  el("startButton").disabled = true;


  google.script.run

    .withSuccessHandler(function(result) {

      playerId = result.playerId;

      username = result.username;

      beginGame();

    })

    .withFailureHandler(function(error) {

      el("loginMessage").textContent =
        error.message ||
        "Terjadi kesalahan.";

      el("startButton").disabled = false;

    })

    .registerPlayer(name, wa);
}


// ====================================
// GENERATE QUESTIONS
// ====================================

function generateQuestions() {

  const keys =
    Object.keys(MORSE);

  questions = [];

  let used = [];


  while (questions.length < 10) {

    const randomIndex =
      Math.floor(
        Math.random() * keys.length
      );

    const letter =
      keys[randomIndex];

    if (used.includes(letter)) {
      continue;
    }

    used.push(letter);

    questions.push(letter);
  }
}


// ====================================
// BEGIN GAME
// ====================================

function beginGame() {

  score = 0;

  correct = 0;

  wrong = 0;

  questionIndex = 0;

  startTime = Date.now();

  generateQuestions();

  el("score").textContent = score;

  showScreen("gameScreen");

  showQuestion();
}


// ====================================
// SHOW QUESTION
// ====================================

function showQuestion() {

  if (questionIndex >= questions.length) {

    finishGame();

    return;
  }


  const answer =
    questions[questionIndex];

  currentAnswer = answer;


  el("questionNumber").textContent =
    questionIndex + 1;


  el("morseCode").textContent =
    MORSE[answer];


  el("progressBar").style.width =
    ((questionIndex) / 10 * 100) + "%";


  createAnswers(answer);
}


// ====================================
// CREATE ANSWERS
// ====================================

function createAnswers(correctAnswer) {

  const container =
    el("answers");

  container.innerHTML = "";


  let choices = [
    correctAnswer
  ];


  const keys =
    Object.keys(MORSE);


  while (choices.length < 4) {

    const random =
      keys[
        Math.floor(
          Math.random() * keys.length
        )
      ];

    if (!choices.includes(random)) {

      choices.push(random);

    }
  }


  // Acak pilihan
  choices.sort(
    () => Math.random() - 0.5
  );


  choices.forEach(function(choice) {

    const button =
      document.createElement("div");

    button.className =
      "answer";

    button.textContent =
      choice;

    button.onclick = function() {

      answerQuestion(
        choice,
        button
      );

    };

    container.appendChild(button);

  });
}


// ====================================
// ANSWER
// ====================================

function answerQuestion(choice, button) {

  const buttons =
    document.querySelectorAll(".answer");


  // Matikan semua tombol
  buttons.forEach(function(btn) {

    btn.style.pointerEvents =
      "none";

  });


  if (choice === currentAnswer) {

    button.classList.add("correct");

    score += 10;

    correct++;

    el("score").textContent =
      score;

  } else {

    button.classList.add("wrong");

    wrong++;


    // Tampilkan jawaban benar
    buttons.forEach(function(btn) {

      if (
        btn.textContent ===
        currentAnswer
      ) {

        btn.classList.add("correct");

      }

    });

  }


  questionIndex++;


  setTimeout(function() {

    showQuestion();

  }, 650);
}


// ====================================
// FINISH GAME
// ====================================

function finishGame() {

  const duration =
    Math.floor(
      (Date.now() - startTime) / 1000
    );


  el("finalScore").textContent =
    score;

  el("finalCorrect").textContent =
    correct;

  el("finalWrong").textContent =
    wrong;


  showScreen("resultScreen");


  // Simpan ke Google Sheets

  google.script.run

    .withFailureHandler(function(error) {

      console.log(error);

    })

    .saveScore(
      playerId,
      username,
      score,
      correct,
      wrong,
      duration
    );
}


// ====================================
// LEADERBOARD
// ====================================

function showLeaderboard() {

  showScreen("leaderboardScreen");

  const container =
    el("leaderboard");

  container.innerHTML =
    "Memuat leaderboard...";


  google.script.run

    .withSuccessHandler(function(data) {

      renderLeaderboard(data);

    })

    .withFailureHandler(function(error) {

      container.innerHTML =
        "Gagal memuat leaderboard.";

    })

    .getLeaderboard();
}


// ====================================
// RENDER LEADERBOARD
// ====================================

function renderLeaderboard(data) {

  const container =
    el("leaderboard");


  if (!data || data.length === 0) {

    container.innerHTML =
      "<p style='text-align:center;opacity:.6'>" +
      "Belum ada pemain." +
      "</p>";

    return;
  }


  container.innerHTML = "";


  data.forEach(function(player, index) {

    const row =
      document.createElement("div");

    row.className =
      "rank";


    let medal = "";

    if (index === 0) medal = "🥇";

    else if (index === 1) medal = "🥈";

    else if (index === 2) medal = "🥉";

    else medal = index + 1;


    row.innerHTML = `

      <div class="rankNumber">
        ${medal}
      </div>

      <div class="rankName">
        ${escapeHTML(player.username)}
      </div>

      <div class="rankScore">
        ${player.score}
      </div>

    `;


    container.appendChild(row);

  });
}


// ====================================
// BACK TO MENU
// ====================================

function backToMenu() {

  showScreen("loginScreen");

  el("startButton").disabled =
    false;

  el("loginMessage").textContent =
    "";

}


// ====================================
// SECURITY
// ====================================

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;
}


</script>
