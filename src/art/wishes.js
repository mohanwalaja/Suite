// Original short poster greetings. Keep solemn observances distinct from celebrations;
// no date assumptions, promises, or fortune predictions. Existing draft wording wins.
const text = `
Ganesh Chaturthi|May Ganesha bless your new beginnings.
Navaratri|Nine nights of devotion, music and light.
Durga Puja|Wishing you courage and joy this Durga Puja.
Dussehra|May goodness shine in every new beginning.
Onam|A joyful Onam, from our home to yours.
Maha Shivaratri|May Shiva’s night bring stillness and peace.
Makar Sankranti|Bright skies and warm harvest wishes.
Krishna Janmashtami|May Krishna’s flute fill your home with joy.
Raksha Bandhan|For the bond that distance cannot untie.
Tamil Puthandu|Puthandu Nalvazhthukkal! A joyful new year.
Ugadi|May every flavor of the new year bring hope.
Gudi Padwa|Raise the gudi. Welcome a new beginning.
Vishu / Vishu Kani|May the first light of Vishu bring you joy.
Baisakhi|Golden fields and warm Baisakhi wishes.
Lohri|Wishing you warmth around the Lohri fire.
Rongali Bihu|May spring arrive with rhythm and laughter.
Magh Bihu|Warm wishes for a bountiful harvest feast.
Chhath Puja|Gratitude to the sun, at dusk and dawn.
Karthigai Deepam|May each deepam light a little hope.
Thaipusam|May Murugan’s blessings accompany you.
Akshaya Tritiya|Warm wishes for a generous new beginning.
Rama Navami|May Rama’s example inspire kindness today.
Hanuman Jayanti|May devotion and courage guide your steps.
Guru Purnima|With gratitude to those who guide us.
Karva Chauth|Warm wishes beneath the evening moon.
Dhanteras|May your lamps glow with health and hope.
Bhai Dooj|For a lifetime of sibling stories and love.
Govardhan Puja|Wishing you a joyful Govardhan Puja.
Saraswati Puja / Vasant Panchami|May Saraswati inspire learning and the arts.
Ayudha Puja|Honoring the tools that shape our work.
Varalakshmi Vratam|May Lakshmi’s grace brighten your home.
Aadi Perukku|Gratitude for flowing rivers and fertile fields.
Mahavir Jayanti|May compassion guide every living act.
Buddha Purnima|May kindness and mindfulness light your path.
Guru Nanak Jayanti|Celebrating a spirit of equality and service.
Eid al-Fitr / Eid al-Adha|Eid Mubarak to you and your loved ones.
Eid-e-Milad|Warm wishes for a peaceful Eid-e-Milad.
Christmas|Peace on earth. Joy in every home.
Easter|May Easter morning bring renewed hope.
Mahalaya|A peaceful dawn of remembrance and devotion.
Attukal Pongala|May each offering carry a prayer of gratitude.
Thrissur Pooram|Wishing you a jubilant Pooram celebration.
Bonalu|Warm wishes for a joyful Bonalu.
Bathukamma|May your celebrations bloom like these flowers.
Hartalika Teej / Teej|Warm Teej wishes beneath the monsoon skies.
Gangaur|Wishing you a Gangaur filled with love.
Losar|May the new year bring peace to your home.
Hornbill Festival|Celebrating living traditions, song and craft.
Wangala|May the harvest drums carry your joy.
Nuakhai|Gratitude for the first grain of the harvest.
Parsi New Year|Warm wishes for a bright and peaceful year.
Nag Panchami|Wishing you a peaceful Nag Panchami.
Skanda Sashti|May Murugan inspire strength and devotion.
Vaikunta Ekadashi|A peaceful day of devotion to Vishnu.
Aadi Pooram|Celebrating Andal with flowers and devotion.
Thai Pongal|Iniya Pongal Nalvazhthukkal!
Mattu Pongal|With gratitude to the cattle of the harvest.
Kaanum Pongal|May family and friendship fill this harvest day.
Bhogi|Let this Bhogi welcome a fresh beginning.
Ratha Yatra|Joyful wishes as Jagannath’s chariot sets out.
Gowri Habba|Wishing you Gowri’s grace and a joyful celebration.
Bandi Chhor Divas|May the lights carry a message of freedom.
Kali Puja|May light and courage fill this sacred night.
Margazhi|Morning kolams, music and quiet devotion.
Paryushana|A time for reflection, compassion and forgiveness.
Ladakh Festival|Celebrating the arts of the high Himalayas.
Sangai Festival|Celebrating Manipur’s art, nature and community.
Chapchar Kut|May the season of bamboo dance bring joy.
Moatsu|For a season of sharing, song and friendship.
Karam|May new leaves bring hope for the harvest.
Cheti Chand|Warm wishes for a joyful Sindhi new year.
Ambubachi Mela|A time to honor renewal and devotion.
Women’s Day|Celebrating women’s voices and achievements.
Children’s Day|For every question, dream and discovery.
Independence Day|Celebrating freedom and our shared future.
Republic Day|Many voices. One republic.
International Yoga Day|A moment to breathe, stretch and be still.
New Year’s Day|A fresh page. A hopeful beginning.
World Environment Day|Small acts of care for our living world.
Friendship Day|For the friends who feel like home.
Grandparents’ Day|For the stories that connect generations.
International Day of Families|To the people who make a place a home.
World Health Day|Wishing every community care and wellbeing.
Earth Day|One earth, held in all our hands.
National Youth Day|Here’s to young voices and bold ideas.
National Science Day|Keep asking why. Keep discovering.
Doctors’ Day|Thank you for your care and commitment.
Engineers’ Day|For the minds that turn plans into progress.
Labour Day|Honoring the hands behind our everyday lives.
Constitution Day|Reflecting on justice, liberty and equality.
Valentine’s Day|May the people you love feel it today.
International Day of Peace|Let peace begin with listening.
World Book Day|Open a book. Discover another world.
World Music Day|Let music bring us together.
International Literacy Day|Every word opens a door.
World Mental Health Day|There is strength in asking for care.
National Sports Day|Celebrating the spirit of fair play.
World Students’ Day|For every learner finding their own path.
World Kindness Day|A small kindness can change someone’s day.
International Men’s Day|Celebrating care, wellbeing and community.
National Education Day|Let learning reach every classroom.
World Heritage Day|Looking after the places that tell our stories.
National Girl Child Day|Space to learn, lead and dream.
National Handloom Day|Honoring each thread and every weaver.
International Mother Language Day|Every mother tongue carries a world of stories.
World Water Day|Treasure every drop.
International Day of Happiness|May the little things bring you joy.
World Art Day|A celebration of color, craft and imagination.
National Technology Day|For ideas that make everyday life better.
World Photography Day|A single frame can hold a story.
International Nurses Day|Thank you for the care in every shift.
World Senior Citizens Day|Honoring experience, wisdom and connection.
`;
export const wishes = new Map(
  text
    .trim()
    .split('\n')
    .flatMap((row) => {
      const [names, greeting] = row.split('|');
      return names.split(' / ').map((n) => [n, greeting]);
    }),
);
