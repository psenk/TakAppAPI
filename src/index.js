import { Router } from "itty-router";
import bcrypt, { hash } from "bcryptjs";

// create router instance
const router = Router();
const SALT_ROUNDS = 10;

/*
- TODO: clear expired session tokens
*/

/**
 * NOTES:
 * - PLAYER A IS ALWAYS BLACK
 * - PLAYER B IS ALWAYS WHITE
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

    const player = await env.DB.prepare(
        "SELECT * FROM Players WHERE PlayerName = ?;",
    )
        .bind(credentials.name)
        .first();

    if (!player) {
        return new Response("User does not exist", { status: 400 });
    }

    if (await !bcrypt.compare(credentials.auth, player.PlayerAuth)) {
        return new Response("Incorrect password", { status: 400 });
    } else {
        const loginToken = crypto.randomUUID();
        const expirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
        const token = await env.DB.prepare(
            "INSERT INTO LoginTokens (Token, TokenExpiresAt, TokenPlayerId) VALUES (?, ?, ?);",
        )
            .bind(loginToken, expirationDate, player.PlayerId)
            .run();
        return Response.json(
            { sessionToken: loginToken, expiresAt: expirationDate },
            { status: 200 },
        );
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

    const doesUserAlreadyExist = await env.DB.prepare(
        "SELECT * FROM Players WHERE PlayerName = ?;",
    )
        .bind(playerRegisterBody.name)
        .first();

    if (doesUserAlreadyExist) {
        return new Response("Username taken", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(
        playerRegisterBody.auth,
        SALT_ROUNDS,
    );

    const player = await env.DB.prepare(
        "INSERT INTO Players (PlayerName, PlayerAuth, PlayerDateCreated) VALUES (?, ?, ?);",
    )
        .bind(
            playerRegisterBody.name,
            hashedPassword.toString(),
            new Date().toISOString(),
        )
        .run();
    const loginToken = crypto.randomUUID();
    const expirationDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    const token = await env.DB.prepare(
        "INSERT INTO LoginTokens (Token, TokenExpiresAt, TokenPlayerId) VALUES (?, ?, ?);",
    )
        .bind(loginToken, expirationDate, player.meta.last_row_id)
        .run();
    return Response.json(
        { sessionToken: loginToken, expiresAt: expirationDate },
        { status: 200 },
    );
});

// POST - return players active games
router.post("/api/activegames", async (request, env) => {
    const sessionToken = request.headers.get("Authorization");
    if (!sessionToken || !sessionToken.startsWith("Bearer ")) {
        return new Response("Invalid authorization", { status: 400 });
    }

    const token = sessionToken.substring(7);
    const session  = await env.DB.prepare(
        "SELECT * FROM LoginTokens WHERE Token = ?;",
    )
        .bind(token)
        .first();

    if (!session) {
        return new Response("Invalid session token", { status: 400 });
    }

    const player = session.TokenPlayerId;
    const { results: activeGamesList } = await env.DB.prepare(
        "SELECT * FROM ActiveGames WHERE GamePlayerIdA = ? OR GamePlayerIdB = ?;",
    )
        .bind(player, player)
        .all();

    return Response.json({ activeGames: activeGamesList });
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

// unmatched routes
router.all("*", () => new Response("Not found", { status: 404 }));

// main export
export default {
    fetch: (request, env) => router.fetch(request, env),
};
