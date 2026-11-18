/* Coral Key — a weekend at the resort.
   Adapted from the Lanternveil story shape. elves/ is not shared and not modified.
   VIDEOS is an array of clips per woman. Each item is
   { id, src, poster, still, title }.
   A scene step or gallery card points at one clip with "aurelia.smile"
   (her name, a dot, the clip id). To add a memory moment, push another
   object onto her array, add its src and poster to SHIP_LIST (only listed
   files are requested), and set video: "aurelia.newId" on the scene or card.
   High-affection steps can also set minAff. */
(function () {
  'use strict';

  const SPRITE_FILES = {
    'aurelia.hostess': 'art/aurelia_hostess.webp',
    'aurelia.pool': 'art/aurelia_pool.webp',
    'aurelia.cocktail': 'art/aurelia_cocktail.webp',
    'aurelia.evening': 'art/aurelia_ending.webp',
    'mika.maid': 'art/mika_maid.webp',
    'mika.beach': 'art/mika_beach.webp',
    'mika.market': 'art/mika_market.webp',
    'mika.evening': 'art/mika_ending.webp',
    'celeste.beach': 'art/celeste_beach.webp',
    'celeste.surf': 'art/celeste_surf.webp',
    'celeste.bonfire': 'art/celeste_bonfire.webp',
    'celeste.evening': 'art/celeste_ending.webp',
    'sable.palms': 'art/sable_palms.webp',
    'sable.jetski': 'art/sable_jetski.webp',
    'sable.tiki': 'art/sable_tikibar.webp',
    'sable.evening': 'art/sable_ending.webp'
  };

  const BG_FILES = {
    lobby: 'art/bg_lobby.webp',
    room: 'art/bg_room.webp',
    pool: 'art/bg_pool.webp',
    beach: 'art/bg_beach_day.webp',
    tiki: 'art/bg_tikibar.webp',
    night: 'art/bg_beach_night.webp'
  };

  const VIDEOS = {
    aurelia: [
      { id: 'smile', src: 'video/aurelia.mp4', poster: 'video/aurelia_poster.jpg', still: 'art/aurelia_ending.webp', title: 'A Smile' },
      { id: 'tiki', src: 'video/aurelia_tiki.mp4', poster: 'video/aurelia_tiki_poster.jpg', still: 'art/aurelia_cocktail.webp', title: 'Sideways Laugh' },
      { id: 'kiss', src: 'video/aurelia_kiss.mp4', poster: 'video/aurelia_kiss_poster.jpg', still: 'art/aurelia_ending.webp', title: 'Blown Kiss' }
    ],
    mika: [
      { id: 'glance', src: 'video/mika.mp4', poster: 'video/mika_poster.jpg', still: 'art/mika_ending.webp', title: 'A Glance' },
      { id: 'meet', src: 'video/mika_meet.mp4', poster: 'video/mika_meet_poster.jpg', still: 'art/mika_maid.webp', title: 'Sheepish' },
      { id: 'market', src: 'video/mika_market.mp4', poster: 'video/mika_market_poster.jpg', still: 'art/mika_market.webp', title: 'Market Wink' }
    ],
    celeste: [
      { id: 'laugh', src: 'video/celeste.mp4', poster: 'video/celeste_poster.jpg', still: 'art/celeste_ending.webp', title: 'Her Laugh' },
      { id: 'bonfire', src: 'video/celeste_bonfire.mp4', poster: 'video/celeste_bonfire_poster.jpg', still: 'art/celeste_bonfire.webp', title: 'Bonfire Kiss' },
      { id: 'surf', src: 'video/celeste_surf.mp4', poster: 'video/celeste_surf_poster.jpg', still: 'art/celeste_surf.webp', title: 'Wet Smile' }
    ],
    sable: [
      { id: 'kiss', src: 'video/sable.mp4', poster: 'video/sable_poster.jpg', still: 'art/sable_ending.webp', title: 'Blown Kiss' },
      { id: 'palms', src: 'video/sable_palms.mp4', poster: 'video/sable_palms_poster.jpg', still: 'art/sable_palms.webp', title: 'Through Her Lashes' },
      { id: 'jetski', src: 'video/sable_jetski.mp4', poster: 'video/sable_jetski_poster.jpg', still: 'art/sable_jetski.webp', title: 'Wind Smile' }
    ]
  };

  const SHIP_LIST = Object.keys(SPRITE_FILES).map(function (k) { return SPRITE_FILES[k]; })
    .concat(Object.keys(BG_FILES).map(function (k) { return BG_FILES[k]; }));
  Object.keys(VIDEOS).forEach(function (who) {
    (VIDEOS[who] || []).forEach(function (clip) {
      if (clip.src) SHIP_LIST.push(clip.src);
      if (clip.poster) SHIP_LIST.push(clip.poster);
    });
  });

  const CAST = {
    aurelia: {
      name: 'Aurelia', age: 28, color: '#f0c36a',
      blurb: 'Warm at the desk, precise with a key, and teasing the moment she is off duty.'
    },
    mika: {
      name: 'Mika', age: 23, color: '#ff9ec4',
      blurb: 'Shy, clumsy, and braver than she sounds once the blush settles.'
    },
    celeste: {
      name: 'Celeste', age: 24, color: '#7ec8ff',
      blurb: 'Bubbly, athletic, and convinced the ocean is on her team.'
    },
    sable: {
      name: 'Sable', age: 27, color: '#ff7a68',
      blurb: 'Sultry, sure of herself, and in no hurry to pretend otherwise.'
    }
  };

  const OUTFITS = {
    aurelia: [
      { id: 'hostess', name: 'Ivory Desk Suit', hint: 'Seen at Friday check-in.', sprite: 'aurelia.hostess' },
      { id: 'pool', name: 'Off-Duty Gold', hint: 'Seen by the pool.', sprite: 'aurelia.pool' },
      { id: 'cocktail', name: 'Sunset Slip', hint: 'Seen at the tiki bar.', sprite: 'aurelia.cocktail' },
      { id: 'evening', name: 'Balcony Gold', hint: 'Seen in her ending.', sprite: 'aurelia.evening' }
    ],
    mika: [
      { id: 'maid', name: 'Maid Uniform', hint: 'Seen in your room.', sprite: 'mika.maid' },
      { id: 'beach', name: 'Ruffle White', hint: 'Seen on her day off.', sprite: 'mika.beach' },
      { id: 'market', name: 'Lantern Sundress', hint: 'Seen at the night market.', sprite: 'mika.market' },
      { id: 'evening', name: 'Lantern Night', hint: 'Seen in her ending.', sprite: 'mika.evening' }
    ],
    celeste: [
      { id: 'beach', name: 'Tide Blue', hint: 'Seen on the beach.', sprite: 'celeste.beach' },
      { id: 'surf', name: 'Board Day', hint: 'Seen with her board.', sprite: 'celeste.surf' },
      { id: 'bonfire', name: 'Bonfire Set', hint: 'Seen at the night beach.', sprite: 'celeste.bonfire' },
      { id: 'evening', name: 'Starlight Blue', hint: 'Seen in her ending.', sprite: 'celeste.evening' }
    ],
    sable: [
      { id: 'palms', name: 'Palm Red', hint: 'Seen under the palms.', sprite: 'sable.palms' },
      { id: 'jetski', name: 'Open Water', hint: 'Seen on the jet ski.', sprite: 'sable.jetski' },
      { id: 'tiki', name: 'Bar Red', hint: 'Seen at the tiki bar.', sprite: 'sable.tiki' },
      { id: 'evening', name: 'Night Pool', hint: 'Seen in her ending.', sprite: 'sable.evening' }
    ]
  };

  const GALLERY = {
    aurelia_checkin: { who: 'aurelia', title: 'Check-In', caption: 'She gives you a shell key and a look that is not in the manual.', sprite: 'aurelia.hostess' },
    aurelia_pool: { who: 'aurelia', title: 'Off Duty', caption: 'The lounger, the gold suit, and an afternoon she refuses to call a date.', sprite: 'aurelia.pool' },
    aurelia_cocktail: { who: 'aurelia', title: 'Last Call For Two', caption: 'Sunset, one glass, and a laugh she aims just past your shoulder.', sprite: 'aurelia.cocktail', video: 'aurelia.tiki' },
    aurelia_smile: { who: 'aurelia', title: 'A Smile', caption: 'She smiles, winks, and tips her head, already sure of Sunday.', sprite: 'aurelia.evening', video: 'aurelia.smile' },
    end_aurelia: { who: 'aurelia', title: 'The Key Stays Out', caption: 'A soft smile, a blown kiss, and the balcony going dark.', sprite: 'aurelia.evening', video: 'aurelia.kiss' },
    mika_meet: { who: 'mika', title: 'Under the Bed', caption: 'She blinks, flustered, then finds a sheepish smile.', sprite: 'mika.maid', video: 'mika.meet' },
    mika_beach: { who: 'mika', title: 'Day Off', caption: 'She meant to read. The breeze had other plans for her hair.', sprite: 'mika.beach' },
    mika_market: { who: 'mika', title: 'Night Market', caption: 'Lantern light, her hair in the breeze, a smile and a wink.', sprite: 'mika.market', video: 'mika.market' },
    end_mika: { who: 'mika', title: 'Lanterns for Two', caption: 'She stops apologizing long enough to kiss you.', sprite: 'mika.evening', video: 'mika.glance' },
    celeste_beach: { who: 'celeste', title: 'The Break', caption: 'She waves with her whole arms, like the tide might miss it.', sprite: 'celeste.beach' },
    celeste_surf: { who: 'celeste', title: 'One Wave', caption: 'Wet hair, a smile, and a blink she aims at you.', sprite: 'celeste.surf', video: 'celeste.surf' },
    celeste_bonfire: { who: 'celeste', title: 'Bonfire', caption: 'Firelight, a warm smile, and a kiss blown across the blanket.', sprite: 'celeste.bonfire', video: 'celeste.bonfire' },
    end_celeste: { who: 'celeste', title: 'Stay Through Sunday', caption: 'Low tide, starlight, and a kiss that tastes like salt.', sprite: 'celeste.evening', video: 'celeste.laugh' },
    sable_palms: { who: 'sable', title: 'Striped Shade', caption: 'She looks up through her lashes, then lets the smirk arrive.', sprite: 'sable.palms', video: 'sable.palms' },
    sable_jetski: { who: 'sable', title: 'Hold On', caption: 'Wind in her hair, and a close-mouthed smile over her shoulder.', sprite: 'sable.jetski', video: 'sable.jetski' },
    sable_tiki: { who: 'sable', title: 'Her Stool', caption: 'Sunglasses up, sunset down, and no interest in pretending.', sprite: 'sable.tiki' },
    end_sable: { who: 'sable', title: 'The Pool After Dark', caption: 'Closed to guests. Open to you. A kiss, then dark.', sprite: 'sable.evening', video: 'sable.kiss' },
    suit_aurelia: { who: 'aurelia', title: 'Gold Suit', caption: 'The lounger look, unlocked when her weekend is yours.', sprite: 'aurelia.pool', section: 'SWIMSUITS', route: true },
    suit_mika: { who: 'mika', title: 'Striped Day Off', caption: 'The beach suit she wears when the uniform is off.', sprite: 'mika.beach', section: 'SWIMSUITS', route: true },
    suit_celeste: { who: 'celeste', title: 'Blue Break', caption: 'The suit she waves in, before anyone is racing.', sprite: 'celeste.beach', section: 'SWIMSUITS', route: true },
    suit_celeste_surf: { who: 'celeste', title: 'Board and Smile', caption: 'The same blue, with the board she will not share.', sprite: 'celeste.surf', section: 'SWIMSUITS', route: true },
    suit_sable: { who: 'sable', title: 'Red in the Shade', caption: 'The suit from the palms, the jet ski, and the closed pool.', sprite: 'sable.palms', section: 'SWIMSUITS', route: true }
  };

  const GALLERY_ORDER = [
    'aurelia_checkin', 'aurelia_pool', 'aurelia_cocktail', 'aurelia_smile', 'end_aurelia',
    'mika_meet', 'mika_beach', 'mika_market', 'end_mika',
    'celeste_beach', 'celeste_surf', 'celeste_bonfire', 'end_celeste',
    'sable_palms', 'sable_jetski', 'sable_tiki', 'end_sable',
    'suit_aurelia', 'suit_mika', 'suit_celeste', 'suit_celeste_surf', 'suit_sable'
  ];

  function say(id, who, text, extra) {
    return Object.assign({ op: 'say', id: id, who: who, text: text }, extra || {});
  }
  function choice(id, who, options, extra) {
    return Object.assign({ op: 'choice', id: id, who: who, options: options }, extra || {});
  }
  function unlock(id, who, outfit, gallery) {
    const step = { op: 'unlock', id: id, who: who };
    if (outfit) step.outfit = outfit;
    if (gallery) step.gallery = gallery;
    return step;
  }
  function presence(id, who, n) {
    return { op: 'aff', id: id, who: who, n: n, quiet: true };
  }

  const SCENES = {
    friday_lobby: {
      id: 'friday_lobby', who: 'aurelia', bg: 'lobby', when: 'Friday',
      steps: [
        say('fl1', 'narr', 'The ferry leaves a white seam on the water and then forgets you. You are twenty-seven. The weekend is yours. Coral Key is already warmer than the city you left, and the lobby smells like teak, lilies, and somebody else\'s good vacation.'),
        say('fl2', 'narr', 'Palms press their shadows against the glass. The floor throws the afternoon back at the ceiling. At the desk, a woman in an ivory suit looks up as if she had both the timetable and a private bet on your face.'),
        unlock('fl3', 'aurelia', 'hostess', 'aurelia_checkin'),
        say('fl4', 'aurelia', 'Welcome to Coral Key. I am Aurelia. I am twenty-eight, so you can retire whatever number you were about to invent. The desk is mine until Sunday night. You, I have not filed yet.', { sprite: 'aurelia.hostess' }),
        say('fl5', 'aurelia', 'Reservation under a hopeful handwriting, ocean-view room, two nights, and a note that says you like the morning. Bold of you to plan a morning before you have met the island. Or me.', { sprite: 'aurelia.hostess' }),
        choice('fl6', 'aurelia', [
          { text: 'Tell her the suit is doing more work than the brochure.', aff: 5, sprite: 'aurelia.hostess', reply: 'Then the brochure should be jealous. Give me your name, {name}, and I will put it somewhere I can find without pretending to look.' },
          { text: 'Smile, and give your name like you mean to stay.', aff: 3, sprite: 'aurelia.hostess', reply: 'Plain looks good on you. Do not get shy about it later. I take notes, and I am unfair about rereading them.' },
          { text: 'Keep it to the reservation.', aff: 0, sprite: 'aurelia.hostess', reply: 'Efficient. I can work with efficient. I can also work with interesting, if you change your mind before the key cools.' }
        ], { sprite: 'aurelia.hostess' }),
        say('fl7', 'aurelia', 'The room faces the water. This shell is the key. If you lose it, you will have to come back and let me be kind about it, which I would enjoy more than the training allows.', { sprite: 'aurelia.hostess' }),
        choice('fl8', 'aurelia', [
          { text: 'Take the key and let the touch linger.', aff: 5, sprite: 'aurelia.hostess', reply: 'Careful. I am still on duty, and I am very good at noticing things I am not supposed to keep.' },
          { text: 'Thank her, and mean it.', aff: 3, sprite: 'aurelia.hostess', reply: 'Manners. I will add them to your file, next to the way you looked at the lilies and then at me, in that order. I noticed the order.' },
          { text: 'Take it and step back.', aff: 0, sprite: 'aurelia.hostess', reply: 'The shell will open the door either way. The rest of the weekend is less automatic. That is the fun part, if you allow fun.' }
        ], { sprite: 'aurelia.hostess' }),
        say('fl9', 'aurelia', 'Dinner is whenever you are hungry. I am at this desk until the lights change. Try not to need rescuing before then. Or do. I give excellent directions, and slightly compromised ones if you smile.', { sprite: 'aurelia.hostess' }),
        say('fl10', 'narr', 'She slides the welcome card across the teak, then gives you a second look that is not in any manual. The shell key is warm from her hand. The elevator is behind you. Her smile stays where it is, professional, and not only that.'),
        presence('fl11', 'aurelia', 2)
      ]
    },

    friday_room: {
      id: 'friday_room', who: 'mika', bg: 'room', when: 'Friday',
      steps: [
        say('fr1', 'narr', 'The room is linen, sea light, and a balcony that has already decided to spoil you. The bed is perfect. The space under it is not. A black skirt, white stockings, and a pair of polished shoes are sticking out, and something small clinks against the frame.'),
        say('fr2', 'narr', 'You say hello. The shoes kick. There is a wooden thump, a bright little "ow," and then she backs out on her knees in a rush, pink hair in her eyes, a dust cloth crushed in both hands like a white flag.'),
        unlock('fr3', 'mika', 'maid', 'mika_meet'),
        say('fr4', 'mika', 'I was cleaning. Under there. A coin rolled, or a shell, and I thought I had six more minutes because the ferry is always late and you are early and I hit my head. I am Mika. I am twenty-three. Please do not tell the front desk.', { sprite: 'mika.maid' }),
        {
          op: 'video', id: 'fr4b', video: 'mika.meet', who: 'mika', sprite: 'mika.maid',
          fallback: 'She blinks hard, finds you still there, and the sheepish smile arrives a second late.'
        },
        say('fr5', 'mika', 'She is nice. She is also my boss. Those can be the same fact and still be bad. The turndown is done. The mint was a lie I already ate. I am so sorry. I am saying sorry with my whole spine.', { sprite: 'mika.maid' }),
        choice('fr6', 'mika', [
          { text: 'Help her up and check the bump, gently.', aff: 5, sprite: 'mika.maid', reply: 'Oh. You are being kind and I am being a disaster. That is my usual order. The bump is fine. My pride filed a complaint and then fainted.' },
          { text: 'Laugh with her, not at her.', aff: 3, sprite: 'mika.maid', reply: 'You can laugh. I already did, on the inside, very loudly, and then I hit the bed again in spirit. Hi. Sorry. Hi.' },
          { text: 'Ask her to finish the room later.', aff: 0, sprite: 'mika.maid', reply: 'Right. Guest. Room. I will exist elsewhere. Professionally. Please forget the part where I was a rug with opinions.' }
        ], { sprite: 'mika.maid' }),
        say('fr7', 'mika', 'If you need towels, call the desk. Or open the door. I will probably be in the hall pretending I was dusting the air and not listening for whether you are the sort of guest who knocks back.', { sprite: 'mika.maid' }),
        choice('fr8', 'mika', [
          { text: 'Tell her you are glad the ferry was early.', aff: 5, sprite: 'mika.maid', reply: 'Do not say it like that. I will believe you. I believe people too fast. It is a whole problem. I am going to think about your voice while I fold towels, which is terrible technique.' },
          { text: 'Offer her the spare shell you found by the door.', aff: 3, sprite: 'mika.maid', reply: 'That is not my shell. I am keeping it anyway, as evidence that I was here and you were nice and the universe is occasionally on my side.' },
          { text: 'Nod, and let her escape.', aff: 0, sprite: 'mika.maid', reply: 'I will go. Walking. Upright. No more floors. Have a good everything. I will be normal later. Probably. Do not test it.' }
        ], { sprite: 'mika.maid' }),
        say('fr9', 'narr', 'She bows, remembers a bow belongs in the lobby and not a bedroom, turns a deeper pink, and leaves with the cloth held like a bouquet. The door clicks. From the hall, very quietly: "Sorry. Again. I am going. I went."'),
        say('fr10', 'narr', 'The room settles. The ocean keeps its own schedule outside the glass. Somewhere under the bed, a coin or a shell or nothing at all has won the afternoon. You are checked in. The weekend has already started without asking permission.'),
        presence('fr11', 'mika', 2)
      ]
    },

    saturday_open: {
      id: 'saturday_open', bg: 'beach', when: 'Saturday',
      steps: [
        say('so1', 'narr', 'Saturday arrives like a dare. The shell key still works. The island has more doors than the one it opened for you, and the light is the color of a postcard that got the truth right for once.'),
        say('so2', 'narr', 'Breakfast is fruit and coffee and a note in Aurelia\'s tidy hand: Off the desk today. Try not to get lost unless you want to be found. Down the staff corridor, someone pink-haired is humming off-key and then stopping, embarrassed at her own tune.'),
        say('so3', 'narr', 'You have the day. The pool deck shines. The beach is already laughing. Under the palms, a striped lounger is occupied by somebody who does not look surprised by anything, least of all you.'),
        say('so4', 'narr', 'One afternoon will not hold all of them. Pick the light you want to stand in. The rest of the island will keep.')
      ]
    },

    pool_gate: {
      id: 'pool_gate', bg: 'pool', when: 'Saturday',
      steps: [
        say('pg1', 'narr', 'The infinity pool pretends it is the ocean and almost gets away with it. Aurelia is off duty on a lounger, gold suit, hair down, one arm folded behind her head like the sun asked for a portrait and she negotiated.'),
        say('pg2', 'narr', 'Past the deck, where the tile gives up and the sand begins, a familiar pink head is losing a fight with a beach towel and a bottle of sunscreen. Mika notices you, startles, and waves with the towel still winning.'),
        choice('pg3', 'narr', [
          { text: 'Spend the afternoon with Aurelia.', scene: 'aurelia_pool' },
          { text: 'Find Mika on the sand.', scene: 'mika_day' }
        ])
      ]
    },

    aurelia_pool: {
      id: 'aurelia_pool', who: 'aurelia', bg: 'pool', when: 'Saturday', marks: 'day',
      steps: [
        say('ap1', 'narr', 'She sees you coming and does not pretend otherwise. The name tag is gone. The posture is not. Even horizontal, Aurelia looks like she could check a guest in with one eyebrow.'),
        unlock('ap2', 'aurelia', 'pool', 'aurelia_pool'),
        say('ap3', 'aurelia', 'If you tell the front office I said the word day off, I will deny it with a smile. Sit. The lounger is too large on purpose. I dislike shouting across a nice afternoon.', { sprite: 'aurelia.pool' }),
        say('ap4', 'aurelia', 'You are staring, which I priced in when I chose this suit. Gold is a professional risk. I am off the clock, {name}, not off the habit of noticing when someone likes what they see.', { sprite: 'aurelia.pool' }),
        choice('ap5', 'aurelia', [
          { text: 'Tell her the afternoon looks designed around her.', aff: 5, sprite: 'aurelia.pool', reply: 'Flattery with good posture. Keep going. I have decided to be susceptible, just for today, and I want it on the record.' },
          { text: 'Ask how she spends a day when nobody needs a key.', aff: 3, sprite: 'aurelia.pool', reply: 'Badly, until someone interesting walks onto my deck. You are repairing my schedule. Do not look so pleased. Or do.' },
          { text: 'Talk about the view, and only the view.', aff: 0, sprite: 'aurelia.pool', reply: 'The ocean is very blue. I am also right here. We can do the scenic route if you need a minute. I have minutes. I would rather spend them.' }
        ], { sprite: 'aurelia.pool' }),
        say('ap6', 'narr', 'She shifts to make room, and the space she leaves is exactly the width of a person who has been thought about. Water ticks the tile. A gull complains. Aurelia ignores the gull with professional focus.'),
        say('ap7', 'aurelia', 'I like the way you checked in. Most people treat the desk like a counter. You treated it like a conversation. Dangerous habit. I encourage it.', { sprite: 'aurelia.pool' }),
        choice('ap8', 'aurelia', [
          { text: 'Ask if Sunday is when she stops being professional.', aff: 5, sprite: 'aurelia.pool', reply: 'Sunday is when I kiss someone if they have earned the balcony. Today I am only off duty. Try to survive the distinction. I am barely managing it.' },
          { text: 'Say you will take the scenic route, slowly.', aff: 3, sprite: 'aurelia.pool', reply: 'Slow is allowed. Staring is allowed. Cowardice is a waste of a very good suit and a better afternoon. Stay anyway.' },
          { text: 'Keep a polite distance on the lounger.', aff: 0, sprite: 'aurelia.pool', reply: 'Polite is a kind of distance. I can feel it from here. The pool will forgive you. I am still deciding, which is more than polite deserves.' }
        ], { sprite: 'aurelia.pool' }),
        say('ap9', 'narr', 'She leans in until you can smell sunscreen and lilies, and she stops a breath short of a kiss, smiling like the almost was the point of the hour. "Go see the island," she says. "Come find me when the lights change. I will not be behind a desk."'),
        say('ap10', 'aurelia', 'And {name}? If anyone asks, you were asking about towel policy. I have a reputation, and I intend to ruin it on my own schedule.', { sprite: 'aurelia.pool' }),
        presence('ap11', 'aurelia', 4)
      ]
    },

    mika_day: {
      id: 'mika_day', who: 'mika', bg: 'beach', when: 'Saturday', marks: 'day',
      steps: [
        say('md1', 'narr', 'The sand just past the pool is brighter than the brochure. Mika stands in a white ruffled suit, hair trying to leave for the horizon, both hands on a towel that has achieved sentience and malice. She sees you and makes a sound like a kettle.'),
        unlock('md2', 'mika', 'beach', 'mika_beach'),
        say('md3', 'mika', 'This is my day off. I am being a person. Persons stand on beaches and do not trip over towels. I am working on the second part. Hi. You came this way on purpose. That is new information and I need a second.', { sprite: 'mika.beach' }),
        say('md4', 'mika', 'I packed a book. The book is in my shoe so it would not get wet, which means I cannot wear the shoe, which means I am a genius. Do not look at me like I am cute. I will fall down out of spite.', { sprite: 'mika.beach' }),
        choice('md5', 'mika', [
          { text: 'Help with the towel, and stay in her sunny orbit.', aff: 5, sprite: 'mika.beach', reply: 'You are good at corners. I am good at panic. Between us we might make one functional picnic. Sit closer. I mean, if you want. I want. That is the sentence.' },
          { text: 'Tell her the day off looks like it fits.', aff: 3, sprite: 'mika.beach', reply: 'It is itchy in a nice way. Like a tag I refuse to cut off because it proves I am not on shift. You can sit. The towel voted yes. I overruled it anyway.' },
          { text: 'Stay standing, a little apart.', aff: 0, sprite: 'mika.beach', reply: 'Okay. Standing is a plan. I can stand. I have legs. They are doing their best. We can talk like two flags. This is fine. I am fine.' }
        ], { sprite: 'mika.beach' }),
        say('md6', 'narr', 'You end up on the towel anyway, because the wind files a complaint and she grabs your wrist so you will not blow away, then stares at her own hand like it forged her signature. The water is the color of glass someone was proud of.'),
        say('md7', 'mika', 'I practice conversations in the linen closet. Today\'s practice was "hello, nice weather, please do not notice that I like you." I have already failed the third clause. The weather is nice, though. I would like that on the record.', { sprite: 'mika.beach' }),
        choice('md8', 'mika', [
          { text: 'Say you noticed, and you like her too.', aff: 5, sprite: 'mika.beach', reply: 'Oh no. Okay. Good no. I am going to put my face in my hands and also stay right here. Do not take it back. I will know. I am bad at many things and not that.' },
          { text: 'Tease her, gently, about the book in the shoe.', aff: 3, sprite: 'mika.beach', reply: 'The book is a romance. Obviously. The heroine does not keep her literature in footwear. I am innovating. Stop smiling like that. No, do not stop. I changed my mind.' },
          { text: 'Change the subject to the tide.', aff: 0, sprite: 'mika.beach', reply: 'The tide is coming in. That is a fact. Facts are safe. I like you in an unsafe way and I will put that in a drawer and sit on the drawer. The tide is very punctual.' }
        ], { sprite: 'mika.beach' }),
        say('md9', 'narr', 'The afternoon loosens. She tells you about the worst guest, who asked for seventeen towels and a seagull divorce, and about the best guest, who she refuses to admit is you until she admits it and then hides in her hair. The sun slips. Lanterns wake up along the coast road.'),
        say('md10', 'mika', 'The night market opens when the sky goes juice-colored. I get nervous alone. I also want grilled pineapple and to show you the good stall, the one that does not yell. Come with me. That was brave. I am going to be brave again if you say yes, and also if you say no, but worse.', { sprite: 'mika.beach' }),
        choice('md11', 'mika', [
          { text: 'Offer her your arm for the walk into town.', aff: 5, sprite: 'mika.beach', reply: 'An arm. I have seen arms. I have not been offered one like a person in a song. I will take it. If I trip, we are going down as a team, which is romantic, medically speaking.' },
          { text: 'Say you wanted to see the market anyway, with her.', aff: 3, sprite: 'mika.beach', reply: 'With me is the important half of that sentence. I am keeping it. Let me find my shoe. The book can stay. It has had enough plot for one day.' },
          { text: 'Hesitate, then go because she asked.', aff: 0, sprite: 'mika.beach', reply: 'Hesitation noted, attendance appreciated. I will not make it weird. I will make it a little weird. It is my craft. Pineapple. Walking. No more speeches. One more speech. Thank you.' }
        ], { sprite: 'mika.beach' }),
        say('md12', 'narr', 'Town is paper lanterns, sweet smoke, and a cobbled lane that shines like it has been polished by a hundred good evenings. Mika has changed into a floral sundress and a little purse she holds like it might escape. She looks back to be sure you are real.'),
        unlock('md13', 'mika', 'market', 'mika_market'),
        say('md14', 'mika', 'This one. The pineapple. And the one with the terrible pun on the sign, we skip that one, he knows my name and uses this power for evil. Stay where I can see you. I get brave and then I get lost. Sometimes both.', { sprite: 'mika.market' }),
        {
          op: 'video', id: 'md14b', video: 'mika.market', who: 'mika', sprite: 'mika.market',
          fallback: 'She looks back over her shoulder, hair lifting, and the wink is so quick she might deny it.'
        },
        choice('md15', 'mika', [
          { text: 'Buy the pineapple and share it from one stick.', aff: 5, sprite: 'mika.market', reply: 'Sharing is a trap and I am in it. You have sugar on your thumb. I am going to think about that the whole walk home and pretend I am thinking about fruit.' },
          { text: 'Let her lead, and tell her the dress was worth the wait.', aff: 3, sprite: 'mika.market', reply: 'I changed three times. The first two were cowardice with sleeves. This one is me deciding you could look. You are looking. I did the math and the math was you.' },
          { text: 'Keep the evening light and polite.', aff: 0, sprite: 'mika.market', reply: 'Polite is nice. Polite is also a door I do not know how to knock on. I will knock anyway, later, when I have more pineapple and fewer witnesses.' }
        ], { sprite: 'mika.market' }),
        say('md16', 'narr', 'You walk back along the water with the lanterns behind you and her shoulder finding yours every few steps, as if by accident, as if by a plan she is too shy to file. At the resort path she stops, folds her hands, and unfolds them.'),
        say('md17', 'mika', 'Today was my favorite shift, and I was not on shift. If I dream about the towel, ignore that. If I dream about you, that is classified. Good night, {name}. I will try not to be under any furniture when you get back.', { sprite: 'mika.market' }),
        presence('md18', 'mika', 6)
      ]
    },

    celeste_day: {
      id: 'celeste_day', who: 'celeste', bg: 'beach', when: 'Saturday', marks: 'day',
      steps: [
        say('cd1', 'narr', 'The beach is a bright argument the ocean is winning, happily. A guest with sun in her hair and both arms in the air waves like she is signaling a ship. The ship is you. She has already decided.'),
        unlock('cd2', 'celeste', 'beach', 'celeste_beach'),
        say('cd3', 'celeste', 'Yes! You! I have been saving this stretch of water and it is rude to keep a stretch waiting. I am Celeste. Twenty-four. I surf, I run, I make friends at a volume the resort has asked me to consider. I considered it. No.', { sprite: 'celeste.beach' }),
        say('cd4', 'celeste', 'You have weekend written all over you. Weekend is my favorite sport. I am on a break from a break. Come closer, the sand is not going to introduce us and I already started without it.', { sprite: 'celeste.beach' }),
        choice('cd5', 'celeste', [
          { text: 'Jog down into her splash and match her grin.', aff: 5, sprite: 'celeste.beach', reply: 'There you are! I knew your knees could do that. Team Celeste just drafted you. The ocean already voted yes. I voted louder.' },
          { text: 'Wave back and ask if she teaches beginners.', aff: 3, sprite: 'celeste.beach', reply: 'I teach enthusiasm. Balance is a rumor we chase. You will be great, or you will be hilarious, and I like both with my whole chest. Come on.' },
          { text: 'Stay up on the dry sand.', aff: 0, sprite: 'celeste.beach', reply: 'Dry sand is a valid lifestyle. It is also a waste of a perfectly good dare. I will come to you. See? Compromise. I am growing. The tide is not.' }
        ], { sprite: 'celeste.beach' }),
        say('cd6', 'narr', 'She talks the way other people run, easy and glad to be tired later. A white board is planted in the sand like a flag. She spins it up onto her hip and the water applauds in small crashes. Her blue suit is practical and also, clearly, a choice.'),
        unlock('cd7', 'celeste', 'surf', 'celeste_surf'),
        say('cd8', 'celeste', 'Rule one, you do not have to stand. Rule two, if you fall, fall toward the fun. Rule three, I am going to show off a little and you are going to pretend it is instruction. Ready, {name}? Say ready. It helps my nerves, which I hide in shouting.', { sprite: 'celeste.surf' }),
        {
          op: 'video', id: 'cd8b', video: 'celeste.surf', who: 'celeste', sprite: 'celeste.surf',
          fallback: 'She smiles, blinks, and lets the wet hair blow across the grin.'
        },
        choice('cd9', 'celeste', [
          { text: 'Say ready, and mean it.', aff: 5, sprite: 'celeste.surf', reply: 'Ready is my favorite word in your mouth. Again later, in a different context, if the weekend goes my way. Paddle! I will be the loud one behind you, which is always.' },
          { text: 'Admit you might fall, and go anyway.', aff: 3, sprite: 'celeste.surf', reply: 'Falling is just surfing with extra steps. I fall on purpose sometimes so nobody feels lonely about it. Not today. Today I want you to see me fly a little. Watch my hands, then my face. Mostly my face.' },
          { text: 'Offer to watch from the shore.', aff: 0, sprite: 'celeste.surf', reply: 'Audience is a job. I accept your application and I am also going to drag you in up to the knees, because watching is nicer when you are glittering. Terms and conditions.' }
        ], { sprite: 'celeste.surf' }),
        say('cd10', 'narr', 'The next hour is salt, shouting, and her laugh every time the board wins. She is good. She is also showing off for an audience of one, and she checks, between waves, that the audience is still you. It is.'),
        say('cd11', 'celeste', 'You did not drown and you did not flee. That is a perfect score. I am keeping you for the evening roster if the evening roster wants you. There is a bonfire when the sky goes navy. I save a blanket. I am saying that like a casual athlete and not like a person with a plan.', { sprite: 'celeste.surf' }),
        choice('cd12', 'celeste', [
          { text: 'Tell her to save the blanket with your name on it.', aff: 5, sprite: 'celeste.surf', reply: 'Name written. In my head, in huge letters, with a heart I will deny if asked and confirm if kissed. Later. Race you to the showers. Loser carries the board. I never lose. Except on purpose, starting now.' },
          { text: 'Say the bonfire sounds like the right kind of tired.', aff: 3, sprite: 'celeste.surf', reply: 'Right kind of tired is my love language, next to snacks and people who paddle back out. I will look for you. I look obvious. It is part of the brand.' },
          { text: 'Say you might turn in early.', aff: 0, sprite: 'celeste.surf', reply: 'Early is a tragedy I will allow and then complain about, cheerfully, to the fire. If you change your mind, the blanket is the blue one. I am the loud one. You cannot miss either of us.' }
        ], { sprite: 'celeste.surf' }),
        say('cd13', 'narr', 'She bumps your shoulder with hers on the walk up, a full-body punctuation mark, and peels off toward the outdoor showers still talking. The beach keeps her outline for a second in the glare. Your arms feel used in a way you do not mind. The day is brighter than when it started.'),
        presence('cd14', 'celeste', 6)
      ]
    },

    sable_day: {
      id: 'sable_day', who: 'sable', bg: 'beach', when: 'Saturday', marks: 'day',
      steps: [
        say('sd1', 'narr', 'Under the palms the light goes striped. A woman with wet black hair and a red suit has claimed the lounger, one knee up, sunglasses nowhere yet because she wants you to see her eyes do the work. She looks you over like a menu she already intends to order from.'),
        unlock('sd2', 'sable', 'palms', 'sable_palms'),
        say('sd3', 'sable', 'You found the good shade. Most people walk past it on their way to being busy. I am Sable. Twenty-seven. I am on nobody\'s schedule, including the resort\'s, which has learned to live with the disappointment.', { sprite: 'sable.palms' }),
        {
          op: 'video', id: 'sd3b', video: 'sable.palms', who: 'sable', sprite: 'sable.palms',
          fallback: 'She looks up through her lashes, lets you hold the look, and the smirk arrives right on time.'
        },
        say('sd4', 'sable', 'Sit. The chair was waiting. So was I, if we are telling the truth, and I prefer the truth. It saves the afternoon for better games than small talk. You can still have small talk. I will make it expensive.', { sprite: 'sable.palms' }),
        choice('sd5', 'sable', [
          { text: 'Sit close enough that she has to mean it.', aff: 5, sprite: 'sable.palms', reply: 'There. Honesty looks good in this light. You may keep looking. I wore this so the looking would have somewhere useful to land.' },
          { text: 'Ask what the better games are.', aff: 3, sprite: 'sable.palms', reply: 'Speed. Attention. A jet ski I do not lend. And the game where you pretend you are only here for the shade while I pretend to believe you. I am losing on purpose.' },
          { text: 'Stay at the edge of the shade.', aff: 0, sprite: 'sable.palms', reply: 'Edge of the shade is still my shade. Brave, in a cautious way. I can work with cautious. I just do not intend to stay there with you.' }
        ], { sprite: 'sable.palms' }),
        say('sd6', 'narr', 'She talks low, unhurried, about nothing that matters and everything that does: which bartender waters the drinks, which path avoids the wedding photos, which hour of the day she likes a person best. She is looking at you during that last one. She does not blink it away.'),
        say('sd7', 'sable', 'I keep a jet ski past the rocks. Fast, loud, and no room for pretending you do not want to hold on. Come for a loop. If you hate it, I will bring you back and only tease you for a year.', { sprite: 'sable.palms' }),
        unlock('sd8', 'sable', 'jetski', 'sable_jetski'),
        say('sd9', 'narr', 'The ski is silver and impatient. Sable takes the front as if the ocean asked her to drive and she agreed on her terms. Spray climbs. The island shrinks into a green sentence. She glances back, hair a black flag, and tips her chin at the grip.'),
        say('sd10', 'sable', 'Hands on the grips, or around my waist if you want to stay aboard. I am going to open it up, {name}. Hold on like you mean to arrive with me.', { sprite: 'sable.jetski' }),
        {
          op: 'video', id: 'sd10b', video: 'sable.jetski', who: 'sable', sprite: 'sable.jetski',
          fallback: 'She looks back with a close-mouthed smile, hair a black flag in the wind.'
        },
        choice('sd11', 'sable', [
          { text: 'Hold on, close, and tell her not to spare you.', aff: 5, sprite: 'sable.jetski', reply: 'Good. I hate spare. Keep that grip. If you laugh, I will go faster. If you swear, I will go faster. I am consistent. So is the sea. We are not.' },
          { text: 'Hold on, and ask her to show you the pretty line first.', aff: 3, sprite: 'sable.jetski', reply: 'Pretty first, wicked after. I respect a person with a sequence. Watch the cove. Then watch me. The cove will still be there. I am the view that moves.' },
          { text: 'Ask her to keep it gentle.', aff: 0, sprite: 'sable.jetski', reply: 'Gentle is available. It is not what you came down the path for, but I can be generous. Hands stay. I still like the way you listen. Do it closer.' }
        ], { sprite: 'sable.jetski' }),
        say('sd12', 'narr', 'Wind takes the rest of the conversation. What is left is her shoulder under your chin when the turn sharpens, the red strap of her suit against the sun, and a laugh she does not bother to hide. She brings you back in a wide arc, slower at the end, as if the dock is a secret she is willing to share.'),
        choice('sd13', 'sable', [
          { text: 'Tell her you want the evening version of that ride.', aff: 5, sprite: 'sable.jetski', reply: 'Evening version does not need an engine. Tiki bar, sunset, my stool. If you sit with someone else I will live, and I will also make you regret the upholstery. Come find me.' },
          { text: 'Say the cove was worth the grip.', aff: 3, sprite: 'sable.jetski', reply: 'The cove is fine. The grip is what I will replay. You can buy me a drink later and pretend it is about the view. I will let you pretend for one sip.' },
          { text: 'Thank her for the lift and leave it there.', aff: 0, sprite: 'sable.jetski', reply: 'Polite landing. Cute. The bar is there if your courage catches up with your hands. They were ahead of you today. I liked them.' }
        ], { sprite: 'sable.jetski' }),
        say('sd14', 'narr', 'She kills the engine and the world gets loud with ordinary water again. Sable stays seated a moment longer than she needs to, looking at you over her shoulder, pleased and not humble about it. Then she hops to the dock and walks up the sand without checking whether you follow. She does not have to.'),
        presence('sd15', 'sable', 6)
      ]
    },

    dusk_open: {
      id: 'dusk_open', bg: 'night', when: 'Saturday night',
      steps: [
        say('do1', 'narr', 'Dusk folds the island along the waterline. The pool goes dark. The path lights wake up one by one, small moons somebody planted for people who are not ready to be indoors.'),
        say('do2', 'narr', 'Two invitations are still open, whether or not anyone wrote them down. The tiki bar is a thatched laugh at the end of the sand, bottles glowing, sunset doing indecent work on the tide. Down the other way, a bonfire is already talking to itself.'),
        say('do3', 'narr', 'You smell citrus, smoke, and salt. The weekend is halfway gone and not sorry. Pick the dark you want to stand in.')
      ]
    },

    tiki_gate: {
      id: 'tiki_gate', bg: 'tiki', when: 'Saturday night',
      steps: [
        say('tg1', 'narr', 'The tiki bar has no walls worth mentioning. String lights do the work of a roof. Aurelia is there in a gold slip of a dress, a champagne glass in one hand, the desk finally someone else\'s problem. She looks relieved and dangerous in equal amounts.'),
        say('tg2', 'narr', 'At the rail, Sable has sunglasses pushed into her hair and the same red suit, as if night were a suggestion. She catches your eye and pats the stool beside her, unhurried, certain you saw it. Both of them did.'),
        choice('tg3', 'narr', [
          { text: 'Sit with Aurelia at the bar.', scene: 'aurelia_night' },
          { text: 'Go to Sable.', scene: 'sable_night' }
        ])
      ]
    },

    aurelia_night: {
      id: 'aurelia_night', who: 'aurelia', bg: 'tiki', when: 'Saturday night', marks: 'night',
      steps: [
        say('an1', 'narr', 'She turns the neighboring stool with her ankle, a small competent magic, and waits. Up close the dress is the color of the last good light on the water. The glass sweats. So, quietly, do you.'),
        unlock('an2', 'aurelia', 'cocktail', 'aurelia_cocktail'),
        say('an3', 'aurelia', 'I told them I was taking the evening for research. The research is whether you would come. Early results are promising. Sit, {name}. The sunset is officially off duty, which makes two of us.', { sprite: 'aurelia.cocktail' }),
        {
          op: 'video', id: 'an3b', video: 'aurelia.tiki', who: 'aurelia', sprite: 'aurelia.cocktail',
          fallback: 'She laughs, bright as the string lights, and glances sideways as if the sunset were in on it.'
        },
        say('an4', 'aurelia', 'I spent all day not texting the front desk to ask where you were. Growth. You may reward it with attention, a story, or the truth about who you thought about between breakfast and now. I can survive any of the three. I have preferences.', { sprite: 'aurelia.cocktail' }),
        choice('an5', 'aurelia', [
          { text: 'Tell her the afternoon kept turning into her.', aff: 5, sprite: 'aurelia.cocktail', reply: 'Good. I dislike being a detour. Come here, closer than the stool was built for. I will not kiss you over a bar. I want a door, a moon, and no audience. Tomorrow.' },
          { text: 'Ask what she drinks when nobody is ordering.', aff: 3, sprite: 'aurelia.cocktail', reply: 'This, slowly, and then water, because I intend to remember the way you look in this light. Flirting is better when I can quote it in the morning.' },
          { text: 'Keep the talk light, about the bar.', aff: 0, sprite: 'aurelia.cocktail', reply: 'The bar is charming. I am more so. We can discuss citrus for as long as you need. I am patient. I am also not blind, and you did sit down.' }
        ], { sprite: 'aurelia.cocktail' }),
        say('an6', 'narr', 'Music from somewhere with a worse roof drifts over the sand. Aurelia listens with her head tipped, then hooks one finger in the air between you, not quite touching, close enough that the not-touching is the touch.'),
        say('an7', 'aurelia', 'I am good at rooms. Lobbies, desks, the correct distance. I am less interested in the correct distance tonight. If you walk me as far as the path and no farther, I will still call it a win. I would like a larger win. I am saying so while I still have a professional vocabulary left.', { sprite: 'aurelia.cocktail' }),
        choice('an8', 'aurelia', [
          { text: 'Walk her as far as she wants, and say so.', aff: 5, sprite: 'aurelia.cocktail', reply: 'Careful. I want the balcony, your name said properly, and the kind of kiss that ends the sentence. Not here. I want to want it until Sunday and then stop wanting and start having. Stay in that future with me.' },
          { text: 'Tell her the correct distance can retire.', aff: 3, sprite: 'aurelia.cocktail', reply: 'Retirement party of one rule. I accept. Finish your drink. Look at me while you do it. There. That is already better customer service than I am supposed to give.' },
          { text: 'Offer to see her to the lobby, properly.', aff: 0, sprite: 'aurelia.cocktail', reply: 'Properly is a sweet little cage. I will walk in it for one path, because you asked nicely, and I will spend the walk thinking about the door I would rather open. You may join that thought whenever you are ready.' }
        ], { sprite: 'aurelia.cocktail' }),
        say('an9', 'narr', 'She finishes the glass and leaves it squared to the bar, a last bit of desk in her. On the path her hand finds the inside of your elbow, light, exact, and she does not kiss you. She lets the not-kissing stand between you like a promise with good posture.'),
        say('an10', 'aurelia', 'Sunday. West balcony, after the resort pretends to sleep. Wear whatever makes you brave. I will wear the gold again, and less of my job. Good night, {name}. Try to dream in a way I would approve of. I have standards. You are meeting them.', { sprite: 'aurelia.cocktail' }),
        presence('an11', 'aurelia', 4)
      ]
    },

    sable_night: {
      id: 'sable_night', who: 'sable', bg: 'tiki', when: 'Saturday night', marks: 'night',
      steps: [
        say('sn1', 'narr', 'Sable does not wave. She shifts her weight along the rail so the space beside her becomes a fact. The sunset is doing its best behind her and losing. Sunglasses sit in her hair like she might need them for a sun that has already given up.'),
        unlock('sn2', 'sable', 'tiki', 'sable_tiki'),
        say('sn3', 'sable', 'You chose the interesting stool. I respect a person who can read a room, especially when I am the room. Drink whatever you like. I am drinking the view, and then I am drinking you in, which is tacky of me and also accurate.', { sprite: 'sable.tiki' }),
        say('sn4', 'sable', 'Daylight was the jet ski. This is the part with less wind and more honesty. If you are shy, say so. I like shy when it is honest. I do not like shy worn as a costume. You do not look costumed. You look interested, and you are trying to be polite about it.', { sprite: 'sable.tiki' }),
        choice('sn5', 'sable', [
          { text: 'Tell her the daylight grip has not worn off.', aff: 5, sprite: 'sable.tiki', reply: 'Good. I was going to be offended if you treated the sea like a one-time stunt. Come closer. The rail is a suggestion. My hip is a better landmark.' },
          { text: 'Ask what she does when the bar closes.', aff: 3, sprite: 'sable.tiki', reply: 'I find a pool the resort thinks is locked, and I sit in the steam until my thoughts behave. Tomorrow I might want company in that crime. Tonight I want you to stand here and mean it.' },
          { text: 'Order something simple and keep your distance.', aff: 0, sprite: 'sable.tiki', reply: 'Simple is allowed. Distance is boring, and you are not, which is why the distance will lose. I can wait one drink. I do not wait two.' }
        ], { sprite: 'sable.tiki' }),
        say('sn6', 'narr', 'She talks about the island the way some people talk about a lover they have already decided to keep: fond, a little cruel, entirely sure. When she laughs, she tips her face toward you so you get the laugh first and the bar second.'),
        say('sn7', 'sable', 'I am not a riddle, {name}. I am a woman at a bar who likes the way you look at her and intends to do something about it when there is less of an audience. If that scares you, good. If it does not, better. Either way, do not look away while I am being this clear.', { sprite: 'sable.tiki' }),
        choice('sn8', 'sable', [
          { text: 'Hold her gaze and say you will be there tomorrow.', aff: 5, sprite: 'sable.tiki', reply: 'Tomorrow, the closed pool, after dark. I will not send a map. If you want me, you will find the steam. Kiss me then, not as a maybe. I dislike maybes. I like you. That is the whole brief.' },
          { text: 'Say you like her clear, and you are still catching up.', aff: 3, sprite: 'sable.tiki', reply: 'Catch up. I am a good view and a poor habit of waiting. One night of it, for you. Then I want the lights low, your attention close, and a kiss that is not a performance for the bar. I am not careless. I am certain.' },
          { text: 'Smile, and let the moment stay unfinished.', aff: 0, sprite: 'sable.tiki', reply: 'Unfinished is a style. It is not mine. I will leave the door unlocked in the only way I know how: I will be there, and if you are not, I will swim anyway and think of your hands on the grip. Your loss. Maybe mine too.' }
        ], { sprite: 'sable.tiki' }),
        say('sn9', 'narr', 'She finishes her drink without rushing, sets the glass down where the bartender will see it, and brushes two fingers along your wrist on her way past. It is not an accident. She does not do accidents. The string lights buzz. The ocean takes the sun the rest of the way down.'),
        say('sn10', 'sable', 'Sleep if you can. I do not plan to be forgettable. And {name}? Wear something you can stand to have remembered. I remember everything I decide to keep.', { sprite: 'sable.tiki' }),
        presence('sn11', 'sable', 4)
      ]
    },

    celeste_night: {
      id: 'celeste_night', who: 'celeste', bg: 'night', when: 'Saturday night', marks: 'night',
      steps: [
        say('cn1', 'narr', 'The night beach is a different country from the one you swam in. Palms are black cutouts. The moon has put a road on the water. A bonfire snaps inside a ring of stones, and Celeste is on a blanket in a blue crop top and soft shorts, sparks in her hair, already grinning like you are the second half of a joke she likes.'),
        unlock('cn2', 'celeste', 'bonfire', 'celeste_bonfire'),
        say('cn3', 'celeste', 'You came! I told the fire you would, and it did a little pop, which I am counting as science. Sit. The blanket is clean. I am not. I smell like smoke and victory and a little like the sunscreen I missed, behind my ear, you may not look for it yet.', { sprite: 'celeste.bonfire' }),
        {
          op: 'video', id: 'cn3b', video: 'celeste.bonfire', who: 'celeste', sprite: 'celeste.bonfire',
          fallback: 'Firelight finds her smile, and she blows you a kiss like it is the easiest thing she has done all day.'
        },
        say('cn4', 'celeste', 'Daytime me is cardio. Nighttime me is still cardio, but the feelings kind. I get loud when I mean something. I mean I had a really good day with you, {name}, and I want a really good night that does not end in me chickening out. So. Hi. Officially.', { sprite: 'celeste.bonfire' }),
        choice('cn5', 'celeste', [
          { text: 'Sit close and say the day was your favorite too.', aff: 5, sprite: 'celeste.bonfire', reply: 'Favorite! I am going to do a small victory lap in my soul. Shoulder. Give me shoulder. There. We are a team blanket now. The fire is jealous. It can cope.' },
          { text: 'Ask what nighttime cardio for feelings looks like.', aff: 3, sprite: 'celeste.bonfire', reply: 'Talking until the truth falls out, then maybe a kiss if the truth is nice, then the stars, then me pretending I am chill about the kiss, which I will not be. Chill is not in my training plan.' },
          { text: 'Sit on the other corner of the blanket.', aff: 0, sprite: 'celeste.bonfire', reply: 'Far corner. Okay. I will stretch. I am very good at stretching toward things I want. Watch me be subtle. I am not subtle. This is me scooting. Alert the press.' }
        ], { sprite: 'celeste.bonfire' }),
        say('cn6', 'narr', 'The fire settles into a working glow. She tells you about a wave she still dreams about and a race she lost on purpose so a kid would win, then admits she has never lost on purpose to an adult and is not starting with you. Her knee finds yours and stays, warm from the fire and from her.'),
        say('cn7', 'celeste', 'Tomorrow the tide goes way out. It is pretty in a way I do not have a joke for. I want to show you, and I want to kiss you before I lose my nerve and challenge you to sprints instead. Sprints are my backup flirting. You should know the competition.', { sprite: 'celeste.bonfire' }),
        choice('cn8', 'celeste', [
          { text: 'Tell her to save the kiss for the starlight, and you will be there.', aff: 5, sprite: 'celeste.bonfire', reply: 'Starlight. Low tide. You, me, no sprinting unless the kiss goes so well I have to run around. Deal. I am going to be unbearable about this until then. Starting now. Yay.' },
          { text: 'Say her backup flirting is cute, and her first plan is better.', aff: 3, sprite: 'celeste.bonfire', reply: 'First plan is the kiss. Backup is athletics. You picked the final. I could float. I will not, because the fire would gossip. Hold my hand on the walk back so I do not sprint from joy.' },
          { text: 'Say the fire is enough for tonight.', aff: 0, sprite: 'celeste.bonfire', reply: 'Enough is a full plate. I can live with full. I would rather live with more, and I will ask again when the sky is bigger. If you say no then, I will still high-five you, and I will mean the high-five. I will also mope, athletically.' }
        ], { sprite: 'celeste.bonfire' }),
        say('cn9', 'narr', 'You stay until the fire is a red thought and the moon is high enough to trip over. Celeste walks you back barefoot, swinging her shoes, bumping you on purpose every ten steps and apologizing none of the times. At the path she bounces once, like a start line.'),
        say('cn10', 'celeste', 'Sunday. Low tide. I will be the bright thing on the blanket that is not a star. If you kiss me, {name}, do it like you are glad, because I am going to be so glad I might yell. Fair warning. Sweet dreams. Dream of waves. Dream of me. Both is allowed and encouraged.', { sprite: 'celeste.bonfire' }),
        presence('cn11', 'celeste', 4)
      ]
    }
  };

  function endingChoice(id, who, sprite) {
    return choice(id, who, [
      { text: 'Close the last inch yourself.', aff: 0, sprite: sprite, reply: 'You do. The weekend narrows to her mouth, her hands, and the dark that is about to be kind.' },
      { text: 'Ask her to say it once, plainly, then kiss her.', aff: 0, sprite: sprite, reply: 'She says your name like a decision. The kiss that follows is not a maybe.' },
      { text: 'Admit you are nervous, and stay.', aff: 0, sprite: sprite, reply: 'Nerves and all, you stay. She is gentle for one breath and certain for the rest.' }
    ], { sprite: sprite });
  }

  const ENDINGS = {
    aurelia: {
      id: 'ending_aurelia', who: 'aurelia', bg: 'night', when: 'Sunday',
      steps: [
        say('ea1', 'narr', 'Sunday evening, the resort practices being asleep. The west balcony holds a moon, two lanterns, and Aurelia in gold, hands on the stone, hair down, the job finally set on a chair inside.'),
        unlock('ea2', 'aurelia', 'evening'),
        say('ea3', 'aurelia', 'You came. I would have waited past sensible and then past proud. I am glad I do not have to. The key in your pocket can keep working. I would like the rest of you to keep working here too.', { sprite: 'aurelia.evening' }),
        {
          op: 'branch', id: 'ea4', who: 'aurelia', below: 16, sprite: 'aurelia.evening',
          high: { text: 'You kept finding me. I kept letting you. That is the whole romance, {name}, and I am done pretending it is a service standard. Come here.', sprite: 'aurelia.evening' },
          low: { text: 'You were careful all weekend. I noticed. I am done being careful for both of us. The balcony is off the record. So is this. Come here anyway.', sprite: 'aurelia.evening' }
        },
        endingChoice('ea5', 'aurelia', 'aurelia.evening'),
        say('ea7', 'narr', 'Aurelia kisses you. It is slow, and sure, and her fingers curl at your waist as the balcony, the moon, and the rest of the night fade to black.', { sprite: 'aurelia.evening', fade: true }),
        say('ea8', 'narr', 'Sunday morning finds the ferry optional. Coffee waits. The shell key is still yours. So is the woman who gave it to you, now that the desk is someone else\'s and the light is for the two of you.', { bg: 'beach' }),
        unlock('ea9', 'aurelia', 'evening', 'end_aurelia')
      ]
    },
    mika: {
      id: 'ending_mika', who: 'mika', bg: 'night', when: 'Sunday',
      steps: [
        say('em1', 'narr', 'Sunday night, the market lanterns are lit again and the loud stalls have gone home. Under a quiet canopy of white curtains and paper light, Mika sits in her floral dress, shoes off, hands folded and then unfolded and then given up on.'),
        unlock('em2', 'mika', 'evening'),
        say('em3', 'mika', 'I saved the seat that faces the nothing view, because the something view is me, and I am trying to say that without combusting. You can sit. You should sit. I practiced this and then I forgot every word except your name.', { sprite: 'mika.evening' }),
        {
          op: 'branch', id: 'em4', who: 'mika', below: 16, sprite: 'mika.evening',
          high: { text: 'I like you. Present tense, no towel, no apology. I mean, one apology, for how long it took me to say it out loud. Okay. Said. Please do something about it before I hide in the curtains.', sprite: 'mika.evening' },
          low: { text: 'You were so polite I nearly gave up. Then I decided polite is not the same as no. I like you anyway. If I am wrong I will fall into the sea and become a cautionary lantern. If I am right, stay.', sprite: 'mika.evening' }
        },
        endingChoice('em5', 'mika', 'mika.evening'),
        say('em7', 'narr', 'Mika kisses you. It is soft, a little shaky, and then not shaky at all. Her hands stay on your shoulders as the lanterns blur and the night fades to black.', { sprite: 'mika.evening', fade: true }),
        say('em8', 'narr', 'Monday is a rumor. She is off shift, barefoot, and done apologizing for wanting you beside her. The good stall will be there tomorrow. So will she, if you are.', { bg: 'beach' }),
        unlock('em9', 'mika', 'evening', 'end_mika')
      ]
    },
    celeste: {
      id: 'ending_celeste', who: 'celeste', bg: 'night', when: 'Sunday',
      steps: [
        say('ec1', 'narr', 'Low tide has pulled the ocean back like a blanket. The stars are showing off. Celeste is on the same blue blanket, hair loose, the fire a memory down the beach, her smile smaller than usual and somehow brighter.'),
        unlock('ec2', 'celeste', 'evening'),
        say('ec3', 'celeste', 'I did not sprint. I want that in the notes. I walked here like a person with a plan and a heartbeat doing parkour. You showed up. That is my favorite result of any race, and we were not even racing. Hi.', { sprite: 'celeste.evening' }),
        {
          op: 'branch', id: 'ec4', who: 'celeste', below: 16, sprite: 'celeste.evening',
          high: { text: 'I like you at volume. The ocean already knows. You should know too, {name}, before I challenge the moon to a duel for dramatic reasons. Kiss me. I am asking in letters you can hear.', sprite: 'celeste.evening' },
          low: { text: 'You played it cool. I do not own cool. I own this blanket and a very obvious crush, and I am spending both. If you want to leave, the tide will walk you out. If you want to stay, I am the brighter option. Kiss me or high-five me. I am hoping against the high-five.', sprite: 'celeste.evening' }
        },
        endingChoice('ec5', 'celeste', 'celeste.evening'),
        say('ec7', 'narr', 'Celeste kisses you, bright and sure, a happy sound caught between your mouths. The stars wheel, the tide stays out, and the rest of the night fades to black.', { sprite: 'celeste.evening', fade: true }),
        say('ec8', 'narr', 'Morning will be fruit, two boards, and a ferry that can leave without a legend. She is already planning the race after breakfast. The kiss, she says, does not count as a warmup. It counts as everything else.', { bg: 'beach' }),
        unlock('ec9', 'celeste', 'evening', 'end_celeste')
      ]
    },
    sable: {
      id: 'ending_sable', who: 'sable', bg: 'night', when: 'Sunday',
      steps: [
        say('es1', 'narr', 'The sign on the garden pool says closed. Steam does not care. Lanterns burn low along the rocks. Sable sits at the edge in that red suit, hair a dark river, feet in the water, looking up like she heard you decide a long time ago.'),
        unlock('es2', 'sable', 'evening'),
        say('es3', 'sable', 'You found the steam. Good. I do not reward almosts after sunset. Come down here. The water is warm, my patience is not, and I have spent a whole weekend being clearer than this island deserves.', { sprite: 'sable.evening' }),
        {
          op: 'branch', id: 'es4', who: 'sable', below: 16, sprite: 'sable.evening',
          high: { text: 'You kept up. I noticed every time. I do not say this twice, {name}, so listen while my voice is still lazy. I want you here. Not for another lap. For a kiss, and for the Sunday that follows it.', sprite: 'sable.evening' },
          low: { text: 'You held back. Cute, for a minute. The minute is over. I am not going to beg, and I am not going to pretend I do not want your mouth on mine. Stay, or go disappoint a perfectly good night. I think you will stay.', sprite: 'sable.evening' }
        },
        endingChoice('es5', 'sable', 'sable.evening'),
        say('es7', 'narr', 'Sable kisses you. It is deep, unhurried, and entirely sure. Her hand stays at your jaw as the lanterns smear into gold and the night fades to black.', { sprite: 'sable.evening', fade: true }),
        say('es8', 'narr', 'The pool opens to the public whenever the public is ready. The two of you are not in a hurry to be the public. Sunday can start when she says so. She says so against your shoulder, pleased, and not humble about it.', { bg: 'night' }),
        unlock('es9', 'sable', 'evening', 'end_sable')
      ]
    }
  };

  const CARDS = {
    aurelia: {
      kicker: 'AURELIA',
      title: 'The Key Stays Out',
      text: 'You do not take the afternoon ferry. Aurelia leaves the desk to someone else and meets you with coffee, the shell key still warm in your pocket. The island keeps both your names.'
    },
    mika: {
      kicker: 'MIKA',
      title: 'Lanterns for Two',
      text: 'Monday can wait. Mika is off shift and done apologizing for wanting you there. She saved you the seat with the better view, which is her, lantern-lit and finally sure.'
    },
    celeste: {
      kicker: 'CELESTE',
      title: 'Stay Through Sunday',
      text: 'Low tide, two boards, and a race after breakfast. Celeste kisses your cheek like it is part of the sport and tells the ferry to leave without a legend. She is keeping you for the next heat.'
    },
    sable: {
      kicker: 'SABLE',
      title: 'The Pool After Dark',
      text: 'The sign still says closed. Sable still does not care. Steam, red suit, and a Sunday that starts when the two of you decide to be seen. She intends to take her time being seen with you.'
    }
  };

  const BONUS_AFF = 16;
  const BONUS = {
    aurelia: {
      id: 'bonus_aurelia', who: 'aurelia', bg: 'night', when: 'Sunday',
      steps: [
        say('ba1', 'narr', 'Before the balcony lets the night go, Aurelia keeps one look back for herself. The lantern is behind her. The job is not in the room.'),
        say('ba2', 'aurelia', 'That was the kiss. This is the part I do not put in a file. Stay in it with me for one more breath, {name}.', { sprite: 'aurelia.evening' }),
        { op: 'video', id: 'ba3', video: 'aurelia.smile', who: 'aurelia', sprite: 'aurelia.evening', fallback: 'She smiles, winks, and tips her head, already sure of the morning.' },
        unlock('ba4', 'aurelia', 'evening', 'aurelia_smile')
      ]
    },
    mika: {
      id: 'bonus_mika', who: 'mika', bg: 'night', when: 'Sunday',
      steps: [
        say('bm1', 'narr', 'The market is almost dark. Mika finds the last lit stall anyway, floral dress, bare feet, and a smile she does not apologize for.'),
        say('bm2', 'mika', 'One more wink. Then I will be brave at the dock without hiding in a curtain. Watch this one, {name}. It is yours.', { sprite: 'mika.market' }),
        { op: 'video', id: 'bm3', video: 'mika.market', who: 'mika', sprite: 'mika.market', fallback: 'Lantern light, her hair in the breeze, a smile and a wink meant only for you.' },
        unlock('bm4', 'mika', 'market', 'mika_market')
      ]
    },
    celeste: {
      id: 'bonus_celeste', who: 'celeste', bg: 'night', when: 'Sunday',
      steps: [
        say('bc1', 'narr', 'The tide is still out. Celeste is still on the blanket, and the laugh she has been holding arrives all at once.'),
        say('bc2', 'celeste', 'Bonus heat. No trophy, no ferry, just you and the ridiculous fact that I like you this much. Do not blink.', { sprite: 'celeste.evening' }),
        { op: 'video', id: 'bc3', video: 'celeste.laugh', who: 'celeste', sprite: 'celeste.evening', fallback: 'She laughs, bright as the stars, and does not look away.' },
        unlock('bc4', 'celeste', 'evening', 'celeste_surf')
      ]
    },
    sable: {
      id: 'bonus_sable', who: 'sable', bg: 'palms', when: 'Sunday',
      steps: [
        say('bs1', 'narr', 'Before the dock, she takes you back under the striped shade. Sunglasses up. The red suit. No audience she cares about.'),
        say('bs2', 'sable', 'You earned the version of me that does not perform. One look. Then we walk down and I send you off properly.', { sprite: 'sable.palms' }),
        { op: 'video', id: 'bs3', video: 'sable.palms', who: 'sable', sprite: 'sable.palms', fallback: 'She looks up through her lashes, then lets the smirk arrive just for you.' },
        unlock('bs4', 'sable', 'palms', 'sable_palms')
      ]
    }
  };
  const CHECKOUT = {
    aurelia: {
      id: 'checkout_aurelia', who: 'aurelia', bg: 'beach', when: 'Monday',
      steps: [
        say('ca1', 'narr', 'Monday. The ferry noses the dock. Aurelia walks you down in the gold suit, hair down, the desk someone else\'s problem.'),
        say('ca2', 'aurelia', 'The shell key still opens the room. I still open the weekend. Come back before both of us get professional about missing you.', { sprite: 'aurelia.pool' }),
        say('ca3', 'aurelia', 'Go on. I will be the one you see when you look back.', { sprite: 'aurelia.pool' }),
        { op: 'video', id: 'ca4', video: 'aurelia.kiss', who: 'aurelia', sprite: 'aurelia.evening', fallback: 'She blows you a kiss the lanterns would have been proud of, and the ferry takes the rest.' },
        unlock('ca5', 'aurelia', 'evening', 'end_aurelia')
      ]
    },
    mika: {
      id: 'checkout_mika', who: 'mika', bg: 'beach', when: 'Monday',
      steps: [
        say('cm1', 'narr', 'The ferry horn is rude about it. Mika is at the dock in the floral dress, shoes in one hand, the other hand not quite sure where to be until it finds yours.'),
        say('cm2', 'mika', 'I am not going to cry in front of a boat. I might wave until my arm files a complaint. Text me when you can see the island as a speck. I will still be looking.', { sprite: 'mika.evening' }),
        say('cm3', 'narr', 'She steps back, finds her courage, and gives you the look she practiced.', { sprite: 'mika.evening' }),
        { op: 'video', id: 'cm4', video: 'mika.glance', who: 'mika', sprite: 'mika.evening', fallback: 'She glances back, soft and sure, and lets that be the goodbye.' },
        unlock('cm5', 'mika', 'evening', 'end_mika')
      ]
    },
    celeste: {
      id: 'checkout_celeste', who: 'celeste', bg: 'beach', when: 'Monday',
      steps: [
        say('cc1', 'narr', 'Celeste jogs the dock and then remembers she meant to walk. The board stays on the beach. You do not.'),
        say('cc2', 'celeste', 'The next race is whenever you are back. I will save the blanket and the louder smile. This one is the goodbye, so watch it all the way to the boat.', { sprite: 'celeste.bonfire' }),
        { op: 'video', id: 'cc3', video: 'celeste.bonfire', who: 'celeste', sprite: 'celeste.bonfire', fallback: 'She blows you a kiss across the dock, warm as the fire that started it.' },
        unlock('cc4', 'celeste', 'bonfire', 'end_celeste')
      ]
    },
    sable: {
      id: 'checkout_sable', who: 'sable', bg: 'beach', when: 'Monday',
      steps: [
        say('cs1', 'narr', 'Sable does not hurry the gangway. Sunglasses in her hair, red suit under a shirt she did not bother to button, she walks you to the edge and stops where the dock still counts as hers.'),
        say('cs2', 'sable', 'Do not make me shout. I do not shout. I will do this once, and you will take it with you.', { sprite: 'sable.evening' }),
        { op: 'video', id: 'cs3', video: 'sable.kiss', who: 'sable', sprite: 'sable.evening', fallback: 'She blows the kiss like a decision, and the ferry is lucky to leave with it.' },
        unlock('cs4', 'sable', 'evening', 'end_sable')
      ]
    }
  };

  window.BEACH = {
    SPRITE_FILES: SPRITE_FILES,
    BG_FILES: BG_FILES,
    VIDEOS: VIDEOS,
    SHIP_LIST: SHIP_LIST,
    CAST: CAST,
    OUTFITS: OUTFITS,
    GALLERY: GALLERY,
    GALLERY_ORDER: GALLERY_ORDER,
    SCENES: SCENES,
    ENDINGS: ENDINGS,
    CARDS: CARDS,
    BONUS: BONUS,
    CHECKOUT: CHECKOUT,
    BONUS_AFF: BONUS_AFF
  };
})();
