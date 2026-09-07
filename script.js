<script>

// ========================================
// LINK DEPLOY GOOGLE APPS SCRIPT
// ========================================
//
// TEMPEL LINK DEPLOY DI SINI
//
// Contoh:
// const SCRIPT_URL =
// "https://script.google.com/macros/s/XXXXXXXX/exec";
//
// ========================================

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzM6n0SKaDiHc2TnanBbraXcwx7hTId5e6lZnH1NCgc5hL_m7kAxzLPSurcguSJ4X9Y9Q/exec";


// ========================================
// DATA MORSE
// ========================================

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


// ========================================
// DATA PLAYER
// ========================================

let playerId = "";
let username = "";

let score = 0;
let correct = 0;
let wrong = 0;

let questionIndex = 0;

let currentAnswer = "";

let questions = [];

let startTime = 0;


// ========================================
// SCREEN
// ========================================

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(function(screen) {

      screen.classList.remove("active");

    });


  const screen =
    document.getElementById(id);


  if (screen) {

    screen.classList.add("active");

  }

}


// ========================================
// MULAI GAME
// ========================================

function startGame() {

  const name =
    document
      .getElementById("username")
      .value
      .trim();


  const wa =
    document
      .getElementById("whatsapp")
      .value
      .trim();


  const message =
    document.getElementById(
      "loginMessage"
    );


  const startButton =
    document.getElementById(
      "startButton"
    );


  if (!name) {

    message.textContent =
      "Masukkan username.";

    return;

  }


  if (name.length < 3) {

    message.textContent =
      "Username minimal 3 karakter.";

    return;

  }


  if (!wa) {

    message.textContent =
      "Masukkan nomor WhatsApp.";

    return;

  }


  message.textContent =
    "Menghubungkan ke database...";


  startButton.disabled = true;


  // ======================================
  // GOOGLE APPS SCRIPT
  // ======================================

  google.script.run

    .withSuccessHandler(
      function(result) {

        if (!result ||
            !result.success) {

          message.textContent =
            "Gagal membuat akun.";

          startButton.disabled =
            false;

          return;

        }


        playerId =
          result.playerId;


        username =
          result.username;


        message.textContent =
          "";


        beginGame();

      }
    )


    .withFailureHandler(
      function(error) {

        console.error(error);


        message.textContent =
          error.message ||
          "Terjadi kesalahan koneksi.";


        startButton.disabled =
          false;

      }
    )


    .registerPlayer(
      name,
      wa
    );

}


// ========================================
// BUAT SOAL
// ========================================

function generateQuestions() {

  const keys =
    Object.keys(MORSE);


  questions = [];


  const used = [];


  while (
    questions.length < 10
  ) {

    const index =
      Math.floor(
        Math.random() *
        keys.length
      );


    const letter =
      keys[index];


    if (
      used.includes(letter)
    ) {

      continue;

    }


    used.push(letter);

    questions.push(letter);

  }

}


// ========================================
// MULAI GAME
// ========================================

function beginGame() {

  score = 0;

  correct = 0;

  wrong = 0;

  questionIndex = 0;

  startTime =
    Date.now();


  generateQuestions();


  document
    .getElementById("score")
    .textContent = "0";


  showScreen(
    "gameScreen"
  );


  showQuestion();

}


// ========================================
// TAMPILKAN SOAL
// ========================================

function showQuestion() {

  if (
    questionIndex >=
    questions.length
  ) {

    finishGame();

    return;

  }


  currentAnswer =
    questions[
      questionIndex
    ];


  document
    .getElementById(
      "questionNumber"
    )
    .textContent =
    questionIndex + 1;


  document
    .getElementById(
      "morseCode"
    )
    .textContent =
    MORSE[currentAnswer];


  document
    .getElementById(
      "progressBar"
    )
    .style.width =
    (
      questionIndex /
      questions.length *
      100
    ) + "%";


  createAnswers(
    currentAnswer
  );

}


// ========================================
// BUAT PILIHAN
// ========================================

