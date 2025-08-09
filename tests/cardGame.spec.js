import { test, expect } from '@playwright/test';

const BASE_URL = 'https://deckofcardsapi.com';

const isTenValue = (v) => v === '10' || v === 'JACK' || v === 'QUEEN' || v === 'KING';
const pretty = (c) => `${c.value} of ${c.suit}`;
const handStr = (hand) => hand.map(pretty).join(', ');

// Blackjack = ACE + (10 | J | Q | K) in the first two cards
const hasBlackjack = (hand) => {
  const firstTwo = hand.slice(0, 2);
  const values = firstTwo.map(c => c.value);
  return values.includes('ACE') && values.some(isTenValue);
};

test('Checking for a BlackJack from Player X and Player Y using Deck of cards API', async ({ request }) => {
  // Verifying if site is up
  const home = await request.get(`${BASE_URL}/`);
  expect(home.ok(), 'Site should be reachable (200)').toBeTruthy();
  console.log("Site is Up and Running");

  // using A Brand New Jack
  const newDeckRes = await request.get(`${BASE_URL}/api/deck/new/`);
  expect(newDeckRes.ok()).toBeTruthy();
  console.log("New Deck API is running");
  const { deck_id } = await newDeckRes.json();
  expect(deck_id, 'deck_id must exist').toBeTruthy();
  console.log("DECK_ID Exists")

  // using Shuffle the cards
  const shuffleRes = await request.get(`${BASE_URL}/api/deck/${deck_id}/shuffle/`);
  expect(shuffleRes.ok(), 'Shuffle should succeed').toBeTruthy();

  // Dealing 3 cards to 2 players (draw 6)
  const drawRes = await request.get(`${BASE_URL}/api/deck/${deck_id}/draw/?count=6`);
  expect(drawRes.ok(), 'Draw should succeed').toBeTruthy();
  const { cards } = await drawRes.json();
  expect(cards?.length).toBe(6);

  const playerx = cards.slice(0, 3);
  const playery = cards.slice(3, 6);

  console.log('Player X:', handStr(playerx));
  console.log('Player Y:', handStr(playery));

  //Blackjack check (first two cards only)
  const p1BJ = hasBlackjack(playerx);
  const p2BJ = hasBlackjack(playery);

  // Who won Black Jack
  if (p1BJ || p2BJ) {
    const Winner = p1BJ && p2BJ ? 'Both' : (p1BJ ? 'Player 1' : 'Player 2');
    console.log(`Blackjack! ${Winner}`);
  } else {
    console.log('No blackjack this time.');
  }

});
