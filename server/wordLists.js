const wordLists = {
  english: {
    easy: [
      'apple', 'cat', 'dog', 'sun', 'tree', 'book', 'fish', 'ball', 'cake', 'star',
      'moon', 'hat', 'cup', 'door', 'bird', 'duck', 'frog', 'milk', 'nose', 'hand',
      'boat', 'lamp', 'shoe', 'kite', 'leaf', 'sock', 'fork', 'spoon', 'egg', 'pear',
      'cloud', 'rain', 'snow', 'wind', 'fire', 'ice', 'lake', 'park', 'farm', 'city',
      'bed', 'desk', 'chair', 'pen', 'key', 'bag', 'fan', 'ring', 'box', 'toy'
    ],
    medium: [
      'guitar', 'bicycle', 'elephant', 'laptop', 'mountain', 'pizza', 'umbrella', 'volcano', 'penguin', 'robot',
      'camera', 'castle', 'desert', 'dragon', 'engine', 'forest', 'garden', 'hammer', 'island', 'jungle',
      'knight', 'lighthouse', 'magnet', 'mirror', 'museum', 'ocean', 'palace', 'rocket', 'sandwich', 'spider',
      'telescope', 'theater', 'turtle', 'wallet', 'window', 'wizard', 'zebra', 'anchor', 'balloon', 'bridge',
      'cactus', 'candle', 'compass', 'diamond', 'feather', 'fountain', 'gears', 'helmet', 'ladder', 'microchip'
    ],
    hard: [
      'architecture', 'symphony', 'renaissance', 'microscope', 'galaxy', 'equilibrium', 'metamorphosis', 'hieroglyphics', 'labyrinth', 'orchestra',
      'astronomy', 'bacteriology', 'cryptography', 'dichotomy', 'exoskeleton', 'fluorescence', 'gravitation', 'homeostasis', 'incandescence', 'juxtaposition',
      'kaleidoscope', 'logarithm', 'nanotechnology', 'oscillation', 'photosynthesis', 'quantum', 'radioactivity', 'stratosphere', 'thermodynamics', 'ultraviolet',
      'vacuum', 'wavelength', 'xenolith', 'yield', 'zooplankton', 'abbreviation', 'benevolence', 'connoisseur', 'decipher', 'eccentricity',
      'formidable', 'gargantuan', 'hypothetical', 'idiosyncrasy', 'judicious', 'knowledgeable', 'loquacious', 'magnanimous', 'nonchalant', 'obsequious'
    ]
  },
  indian: {
    easy: [
      'samosa', 'chai', 'mango', 'peacock', 'lotus', 'temple', 'diya', 'rangoli', 'turban', 'henna',
      'auto', 'dhoti', 'saree', 'laddo', 'jalebi', 'kulfi', 'papad', 'thali', 'naan', 'roti',
      'ghee', 'spices', 'bangles', 'bindi', 'tabla', 'flute', 'sitara', 'curd', 'honey', 'onion',
      'paddy', 'river', 'tiger', 'cow', 'goat', 'cycle', 'well', 'cart', 'plough', 'seed'
    ],
    medium: [
      'rickshaw', 'cricket', 'bollywood', 'himalayas', 'taj mahal', 'elephant', 'bangle', 'curry', 'monsoon', 'kabaddi',
      'panchatantra', 'mahabharata', 'ramayana', 'yoga', 'namaste', 'ghats', 'bazaar', 'shikara', 'howdah', 'palms',
      'pattu', 'kurta', 'sherwani', 'ghagra', 'dupatta', 'kolhapuri', 'mojari', 'jumka', 'mangalsutra', 'kajal',
      'chariot', 'fortress', 'gateway', 'stupa', 'minaret', 'caravan', 'ayurveda', 'panchayat', 'talwar', 'shield'
    ],
    hard: [
      'bharatnatyam', 'kathakali', 'ganesh chaturthi', 'ayurveda', 'dharamshala', 'varanasi', 'yoga', 'satyameva jayate', 'ashoka chakra', 'bhagavad gita',
      'kumbh mela', 'jallikattu', 'kathak', 'manipuri', 'mohiniyattam', 'odissi', 'yakshagana', 'kalarippayattu', 'panchali', 'dronacharya',
      'kurukshetra', 'patliputra', 'indus valley', 'harappa', 'mohenjo-daro', 'khajuraho', 'hampi', 'konark', 'ajanta caves', 'ellora caves',
      'upanishads', 'vedas', 'puranas', 'arthashastra', 'charaka samhita', 'sushruta samhita', 'panini', 'aryabhata', 'varahamihira', 'bhaskara'
    ]
  },
  animals: {
    easy: ['cat', 'dog', 'fish', 'bird', 'lion', 'bear', 'frog', 'duck', 'pig', 'cow'],
    medium: ['elephant', 'giraffe', 'penguin', 'kangaroo', 'dolphin', 'monkey', 'zebra', 'hippo', 'tiger', 'wolf'],
    hard: ['platypus', 'chameleon', 'armadillo', 'axolotl', 'pangolin', 'narwhal', 'wolverine', 'capybara', 'salamander', 'woodpecker']
  },
  food: {
    easy: ['pizza', 'burger', 'apple', 'banana', 'cake', 'bread', 'egg', 'milk', 'taco', 'rice'],
    medium: ['spaghetti', 'sushi', 'croissant', 'lasagna', 'burrito', 'pancakes', 'avocado', 'broccoli', 'chocolate', 'donut'],
    hard: ['ratatouille', 'beef wellington', 'bouillabaisse', 'charcuterie', 'eggs benedict', 'macarons', 'pad thai', 'risotto', 'shabu shabu', 'tiramisu']
  },
  movies: {
    easy: ['star wars', 'batman', 'superman', 'frozen', 'titanic', 'jaws', 'shrek', 'cars', 'up', 'lion king'],
    medium: ['inception', 'avengers', 'gladiator', 'matrix', 'godfather', 'jurassic park', 'avatar', 'interstellar', 'toy story', 'harry potter'],
    hard: ['pulp fiction', 'parasite', 'spirited away', 'schindler list', 'blade runner', 'citizen kane', 'goodfellas', 'psycho', 'casablanca', 'whiplash']
  }
};

module.exports = wordLists;
