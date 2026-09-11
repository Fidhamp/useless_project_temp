from flask import Flask, render_template, request, redirect, session, url_for
import random

app = Flask(__name__)

app.secret_key = "susmate-secret-key"


# =========================
# QUESTIONS
# =========================

questions = [

    "Who would disappear when the bill arrives? 💸",

    "Who would expose the group chat? 📱",

    "Who would sell their friend for $100? 💸 ",

    "Who would betray the gang for biriyani? 🍛",

    "Who would say 'I'm on the way' while still at home? 😂",

    "Who acts innocent but knows everything ? 🤫",

    "Who is secretly the final boss of this friend group? 😈",

    "who is most suspicious right now? 👀",

]


# =========================
# PUNISHMENTS
# =========================

punishments = [

    "Do a funny dance for 10 seconds 💃",

    "Tell the worst joke you know 😂",

    "Act like a movie villain for 20 seconds 😈",

    "Make your funniest pose 📸",

    "Act like a snake for 15 seconds 🐍",

    "Let the gang choose your funny nickname 😂"

]


# =========================
# HOME PAGE
# =========================

@app.route("/")
def home():

    return render_template("home.html")


# =========================
# ADD PLAYERS
# =========================
@app.route("/players", methods=["GET", "POST"])
def players():

    if "players" not in session:
        session["players"] = []

    if request.method == "POST":

        name = request.form.get("name")

        if name:
            name = name.strip()

            # Don't add duplicate names
            if name not in session["players"]:
                players_list = session["players"]
                players_list.append(name)
                session["players"] = players_list

    return render_template(
        "players.html",
        players=session["players"]
    )


# =========================
# START NEW GAME
# =========================

@app.route("/start-game")
def start_game():

    # Make sure there are at least 3 players

    if "players" not in session or len(session["players"]) < 3:

        return redirect("/players")


    # Reset game data

    session["question_number"] = 0

    session["current_player_index"] = 0


    # Create scores

    scores = {}

    for player in session["players"]:

        scores[player] = 0


    session["scores"] = scores


    return redirect("/game")


# =========================
# GAME
# =========================

@app.route("/game", methods=["GET", "POST"])
def game():

    # Make sure game exists

    if "players" not in session:

        return redirect("/players")


    if "question_number" not in session:

        return redirect("/start-game")


    players_list = session["players"]


    # =====================
    # WHEN SOMEONE VOTES
    # =====================

    if request.method == "POST":

        selected_player = request.form.get("suspect")


        # Get scores

        scores = session["scores"]


        # Add SUS points

        if selected_player:

            scores[selected_player] += 10


        # Save scores

        session["scores"] = scores


        # Move to next player's turn

        session["current_player_index"] += 1


        # =====================
        # EVERYONE ANSWERED
        # =====================

        if session["current_player_index"] >= len(players_list):

            # Go to next question

            session["question_number"] += 1


            # Start again from Player 1

            session["current_player_index"] = 0


    # =====================
    # GET CURRENT DATA
    # =====================

    question_number = session["question_number"]


    # =====================
    # GAME FINISHED
    # =====================

    if question_number >= len(questions):

        return redirect("/reveal")


    current_player_index = session["current_player_index"]


    current_player = players_list[current_player_index]


    # =====================
    # REMOVE CURRENT PLAYER
    # =====================

    suspects = []


    for player in players_list:

        if player != current_player:

            suspects.append(player)


    # =====================
    # SHOW GAME PAGE
    # =====================

    return render_template(

        "game.html",

        question=questions[question_number],

        question_number=question_number,

        total_questions=len(questions),

        current_player=current_player,

        suspects=suspects,

        turn_number=current_player_index + 1,

        total_players=len(players_list)

    )


# =========================
# DRAMATIC REVEAL
# =========================

@app.route("/reveal")
def reveal():

    return render_template("reveal.html")


# =========================
# RESULT
# =========================

@app.route("/result")
def result():

    if "scores" not in session:

        return redirect("/")


    scores = session["scores"]


    # Find highest score

    snake = max(scores, key=scores.get)


    snake_score = scores[snake]


    # Random punishment

    punishment = random.choice(punishments)


    # Snake level

    if snake_score <= 20:

        snake_level = "Slightly Sus 👀"

    elif snake_score <= 40:

        snake_level = "Suspicious Behaviour 🤨"

    elif snake_score <= 60:

        snake_level = "Snake Behaviour 🐍"

    else:

        snake_level = "CERTIFIED SNAKE 😈🐍"


    return render_template(

        "result.html",

        snake=snake,

        snake_score=snake_score,

        snake_level=snake_level,

        scores=scores,

        punishment=punishment

    )


# =========================
# PLAY AGAIN
# =========================

@app.route("/play-again")
def play_again():

    return redirect("/start-game")


# =========================
# NEW GANG
# =========================

@app.route("/new-gang")
def new_gang():

    session.clear()

    return redirect("/")

@app.route("/new-game")
def new_game():
    session.clear()
    return redirect(url_for("players"))


# =========================
# RUN APP
# =========================

if __name__ == "__main__":

    app.run(debug=True)