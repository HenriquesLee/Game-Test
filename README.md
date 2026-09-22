# Mr. White

A real-time word-deduction party game. One host creates a room, shares the
code or link, and a small group (3+ people) plays together from their own
phones. Everyone gets the same secret word except the Imposter (a close but
different word) and Mr. White (no word at all, and has to bluff).

Built with Next.js and Firebase Realtime Database — free to run, deployable
on Vercel's free tier.

## How the game works

- 3–4 players: 1 Imposter, no Mr. White
- 5–7 players: 1 Imposter, 1 Mr. White
- 8+ players: 2 Imposters, 1 Mr. White

Each round: everyone privately reveals their word card, players go around in
a random order giving one clue word/phrase each, then open discussion, then
a vote. The top-voted player is eliminated and their role revealed.
Civilians win when every Imposter/Mr. White is voted out; the Imposters/Mr.
White win once they equal or outnumber the remaining civilians.

## 1. Set up a free Firebase project (holds live game state)

Vercel's functions don't keep data in memory between requests, so the game
needs somewhere to store room state that updates instantly for everyone.
Firebase's Realtime Database free tier is more than enough for this.

1. Go to https://console.firebase.google.com and create a new project (no
   billing required for the free Spark plan).
2. In the left sidebar, go to **Build -> Realtime Database -> Create
   Database**. Pick any region. Start in **test mode** for now (rules below
   tighten it).
3. Go to **Project settings -> General**, scroll to "Your apps", click the
   web icon (`</>`), register an app (no Hosting needed), and copy the
   `firebaseConfig` values shown.
4. In the Realtime Database's **Rules** tab, paste this and publish. It
   keeps the database open for read/write (fine for a casual party game
   with unguessable 5-character room codes) while avoiding wide-open schema:

   ```json
   {
     "rules": {
       "rooms": {
         "$roomCode": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values from step 1:

```bash
cp .env.local.example .env.local
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, create a room, and open the room link in another
browser tab (or your phone, once deployed) to test with a second player.

## 4. Deploy to Vercel (free)

**Option A: CLI**
```bash
npm install -g vercel
vercel
```
Follow the prompts, then when it asks about environment variables, add the
same ones from `.env.local`. Or set them afterward with `vercel env add`.

**Option B: GitHub**
1. Push this project to a GitHub repo.
2. Go to https://vercel.com/new, import the repo.
3. Under **Environment Variables**, add all seven `NEXT_PUBLIC_FIREBASE_*`
   values from your `.env.local`.
4. Deploy. Vercel gives you a URL like `mr-white-game.vercel.app`.

Share that URL (or the room-specific link the app generates after you
create a room) with your group. Everyone just opens it on their own phone.

## Notes

- No accounts or sign-in: each browser gets a random player ID stored in
  `localStorage`, so refreshing keeps your seat in the game.
- Room codes are 5 characters, avoiding ambiguous letters/numbers (no O/0,
  I/1).
- Rooms aren't automatically deleted. For personal/small-group use this is
  fine; if you want automatic cleanup later, a scheduled Firebase Cloud
  Function can prune old `rooms/*` entries by `createdAt`.
- Word pairs live in `lib/words.ts` — add your own anytime.
