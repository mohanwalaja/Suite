// Names are stable catalogue identities. Epithets and common transliterations are searchable;
// they are not counted as extra deities or additional pictures.
export const DEITIES = 'Hindu deities';
const records = `
Ganesha|गणेश|Ganesh Ganapati Ganpati Vinayaka Pillaiyar गणपति विनायक|May every beginning be filled with wisdom.|modak,hibiscus,book,palm-leaf,deepam,garland,lotus,toran
Shiva|शिव|Siva Shiv Shankar Mahadev Mahadeva Bholenath Nataraja भोलेनाथ महादेव शंकर|A moment of stillness in the presence of Shiva.|lingam,mountain,harvest-bull,moon,drum,deepam,bells,garland
Vishnu|विष्णु|Narayana Hari Perumal नारायण हरि|May peace and balance fill your home.|conches,lotus,serpent,garland,temple-gate,deepam,kalash,lotus-pond
Lakshmi|लक्ष्मी|Mahalakshmi Laxmi Sri Mahalakshmi महालक्ष्मी|May generosity and grace brighten your day.|lotus,coins,deepam,kalash,elephant,diya,garland,grain
Krishna|कृष्ण|Kanhaiya Gopal Govinda Bal Gopal Kanha कन्हैया कान्हा गोपाल|May the music of Krishna’s flute bring joy.|flute,peacock-feather,butter-pot,harvest-bull,cradle,mountain,lotus,garland
Rama|राम|Ram Shri Ram Raghava Ramachandra राघव श्रीराम|May courage walk hand in hand with kindness.|chariot,lotus,temple-gate,garland,conches,deepam,book,toran
Sita|सीता|Janaki Sita Devi Maithili जानकी मैथिली|With reverence for Sita’s strength and grace.|lotus,garland,family-tree,deepam,temple-gate,petals,kalash,grain
Hanuman|हनुमान|Anjaneya Bajrangbali Maruti Anjaneyar बजरंगबली आंजनेय|May devotion give you strength.|mountain,book,hibiscus,deepam,temple-gate,garland,lotus,toran
Saraswati|सरस्वती|Saraswathi Sharada Vani Sharda शारदा वीणापाणि|May learning and music brighten your path.|veena,book,quill,lotus,palm-leaf,inkwell,deepam,garland
Durga|दुर्गा|Durga Devi Amba Ambika Sherawali अम्बा अंबिका शेरावाली|May the Mother’s courage and compassion guide us.|lion,conches,lotus,drum,hibiscus,kalash,garland,deepam
Parvati|पार्वती|Gauri Gowri Uma Girija गौरी उमा गिरिजा|May love and steadfastness fill your home.|mountain,lotus,garland,kalash,deepam,henna,bangles,swing
Kali|काली|Maa Kali Mahakali Kalika महाकाली कालिका|May courage shine through the darkest night.|hibiscus,moon,diya,deepam,garland,lotus,doorway,drum
Murugan|मुरुगन|Kartikeya Karthikeya Skanda Subrahmanya Subramanya Shanmukha कार्तिकेय स्कन्द सुब्रह्मण्य|With devotion to Murugan of the hills.|peacocks,peacock-feather,mountain,garland,bells,deepam,doorway,lotus
Venkateswara|वेंकटेश्वर|Venkateshwara Balaji Srinivasa Govinda Tirupati Venkatachalapathy बालाजी श्रीनिवास|A lamp-lit darshan of Sri Venkateswara.|temple-gate,garlands,conches,deepam,lotus,mountain,kalash,bells
Ayyappa|अय्यप्पा|Ayyappan Dharma Sastha Manikandan Shasta शास्ता मणिकंठन|With devotion on the path to Sabarimala.|mountain,deepam,temple-gate,garland,bells,lotus,basket,kalash
Radha|राधा|Radharani Radhika Vrishabhanu राधारानी राधिका|A celebration of loving devotion.|lotus,flute,peacock-feather,garland,lotus-pond,swing,rose,petals
Brahma|ब्रह्मा|Brahmadev Chaturmukha Prajapati चतुर्मुख प्रजापति|Honoring creation, knowledge and new beginnings.|lotus,book,palm-leaf,kalash,lotus-pond,quill,deepam,garland
Surya|सूर्य|Suryadev Aditya Ravi Bhaskara भास्कर आदित्य रवि|With gratitude for the light of a new day.|sun,chariot,lotus,horizon,grain,sugarcane,kalash,deepam
Jagannath|जगन्नाथ|Jagannatha Puri Jagannath जगन्नाथजी|Warm wishes from the path of the chariot.|chariot,conches,garlands,deepam,temple-gate,lotus,drum,bells
Narasimha|नरसिंह|Narasinha Narasingha Lakshmi Narasimhar नृसिंह|May courage shelter those in need.|lion,conches,lotus,garland,deepam,temple-gate,kalash,book
Ganga|गंगा|Ganges Ganga Maiya Bhagirathi भागीरथी गंगाजी|May the river inspire renewal and care.|drop,kalash,lotus-pond,boat,mountain,deepam,garland,lotus
Annapurna|अन्नपूर्णा|Annapoorna Annapurneshwari अन्नपूर्णेश्वरी|In gratitude for nourishment and sharing.|baby-bowl,grain,rice-tray,basket,deepam,lotus,kalash,garland
Meenakshi|मीनाक्षी|Minakshi Madurai Meenatchi मीनाक्षी अम्मन|May Meenakshi’s grace brighten your day.|parrot,temple-gate,lotus,garland,deepam,silk-folds,kalash,bells
Andal|आंडाल|Aandal Goda Kothai Kodhai गोदा कोदै|A floral offering in the spirit of Andal.|garlands,parrot,lotus,deepam,bangles,book,temple-gate,betel-tray
Mariamman|मारियम्मन|Mariamman Mariamma Amman Mariamman Devi मारिअम्मा|Gratitude for rain, renewal and community.|kalash,drop,garland,hibiscus,deepam,turmeric,temple-gate,lotus
Dhanvantari|धन्वंतरि|Dhanvantri Dhanwantari Ayurveda धन्वन्तरि|Wishing you health and wellbeing.|kalash,conches,sprout,lotus,deepam,book,betel-tray,garland
Dattatreya|दत्तात्रेय|Datta Guru Dattaguru अवधूत दत्तगुरु|With gratitude for wisdom and guidance.|harvest-bull,book,family-tree,kalash,deepam,lotus,garland,palm-leaf
Shani|शनि|Shanidev Sani Shanaishchara शनिदेव शनैश्चर|May patience and discipline guide each step.|crow,deepam,stars,temple-gate,diya,garland,kalash,lotus
Chandra|चंद्र|Chandradev Soma Chandran चन्द्र सोम|May moonlight bring a moment of calm.|moon,chariot,phases,stars,lotus-pond,kalash,garland,deepam
Indra|इंद्र|Indradev Devendra Indiran इन्द्र देवेन्द्र|Celebrating the clouds and life-giving rain.|elephant,drop,cloud,lotus,kalash,garland,horizon,deepam
Agni|अग्नि|Agnidev Pavaka पावक अग्निदेव|A flame of reverence and renewal.|havan,bonfire,deepam,diya,wooden-ladle,grain,kalash,lotus
Naga|नाग|Naga Devata Nag Devta Nagadevata नागदेवता|In reverence for the sacred grove.|serpent,family-tree,lotus,deepam,garland,betel-tray,bells,doorway
Bhagavathy|भगवती|Bhagavati Bhagavathi Attukal भगवती देवी|An offering of gratitude to Bhagavathy.|hibiscus,pongal-pot,deepam,garland,bells,temple-gate,grain,kalash
Kamakhya|कामाख्या|Maa Kamakhya Kameshwari कामेश्वरी|Honoring the sacred rhythms of renewal.|temple-gate,silk-folds,hibiscus,garland,deepam,lotus,kalash,drop
Jhulelal|झूलेलाल|Jhoolay Lal Uderolal Zinda Pir उदेरोलाल|Warm wishes by the flowing river.|boat,drop,deepam,lotus-pond,kalash,garland,grain,moon
`;
export const deityTopics = records
  .trim()
  .split('\n')
  .map((line) => {
    const [name, hindi, aliases, tagline, cast] = line.split('|');
    return {
      id: 'deity-' + name.toLowerCase(),
      name,
      hindi,
      aliases,
      tagline,
      motifs: cast.split(','),
      category: DEITIES,
      eyebrow: 'A devotional offering',
      description: `${name} · ${tagline}`,
      path: '/',
      tags: [name, 'Darshan', 'DevotionalArt'],
    };
  });