function createAnswers(
  correctAnswer
) {

  const container =
    document.getElementById(
      "answers"
    );


  container.innerHTML =
    "";


  const choices = [
    correctAnswer
  ];


  const keys =
    Object.keys(MORSE);


  while (
    choices.length < 4
  ) {

    const random =
      keys[
        Math.floor(
          Math.random() *
          keys.length
        )
      ];


    if (
      !choices.includes(random)
    ) {

      choices.push(random);

    }

  }


  choices.sort(
    () => Math.random() - 0.5
  );


  choices.forEach(
    function(choice) {

      const button =
        document.createElement(
          "div"
        );


      button.className =
        "answer";


      button.textContent =
        choice;


      button.onclick =
        function() {

          answerQuestion(
            choice,
            button
          );

        };


      container.appendChild(
        button
      );

    }
  );

}


// ========================================
// JAWABAN
// ========================================

function answerQuestion(
  choice,
  button
) {

  const buttons =
    document.querySelectorAll(
      ".answer"
    );


  buttons.forEach(
    function(btn) {

      btn.style.pointerEvents =
        "none";

    }
  );


  if (
    choice ===
    currentAnswer
  ) {

    button.classList.add(
      "correct"
    );


    score += 10;

    correct++;


    document
      .getElementById(
        "score"
      )
      .textContent =
      score;

  }

  else {

    button.classList.add(
      "wrong"
    );


    wrong++;


    buttons.forEach(
      function(btn) {

        if (
          btn.textContent ===
          currentAnswer
        ) {

          btn.classList.add(
            "correct"
          );

        }

      }
    );

  }


  questionIndex++;


  setTimeout(
    function() {

      showQuestion();

    },
    700
  );

}


// ========================================
// GAME SELESAI
// ========================================

function finishGame() {

  const duration =
    Math.floor(
      (
        Date.now() -
        startTime
      ) / 1000
    );


  document
    .getElementById(
      "finalScore"
    )
    .textContent =
    score;


  document
    .getElementById(
      "finalCorrect"
    )
    .textContent =
    correct;


  document
    .getElementById(
      "finalWrong"
    )
    .textContent =
    wrong;


  showScreen(
    "resultScreen"
  );


  // ======================================
  // SIMPAN DATABASE
  // ======================================

  google.script.run

    .withSuccessHandler(
      function(result) {

        console.log(
          "Score berhasil disimpan."
        );

      }
    )

    .withFailureHandler(
      function(error) {

        console.error(
          "Gagal menyimpan score:",
          error
        );

      }
    )

    .saveScore(

      playerId,

      username,

      score,

      correct,

      wrong,

      duration

    );

}


// ========================================
// LEADERBOARD
// ========================================

function showLeaderboard() {

  showScreen(
    "leaderboardScreen"
  );


  const container =
    document.getElementById(
      "leaderboard"
    );


  container.innerHTML =
    "<p style='text-align:center'>" +
    "Memuat leaderboard..." +
    "</p>";


  google.script.run

    .withSuccessHandler(
      function(data) {

        renderLeaderboard(
          data
        );

      }
    )

    .withFailureHandler(
      function(error) {

        console.error(error);


        container.innerHTML =
          "<p style='text-align:center'>" +
          "Gagal memuat leaderboard." +
          "</p>";

      }
    )

    .getLeaderboard();

}


// ========================================
// RENDER LEADERBOARD
// ========================================

function renderLeaderboard(
  data
) {

  const container =
    document.getElementById(
      "leaderboard"
    );


  container.innerHTML =
    "";


  if (
    !data ||
    data.length === 0
  ) {

    container.innerHTML =
      "<p style='text-align:center'>" +
      "Belum ada pemain." +
      "</p>";

    return;

  }


  data.forEach(
    function(player, index) {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "rank";


      let position =
        index + 1;


      if (index === 0) {

        position = "🥇";

      }

      else if (index === 1) {

        position = "🥈";

      }

      else if (index === 2) {

        position = "🥉";

      }


      row.innerHTML = `

        <div>
          ${position}
        </div>

        <div>
          ${escapeHTML(
            player.username
          )}
        </div>

        <div class="rankScore">
          ${player.score}
        </div>

      `;


      container.appendChild(
        row
      );

    }
  );

}


// ========================================
// KEMBALI MENU
// ========================================

function backToMenu() {

  showScreen(
    "loginScreen"
  );


  document
    .getElementById(
      "startButton"
    )
    .disabled =
    false;


  document
    .getElementById(
      "loginMessage"
    )
    .textContent =
    "";

}


// ========================================
// SECURITY
// ========================================

function escapeHTML(text) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}

</script>
