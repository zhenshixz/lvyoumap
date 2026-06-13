const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dbPath = path.join(rootDir, 'backend', 'db.json');
const dataDir = path.join(rootDir, 'data');
const provincesDir = path.join(dataDir, 'provinces');
const provinceListsDir = path.join(dataDir, 'province-lists');
const provinceFoodsDir = path.join(dataDir, 'province-foods');
const attractionDetailsDir = path.join(dataDir, 'attraction-details');

function buildProvinceIndex(provinces) {
  const index = {};

  for (const [name, province] of Object.entries(provinces || {})) {
    index[name] = {
      id: province.id,
      name: province.name,
      province: province.province,
      description: province.description,
      tags: province.tags,
      weather: province.weather,
      bestTime: province.bestTime,
      image: province.image,
      attractionCount: Array.isArray(province.attractions) ? province.attractions.length : 0,
    };
  }

  return index;
}

function buildProvinceShell(province) {
  return {
    id: province.id,
    name: province.name,
    province: province.province,
    description: province.description,
    tags: province.tags,
    weather: province.weather,
    bestTime: province.bestTime,
    image: province.image,
    attractionCount: Array.isArray(province.attractions) ? province.attractions.length : 0,
  };
}

function buildAttractionListItem(attraction, provinceName, provinceId) {
  return {
    id: attraction.id,
    provinceId,
    provinceName,
    name: attraction.name,
    image: attraction.thumb || attraction.image,
    thumb: attraction.thumb || attraction.image,
    rating: attraction.rating,
    level: attraction.level,
    intro: attraction.intro,
    price: attraction.price,
    city: attraction.city,
    reviewsCount: attraction.reviewsCount,
  };
}

function main() {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const provinces = db.provinces || {};

  fs.mkdirSync(provincesDir, { recursive: true });
  fs.mkdirSync(provinceListsDir, { recursive: true });
  fs.mkdirSync(provinceFoodsDir, { recursive: true });
  fs.mkdirSync(attractionDetailsDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'provinces-index.json'),
    JSON.stringify(buildProvinceIndex(provinces)),
    'utf8',
  );

  for (const [name, province] of Object.entries(provinces)) {
    fs.writeFileSync(
      path.join(provincesDir, `${name}.json`),
      JSON.stringify(province),
      'utf8',
    );

    const shell = buildProvinceShell(province);
    const attractions = Array.isArray(province.attractions)
      ? province.attractions.map((attraction) => buildAttractionListItem(attraction, name, province.id || name))
      : [];

    fs.writeFileSync(
      path.join(provinceListsDir, `${name}.json`),
      JSON.stringify({ ...shell, attractions }),
      'utf8',
    );

    fs.writeFileSync(
      path.join(provinceFoodsDir, `${name}.json`),
      JSON.stringify({
        province: province.province || name,
        bestTime: province.bestTime,
        foods: province.foods || [],
        itineraries: province.itineraries || [],
      }),
      'utf8',
    );

    for (const attraction of province.attractions || []) {
      fs.writeFileSync(
        path.join(attractionDetailsDir, `${attraction.id}.json`),
        JSON.stringify({ ...attraction, provinceId: province.id || name, provinceName: name }),
        'utf8',
      );
    }
  }

  console.log(`Generated ${Object.keys(provinces).length} static province files in ${path.relative(rootDir, dataDir)}`);
}

main();
