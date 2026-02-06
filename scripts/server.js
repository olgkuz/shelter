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

function getCommonCharacterWords(a, b) {
  const aWords = new Set(
    String(a || '')
      .toLowerCase()
      .split(/[,\s]+/)
      .map((part) => part.trim())
      .filter((part) => part.length >= 4)
  );

  if (!aWords.size) return 0;

  return String(b || '')
    .toLowerCase()
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 4)
    .reduce((acc, word) => acc + (aWords.has(word) ? 1 : 0), 0);
}

function detectPetType(pet) {
  const text = `${pet.description || ''} ${pet.character || ''}`.toLowerCase();

  if (text.includes('кошка') || text.includes('кошеч') || text.includes('котик') || text.includes('кот')) {
    return 'cat';
  }

  if (text.includes('собака') || text.includes('пес') || text.includes('пёс') || text.includes('щен')) {
    return 'dog';
  }

  return 'unknown';
}

function getSimilarityScore(base, candidate, baseType) {
  let score = 0;

  const ageDiff = Math.abs(Number(base.age) - Number(candidate.age));
  score += Math.max(0, 4 - ageDiff);

  if (baseType !== 'unknown' && detectPetType(candidate) === baseType) score += 4;

  if (base.sex === candidate.sex) score += 1;
  if (Boolean(base.sterilized) === Boolean(candidate.sterilized)) score += 1;
  if (Boolean(base.vaccinated) === Boolean(candidate.vaccinated)) score += 1;
  if (Boolean(base.specialCare) === Boolean(candidate.specialCare)) score += 1;

  const commonCharacterWords = getCommonCharacterWords(base.character, candidate.character);
  score += Math.min(commonCharacterWords, 3);

  return score;
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
 * GET /pets/:id/similar
 * Query:
 *  - limit (default 8)
 * Возвращает похожих питомцев (по типу, возрасту и характеристикам)
 */
app.get('/pets/:id/similar', (req, res) => {
  const { pets } = readPetsFile();
  const id = req.params.id;
  const limit = req.query.limit !== undefined ? Number(req.query.limit) : 8;

  const basePet = pets.find(p => String(p.id) === String(id));
  if (!basePet) {
    return res.status(404).json({ error: true, message: `Животное не найдено по id=${id}` });
  }

  const baseType = detectPetType(basePet);

  let result = pets.filter(p => String(p.id) !== String(id));

  if (baseType !== 'unknown') {
    result = result.filter(p => detectPetType(p) === baseType);
  }

  result = result
    .map(p => ({
      pet: p,
      score: getSimilarityScore(basePet, p, baseType)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Number.isFinite(limit) ? limit : 8)
    .map(({ pet }) => ({
      id: pet.id,
      name: pet.name,
      age: pet.age,
      sex: pet.sex,
      status: pet.status,
      sterilized: pet.sterilized,
      vaccinated: pet.vaccinated,
      specialCare: pet.specialCare,
      character: pet.character,
      coverImg: pet.coverImg || (Array.isArray(pet.images) ? pet.images[0] : pet.img),
      images: Array.isArray(pet.images) ? pet.images : (pet.img ? [pet.img] : [])
    }));

  res.json({ pets: result });
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
