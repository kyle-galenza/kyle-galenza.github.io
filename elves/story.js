/* Lanternveil — Festival of Lights
   Files load only when listed in SHIP_LIST (no speculative requests).
   Aelith's second clip is the courtyard date. Her bathing dress is a still. */
(function () {
  'use strict';

  const SPRITE_FILES = {
    'aelith.default': 'art/aelith.jpg',
    'aelith.default.pose2': 'art/aelith_pose2.jpg',
    'aelith.festival': 'art/aelith_festival.jpg',
    'aelith.festival.pose2': 'art/aelith_festival_pose2.jpg',
    'aelith.swim': 'art/aelith_swim.jpg',
    'aelith.swim.pose2': 'art/aelith_swim_pose2.jpg',
    'aelith.date': 'art/aelith_date.jpg',
    'aelith.date.pose2': 'art/aelith_date_pose2.jpg',
    'aelith.night': 'art/aelith_night.jpg',
    'aelith.night.pose2': 'art/aelith_night_pose2.jpg',
    'nyssa.default': 'art/nyssa.jpg',
    'nyssa.default.pose2': 'art/nyssa_pose2.jpg',
    'nyssa.festival': 'art/nyssa_festival.jpg',
    'nyssa.festival.pose2': 'art/nyssa_festival_pose2.jpg',
    'nyssa.swim': 'art/nyssa_swim.jpg',
    'nyssa.swim.pose2': 'art/nyssa_swim_pose2.jpg',
    'nyssa.date': 'art/nyssa_date.jpg',
    'nyssa.date.pose2': 'art/nyssa_date_pose2.jpg',
    'nyssa.night': 'art/nyssa_night.jpg',
    'nyssa.night.pose2': 'art/nyssa_night_pose2.jpg',
    'lirael.default': 'art/lirael.jpg',
    'lirael.default.pose2': 'art/lirael_pose2.jpg',
    'lirael.festival': 'art/lirael_festival.jpg',
    'lirael.festival.pose2': 'art/lirael_festival_pose2.jpg',
    'lirael.date': 'art/lirael_date.jpg',
    'lirael.date.pose2': 'art/lirael_date_pose2.jpg',
    'lirael.night': 'art/lirael_night.jpg',
    'lirael.night.pose2': 'art/lirael_night_pose2.jpg'
  };

  const VIDEOS = {
    'aelith.festival': {
      src: 'art/video/aelith_festival.mp4',
      poster: 'art/video/aelith_festival_poster.jpg',
      still: 'art/aelith_festival.jpg',
      title: 'The First Dance',
      who: 'aelith'
    },
    'aelith.date': {
      src: 'art/video/aelith_date.mp4',
      poster: 'art/video/aelith_date_poster.jpg',
      still: 'art/aelith_date.jpg',
      title: 'The Courtyard',
      who: 'aelith'
    },
    'nyssa.festival': {
      src: 'art/video/nyssa_festival.mp4',
      poster: 'art/video/nyssa_festival_poster.jpg',
      still: 'art/nyssa_festival.jpg',
      title: 'Starlight',
      who: 'nyssa'
    },
    'nyssa.date': {
      src: 'art/video/nyssa_date.mp4',
      poster: 'art/video/nyssa_date_poster.jpg',
      still: 'art/nyssa_date.jpg',
      title: 'The Balcony',
      who: 'nyssa'
    },
    'lirael.festival': {
      src: 'art/video/lirael_festival.mp4',
      poster: 'art/video/lirael_festival_poster.jpg',
      still: 'art/lirael_festival.jpg',
      title: 'The Range',
      who: 'lirael'
    },
    'lirael.date': {
      src: 'art/video/lirael_date.mp4',
      poster: 'art/video/lirael_date_poster.jpg',
      still: 'art/lirael_date.jpg',
      title: 'Firefly Walk',
      who: 'lirael'
    }
  };

  /* Only files that exist in the tree. Missing clips are not requested. */
  const SHIP_LIST = [
    'art/aelith.jpg',
    'art/aelith_festival.jpg',
    'art/aelith_swim.jpg',
    'art/aelith_night.jpg',
    'art/aelith_date.jpg',
    'art/nyssa.jpg',
    'art/nyssa_festival.jpg',
    'art/nyssa_swim.jpg',
    'art/nyssa_night.jpg',
    'art/nyssa_date.jpg',
    'art/lirael.jpg',
    'art/lirael_festival.jpg',
    'art/lirael_night.jpg',
    'art/lirael_date.jpg',
    'art/video/aelith_festival.mp4',
    'art/video/aelith_festival_poster.jpg',
    'art/video/aelith_date.mp4',
    'art/video/aelith_date_poster.jpg',
    'art/video/nyssa_festival.mp4',
    'art/video/nyssa_festival_poster.jpg',
    'art/video/nyssa_date.mp4',
    'art/video/nyssa_date_poster.jpg',
    'art/video/lirael_festival.mp4',
    'art/video/lirael_festival_poster.jpg',
    'art/video/lirael_date.mp4',
    'art/video/lirael_date_poster.jpg'
  ];

  const CAST = {
    aelith: {
      name: 'Aelith', full: 'Aelith Sunveil', age: 28, role: 'SUN ELF NOBLE',
      color: '#e2b15a', gift: 'a sun-gold ribbon',
      giftLine: 'She goes quiet, which for Aelith is louder than a speech. "You noticed. I will wear it where the court can be jealous."',
      giftAgain: 'She laughs and ties it beside the first. "You will spoil a woman who is already certain of you."'
    },
    nyssa: {
      name: 'Nyssa', full: 'Nyssa Moonwhisper', age: 27, role: 'MOON ELF',
      color: '#c4c2ff', gift: 'a moonpearl',
      giftLine: 'She turns the pearl in the moonlight and, for once, does not make a joke of it. "Keep being this attentive. I have very little defense against it."',
      giftAgain: '"Another? The moon will think I am collecting tributes." She is already wearing the first.'
    },
    lirael: {
      name: 'Lirael', full: 'Lirael Ashbough', age: 26, role: 'WOOD ELF RANGER',
      color: '#9dce8a', gift: 'honey cakes',
      giftLine: 'She takes the parcel with both hands, ears pink. "You remembered. I was going to pretend I did not want any. I am bad at that."',
      giftAgain: '"If you keep feeding me I will follow you home. That is not a threat. It is... a schedule."'
    }
  };

  const OUTFITS = {
    aelith: [
      { id: 'default', name: 'Court Emerald', hint: 'The gown she wears to receive guests.', sprite: 'aelith.default' },
      { id: 'festival', name: 'Lantern Gown', hint: 'Unlocked when you dance.', sprite: 'aelith.festival' },
      { id: 'swim', name: 'Bathing Dress', hint: 'Unlocked at the spa pool.', sprite: 'aelith.swim' },
      { id: 'date', name: 'Date Dress', hint: 'Unlocked on your lantern date.', sprite: 'aelith.date' },
      { id: 'night', name: 'Nightgown', hint: 'Unlocked at her promise.', sprite: 'aelith.night' }
    ],
    nyssa: [
      { id: 'default', name: 'Midnight Velvet', hint: 'What she wears on the balcony.', sprite: 'nyssa.default' },
      { id: 'festival', name: 'Starlight Gown', hint: 'Unlocked under the stars.', sprite: 'nyssa.festival' },
      { id: 'swim', name: 'Lake Suit', hint: 'Unlocked at the moonlit lake.', sprite: 'nyssa.swim' },
      { id: 'date', name: 'Date Night', hint: 'Unlocked on your night together.', sprite: 'nyssa.date' },
      { id: 'night', name: 'Night Silk', hint: 'Unlocked at her promise.', sprite: 'nyssa.night' }
    ],
    lirael: [
      { id: 'default', name: 'Ranger Leaves', hint: 'Leaf-leather and freckles.', sprite: 'lirael.default' },
      { id: 'festival', name: 'Festival Leathers', hint: 'Unlocked at the range.', sprite: 'lirael.festival' },
      { id: 'date', name: 'Stream Dress', hint: 'Unlocked by the mossy stream.', sprite: 'lirael.date' },
      { id: 'night', name: 'Cabin Shawl', hint: 'Unlocked by her fireplace.', sprite: 'lirael.night' }
    ]
  };

  const GALLERY = {
    aelith_meet: { who: 'aelith', title: 'The Borrowed Path', caption: 'She lends you the gardens, and her attention.', sprite: 'aelith.default', bg: 'gardens' },
    aelith_fest: { who: 'aelith', title: 'The First Dance', caption: 'Lantern light, a smile, and her hair moving with the song.', sprite: 'aelith.festival', bg: 'festival', video: 'aelith.festival' },
    aelith_spa: { who: 'aelith', title: 'The Spa Pool', caption: 'A bathing dress, steam, and a quiet kiss.', sprite: 'aelith.swim', bg: 'pool' },
    aelith_date: { who: 'aelith', title: 'The Courtyard', caption: 'She twirls in the sun and laughs in her date dress.', sprite: 'aelith.date', bg: 'date', video: 'aelith.date' },
    aelith_vow: { who: 'aelith', title: 'Dawn Promise', caption: 'She will argue with a gate, if you stay.', sprite: 'aelith.night', bg: 'gardens' },
    end_aelith: { who: 'aelith', title: 'The Gate Stays Open', caption: 'The kingdom learns your name.', sprite: 'aelith.date.pose2', bg: 'gate' },
    nyssa_meet: { who: 'nyssa', title: 'Off Duty Moon', caption: 'The balcony, and a chair that does not face the drop.', sprite: 'nyssa.default', bg: 'tower' },
    nyssa_fest: { who: 'nyssa', title: 'Starlight', caption: 'She lets you map her sky.', sprite: 'nyssa.festival', bg: 'tower', video: 'nyssa.festival' },
    nyssa_pool: { who: 'nyssa', title: 'Moonlit Lake', caption: 'A still of the lake, and her suit dark as the water.', sprite: 'nyssa.swim', bg: 'pool' },
    nyssa_date: { who: 'nyssa', title: 'The Balcony', caption: 'She turns in her date dress, smiles, and winks.', sprite: 'nyssa.date', bg: 'tower', video: 'nyssa.date' },
    nyssa_vow: { who: 'nyssa', title: 'A Plain Truth', caption: 'She would like, for one night, to be plain.', sprite: 'nyssa.night', bg: 'tower' },
    end_nyssa: { who: 'nyssa', title: 'Plain as Moonlight', caption: 'You stay where the moon can see you both.', sprite: 'nyssa.date.pose2', bg: 'gate' },
    lirael_meet: { who: 'lirael', title: 'Slippery Path', caption: 'She was not waiting. She was also waiting.', sprite: 'lirael.default', bg: 'falls' },
    lirael_fest: { who: 'lirael', title: 'The Range', caption: 'The target was never the point.', sprite: 'lirael.festival', bg: 'falls', video: 'lirael.festival' },
    lirael_date: { who: 'lirael', title: 'By the Stream', caption: 'On the mossy rock she turns and blows a kiss.', sprite: 'lirael.date', bg: 'falls', video: 'lirael.date' },
    lirael_vow: { who: 'lirael', title: 'Footsteps', caption: 'The forest is asked not to forget you.', sprite: 'lirael.night', bg: 'camp' },
    end_lirael: { who: 'lirael', title: 'What the Forest Kept', caption: 'She does not hide behind the tree.', sprite: 'lirael.date.pose2', bg: 'gate' },
    end_neutral: { who: 'narr', title: 'When the Lanterns Go Out', caption: 'The road home is ordinary. The names are not.', sprite: 'aelith.default', bg: 'gate' }
  };

  const GALLERY_ORDER = [
    'aelith_meet', 'aelith_fest', 'aelith_spa', 'aelith_date', 'aelith_vow', 'end_aelith',
    'nyssa_meet', 'nyssa_fest', 'nyssa_pool', 'nyssa_date', 'nyssa_vow', 'end_nyssa',
    'lirael_meet', 'lirael_fest', 'lirael_date', 'lirael_vow', 'end_lirael',
    'end_neutral'
  ];

  function say(id, who, text, extra) {
    return Object.assign({ op: 'say', id: id, who: who, text: text }, extra || {});
  }
  function choice(id, who, options) {
    return { op: 'choice', id: id, who: who, options: options };
  }

  const INTRO = {
    id: 'intro',
    bg: 'gate',
    steps: [
      say('intro1', 'narr', 'The road ends in a lantern that was not there yesterday. It burns a color fire does not know, and the dark around it has the shape of a door.'),
      say('intro2', 'narr', 'You are twenty-seven, and you have walked a long time to stand here. The door opens on water, music, and warm light.'),
      say('intro3', 'narr', 'A steward in leaf-mail looks at your face, then at the lantern, and bows. "Twenty-one days. The Festival of Lights is the only time the kingdom of Vaelith remembers the road. When the last lantern goes out, the gate will forget you. Until then, walk where the light is."'),
      say('intro4', 'narr', 'Three names are already in the air, though you have not earned them. The gardens. The tower. The falls.')
    ]
  };

  const EVENTS = [];
  function ev(p) {
    EVENTS.push({
      id: p.id,
      who: p.who,
      minDay: p.minDay,
      minAff: p.minAff || 0,
      need: p.need || [],
      flag: p.id,
      bg: p.bg,
      steps: p.steps
    });
  }

  ev({
    id: 'aelith_meet', who: 'aelith', minDay: 1, minAff: 0, bg: 'gardens',
    steps: [
      say('ae_m1', 'narr', 'Sun lies across the palace gardens in bars of gold. A woman in emerald and gold filigree does not pretend she has not seen you.'),
      say('ae_m2', 'aelith', 'A human, walking as if my gardens were a rumor someone dared you to test. I am Aelith Sunveil. These paths are mine until the lanterns go out. You may borrow them.', { sprite: 'aelith.default' }),
      choice('ae_m3', 'aelith', [
        { text: 'Then I will walk them with you.', aff: 6, reply: 'Good. A pretty view is wasted when there is no one in it worth teasing.' },
        { text: 'You are generous with a stranger.', aff: 3, reply: 'Generous is the wrong word. Curious is closer. Try to be interesting.' },
        { text: 'I was looking for the way back.', aff: 0, reply: 'Already? The festival will survive it. My pride will sulk, a little.' }
      ]),
      say('ae_m4', 'aelith', 'I have worn this face since before your grandparents learned the word elf. Do not let the face confuse you. I know exactly what I am doing.', { pose: 'pose2' }),
      { op: 'unlock', id: 'ae_m5', who: 'aelith', gallery: 'aelith_meet' },
      { op: 'aff', id: 'ae_m6', who: 'aelith', n: 2 }
    ]
  });

  ev({
    id: 'aelith_sun', who: 'aelith', minDay: 2, minAff: 6, need: ['aelith_meet'], bg: 'gardens',
    steps: [
      say('ae_s1', 'narr', 'She is at the sundial, which she claims runs on compliments.'),
      say('ae_s2', 'aelith', 'You are late. The dial and I agreed on this. Come here and be forgiven.', { pose: 'pose2' }),
      say('ae_s3', 'narr', 'She turns your hand toward a sunpetal and does not give it back at once.'),
      say('ae_s4', 'aelith', 'The court will ask what I see in a mortal. I intend to have a better answer than "the light liked you first."'),
      choice('ae_s5', 'aelith', [
        { text: 'Tell them the light was right.', aff: 6, reply: 'Dangerous answer. I will use it anyway.' },
        { text: 'What would you like the answer to be?', aff: 3, reply: 'That you looked at me as if the gown were a courtesy and the woman were the point. Do that, and the court can choke on it.' },
        { text: 'Let the court talk.', aff: 0, reply: 'They will. I had hoped you would give them better material.' }
      ]),
      { op: 'aff', id: 'ae_s6', who: 'aelith', n: 2 }
    ]
  });

  ev({
    id: 'aelith_fest', who: 'aelith', minDay: 5, minAff: 16, need: ['aelith_sun'], bg: 'festival',
    steps: [
      say('ae_f1', 'narr', 'At dusk the lantern court is a floor of light. Aelith offers her hand as if the offer were a decree.'),
      say('ae_f2', 'aelith', 'Hold my waist. The court is watching, which is why you will not look at the court.', { sprite: 'aelith.default' }),
      { op: 'unlock', id: 'ae_f3', who: 'aelith', outfit: 'festival', gallery: 'aelith_fest' },
      { op: 'mini', id: 'ae_f4', game: 'dance', who: 'aelith', sprite: 'aelith.festival' },
      {
        op: 'video', id: 'ae_f5', video: 'aelith.festival', who: 'aelith', sprite: 'aelith.festival.pose2', cg: true,
        fallback: 'She laughs against your temple, close enough that the next step could be a kiss, and lets the song finish first.'
      },
      { op: 'aff', id: 'ae_f6', who: 'aelith', n: 2 }
    ]
  });

  ev({
    id: 'aelith_spa', who: 'aelith', minDay: 8, minAff: 24, need: ['aelith_fest'], bg: 'pool',
    steps: [
      say('ae_p1', 'narr', 'Behind the gardens a spa pool holds the last of the sun. Aelith is already there, in a bathing dress the color of wet leaves, as if the water had been waiting on you.'),
      say('ae_p2', 'aelith', 'Do not look so startled. It is a dress. The court would faint, which is half the pleasure. Come sit where the steam can reach you.', { sprite: 'aelith.swim' }),
      choice('ae_p3', 'aelith', [
        { text: 'Sit with her, and let her see you looking.', aff: 6, reply: 'There. Honesty looks well on you. The water agrees.' },
        { text: 'The steam suits you more than the court does.', aff: 3, reply: 'Flattery in a bathing dress. You are learning the festival.' },
        { text: 'I will stay on the stones.', aff: 0, reply: 'Prudent. Dull. The pool will forgive you. I might.' }
      ]),
      { op: 'unlock', id: 'ae_p4', who: 'aelith', outfit: 'swim', gallery: 'aelith_spa' },
      say('ae_p5', 'narr', 'She draws you down until the water laps your collarbones, kisses you once, and lets the steam close over the rest.', { sprite: 'aelith.swim', cg: true, fade: true }),
      { op: 'aff', id: 'ae_p6', who: 'aelith', n: 2 }
    ]
  });

  ev({
    id: 'aelith_date_ev', who: 'aelith', minDay: 11, minAff: 34, need: ['aelith_spa'], bg: 'date',
    steps: [
      say('ae_d1', 'narr', 'She sends no servant. She comes herself, in silk the lanterns seem to have chosen, and waits at the garden gate with two cups.'),
      say('ae_d2', 'aelith', 'A date. Mortals have such a useful word for it. Come, before I decide to be shy. I would be very bad at shy.', { sprite: 'aelith.date' }),
      say('ae_d3', 'narr', 'You eat under a canopy of lights. She steals the sweet from your plate and then, as if to even the scales, offers it back from her fingers.'),
      choice('ae_d4', 'aelith', [
        { text: 'Take it, and kiss her fingertips.', aff: 6, reply: 'Oh. You are braver than the court. Good.', sprite: 'aelith.date.pose2' },
        { text: 'You planned every lantern, did you not?', aff: 3, reply: 'All but one. You were the one I could not schedule.' },
        { text: 'This is a lot of trouble for a traveler.', aff: 0, reply: 'Say that again and I will kiss you out of spite. I may do that anyway.' }
      ]),
      { op: 'unlock', id: 'ae_d5', who: 'aelith', outfit: 'date', gallery: 'aelith_date' },
      {
        op: 'video', id: 'ae_d6', video: 'aelith.date', who: 'aelith', sprite: 'aelith.date.pose2', cg: true, fade: true,
        fallback: 'She twirls once in the sunlit courtyard, the date dress flaring, and laughs against your mouth until the light goes soft.'
      },
      { op: 'aff', id: 'ae_d7', who: 'aelith', n: 2 }
    ]
  });

  ev({
    id: 'aelith_vow_ev', who: 'aelith', minDay: 15, minAff: 48, need: ['aelith_date_ev'], bg: 'gardens',
    steps: [
      say('ae_v1', 'narr', 'Near the end of the festival she finds you at dawn, hair down, a silk robe the color of banked embers. The palace is quiet enough to hear the gate thinking about closing.'),
      say('ae_v2', 'aelith', 'I have argued with kings and with weather. I would like to argue with a gate, on your behalf.', { sprite: 'aelith.night' }),
      say('ae_v3', 'aelith', 'Stay. When the lanterns go out, stay anyway. I will teach the kingdom your name until it sticks.', { pose: 'pose2' }),
      choice('ae_v4', 'aelith', [
        { text: 'Then I stay.', aff: 6, flag: 'aelith_vow', reply: 'Say it again tomorrow, and the day after. I will not tire of it.' },
        { text: 'Ask me on the last night, and I will.', aff: 4, flag: 'aelith_vow', reply: 'I am asking now so your courage has time to catch up. I will ask again.' },
        { text: 'The road home is still there.', aff: 0, reply: 'It is. I am better company than a road. Think quickly, {name}.' }
      ]),
      { op: 'unlock', id: 'ae_v5', who: 'aelith', outfit: 'night', gallery: 'aelith_vow' },
      say('ae_v6', 'narr', 'She kisses you once, brief and certain, and the dawn takes the rest of the sentence away.', { sprite: 'aelith.night.pose2', cg: true, fade: true }),
      { op: 'aff', id: 'ae_v7', who: 'aelith', n: 2 }
    ]
  });

  ev({
    id: 'nyssa_meet', who: 'nyssa', minDay: 1, minAff: 0, bg: 'tower',
    steps: [
      say('ny_m1', 'narr', 'The crystal tower is all moon and edge. A silver-haired woman sits on the balcony rail as if falling were a rumor she has declined.'),
      say('ny_m2', 'nyssa', 'If you came for a blessing, the moon is off duty. If you came to be teased, take the chair that does not face the drop. I am Nyssa. You may survive me.', { sprite: 'nyssa.default' }),
      choice('ny_m3', 'nyssa', [
        { text: 'I will take the dangerous chair.', aff: 6, reply: 'Oh, I like you. Sit, then, and try not to be dull about it.' },
        { text: 'Tell me what the moon is sulking about.', aff: 3, reply: 'Mortals who leave early. Present company is still undecided.' },
        { text: 'I was only looking at the view.', aff: 0, reply: 'The view is this way. You were looking at my ears. I allow it. I charge interest.' }
      ]),
      say('ny_m4', 'nyssa', 'Centuries, if you were going to ask. This face is the polite version. The impolite version is funnier, and you have not earned it.', { pose: 'pose2' }),
      { op: 'unlock', id: 'ny_m5', who: 'nyssa', gallery: 'nyssa_meet' },
      { op: 'aff', id: 'ny_m6', who: 'nyssa', n: 2 }
    ]
  });

  ev({
    id: 'nyssa_riddle', who: 'nyssa', minDay: 2, minAff: 6, need: ['nyssa_meet'], bg: 'tower',
    steps: [
      say('ny_r1', 'narr', 'She has chalked three stars on the rail and is pretending they are a test.'),
      say('ny_r2', 'nyssa', 'Riddle. What do I want from a mortal who keeps climbing my stairs?', { pose: 'pose2' }),
      choice('ny_r3', 'nyssa', [
        { text: 'Someone who notices when you are not joking.', aff: 6, reply: 'Unfair. Correct, and unfair. Sit closer. The riddle is over.' },
        { text: 'A clever answer.', aff: 3, reply: 'I have clever. I collect it. Try again on a night when I am braver.' },
        { text: 'I would not presume to know.', aff: 0, reply: 'Presumption would have been more flattering. You may have a second chance if you bring a better face.' }
      ]),
      { op: 'aff', id: 'ny_r4', who: 'nyssa', n: 2 }
    ]
  });

  ev({
    id: 'nyssa_fest', who: 'nyssa', minDay: 5, minAff: 16, need: ['nyssa_riddle'], bg: 'tower',
    steps: [
      say('ny_f1', 'narr', 'Festival night doubles the stars. Nyssa has dressed for them, silver on indigo, and saved you the place at her elbow.'),
      say('ny_f2', 'nyssa', 'Watch the order I touch them. Then do it yourself, and I will decide whether you were listening to the sky or to me.', { sprite: 'nyssa.default' }),
      { op: 'unlock', id: 'ny_f3', who: 'nyssa', outfit: 'festival', gallery: 'nyssa_fest' },
      { op: 'mini', id: 'ny_f4', game: 'stars', who: 'nyssa', sprite: 'nyssa.festival' },
      {
        op: 'video', id: 'ny_f5', video: 'nyssa.festival', who: 'nyssa', sprite: 'nyssa.festival.pose2', cg: true,
        fallback: 'She leans in until her hair ticks your wrist. "You mapped my sky. Do not get proud. Get closer." The lanterns below look like a second, smaller heaven.'
      },
      { op: 'aff', id: 'ny_f6', who: 'nyssa', n: 2 }
    ]
  });

  ev({
    id: 'nyssa_pool', who: 'nyssa', minDay: 8, minAff: 26, need: ['nyssa_fest'], bg: 'pool',
    steps: [
      say('ny_p1', 'narr', 'She leads you to a high pool behind the tower, lanterns floating, the water black and warm. Her suit is cut like night water. She sits on the stone edge and pats the place beside her.'),
      say('ny_p2', 'nyssa', 'You may look. Looking is the polite use of a festival. You may not narrate. I will know.', { sprite: 'nyssa.swim' }),
      choice('ny_p3', 'nyssa', [
        { text: 'Sit beside her, and look only when she looks back.', aff: 6, reply: 'There. Manners and nerve. I was beginning to worry you had only one.' },
        { text: 'The water looks kind. May I?', aff: 3, reply: 'You may dangle your feet and your dignity. I am keeping the rest of the evening.' },
        { text: 'I should leave you to the pool.', aff: 0, reply: 'You may. The pool is worse company. Do not make me say that twice.' }
      ]),
      { op: 'unlock', id: 'ny_p5', who: 'nyssa', outfit: 'swim', gallery: 'nyssa_pool' },
      say('ny_p4', 'narr', 'She stays at the edge in her lake suit, kisses the corner of your mouth, and flicks water at you so the moment cannot get too solemn.', { sprite: 'nyssa.swim', cg: true, fade: true }),
      { op: 'aff', id: 'ny_p6', who: 'nyssa', n: 2 }
    ]
  });

  ev({
    id: 'nyssa_date_ev', who: 'nyssa', minDay: 11, minAff: 36, need: ['nyssa_pool'], bg: 'tower',
    steps: [
      say('ny_d1', 'narr', 'She does not call it a date. She calls it "a walk you will not be late for," then appears in a gown that has clearly negotiated with the moon.'),
      say('ny_d2', 'nyssa', 'If this is a date, {name}, you are doing very well at not ruining it. Come down. The city looks better when I have someone to be superior next to.', { sprite: 'nyssa.date' }),
      choice('ny_d3', 'nyssa', [
        { text: 'I came to stand next to you, not the view.', aff: 6, reply: 'Write that down. I intend to be unbearable about it later.', sprite: 'nyssa.date.pose2' },
        { text: 'You dressed to win. It worked.', aff: 3, reply: 'Flattery is a low art. Do it again.' },
        { text: 'I was not sure this was a date.', aff: 0, reply: 'It is now, because I say so, and because you stayed. Try to keep up.' }
      ]),
      { op: 'unlock', id: 'ny_d4', who: 'nyssa', outfit: 'date', gallery: 'nyssa_date' },
      {
        op: 'video', id: 'ny_d5', video: 'nyssa.date', who: 'nyssa', sprite: 'nyssa.date.pose2', cg: true, fade: true,
        fallback: 'On the moonlit balcony she turns, the date dress catching the light, and gives you a slow wink.'
      },
      { op: 'aff', id: 'ny_d6', who: 'nyssa', n: 2 }
    ]
  });

  ev({
    id: 'nyssa_vow_ev', who: 'nyssa', minDay: 15, minAff: 50, need: ['nyssa_date_ev'], bg: 'tower',
    steps: [
      say('ny_v1', 'narr', 'She is in pale silk, hair loose, the performance folded and set aside on a chair.'),
      say('ny_v2', 'nyssa', 'I have spent a long time being clever. I would like, for what is left of this festival, to be plain.', { sprite: 'nyssa.night' }),
      say('ny_v3', 'nyssa', 'Stay. When the gate forgets the road, let it forget. I will remember you on purpose.', { pose: 'pose2' }),
      choice('ny_v4', 'nyssa', [
        { text: 'Then I stay. Plainly.', aff: 6, flag: 'nyssa_vow', reply: 'Good. Do not decorate it. I heard you.' },
        { text: 'Ask me once more at the end, and I am yours.', aff: 4, flag: 'nyssa_vow', reply: 'I will. I am unbearable when I want something. You have been warned, which is to say invited.' },
        { text: 'I do not know if I can.', aff: 0, reply: 'Then do not kiss me goodnight and pretend it was weather. Decide, {name}.' }
      ]),
      { op: 'unlock', id: 'ny_v5', who: 'nyssa', outfit: 'night', gallery: 'nyssa_vow' },
      say('ny_v6', 'narr', 'She kisses you without a quip in reach, and the moon keeps the rest of it.', { cg: true, fade: true, sprite: 'nyssa.night.pose2' }),
      { op: 'aff', id: 'ny_v7', who: 'nyssa', n: 2 }
    ]
  });

  ev({
    id: 'lirael_meet', who: 'lirael', minDay: 1, minAff: 0, bg: 'falls',
    steps: [
      say('li_m1', 'narr', 'The waterfall keeps its own weather. A red-haired ranger pretends to check a bowstring and fails, completely, to look busy.'),
      say('li_m2', 'lirael', 'Heh. Do not think I did not notice you. I mean the path. The path is slippery. I am Lirael. Ranger. You can tell by the leaves. Obviously.', { sprite: 'lirael.default' }),
      choice('li_m3', 'lirael', [
        { text: 'The path can wait. I am glad you are here.', aff: 6, reply: 'Oh. That was... direct. I like direct. I am going to look at this leaf now.' },
        { text: 'Show me the safe stones?', aff: 3, reply: 'Yes. Good. Practical. I can do practical. Follow my feet, not my ears. My ears are doing too much.' },
        { text: 'I can find my own way.', aff: 0, reply: 'You can. The waterfall will still be here. I might be. If you want. No pressure. Some pressure. A normal amount.' }
      ]),
      say('li_m4', 'lirael', 'I am older than your whole family tree, by the way. I just... look like someone who would lend you a spare bow. Which I would.', { pose: 'pose2' }),
      { op: 'unlock', id: 'li_m5', who: 'lirael', gallery: 'lirael_meet' },
      { op: 'aff', id: 'li_m6', who: 'lirael', n: 2 }
    ]
  });

  ev({
    id: 'lirael_trail', who: 'lirael', minDay: 2, minAff: 6, need: ['lirael_meet'], bg: 'falls',
    steps: [
      say('li_t1', 'narr', 'She knows a ledge where the falls are only a bright noise. The view is the valley. She keeps looking at you instead.'),
      say('li_t2', 'lirael', 'I almost took your hand on the trail. Then I did not. Then I wanted to again. This is going very smoothly.', { pose: 'pose2' }),
      choice('li_t3', 'lirael', [
        { text: 'Offer your hand and leave it there.', aff: 6, reply: 'Okay. Okay, good. I am going to pretend this is for balance. It is not for balance.' },
        { text: 'The valley is beautiful. So are you, if that helps.', aff: 3, reply: 'It helps. It also makes my face do a thing. Ignore the thing. Or do not.' },
        { text: 'We can just walk.', aff: 0, reply: 'Walking is good. Walking is safe. I am very good at safe. Ask anyone. Do not ask the bees.' }
      ]),
      { op: 'aff', id: 'li_t4', who: 'lirael', n: 2 }
    ]
  });

  ev({
    id: 'lirael_fest', who: 'lirael', minDay: 5, minAff: 16, need: ['lirael_trail'], bg: 'falls',
    steps: [
      say('li_f1', 'narr', 'Festival ribbons have found even the range. Lirael has set three arrows in the ground and is trying not to grin.'),
      say('li_f2', 'lirael', 'You do not have to be good. You have to stand where I can look at you without pretending I am watching the target. Also, please loose when the spark is gold. That part is real.', { sprite: 'lirael.default' }),
      { op: 'unlock', id: 'li_f3', who: 'lirael', outfit: 'festival', gallery: 'lirael_fest' },
      { op: 'mini', id: 'li_f4', game: 'archery', who: 'lirael', sprite: 'lirael.festival' },
      {
        op: 'video', id: 'li_f5', video: 'lirael.festival', who: 'lirael', sprite: 'lirael.festival.pose2', cg: true,
        fallback: 'She bumps your shoulder with hers, shy and pleased. "Again tomorrow. Or now. Now is also a time I would accept."'
      },
      { op: 'aff', id: 'li_f6', who: 'lirael', n: 2 }
    ]
  });

  ev({
    id: 'lirael_date_ev', who: 'lirael', minDay: 9, minAff: 30, need: ['lirael_fest'], bg: 'falls',
    steps: [
      say('li_d1', 'narr', 'She calls it "checking the south trail." The trail ends at a mossy rock by the stream, and she has changed into a wrap the color of new leaves.'),
      say('li_d2', 'lirael', 'This is a date. I practiced saying it to a tree. The tree was supportive. You do not have to be, but I hope you are.', { sprite: 'lirael.date' }),
      choice('li_d3', 'lirael', [
        { text: 'It is a date. I am glad you said it.', aff: 6, reply: 'Good. Great. I am going to hold your hand and also possibly combust.', sprite: 'lirael.date.pose2' },
        { text: 'The fireflies were a strong argument.', aff: 3, reply: 'I knew they would help. They are very persuasive. I am only a little jealous of them.' },
        { text: 'We can keep it a walk.', aff: 0, reply: 'A walk is still a walk with you. I will try not to look disappointed. I will fail a bit.' }
      ]),
      { op: 'unlock', id: 'li_d4', who: 'lirael', outfit: 'date', gallery: 'lirael_date' },
      {
        op: 'video', id: 'li_d5', video: 'lirael.date', who: 'lirael', sprite: 'lirael.date.pose2', cg: true, fade: true,
        fallback: 'She turns on the mossy rock and blows you a kiss, shy and pleased, and the stream carries it the rest of the way.'
      },
      { op: 'aff', id: 'li_d6', who: 'lirael', n: 2 }
    ]
  });

  ev({
    id: 'lirael_vow_ev', who: 'lirael', minDay: 15, minAff: 48, need: ['lirael_date_ev'], bg: 'camp',
    steps: [
      say('li_v1', 'narr', 'Her camp is a ring of quiet fire. She has a shawl around her shoulders and both hands around a cup she is not drinking.'),
      say('li_v2', 'lirael', 'I do not want the forest to forget your footsteps. I practiced this too. It went better in my head, and also fine, because you are still here.', { sprite: 'lirael.night' }),
      say('li_v3', 'lirael', 'Stay. I will learn how to say it without a tree between us.', { pose: 'pose2' }),
      choice('li_v4', 'lirael', [
        { text: 'I will stay. No tree required.', aff: 6, flag: 'lirael_vow', reply: 'Okay. Then I am going to kiss you on purpose, and not apologize after. Much.' },
        { text: 'Ask me on the last morning. I want to say yes.', aff: 4, flag: 'lirael_vow', reply: 'I can wait until morning. I might vibrate. Ignore that.' },
        { text: 'I think the gate expects me to leave.', aff: 0, reply: 'The gate expects a lot of things. I expected to be braver. We can both be surprised. Think about it. Please.' }
      ]),
      { op: 'unlock', id: 'li_v5', who: 'lirael', outfit: 'night', gallery: 'lirael_vow' },
      say('li_v6', 'narr', 'She kisses you by the fire, sweet and a little shaky, and the shawl slips only as far as her shoulder before she pulls it close again and stays in your arms.', { sprite: 'lirael.night.pose2', cg: true, fade: true }),
      { op: 'aff', id: 'li_v7', who: 'lirael', n: 2 }
    ]
  });

  function daily(who, n, bg, lead, line, options) {
    return {
      id: who + '_d' + n,
      who: who,
      bg: bg,
      steps: [
        say(who + '_d' + n + '_a', 'narr', lead),
        say(who + '_d' + n + '_b', who, line, { pose: n % 2 ? 'pose2' : '' }),
        choice(who + '_d' + n + '_c', who, options)
      ]
    };
  }

  const DAILIES = {
    aelith: [
      daily('aelith', 0, 'gardens',
        'She has a sun-warmed plum and the expression of a woman who intends to share it on her own terms.',
        'Open your mouth, or tell me you would rather watch me eat it. Both are acceptable. One is more fun.',
        [
          { text: 'Share it, slowly.', aff: 5, reply: 'There. Civilization. Juice on your lip. Do not fix it. I am looking.' },
          { text: 'Tell her the gardens suit her.', aff: 3, reply: 'The gardens suit everyone. I suit them better. You may keep looking.' },
          { text: 'I am not hungry.', aff: 0, reply: 'Tragic. More for me, and less for the moment I was building.' }
        ]),
      daily('aelith', 1, 'gardens',
        'Court gossip drifts like pollen. She sorts it with a finger on your sleeve.',
        'If they are going to invent a rumor about us, we should pick one worth the ink. What shall we be?',
        [
          { text: 'Scandalously happy.', aff: 5, reply: 'Ambitious. I accept. Smile like you mean it. I will do the smoldering.' },
          { text: 'A private friendship. Let them guess.', aff: 3, reply: 'Cruel to the court, kind to us. I can live with that for an afternoon.' },
          { text: 'Nothing. Let it die.', aff: 0, reply: 'You are no fun at politics. Lucky for you, you are fun at other things. Probably.' }
        ]),
      daily('aelith', 2, 'festival',
        'A drift of petals crosses the path. She draws you under the fall of her sleeve.',
        'Stay a moment. The court can have the next hour. This one is the width of my arm, and I am not sharing it.',
        [
          { text: 'Stay inside the circle of her arm.', aff: 5, reply: 'Good. You learn. My sleeve has excellent taste in guests.' },
          { text: 'Tuck a petal behind her ear.', aff: 3, reply: 'Sentimental. Effective. I will allow the court to see it and suffer.' },
          { text: 'Step back into the open.', aff: 0, reply: 'Fresh air. How sensible. How disappointing.' }
        ])
    ],
    nyssa: [
      daily('nyssa', 0, 'tower',
        'She names a dim star after a flaw of yours, fondly, as if flaws were jewelry.',
        'That one is your impatience. It twinkles. I am thinking of naming the next one after the way you look at my mouth when you think I cannot see.',
        [
          { text: 'Then name it honestly. I do look.', aff: 5, reply: 'Honesty. Disgusting. Come here and be punished with a compliment.' },
          { text: 'Name one after your mercy. It can be small.', aff: 3, reply: 'Rude. Accurate. I will allow a very small star.' },
          { text: 'Keep the sky to yourself.', aff: 0, reply: 'Selfish of me was the original plan. You were improving it.' }
        ]),
      daily('nyssa', 1, 'tower',
        'She slides a silver ring onto your finger and sets an hourglass beside it.',
        'One hour. So the moon knows your hand. If you lose the ring I will be tragic for at least four minutes.',
        [
          { text: 'Wear it, and give it back with a kiss on the knuckle.', aff: 5, reply: 'The hour is shorter than I wanted. The kiss was not. Interesting.' },
          { text: 'Ask what the ring has heard, up here.', aff: 3, reply: 'Mostly me, being clever to hide being lonely. You are a better audience than the owls.' },
          { text: 'Decline the ring.', aff: 0, reply: 'Prudent. I hate prudent. The owls will hear about this.' }
        ]),
      daily('nyssa', 2, 'festival',
        'Below, the festival is a bowl of gold. She sits on the rail again, and this time leaves room.',
        'Tell me one true thing, and I will tell you one. No riddles. I am off duty from riddles. Briefly.',
        [
          { text: 'I climb these stairs because of you.', aff: 5, reply: 'True for true: I listen for your step, and I am annoyed when it is someone else.' },
          { text: 'The city is lovelier from here.', aff: 3, reply: 'Cowardly and pretty. My truth: I wore this so you would have a reason to stare. You may pay up.' },
          { text: 'I am only passing through.', aff: 0, reply: 'Then pass more quietly. Some of us were having a feeling.' }
        ])
    ],
    lirael: [
      daily('lirael', 0, 'falls',
        'She tries to teach you a bird call. You are terrible. She is delighted.',
        'That was not a wren. That was a wagon. Do it again. I want to hear the wagon.',
        [
          { text: 'Try again, worse, on purpose, to see her laugh.', aff: 5, reply: 'You are a menace. A kind menace. The wrens will unionize and I will defend you anyway.' },
          { text: 'Ask her to call one, close enough to feel her breath.', aff: 3, reply: 'Oh. That is... very near. The wren can wait. I need a second. There. Hi.' },
          { text: 'Give the call up.', aff: 0, reply: 'We can stop. The woods are still nice without impressions. I am still nice. I think.' }
        ]),
      daily('lirael', 1, 'falls',
        'Bread, cheese, and a log that is wider than the two of you strictly require. She sits closer than the log requires.',
        'I packed too much. This is not a metaphor. It is also a metaphor. Have the cheese.',
        [
          { text: 'Share the cheese, shoulder to shoulder.', aff: 5, reply: 'Good. If I lean, it is balance. I said that already once this week. It remains untrue.' },
          { text: 'Tell her the waterfall sounds like company.', aff: 3, reply: 'It does, until a person is better company. You are currently winning. Do not tell the waterfall.' },
          { text: 'Eat quickly and stand.', aff: 0, reply: 'Right. Busy. I will wrap the rest. For later. If there is a later. There can be a later.' }
        ]),
      daily('lirael', 2, 'camp',
        'Dusk, and a braid she almost does not offer. A leaf is involved. Her courage is a small animal.',
        'I could braid a little of your hair with this. It is a wood-elf thing. It is also a me thing. You can say no and I will become a bush.',
        [
          { text: 'Let her. Thank her after.', aff: 5, reply: 'There. Now the forest knows you. And I know you sat still for me. Both matter.' },
          { text: 'Braid a bit of hers in return.', aff: 3, reply: 'Oh no, you are good at this. I am going to think about your hands for an unreasonable time.' },
          { text: 'Maybe another day.', aff: 0, reply: 'Another day is a real day. I will keep the leaf. It is a very patient leaf.' }
        ])
    ]
  };

  const ENDINGS = {
    aelith: {
      id: 'end_aelith',
      who: 'aelith',
      bg: 'gardens',
      steps: [
        say('end_ae1', 'narr', 'The last night is thin as glass. Aelith waits in the oldest alley of the gardens, lanterns bowing in a wind that smells like rain and oranges.'),
        say('end_ae2', 'aelith', 'I spoke to the gate. It was rude. I was ruder. It will remember your name because I was unbearable about it.', { sprite: 'aelith.date' }),
        say('end_ae3', 'aelith', 'Stay, {name}. Not as a guest. As the person I intend to keep teasing until the sun gets bored.', { sprite: 'aelith.date.pose2' }),
        say('end_ae4', 'narr', 'You stay. She kisses you as the last lantern gutters, and the dark does not close. Somewhere a steward sighs, and lets the exception stand.', { cg: true, fade: true }),
        { op: 'unlock', id: 'end_ae5', who: 'aelith', gallery: 'end_aelith' }
      ]
    },
    nyssa: {
      id: 'end_nyssa',
      who: 'nyssa',
      bg: 'tower',
      steps: [
        say('end_ny1', 'narr', 'The balcony is cold and clear. Nyssa has left the jokes inside.'),
        say('end_ny2', 'nyssa', 'Plain version: I want you here when the festival is a story. I will be clever again tomorrow. Tonight I am only sure.', { sprite: 'nyssa.date' }),
        say('end_ny3', 'nyssa', 'Stay, {name}. Let the moon get used to your hand on this rail.', { sprite: 'nyssa.date.pose2' }),
        say('end_ny4', 'narr', 'You stay. She kisses you under a sky she has already named, and the gate, out of respect or exhaustion, forgets to shut.', { cg: true, fade: true }),
        { op: 'unlock', id: 'end_ny5', who: 'nyssa', gallery: 'end_nyssa' }
      ]
    },
    lirael: {
      id: 'end_lirael',
      who: 'lirael',
      bg: 'falls',
      steps: [
        say('end_li1', 'narr', 'Dawn finds the falls in gold mist. Lirael is not behind a tree. She is in the open, shawl tight, smile braver than the rest of her.'),
        say('end_li2', 'lirael', 'I asked the forest. It said yes, which is what I was going to do anyway. Stay. I will make you tea and also probably cry a little. Happy cry. The good kind.', { sprite: 'lirael.date' }),
        say('end_li3', 'lirael', 'Your footsteps can stay. I want them to.', { sprite: 'lirael.date.pose2' }),
        say('end_li4', 'narr', 'You stay. She kisses you with both hands in your cloak, and the mist closes like a curtain, gentle, around a life that has room for you.', { cg: true, fade: true }),
        { op: 'unlock', id: 'end_li5', who: 'lirael', gallery: 'end_lirael' }
      ]
    }
  };

  const CARDS = {
    aelith: {
      kicker: 'GOOD ENDING',
      title: 'The Gate Stays Open',
      text: 'Vaelith learns your name. Aelith keeps her promise, and her teasing, and the sunrise finds you still in the gardens.'
    },
    nyssa: {
      kicker: 'GOOD ENDING',
      title: 'Plain as Moonlight',
      text: 'The balcony becomes a habit. Nyssa is clever again by breakfast, and plain again whenever you ask. The moon, she insists, approves.'
    },
    lirael: {
      kicker: 'GOOD ENDING',
      title: 'What the Forest Kept',
      text: 'The falls keep their noise. Lirael keeps your hand. The road home grows over, and neither of you minds.'
    },
    neutral: {
      kicker: 'THE FESTIVAL ENDS',
      title: 'When the Lanterns Go Out',
      text: 'You step through while the gate still remembers the trick of opening. By noon the road is only a road. Three names stay warm in your pocket, and the lantern will not light again.'
    }
  };

  const NEUTRAL = {
    open: 'The last lanterns burn low. Music frays. The steward does not meet your eye, which is a kindness. The gate is already practicing how to be a hedge.',
    aelith: 'She finds you at the edge of the light and bows, court-perfect, almost soft. "If you had stayed, I would have been impossible about it. Walk well, {name}."',
    nyssa: 'From the tower, a small wave, then a smaller one, as if she regrets the first. "Try not to be dull out there. I will be offended on principle."',
    lirael: 'She presses a leaf into your palm and does not trust her voice for a moment. "The path is less slippery if you remember it. I will remember you. That is allowed."',
    close: 'You step through. The kingdom folds like a letter. Morning is ordinary, and your pocket is warm where the leaf, or the ribbon, or nothing at all, used to be.'
  };

  window.LVDATA = {
    SPRITE_FILES: SPRITE_FILES,
    VIDEOS: VIDEOS,
    SHIP_LIST: SHIP_LIST,
    CAST: CAST,
    OUTFITS: OUTFITS,
    GALLERY: GALLERY,
    GALLERY_ORDER: GALLERY_ORDER,
    INTRO: INTRO,
    EVENTS: EVENTS,
    DAILIES: DAILIES,
    ENDINGS: ENDINGS,
    CARDS: CARDS,
    NEUTRAL: NEUTRAL
  };
})();