const byId = new Map(deityTopics.map((t) => [t.id, t]));
export const knownDeity = (topic) => (topic.category === DEITIES ? byId.get(topic.id) : undefined);
// Source of truth for the AI paintings. Title | depicted figures (lead first) | ink | framing.
// Earlier editorial paintings leave space for copy on the left. The newer whole scenes must
// be shown uncropped, including their settings and attributes. Never synthesize a missing face.
export const paintings = {
  'chaturthi-ganesha': ['Ganesha & the Modaks', 'Ganesha', 'ivory'],
  'dev-ganesha-scribe': ['Ganesha the Scribe', 'Ganesha', 'wine'],
  'diwali-lakshmi': ['Lakshmi on the Lotus', 'Lakshmi', 'wine'],
  'dev-gajalakshmi': ['Gaja Lakshmi at the Tank', 'Lakshmi', 'teal'],
  'janmashtami-krishna': ['Krishna in Vrindavan', 'Krishna', 'night'],
  'dev-krishna-butter': ['Bala Krishna & the Butter Pot', 'Krishna', 'ivory'],
  'navaratri-devi': ['Durga & the Lion', 'Durga', 'wine'],
  'vasant-saraswati': ['Saraswati & the Veena', 'Saraswati', 'ivory'],
  'shivaratri-shiva': ['Shiva at Kailash', 'Shiva', 'night'],
  'pongal-surya': ['Surya at Harvest', 'Surya', 'ivory'],
  'dev-rama': ['Sita & Rama in Ayodhya', 'Rama,Sita', 'teal'],
  'dev-hanuman': ['Hanuman in Prayer', 'Hanuman', 'wine'],
  'dev-vishnu': ['Vishnu on Adishesha', 'Vishnu', 'night'],
  'dev-murugan': ['Murugan of the Hills', 'Murugan', 'jade'],
  'dev-venkateswara': ['Darshan at Tirumala', 'Venkateswara', 'wine'],
  'dev-ayyappa': ['Ayyappa at Sabarimala', 'Ayyappa', 'teal'],
  'dev-kali': ['Kali & the Hibiscus Garland', 'Kali', 'night'],
  'ganga-makara': ['Ganga on the Makara', 'Ganga', 'teal', 'whole'],
  'annapurna-kashi': ['Annapurna Serves Shiva at Kashi', 'Annapurna,Shiva', 'clay', 'whole'],
  'meenakshi-madurai': ['Meenakshi at the Golden Lotus Tank', 'Meenakshi', 'jade', 'whole'],
  'andal-garden': ['Andal in the Garland Garden', 'Andal', 'moss', 'whole'],
  'mariamman-monsoon': ['Mariamman and the First Rain', 'Mariamman', 'teal', 'whole'],
  'dhanvantari-ocean': ['Dhanvantari Rises from the Ocean', 'Dhanvantari', 'cobalt', 'whole'],
  'dattatreya-banyan': ['Dattatreya beneath the Fig Tree', 'Dattatreya', 'moss', 'whole'],
  'shani-crow': ['Shani on the Crow at Dusk', 'Shani', 'night', 'whole'],
  'chandra-moon-chariot': ['Chandra’s Moonlit Chariot', 'Chandra', 'cloud', 'whole'],
  'indra-airavata': ['Indra Rides Airavata', 'Indra', 'violet', 'whole'],
  'agni-ram': ['Agni and the Ram', 'Agni', 'clay', 'whole'],
  'naga-grove': ['Naga in the Sacred Grove', 'Naga', 'jade', 'whole'],
  'bhagavathy-pongala': ['Pongala for Attukal Bhagavathy', 'Bhagavathy', 'wine', 'whole'],
  'kamakhya-nilachal': ['Red Hibiscus at Kamakhya’s Shrine', 'Kamakhya', 'wine', 'whole'],
  'jhulelal-indus': ['Jhulelal on the Indus', 'Jhulelal', 'cobalt', 'whole'],
  'mahabali-onam': ['Mahabali’s Homecoming', 'Mahabali', 'moss', 'whole'],
  'buddha-purnima': ['The Buddha at Bodh Gaya', 'Buddha', 'night', 'whole'],
  'jagannath-puri': ['Jagannath on Nandighosha', 'Jagannath', 'clay', 'whole'],
  'narasimha-prahlada': ['Narasimha Blesses Prahlada', 'Narasimha', 'sand', 'whole'],
  'brahma-lotus': ['Brahma on the Cosmic Lotus', 'Brahma', 'violet', 'whole'],
  'parvati-tapas': ['Parvati in Himalayan Meditation', 'Parvati', 'teal', 'whole'],
  'radha-yamuna': ['Radha Hears Krishna by the Yamuna', 'Radha,Krishna', 'rose', 'whole'],
};
const canonical = (name) => ({ Gauri: 'Parvati', Mahakali: 'Kali' })[name] || name;
export function paintingsOf(name, { leadOnly = false } = {}) {
  const figure = canonical(name);
  const lead = [],
    shared = [];
  for (const [key, [, people]] of Object.entries(paintings)) {
    const cast = people.split(',');
    if (cast[0] === figure) lead.push(key);
    else if (!leadOnly && cast.includes(figure)) shared.push(key);
  }
  return [...lead, ...shared];
}
export function customDeity(name, photos) {
  return {
    id: 'personal-' + photos[0].id,
    name,
    category: DEITIES,
    photos,
    eyebrow: 'A devotional offering',
    tagline: 'With reverence and warm wishes.',
    description: `A devotional greeting honoring ${name}.`,
    path: '/',
    tags: [name.replace(/[^\p{L}\p{M}\p{N}]/gu, ''), 'DevotionalArt'],
  };
}
