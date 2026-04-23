const Superhero = require('./models/Superhero');

const seedData = [
  // Marvel (20 characters)
  { name: 'Iron Man', character_name: 'Tony Stark', year: 1963, house: 'Marvel', biography: 'Genius inventor and billionaire.', equipment: 'Powered Armor Suit', images: ['https://placehold.co/400x500/red/white?text=Iron+Man', 'https://placehold.co/400x500/darkred/white?text=Iron+Man+2'] },
  { name: 'Captain America', character_name: 'Steve Rogers', year: 1941, house: 'Marvel', biography: 'World War II veteran and super soldier.', equipment: 'Vibranium Shield', images: ['https://placehold.co/400x500/blue/white?text=Captain+America'] },
  { name: 'Thor', character_name: 'Thor Odinson', year: 1962, house: 'Marvel', biography: 'God of Thunder.', equipment: 'Mjolnir', images: ['https://placehold.co/400x500/gray/white?text=Thor'] },
  { name: 'Hulk', character_name: 'Bruce Banner', year: 1962, house: 'Marvel', biography: 'A scientist who transforms into a giant green monster when angry.', equipment: 'None', images: ['https://placehold.co/400x500/green/white?text=Hulk'] },
  { name: 'Black Widow', character_name: 'Natasha Romanoff', year: 1964, house: 'Marvel', biography: 'Expert spy and assassin.', equipment: 'Widow\'s Bite', images: ['https://placehold.co/400x500/black/red?text=Black+Widow'] },
  { name: 'Hawkeye', character_name: 'Clint Barton', year: 1964, house: 'Marvel', biography: 'Master archer.', equipment: 'Bow and Trick Arrows', images: ['https://placehold.co/400x500/purple/white?text=Hawkeye'] },
  { name: 'Spider-Man', character_name: 'Peter Parker', year: 1962, house: 'Marvel', biography: 'Web-slinging superhero.', equipment: 'Web-shooters', images: ['https://placehold.co/400x500/red/blue?text=Spider-Man'] },
  { name: 'Doctor Strange', character_name: 'Stephen Strange', year: 1963, house: 'Marvel', biography: 'Sorcerer Supreme.', equipment: 'Cloak of Levitation', images: ['https://placehold.co/400x500/darkblue/red?text=Doctor+Strange'] },
  { name: 'Black Panther', character_name: 'T\'Challa', year: 1966, house: 'Marvel', biography: 'King of Wakanda.', equipment: 'Vibranium Suit', images: ['https://placehold.co/400x500/black/white?text=Black+Panther'] },
  { name: 'Captain Marvel', character_name: 'Carol Danvers', year: 1968, house: 'Marvel', biography: 'Cosmic-powered hero.', equipment: 'None', images: ['https://placehold.co/400x500/red/yellow?text=Captain+Marvel'] },
  { name: 'Ant-Man', character_name: 'Scott Lang', year: 1979, house: 'Marvel', biography: 'Can shrink and grow in size.', equipment: 'Ant-Man Suit', images: ['https://placehold.co/400x500/darkred/black?text=Ant-Man'] },
  { name: 'Wasp', character_name: 'Hope van Dyne', year: 2015, house: 'Marvel', biography: 'Can shrink and fly.', equipment: 'Wasp Suit', images: ['https://placehold.co/400x500/yellow/black?text=Wasp'] },
  { name: 'Wolverine', character_name: 'Logan', year: 1974, house: 'Marvel', biography: 'Mutant with healing factor and adamantium claws.', equipment: 'Adamantium Claws', images: ['https://placehold.co/400x500/yellow/blue?text=Wolverine'] },
  { name: 'Deadpool', character_name: 'Wade Wilson', year: 1991, house: 'Marvel', biography: 'Merc with a mouth.', equipment: 'Katanas, Guns', images: ['https://placehold.co/400x500/red/black?text=Deadpool'] },
  { name: 'Daredevil', character_name: 'Matt Murdock', year: 1964, house: 'Marvel', biography: 'Blind lawyer who fights crime by night.', equipment: 'Billy Club', images: ['https://placehold.co/400x500/darkred/white?text=Daredevil'] },
  { name: 'Punisher', character_name: 'Frank Castle', year: 1974, house: 'Marvel', biography: 'Vigilante seeking revenge.', equipment: 'Various Firearms', images: ['https://placehold.co/400x500/black/white?text=Punisher'] },
  { name: 'Ghost Rider', character_name: 'Johnny Blaze', year: 1972, house: 'Marvel', biography: 'Spirit of Vengeance.', equipment: 'Hellfire Chain', images: ['https://placehold.co/400x500/orange/black?text=Ghost+Rider'] },
  { name: 'Vision', character_name: '', year: 1968, house: 'Marvel', biography: 'Synthezoid member of the Avengers.', equipment: 'Mind Stone', images: ['https://placehold.co/400x500/green/yellow?text=Vision'] },
  { name: 'Scarlet Witch', character_name: 'Wanda Maximoff', year: 1964, house: 'Marvel', biography: 'Powerful magic wielder.', equipment: 'Chaos Magic', images: ['https://placehold.co/400x500/red/black?text=Scarlet+Witch'] },
  { name: 'Falcon', character_name: 'Sam Wilson', year: 1969, house: 'Marvel', biography: 'Former pararescueman with mechanical wings.', equipment: 'EXO-7 Falcon', images: ['https://placehold.co/400x500/gray/red?text=Falcon'] },
  
  // DC (20 characters)
  { name: 'Superman', character_name: 'Clark Kent', year: 1938, house: 'DC', biography: 'Kryptonian survivor with immense powers.', equipment: 'None', images: ['https://placehold.co/400x500/blue/red?text=Superman', 'https://placehold.co/400x500/darkblue/red?text=Superman+Fly'] },
  { name: 'Batman', character_name: 'Bruce Wayne', year: 1939, house: 'DC', biography: 'Billionaire vigilante of Gotham.', equipment: 'Utility Belt, Batarangs', images: ['https://placehold.co/400x500/black/yellow?text=Batman'] },
  { name: 'Wonder Woman', character_name: 'Diana Prince', year: 1941, house: 'DC', biography: 'Amazonian princess.', equipment: 'Lasso of Truth, Bracelets', images: ['https://placehold.co/400x500/red/blue?text=Wonder+Woman'] },
  { name: 'The Flash', character_name: 'Barry Allen', year: 1956, house: 'DC', biography: 'The fastest man alive.', equipment: 'Flash Ring', images: ['https://placehold.co/400x500/red/yellow?text=The+Flash'] },
  { name: 'Aquaman', character_name: 'Arthur Curry', year: 1941, house: 'DC', biography: 'King of Atlantis.', equipment: 'Trident', images: ['https://placehold.co/400x500/orange/green?text=Aquaman'] },
  { name: 'Cyborg', character_name: 'Victor Stone', year: 1980, house: 'DC', biography: 'Half-man, half-machine hero.', equipment: 'Cybernetic Enhancements', images: ['https://placehold.co/400x500/silver/red?text=Cyborg'] },
  { name: 'Green Lantern', character_name: 'Hal Jordan', year: 1959, house: 'DC', biography: 'Wields a power ring driven by willpower.', equipment: 'Power Ring', images: ['https://placehold.co/400x500/green/white?text=Green+Lantern'] },
  { name: 'Martian Manhunter', character_name: 'J\'onn J\'onzz', year: 1955, house: 'DC', biography: 'Alien from Mars with many abilities.', equipment: 'None', images: ['https://placehold.co/400x500/green/blue?text=Martian+Manhunter'] },
  { name: 'Green Arrow', character_name: 'Oliver Queen', year: 1941, house: 'DC', biography: 'Billionaire playboy turned vigilante archer.', equipment: 'Bow and Trick Arrows', images: ['https://placehold.co/400x500/green/black?text=Green+Arrow'] },
  { name: 'Shazam', character_name: 'Billy Batson', year: 1939, house: 'DC', biography: 'Boy who transforms into a magical hero.', equipment: 'None', images: ['https://placehold.co/400x500/red/gold?text=Shazam'] },
  { name: 'Nightwing', character_name: 'Dick Grayson', year: 1984, house: 'DC', biography: 'Former Robin turned independent hero.', equipment: 'Escrima Sticks', images: ['https://placehold.co/400x500/black/blue?text=Nightwing'] },
  { name: 'Supergirl', character_name: 'Kara Zor-El', year: 1959, house: 'DC', biography: 'Cousin of Superman.', equipment: 'None', images: ['https://placehold.co/400x500/blue/red?text=Supergirl'] },
  { name: 'Batgirl', character_name: 'Barbara Gordon', year: 1967, house: 'DC', biography: 'Vigilante ally of Batman.', equipment: 'Utility Belt', images: ['https://placehold.co/400x500/purple/yellow?text=Batgirl'] },
  { name: 'Joker', character_name: 'Unknown', year: 1940, house: 'DC', biography: 'Clown Prince of Crime.', equipment: 'Gag Gadgets, Joker Venom', images: ['https://placehold.co/400x500/purple/green?text=Joker'] },
  { name: 'Lex Luthor', character_name: 'Lex Luthor', year: 1940, house: 'DC', biography: 'Billionaire nemesis of Superman.', equipment: 'Warsuit', images: ['https://placehold.co/400x500/purple/green?text=Lex+Luthor'] },
  { name: 'Harley Quinn', character_name: 'Harleen Quinzel', year: 1992, house: 'DC', biography: 'Former psychiatrist, villain and anti-hero.', equipment: 'Giant Mallet, Baseball Bat', images: ['https://placehold.co/400x500/red/black?text=Harley+Quinn'] },
  { name: 'Poison Ivy', character_name: 'Pamela Isley', year: 1966, house: 'DC', biography: 'Eco-terrorist controlling plants.', equipment: 'Plant Toxins', images: ['https://placehold.co/400x500/green/red?text=Poison+Ivy'] },
  { name: 'Brainiac', character_name: 'Vril Dox', year: 1958, house: 'DC', biography: 'Extraterrestrial cyborg.', equipment: 'Skull Ship', images: ['https://placehold.co/400x500/green/purple?text=Brainiac'] },
  { name: 'Darkseid', character_name: 'Uxas', year: 1970, house: 'DC', biography: 'Ruler of Apokolips.', equipment: 'Omega Beams', images: ['https://placehold.co/400x500/gray/red?text=Darkseid'] },
  { name: 'Flash (Wally West)', character_name: 'Wally West', year: 1959, house: 'DC', biography: 'Former Kid Flash, the fastest man alive.', equipment: 'Speed Force', images: ['https://placehold.co/400x500/red/yellow?text=Flash+Wally'] },
];

const seedDatabase = async () => {
  try {
    const count = await Superhero.countDocuments();
    if (count === 0) {
      console.log('Database empty. Seeding 40 superheroes...');
      await Superhero.insertMany(seedData);
      console.log('Seeding complete.');
    } else {
      console.log(`Database already has ${count} superheroes. No seeding necessary.`);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

module.exports = seedDatabase;
