const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const port = 3000;

const petsJsonPath = path.join(__dirname, '..', 'server-data', 'pets.json');

// middleware
app.use(cors());
app.use(express.json());

// static images (например: http://localhost:3000/images/pets/pet1_1.jpg)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// helpers
function readPetsFile() {
  const raw = fs.readFileSync(petsJsonPath, 'utf-8');
  const data = JSON.parse(raw);
  if (!data || !Array.isArray(data.pets)) {
    return { pets: [] };
  }
  return data;
}

function toBool(val) {
  if (val === undefined) return undefined;
  if (typeof val === 'boolean') return val;
  const s = String(val).toLowerCase().trim();
  if (['true', '1', 'yes'].includes(s)) return true;
  if (['false', '0', 'no'].includes(s)) return false;
  return undefined;
}

function normalizeText(s) {
  return String(s || '').toLowerCase();
}

// health check
app.get('/', (req, res) => {
  res.send('Pets API is running');
});

/**
 * GET /pets
 * Query filters:
 *  - status: "забронирован" | "дома на испытательном" | "ждет родителей"
 *  - sex: "male" | "female"
 *  - sterilized=true/false
 *  - vaccinated=true/false
 *  - specialCare=true/false
 *  - minAge, maxAge
 *  - q (поиск по имени/описанию/характеру)
 *
 * Returns: карточки (без тяжелых полей можно оставить только cover)
 */
app.get('/pets', (req, res) => {
  const { pets } = readPetsFile();

  const status = req.query.status;
  const sex = req.query.sex;
  const sterilized = toBool(req.query.sterilized);
  const vaccinated = toBool(req.query.vaccinated);
  const specialCare = toBool(req.query.specialCare);

  const minAge = req.query.minAge !== undefined ? Number(req.query.minAge) : undefined;
  const maxAge = req.query.maxAge !== undefined ? Number(req.query.maxAge) : undefined;

  const q = req.query.q ? normalizeText(req.query.q) : '';

  let result = pets.slice();

  if (status) result = result.filter(p => p.status === status);
  if (sex) result = result.filter(p => p.sex === sex);

  if (sterilized !== undefined) result = result.filter(p => Boolean(p.sterilized) === sterilized);
  if (vaccinated !== undefined) result = result.filter(p => Boolean(p.vaccinated) === vaccinated);
  if (specialCare !== undefined) result = result.filter(p => Boolean(p.specialCare) === specialCare);

  if (!Number.isNaN(minAge) && minAge !== undefined) result = result.filter(p => Number(p.age) >= minAge);
  if (!Number.isNaN(maxAge) && maxAge !== undefined) result = result.filter(p => Number(p.age) <= maxAge);

  if (q) {
    result = result.filter(p => {
      const hay = [
        p.name,
        p.description,
        p.character,
        p.status
      ].map(normalizeText).join(' ');
      return hay.includes(q);
    });
  }

  // чтобы список был легким — вернем "карточки"
  const cards = result.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    sex: p.sex,
    status: p.status,
    sterilized: p.sterilized,
    vaccinated: p.vaccinated,
    specialCare: p.specialCare,
    character: p.character,
    coverImg: p.coverImg || (Array.isArray(p.images) ? p.images[0] : p.img),
    images: Array.isArray(p.images) ? p.images : (p.img ? [p.img] : [])
  }));

  res.json({ pets: cards });
});

/**
 * GET /pets/:id
 * Возвращает полную карточку животного
 */
app.get('/pets/:id', (req, res) => {
  const { pets } = readPetsFile();
  const id = req.params.id;

  const pet = pets.find(p => String(p.id) === String(id));
  if (!pet) {
    return res.status(404).json({ error: true, message: `Животное не найдено по id=${id}` });
  }

  // гарантируем images
  const full = {
    ...pet,
    coverImg: pet.coverImg || (Array.isArray(pet.images) ? pet.images[0] : pet.img),
    images: Array.isArray(pet.images) ? pet.images : (pet.img ? [pet.img] : [])
  };

  res.json(full);
});

/**
 * GET /pets/:id/photos
 * Если хочешь отдельно подгружать галерею
 */
app.get('/pets/:id/photos', (req, res) => {
  const { pets } = readPetsFile();
  const id = req.params.id;

  const pet = pets.find(p => String(p.id) === String(id));
  if (!pet) {
    return res.status(404).json({ error: true, message: `Животное не найдено по id=${id}` });
  }

  const photos = Array.isArray(pet.images) ? pet.images : (pet.img ? [pet.img] : []);
  res.json({ id: pet.id, photos });
});

// run
app.listen(port, () => {
  console.log(`Pets server listening on port ${port}`);
});
