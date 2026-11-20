import { DEITIES, knownDeity, paintingsOf } from './deities.js';
// Iconography is assigned by occasion, never by random name matching or by religion inferred
// from a custom subject. Each brief supplies a lead, supporting cast, and 8 still-life subjects.
// Topic | collection | devotional figures (if applicable) | illustrated subjects | painted scene
const lines = `
Diwali|Lakshmi & the lamps|Lakshmi,Ganesha|diya,lotus,kolam,coins,deepam,toran,kalash,garland|diwali-lakshmi
Ganesh Chaturthi|Ganesha’s celebration|Ganesha|modak,hibiscus,betel-tray,kalash,lotus,deepam,toran,garland|chaturthi-ganesha
Pongal|Surya & the harvest|Surya|pongal-pot,sugarcane,sun,grain,kolam,basket,harvest-bull,toran|pongal-surya
Thai Pongal|Thai harvest offerings|Surya|pongal-pot,sun,sugarcane,grain,kolam,garland,basket,deepam|pongal-surya
Mattu Pongal|Honoring the cattle|Krishna|harvest-bull,garland,sugarcane,pongal-pot,grain,bells,kolam,basket
Kaanum Pongal|A harvest gathering||basket,sugarcane,family-tree,grain,boat,kolam,pongal-pot,garland
Bhogi|Renewal at dawn||bonfire,toran,kolam,grain,sugarcane,basket,deepam,horizon
Holi|Krishna & the colors|Krishna,Radha|color-bowls,water-spray,flute,petals,drum,peacock-feather,bunting,pinwheel|janmashtami-krishna
Navaratri|Nine nights of Devi|Durga,Lakshmi,Saraswati|deepam,lotus,bangles,veena,kalash,garland,drum,kumkum|navaratri-devi
Durga Puja|Durga in the pandal|Durga|drum,conches,garland,lotus,kalash,doorway,deepam,kumkum|navaratri-devi
Dussehra|Vijayadashami procession|Rama,Durga|chariot,doorway,garland,toran,conches,deepam,lotus,bells
Onam|Mahabali’s homecoming|Mahabali|pookalam,boat,grain,basket,garland,palm-fan,deepam,lotus-pond|mahabali-onam
Maha Shivaratri|The night of Shiva|Shiva|lingam,moon,drum,harvest-bull,deepam,bells,olive-branch,doorway|shivaratri-shiva
Makar Sankranti|Surya & the sky of kites|Surya|kite,sun,sugarcane,spool,grain,basket,horizon,bunting
Krishna Janmashtami|Krishna in Vrindavan|Krishna|flute,butter-pot,peacock-feather,cradle,footprints,garlands,lotus,moon|janmashtami-krishna
Raksha Bandhan|Threads of kinship||rakhi,braid,betel-tray,letters,ribbon,kumkum,bangles,basket
Tamil Puthandu|The first morning||kolam,toran,calendar,betel-tray,deepam,kalash,petals,horizon
Ugadi|The Ugadi table||mango-leaves,baby-bowl,calendar,toran,kalash,grain,deepam,letters
Gudi Padwa|The raised gudi||gudi,silk-folds,kalash,garland,mango-leaves,calendar,kolam,deepam
Vishu / Vishu Kani|Vishukkani at dawn|Krishna|deepam,coins,basket,grain,lotus,mirror,book,petals
Baisakhi|Fields of gold||grain,drum,basket,sun,silk-folds,sprout,horizon,bunting
Lohri|Around the bonfire||bonfire,drum,grain,sugarcane,basket,silk-folds,sun,petals
Rongali Bihu|Rhythm of spring||drum,silk-folds,flute,sprout,basket,grain,garland,sun
Magh Bihu|The harvest fire||bonfire,grain,basket,drum,sugarcane,sun,silk-folds,flute
Chhath Puja|An offering to the sun|Surya|sunrise-path,basket,sugarcane,drop,grain,deepam,lotus-pond,sun
Karthigai Deepam|The mountain of lights|Shiva,Murugan|deepam,diya,bonfire,doorway,kolam,moon,garland,bells
Thaipusam|A festival for Murugan|Murugan|peacocks,garland,kalash,peacock-feather,deepam,bells,lotus,doorway
Akshaya Tritiya|Lotus & abundance|Lakshmi,Vishnu|coins,kalash,grain,lotus,deepam,jewellery-box,conches,garland|diwali-lakshmi
Rama Navami|Rama’s royal court|Rama|chariot,lotus,garland,doorway,conches,deepam,toran,book
Hanuman Jayanti|Hanuman in devotion|Hanuman|mountain,book,garland,deepam,doorway,lotus,toran,bells
Guru Purnima|At the teacher’s feet||moon,book,palm-leaf,lotus,deepam,stylus,garland,stars
Karva Chauth|Moonrise through the sieve||sieve,moon,kalash,henna,bangles,betel-tray,deepam,kumkum
Dhanteras|Lamps of prosperity|Dhanvantari,Lakshmi|kalash,coins,deepam,lotus,betel-tray,jewellery-box,conches,basket
Bhai Dooj|A sibling’s blessing||betel-tray,kumkum,hands,letters,ribbon,album,deepam,basket
Govardhan Puja|Krishna & Govardhan|Krishna|mountain,harvest-bull,butter-pot,flute,peacock-feather,basket,garland,grain
Saraswati Puja / Vasant Panchami|Saraswati in spring|Saraswati|veena,book,inkwell,lotus,quill,petals,deepam,garland|vasant-saraswati
Ayudha Puja|Blessings for our tools|Saraswati|ruler,book,veena,pencils,stylus,garland,deepam,toran|vasant-saraswati
Varalakshmi Vratam|Varalakshmi’s blessings|Lakshmi|kalash,lotus,coins,garland,bangles,deepam,toran,kumkum|diwali-lakshmi
Aadi Perukku|Gifts of the river||boat,lotus-pond,drop,grain,basket,deepam,garland,sprout
Mahavir Jayanti|A moment of ahimsa||olive-branch,lotus,book,hands,deepam,sprout,wreath,horizon
Buddha Purnima|Under the Bodhi tree|Buddha|bodhi-leaf,moon,lotus,deepam,book,lotus-pond,olive-branch,horizon|buddha-purnima
Guru Nanak Jayanti|Light & service||book,deepam,hands,baby-bowl,garland,letters,lantern,horizon
Eid al-Fitr|Crescent & lantern||lantern,star-moon,archway,dates,stars,letters,rosettes,moon
Eid al-Adha|Generosity at Eid||archway,lantern,star-moon,date-palm,baby-bowl,letters,stars,rosettes
Eid-e-Milad|Lanterns of remembrance||star-moon,archway,lantern,stars,dates,rosettes,letters,moon
Christmas|The Christmas star||nativity,evergreen,bells,star-pillow,wreath,lantern,ribbon,letters
Easter|Light of Easter||lily,cross,sunrise-path,olive-branch,lantern,book,wreath,letters
Good Friday|Remembrance & reflection||cross,olive-branch,lily,lantern,book,horizon,wreath,letters
Mahalaya|Dawn of Devi Paksha|Durga|sunrise-path,conches,lotus,deepam,drum,garland,drop,doorway|navaratri-devi
Attukal Pongala|An offering for Bhagavathy|Bhagavathy|pongal-pot,grain,bonfire,basket,deepam,garland,temple-gate,toran
Thrissur Pooram|A temple procession||parasol,elephant,drum,music,deepam,garland,temple-gate,silk-folds
Bonalu|A decorated offering|Mahakali|pongal-pot,kalash,drum,garland,deepam,kumkum,toran,bells
Bathukamma|A tower of flowers|Gauri|flower-tower,pookalam,petals,lotus-pond,garland,basket,deepam,kalash
Hartalika Teej / Teej|Monsoon devotion|Parvati,Shiva|swing,henna,bangles,garland,lotus,drop,deepam,silk-folds
Gangaur|Gauri & Ishar|Gauri,Shiva|kalash,henna,bangles,garland,boat,deepam,toran,lotus
Losar|A highland new year||mountain,bunting,baby-bowl,calendar,drum,book,basket,horizon
Hornbill Festival|Feathers & the gathering||hornbill,drum,silk-folds,basket,grain,flute,garland,mountain
Wangala|Rhythm of the harvest||drum,grain,flute,basket,sun,sprout,silk-folds,horizon
Nuakhai|The first grain||grain,baby-bowl,basket,kalash,garland,deepam,sun,toran
Parsi New Year|A table of new beginnings||mirror,rose,lantern,book,sprout,calendar,letters,petals
Nag Panchami|The Naga shrine|Naga|serpent,lotus,deepam,garland,basket,doorway,betel-tray,bells
Skanda Sashti|Murugan’s peacock|Murugan|peacock-feather,peacocks,deepam,bells,garland,conches,doorway,lotus
Vaikunta Ekadashi|Vishnu’s gateway|Vishnu|doorway,conches,lotus,deepam,garland,kalash,temple-gate,bells
Aadi Pooram|Andal’s garlands|Andal|garland,bangles,lotus,deepam,parrot,temple-gate,kalash,betel-tray
Ratha Yatra|Jagannath’s chariot|Jagannath|chariot,conches,garlands,bells,lotus,toran,drum,horizon
Gowri Habba|Gowri’s floral court|Gauri|kalash,turmeric,garland,betel-tray,lotus,deepam,bangles,kumkum
Bandi Chhor Divas|A night of lights||diya,lantern,deepam,hands,doorway,book,stars,horizon
Kali Puja|Kali’s night of lamps|Kali|hibiscus,diya,moon,deepam,lotus,garland,doorway,drum
Margazhi|Kolam at first light|Andal|kolam,garland,veena,deepam,doorway,lotus,flute,temple-gate
Paryushana|Reflection & forgiveness||hands,olive-branch,book,lotus,deepam,letters,sprout,horizon
Ladakh Festival|A highland celebration||mountain,bunting,drum,flute,silk-folds,basket,horizon,garland
Sangai Festival|By Loktak Lake||sangai,boat,lotus-pond,silk-folds,drum,basket,mountain,grain
Chapchar Kut|Bamboo & the spring||bamboo,drum,basket,silk-folds,sprout,flute,garland,horizon
Moatsu|A village gathering||basket,grain,drum,bonfire,silk-folds,sprout,garland,flute
Karam|The Karam tree||family-tree,sprout,drum,grain,basket,garland,silk-folds,horizon
Cheti Chand|Jhulelal by the river|Jhulelal|boat,drop,deepam,lotus-pond,kalash,garland,grain,moon
Ambubachi Mela|Kamakhya’s red shrine|Kamakhya|temple-gate,silk-folds,hibiscus,deepam,garland,drop,kalash,lotus
Mother’s Day|A mother’s keepsakes||mother-child,letters,hands,album,heart,swaddle,family-tree,rose|mothers-day-garden
Father’s Day|For a father||parent-child,kite,storybook,compass,swing,album,letters,family-tree|fathers-day-kite
Teachers’ Day|The teacher’s desk||chalkboard,book,pencils,globe,inkwell,ruler,abacus,quill|teachers-day-classroom
Women’s Day|Voices & achievements||speaker,laurel,book,letters,hands,globe,quill,rose
Children’s Day|Childhood stories||kite,train,blocks,storybook,pinwheel,balloon,abacus,bunting
Independence Day|The tricolor unfurled||tricolor,chakra,doorway,horizon,olive-branch,book,letters,lotus
Republic Day|The Republic collection||chakra,tricolor,constitution,doorway,quill,horizon,lotus,letters
International Yoga Day|Breath & balance||yoga,lotus,sunrise-path,moon,bodhi-leaf,phases,lotus-pond,meridian
New Year’s Day|A fresh page||calendar,hourglass,stars,letters,balloon,bunting,sprout,horizon
World Environment Day|A living world||sprout,globe,drop,family-tree,olive-branch,sun,grain,lotus-pond
Friendship Day|Letters to a friend||braid,letters,album,hands,kite,ribbon,heart,wreath
Grandparents’ Day|Stories across generations||album,family-tree,storybook,swing,hands,letters,wreath,heart
International Day of Families|The family album||family-tree,album,parent-child,mother-child,hands,storybook,letters,heart
World Health Day|In good health||stethoscope,heart,hands,drop,olive-branch,book,sun,sprout
Earth Day|Our planet||globe,sprout,family-tree,drop,grain,sun,mountain,olive-branch
National Youth Day|The next chapter||laurel,book,kite,speaker,compass,stars,sprout,globe
National Science Day|The science bench||microscope,orbits,globe,ruler,book,quadrant,meridian,pencils
Doctors’ Day|The physician’s desk||stethoscope,medical-bag,heart,hands,book,quill,letters,globe
Engineers’ Day|The drafting table||drafting-compass,ruler,blueprint,quadrant,pencils,meridian,globe,book
Labour Day|In working hands||tools,hands,blueprint,ruler,grain,laurel,spool,letters
Constitution Day|A founding document||constitution,quill,chakra,tricolor,book,laurel,letters,inkwell
Gandhi Jayanti|Truth & nonviolence||spinning-wheel,olive-branch,book,quill,hands,chakra,letters,horizon
Valentine’s Day|A letter of affection||heart,letters,rose,ribbon,album,hands,wreath,petals
International Day of Peace|A branch of peace||peace-dove,olive-branch,globe,hands,letters,sprout,horizon,wreath
World Book Day|An open book||book,storybook,inkwell,quill,pencils,letters,album,globe
World Music Day|Sound studies||veena,flute,drum,music,bells,book,ribbon,stars
International Literacy Day|Words & learning||pencils,book,chalkboard,quill,globe,inkwell,letters,storybook
World Mental Health Day|Space for care||heart,hands,olive-branch,sprout,letters,book,drop,horizon
National Sports Day|On the playing field||hockey,medal,laurel,scoreboard,ribbon,tricolor,stars,horizon
World Students’ Day|A curious mind||globe,pencils,book,microscope,chalkboard,ruler,inkwell,abacus
World Kindness Day|Small acts of care||hands,heart,letters,rose,sprout,olive-branch,album,wreath
International Men’s Day|Community & wellbeing||speaker,hands,book,heart,letters,laurel,globe,album
National Education Day|The learning studio||book,chalkboard,globe,pencils,quill,ruler,abacus,letters
World Heritage Day|Built heritage||temple-gate,archway,doorway,globe,book,camera,album,laurel
National Girl Child Day|Room to dream||storybook,kite,pencils,globe,sprout,stars,quill,letters
National Handloom Day|Warp & weft||loom,silk-folds,spool,hoop,braid,quilt,ribbon,basket
International Mother Language Day|A world of words||letters,quill,book,inkwell,pencils,globe,letter-cards,storybook
World Water Day|Every drop||drop,lotus-pond,globe,boat,sprout,grain,olive-branch,horizon
International Day of Happiness|Small joys||kite,sun,heart,letters,balloon,sprout,petals,pinwheel
World Art Day|The artist’s table||paintbox,quill,hoop,spool,album,pencils,petals,silk-folds
National Technology Day|Ideas to circuits||circuit,blueprint,ruler,globe,book,orbits,meridian,pencils
World Photography Day|The darkroom||camera,album,globe,letters,laurel,book,stars,horizon
International Nurses Day|In caring hands||medical-bag,stethoscope,hands,heart,book,letters,drop,sprout
World Senior Citizens Day|A lifetime of stories||family-tree,album,book,hands,letters,swing,laurel,heart
`;
const norm = (s) => s.normalize('NFKC').toLowerCase().replace(/[’']/g, '').trim();
const curated = new Map();
for (const line of lines.trim().split('\n')) {
  const [names, title, gods, cast, setting] = line.split('|');
  const brief = {
    title,
    gods: gods ? gods.split(',') : [],
    motifs: cast.split(','),
    setting,
    curated: true,
  };
  for (const n of names.split(' / ')) curated.set(norm(n), brief);
}
export function occasionBrief(topic) {
  if (topic.category === DEITIES) {
    const deity = knownDeity(topic);
    return deity
      ? {
          title: deity.name + ' darshan',
          gods: [deity.name],
          motifs: deity.motifs,
          paintings: paintingsOf(deity.name),
          curated: true,
          standalone: true,
        }
      : {
          title: topic.name + ' · My pictures',
          gods: [],
          motifs: ['lotus', 'deepam', 'garland', 'bells', 'rose', 'petals', 'ribbon', 'jasmine'],
          personal: true,
        };
  }
  return (
    curated.get(norm(topic.name)) || {
      title: 'Celebration stationery',
      motifs: ['wreath', 'letters', 'petals', 'lantern', 'ribbon', 'album', 'sprout', 'bunting'],
      gods: [],
      curated: false,
    }
  );
}
