import { Router } from "itty-router";

// create router instance
const router = Router();

/*
auth endpoint for login

- check username
- check hashed password
- assign api key for continued app use??
*/

// POST - player login
router.post("/api/login", async (request, env) => {
    let loginBody;
    try {
        loginBody = await request.json();
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    const credentials = loginBody.credentials;
    if (!credentials) {
        return new Response("Invalid login request", { status: 400 });
    }

    const player = await env.DB
        .prepare("SELECT * FROM Players WHERE PlayerName = ?;")
        .bind(credentials.name)
        .first();

    if (!player) {
        return new Response("User does not exist", { status: 400 });
    }

    if (credentials.auth != player.PlayerAuth) {
        return new Response("Incorrect password", { status: 400 });
    } else {
        const loginToken = crypto.randomUUID();
        const expirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
        const token = await env.DB
            .prepare(
                "INSERT INTO LoginTokens (Token, TokenExpiresAt, TokenPlayerId) VALUES (?, ?, ?);",
            )
            .bind(loginToken, expirationDate, player.PlayerId)
            .run();
        return new Response(JSON.stringify({ token: loginToken }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }
});

// POST - register new player
router.post("/api/register", async (request, env) => {
    let playerRegisterBody;
    try {
        playerRegisterBody = await request.json();
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    if (!playerRegisterBody.name || !playerRegisterBody.auth) {
        return new Response("Missing required fields", { status: 400 });
    }

    const doesUserAlreadyExist = await env.DB
        .prepare("SELECT * FROM Players WHERE PlayerName = ?;")
        .bind(playerRegisterBody.name)
        .first();

    // TODO: check for valid password

    if (doesUserAlreadyExist) {
        return new Response("Username taken", { status: 400 });
    }

    const player = await env.DB
        .prepare(
            "INSERT INTO Players (PlayerName, PlayerAuth, PlayerDateCreated) VALUES (?, ?, ?);",
        )
        .bind(
            playerRegisterBody.name,
            playerRegisterBody.auth,
            new Date().toISOString(),
        )
        .run();
    const loginToken = crypto.randomUUID();
    const expirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const token = await env.DB
        .prepare(
            "INSERT INTO LoginTokens (Token, TokenExpiresAt, TokenPlayerId) VALUES (?, ?, ?);",
        )
        .bind(loginToken, expirationDate, player.meta.last_row_id)
        .run();
    return new Response(JSON.stringify({ token: token }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
});

/*
create a game

- SQL statement to create new game (row in ActiveGames table)
- determine game settings (size, colors, who goes first, capstone amt, etc.)
- configure new game state
*/

function new_game(settings) {
    // board size
    // capstone amount
}

/*
save a game

- SQL statement to save game as record
- save active game state (to table?)
- verify correct players?
*/

/*
archive a game

- SQL statement to save to GamesHistory table
*/

/*
receive move

- whose move is it?
- is move valid?  (is move valid function)
-- no, send invalid response
-- yes, save board state
-- transmit move to opponent player (send move)
*/

/*
send move

- transmit move to appropriate player
*/

/*
is move valid (TODO: do we want this checked client side?)

- check if move is valid
- respond
*/

/*
is game over

- check board state for game over conditions
-- no, continue
-- yes, end game
*/

/*
read board state

legend:
0 - open tile
1 - player A flat
2 - player A wall
3 - player A capstone
4 - player B flat
5 - player B wall
6 - player B capstone

- board state is 2D array
- tiles in outer array
- pieces on tiles in inner arrays
- board size = root of board state size 
- last item per tile item is top piece
*/

/*
BOARD STATES:
- PLAYER_A_TURN
- PLAYER_B_TURN
- UNDO_PENDING
- GAME_OVER
*/

function print_board(board) {
    const board_size = Math.sqrt(board.length);
    console.log(board_size);
}

let example_board = [[0], [0], [0], [0], [0], [0], [0], [0], [0]];
print_board(example_board);
