const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SCALE_LIBRARY = {
  aeolian: { label: 'минор', intervals: [0, 2, 3, 5, 7, 8, 10] },
  dorian: { label: 'дорийский', intervals: [0, 2, 3, 5, 7, 9, 10] },
  ionian: { label: 'мажор', intervals: [0, 2, 4, 5, 7, 9, 11] },
  lydian: { label: 'лидийский', intervals: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian: { label: 'миксолидийский', intervals: [0, 2, 4, 5, 7, 9, 10] },
  pentatonicMajor: { label: 'мажорная пентатоника', intervals: [0, 2, 4, 7, 9] },
  pentatonicMinor: { label: 'минорная пентатоника', intervals: [0, 3, 5, 7, 10] },
  phrygian: { label: 'фригийский', intervals: [0, 1, 3, 5, 7, 8, 10] },
};

const PROGRESSION_TEMPLATES = {
  aeolian: [0, 5, 3, 4],
  dorian: [0, 3, 5, 4],
  ionian: [0, 4, 5, 3],
  lydian: [0, 4, 1, 3],
  mixolydian: [0, 5, 4, 3],
  pentatonicMajor: [0, 2, 4, 1],
  pentatonicMinor: [0, 3, 5, 2],
  phrygian: [0, 1, 5, 4],
};

const DEFAULT_THEME = {
  accent: '#7c5cff',
  accent2: '#37c2ff',
  accent3: '#ff7a59',
  accentRgb: '124, 92, 255',
  accent2Rgb: '55, 194, 255',
  accent3Rgb: '255, 122, 89',
};

const elements = {
  analysisSummary: document.getElementById('analysis-summary'),
  dropzone: document.getElementById('dropzone'),
  fileName: document.getElementById('file-name'),
  fileSize: document.getElementById('file-size'),
  heroSpectrum: document.getElementById('hero-spectrum'),
  heroSubtitle: document.getElementById('hero-subtitle'),
  heroTitle: document.getElementById('hero-title'),
  imageSize: document.getElementById('image-size'),
  instrumentValue: document.getElementById('instrument-value'),
  keyValue: document.getElementById('key-value'),
  musicCaption: document.getElementById('music-caption'),
  modeValue: document.getElementById('mode-value'),
  musicSpectrum: document.getElementById('music-spectrum'),
  objectCountTag: document.getElementById('object-count-tag'),
  objectList: document.getElementById('object-list'),
  objectsValue: document.getElementById('objects-value'),
  paletteGrid: document.getElementById('palette-grid'),
  photoInput: document.getElementById('photo-input'),
  playBtn: document.getElementById('play-btn'),
  previewFileMeta: document.getElementById('preview-file-meta'),
  previewFileName: document.getElementById('preview-file-name'),
  previewImage: document.getElementById('preview-image'),
  previewOverlay: document.getElementById('preview-overlay'),
  previewPlaceholder: document.getElementById('preview-placeholder'),
  resetBtn: document.getElementById('reset-btn'),
  statusChip: document.getElementById('status-chip'),
  statusLine: document.getElementById('status-line'),
  stopBtn: document.getElementById('stop-btn'),
  tempoValue: document.getElementById('tempo-value'),
  statsGrid: document.getElementById('stats-grid'),
  timeline: document.getElementById('timeline'),
};

const state = {
  analysis: null,
  audio: null,
  currentFile: null,
  dragCounter: 0,
  currentStep: -1,
  loadingToken: 0,
  previewUrl: null,
  playing: false,
};

const visualizers = {
  hero: createBars(elements.heroSpectrum, 14),
  music: createBars(elements.musicSpectrum, 28),
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercent(value) {
  return `${Math.round(clamp(value, 0, 1) * 100)}%`;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return '—';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '').trim();
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;

  const int = Number.parseInt(value, 16);

  return [
    (int >> 16) & 255,
    (int >> 8) & 255,
    int & 255,
  ];
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    switch (max) {
      case red:
        hue = 60 * (((green - blue) / delta) % 6);
        break;
      case green:
        hue = 60 * ((blue - red) / delta + 2);
        break;
      default:
        hue = 60 * ((red - green) / delta + 4);
        break;
    }
  }

  if (Number.isNaN(hue)) {
    hue = 0;
  }

  return {
    h: (hue + 360) % 360,
    l: lightness,
    s: clamp(saturation, 0, 1),
  };
}

function hueToName(hue) {
  const normalized = ((hue % 360) + 360) % 360;

  if (normalized < 16 || normalized >= 344) return 'красный';
  if (normalized < 32) return 'коралловый';
  if (normalized < 48) return 'оранжевый';
  if (normalized < 68) return 'янтарный';
  if (normalized < 88) return 'золотой';
  if (normalized < 128) return 'зелёный';
  if (normalized < 168) return 'бирюзовый';
  if (normalized < 200) return 'циановый';
  if (normalized < 230) return 'синий';
  if (normalized < 260) return 'индиго';
  if (normalized < 305) return 'фиолетовый';
  return 'розовый';
}

function describeColor(color) {
  const hueName = hueToName(color.hue);

  if (color.saturation < 0.16) {
    return `нейтральный ${hueName}`;
  }

  if (color.lightness > 0.74) {
    return `светлый ${hueName}`;
  }

  if (color.lightness < 0.28) {
    return `глубокий ${hueName}`;
  }

  if (color.saturation > 0.65) {
    return `насыщенный ${hueName}`;
  }

  return hueName;
}

function angleDistance(a, b) {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

function nearestPaletteColor(hue, palette) {
  if (!palette.length) {
    return {
      hex: DEFAULT_THEME.accent,
      rgbString: DEFAULT_THEME.accentRgb,
    };
  }

  return palette.reduce((best, color) => {
    const bestDistance = angleDistance(best.hue, hue);
    const candidateDistance = angleDistance(color.hue, hue);
    return candidateDistance < bestDistance ? color : best;
  }, palette[0]);
}

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function makeRng(seed) {
  let current = seed % 2147483647;

  if (current <= 0) {
    current += 2147483646;
  }

  return () => {
    current = (current * 16807) % 2147483647;
    return (current - 1) / 2147483646;
  };
}

function createBars(container, count) {
  if (!container) {
    return [];
  }

  container.innerHTML = '';
  const bars = [];

  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement('span');
    bar.className = 'spectrum-bar';
    bar.style.height = `${18 + (index % 5) * 10}%`;
    bar.style.opacity = `${0.74 + (index % 3) * 0.08}`;
    container.appendChild(bar);
    bars.push(bar);
  }

  return bars;
}

function updateBars(bars, values) {
  bars.forEach((bar, index) => {
    const value = values[index] ?? values[values.length - 1] ?? 20;
    bar.style.height = `${clamp(value, 8, 100)}%`;
  });
}

function sampleFrequencyData(data, count) {
  const values = [];
  const chunk = data.length / count;

  for (let index = 0; index < count; index += 1) {
    const start = Math.floor(index * chunk);
    const end = Math.max(start + 1, Math.floor((index + 1) * chunk));
    let sum = 0;

    for (let pointer = start; pointer < end; pointer += 1) {
      sum += data[pointer] || 0;
    }

    values.push(sum / (end - start));
  }

  return values;
}

function formatNoteLabel(midi) {
  const note = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

function degreeToMidi(rootMidi, intervals, degree, octave) {
  const scaleLength = intervals.length;
  const wrappedDegree = ((degree % scaleLength) + scaleLength) % scaleLength;
  const octaveShift = Math.floor(degree / scaleLength);
  const rootNote = rootMidi % 12;
  const baseOctave = octave + octaveShift;
  return 12 * (baseOctave + 1) + rootNote + intervals[wrappedDegree];
}

function selectScale(metrics, hue) {
  if (metrics.edgeDensity > 0.66) {
    return 'phrygian';
  }

  if (metrics.brightness < 0.35) {
    return hue >= 180 && hue < 300 ? 'aeolian' : 'phrygian';
  }

  if (metrics.saturation > 0.5 && hue >= 40 && hue < 160) {
    return 'lydian';
  }

  if (hue >= 180 && hue < 300) {
    return 'dorian';
  }

  if (hue < 40 || hue >= 320) {
    return 'mixolydian';
  }

  return metrics.brightness > 0.62 ? 'ionian' : 'aeolian';
}

function selectInstrument(metrics) {
  if (metrics.edgeDensity > 0.68) {
    return {
      bassType: 'square',
      leadCutoff: 1600,
      label: 'зернистый лид',
      padType: 'triangle',
      toneType: 'sawtooth',
    };
  }

  if (metrics.saturation > 0.58) {
    return {
      bassType: 'sine',
      leadCutoff: 2300,
      label: 'неоновый плэк',
      padType: 'sine',
      toneType: 'triangle',
    };
  }

  if (metrics.brightness > 0.65) {
    return {
      bassType: 'sine',
      leadCutoff: 2800,
      label: 'воздушный пад',
      padType: 'triangle',
      toneType: 'triangle',
    };
  }

  return {
    bassType: 'sine',
    leadCutoff: 2100,
    label: 'мягкое стекло',
    padType: 'triangle',
    toneType: 'triangle',
  };
}

function colorDistance(a, b) {
  const [ar, ag, ab] = a.rgb;
  const [br, bg, bb] = b.rgb;
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2);
}

function extractPalette(imageData) {
  const { data } = imageData;
  const buckets = new Map();
  let pixelCount = 0;
  let saturationSum = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3];

    if (alpha < 16) {
      continue;
    }

    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const hsl = rgbToHsl(r, g, b);
    const salience = 0.42 + hsl.s * 1.25 + Math.abs(hsl.l - 0.5) * 0.55;
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);

    let bucket = buckets.get(key);

    if (!bucket) {
      bucket = {
        b: 0,
        g: 0,
        hX: 0,
        hY: 0,
        r: 0,
        weight: 0,
      };
      buckets.set(key, bucket);
    }

    bucket.r += r * salience;
    bucket.g += g * salience;
    bucket.b += b * salience;
    bucket.hX += Math.cos((hsl.h * Math.PI) / 180) * salience;
    bucket.hY += Math.sin((hsl.h * Math.PI) / 180) * salience;
    bucket.weight += salience;
    pixelCount += 1;
    saturationSum += hsl.s;
  }

  const ranked = [...buckets.values()].sort((left, right) => right.weight - left.weight);
  const palette = [];

  for (const bucket of ranked) {
    const weight = bucket.weight || 1;
    const r = Math.round(bucket.r / weight);
    const g = Math.round(bucket.g / weight);
    const b = Math.round(bucket.b / weight);
    const hsl = rgbToHsl(r, g, b);
    const candidate = {
      hex: rgbToHex(r, g, b),
      h: hsl.h,
      hue: hsl.h,
      l: hsl.l,
      lightness: hsl.l,
      r,
      rgb: [r, g, b],
      rgbString: `${r}, ${g}, ${b}`,
      s: hsl.s,
      saturation: hsl.s,
      weight,
    };

    if (palette.some((entry) => colorDistance(entry, candidate) < 28)) {
      continue;
    }

    palette.push(candidate);

    if (palette.length === 5) {
      break;
    }
  }

  while (palette.length < 5 && ranked[palette.length]) {
    const bucket = ranked[palette.length];
    const weight = bucket.weight || 1;
    const r = Math.round(bucket.r / weight);
    const g = Math.round(bucket.g / weight);
    const b = Math.round(bucket.b / weight);
    const hsl = rgbToHsl(r, g, b);

    palette.push({
      hex: rgbToHex(r, g, b),
      h: hsl.h,
      hue: hsl.h,
      l: hsl.l,
      lightness: hsl.l,
      r,
      rgb: [r, g, b],
      rgbString: `${r}, ${g}, ${b}`,
      s: hsl.s,
      saturation: hsl.s,
      weight,
    });
  }

  const totalWeight = palette.reduce((sum, color) => sum + color.weight, 0) || 1;

  palette.forEach((color) => {
    color.weightPct = color.weight / totalWeight;
    color.label = describeColor(color);
  });

  return {
    averageSaturation: pixelCount ? saturationSum / pixelCount : 0,
    palette,
  };
}

function analyzeStructure(imageData, palette) {
  const { data, width, height } = imageData;
  const cellSize = Math.max(12, Math.round(Math.min(width, height) / 12));
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const cells = Array.from({ length: cols * rows }, (_, index) => ({
    col: index % cols,
    contrast: 0,
    count: 0,
    edgeAvg: 0,
    edgeSum: 0,
    hue: 0,
    hueX: 0,
    hueY: 0,
    index,
    lumaSqSum: 0,
    lumaSum: 0,
    row: Math.floor(index / cols),
    score: 0,
    saturation: 0,
    warmth: 0,
  }));

  const gray = new Float32Array(width * height);
  let brightnessSum = 0;
  let saturationSum = 0;
  let warmthSum = 0;
  let leftLuma = 0;
  let rightLuma = 0;
  let topLuma = 0;
  let bottomLuma = 0;
  let pixelCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha < 16) {
        continue;
      }

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const hsl = rgbToHsl(r, g, b);
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const cellIndex = Math.min(cols - 1, Math.floor(x / cellSize)) + Math.min(rows - 1, Math.floor(y / cellSize)) * cols;
      const cell = cells[cellIndex];

      gray[y * width + x] = luma;
      cell.count += 1;
      cell.lumaSum += luma;
      cell.lumaSqSum += luma * luma;
      cell.saturation += hsl.s;
      cell.warmth += (r - b) / 255;
      cell.hueX += Math.cos((hsl.h * Math.PI) / 180) * (0.4 + hsl.s);
      cell.hueY += Math.sin((hsl.h * Math.PI) / 180) * (0.4 + hsl.s);

      brightnessSum += luma;
      saturationSum += hsl.s;
      warmthSum += (r - b) / 255;
      pixelCount += 1;

      if (x < width / 2) {
        leftLuma += luma;
      } else {
        rightLuma += luma;
      }

      if (y < height / 2) {
        topLuma += luma;
      } else {
        bottomLuma += luma;
      }
    }
  }

  let edgeEnergy = 0;
  let edgeSamples = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const gx =
        -gray[index - width - 1] -
        2 * gray[index - 1] -
        gray[index + width - 1] +
        gray[index - width + 1] +
        2 * gray[index + 1] +
        gray[index + width + 1];
      const gy =
        -gray[index - width - 1] -
        2 * gray[index - width] -
        gray[index - width + 1] +
        gray[index + width - 1] +
        2 * gray[index + width] +
        gray[index + width + 1];
      const edge = Math.sqrt(gx * gx + gy * gy);
      const cellIndex = Math.min(cols - 1, Math.floor(x / cellSize)) + Math.min(rows - 1, Math.floor(y / cellSize)) * cols;
      cells[cellIndex].edgeSum += edge;
      edgeEnergy += edge;
      edgeSamples += 1;
    }
  }

  const edgeAverages = [];
  const contrastValues = [];

  cells.forEach((cell) => {
    const count = cell.count || 1;
    const meanLuma = cell.lumaSum / count;
    const variance = Math.max(0, cell.lumaSqSum / count - meanLuma * meanLuma);
    cell.contrast = clamp(Math.sqrt(variance) / 64, 0, 1);
    cell.edgeAvg = clamp((cell.edgeSum / count) / 180, 0, 1);
    cell.saturation = clamp(cell.saturation / count, 0, 1);
    cell.warmth = clamp((cell.warmth / count + 1) / 2, 0, 1);
    cell.hue = (Math.atan2(cell.hueY, cell.hueX) * 180) / Math.PI;

    if (Number.isNaN(cell.hue)) {
      cell.hue = 0;
    }

    if (cell.hue < 0) {
      cell.hue += 360;
    }

    cell.score = clamp(cell.edgeAvg * 0.58 + cell.contrast * 0.27 + cell.saturation * 0.15, 0, 1);
    edgeAverages.push(cell.edgeAvg);
    contrastValues.push(cell.contrast);
  });

  const edgeMax = Math.max(...edgeAverages, 0.001);
  const scoreList = [];

  cells.forEach((cell) => {
    const normalizedEdge = cell.edgeAvg / edgeMax;
    cell.score = clamp(normalizedEdge * 0.6 + cell.contrast * 0.25 + cell.saturation * 0.15, 0, 1);
    scoreList.push(cell.score);
  });

  const activeCount = Math.max(6, Math.ceil(cells.length * 0.28));
  const threshold = [...scoreList].sort((left, right) => right - left)[activeCount - 1] || 0;
  const active = cells.map((cell) => cell.score >= threshold);
  const visited = new Array(cells.length).fill(false);
  const components = [];

  function pushComponent(cellIndexes) {
    if (!cellIndexes.length) {
      return;
    }

    let weightSum = 0;
    let xSum = 0;
    let ySum = 0;
    let hueX = 0;
    let hueY = 0;
    let minCol = Infinity;
    let maxCol = -Infinity;
    let minRow = Infinity;
    let maxRow = -Infinity;
    let cellScoreSum = 0;

    for (const cellIndex of cellIndexes) {
      const cell = cells[cellIndex];
      const weight = cell.score + 0.15;
      const centerX = (cell.col + 0.5) / cols;
      const centerY = (cell.row + 0.5) / rows;

      weightSum += weight;
      xSum += centerX * weight;
      ySum += centerY * weight;
      hueX += Math.cos((cell.hue * Math.PI) / 180) * weight;
      hueY += Math.sin((cell.hue * Math.PI) / 180) * weight;
      minCol = Math.min(minCol, cell.col);
      maxCol = Math.max(maxCol, cell.col);
      minRow = Math.min(minRow, cell.row);
      maxRow = Math.max(maxRow, cell.row);
      cellScoreSum += cell.score;
    }

    const centerX = xSum / weightSum;
    const centerY = ySum / weightSum;
    const hue = (Math.atan2(hueY, hueX) * 180) / Math.PI;
    const normalizedHue = hue < 0 ? hue + 360 : hue;
    const size = cellIndexes.length;
    const avgScore = cellScoreSum / size;
    const share = size / cells.length;
    const spanCols = maxCol - minCol + 1;
    const spanRows = maxRow - minRow + 1;
    const aspectRatio = spanCols / spanRows;
    const paletteColor = nearestPaletteColor(normalizedHue, palette);
    const pan = clamp(centerX * 2 - 1, -0.9, 0.9);

    components.push({
      aspectRatio,
      centerX,
      centerY,
      color: paletteColor,
      energy: avgScore,
      hue: normalizedHue,
      importance: avgScore * (1 + share * 3),
      pan,
      role: avgScore > 0.68 || cellIndexes.length > 12 ? 'ударный акцент' : share > 0.22 ? 'пространственный слой' : 'мягкий слой',
      share,
      size,
      spanCols,
      spanRows,
    });
  }

  for (let index = 0; index < cells.length; index += 1) {
    if (!active[index] || visited[index]) {
      continue;
    }

    const queue = [index];
    visited[index] = true;
    const group = [];

    while (queue.length) {
      const current = queue.pop();
      group.push(current);
      const cell = cells[current];
      const neighbors = [];

      if (cell.col > 0) neighbors.push(current - 1);
      if (cell.col < cols - 1) neighbors.push(current + 1);
      if (cell.row > 0) neighbors.push(current - cols);
      if (cell.row < rows - 1) neighbors.push(current + cols);

      for (const neighbor of neighbors) {
        if (active[neighbor] && !visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      }
    }

    pushComponent(group);
  }

  if (!components.length) {
    const strongestCells = [...cells.keys()]
      .sort((left, right) => cells[right].score - cells[left].score)
      .slice(0, Math.min(3, cells.length));
    pushComponent(strongestCells);
  }

  components.sort((left, right) => right.importance - left.importance);

  return {
    balance: clamp(1 - Math.abs(leftLuma - rightLuma) / Math.max(leftLuma + rightLuma, 1), 0, 1),
    brightness: clamp(brightnessSum / (pixelCount * 255), 0, 1),
    complexity: clamp((edgeEnergy / Math.max(edgeSamples, 1)) / 180, 0, 1),
    contrast: clamp(average(contrastValues), 0, 1),
    edgeDensity: clamp((edgeEnergy / Math.max(edgeSamples, 1)) / 180, 0, 1),
    objects: components.slice(0, 4),
    saturation: clamp(saturationSum / Math.max(pixelCount, 1), 0, 1),
    warmth: clamp((warmthSum / Math.max(pixelCount, 1) + 1) / 2, 0, 1),
  };
}

function buildSoundProfile(metrics, palette, objects) {
  const primary = palette[0] || {
    hue: 0,
    label: 'нейтральный',
    lightness: 0.5,
    saturation: 0.3,
    hex: DEFAULT_THEME.accent,
    rgbString: DEFAULT_THEME.accentRgb,
  };

  const scaleName = selectScale(metrics, primary.hue);
  const scale = SCALE_LIBRARY[scaleName];
  const instrument = selectInstrument(metrics);
  const rootIndex = Math.round((primary.hue / 360) * 12) % 12;
  const tempo = Math.round(clamp(72 + metrics.contrast * 30 + metrics.complexity * 24 + metrics.saturation * 16, 72, 148));
  const baseOctave = metrics.brightness > 0.58 ? 4 : 3;
  const rootMidi = 12 * (baseOctave + 1) + rootIndex;
  const swing = clamp(0.015 + metrics.complexity * 0.05, 0.015, 0.075);
  const progressionTemplate = PROGRESSION_TEMPLATES[scaleName] || PROGRESSION_TEMPLATES.ionian;
  const seed = hashString(
    [
      palette.map((color) => color.hex).join('|'),
      metrics.brightness.toFixed(3),
      metrics.contrast.toFixed(3),
      metrics.saturation.toFixed(3),
      metrics.edgeDensity.toFixed(3),
      objects.length,
    ].join('::'),
  );
  const rng = makeRng(seed);

  const progression = progressionTemplate.map((degree) => {
    const chordDegree = degree + (rng() > 0.72 ? 1 : 0);
    const octave = baseOctave - 1;
    const chord = [
      degreeToMidi(rootMidi, scale.intervals, chordDegree, octave),
      degreeToMidi(rootMidi, scale.intervals, chordDegree + 2, octave),
      degreeToMidi(rootMidi, scale.intervals, chordDegree + 4, octave),
    ];

    if (rng() > 0.54) {
      chord.push(degreeToMidi(rootMidi, scale.intervals, chordDegree + 6, octave));
    }

    return chord;
  });

  const objectPool = objects.length
    ? objects
    : [
        {
          centerX: 0.5,
          centerY: 0.5,
          color: primary,
          energy: 0.5,
          hue: primary.hue,
          importance: 0.5,
          pan: 0,
          role: 'мягкий слой',
          share: 0.5,
          size: 1,
          spanCols: 1,
          spanRows: 1,
        },
      ];

  const palettePool = palette.length ? palette : [primary];
  const melodySteps = [];

  for (let step = 0; step < 16; step += 1) {
    const color = palettePool[step % palettePool.length];
    const object = objectPool[(step + Math.floor(rng() * objectPool.length)) % objectPool.length];
    const degreeBase = Math.round((color.hue / 360) * scale.intervals.length);
    const motion = Math.round((object.centerY - 0.5) * 4);
    const accent = step % 4 === 0 ? 2 : step % 4 === 2 ? 1 : 0;
    const wander = rng() > 0.7 ? 1 : 0;
    const degree = degreeBase + motion + accent + wander;
    const octaveShift = object.centerY < 0.3 ? 1 : object.centerY > 0.72 ? -1 : 0;
    const midi = degreeToMidi(rootMidi, scale.intervals, degree, baseOctave + octaveShift);
    const velocity = clamp(0.32 + color.saturation * 0.32 + object.energy * 0.22 + (step % 4 === 0 ? 0.1 : 0), 0.22, 0.96);
    const duration = step % 4 === 0 ? 1.05 : step % 3 === 0 ? 0.85 : 0.72;
    const pan = clamp(object.centerX * 2 - 1, -0.9, 0.9);

    melodySteps.push({
      accent: step % 4 === 0,
      color: color.hex,
      duration,
      midi,
      note: formatNoteLabel(midi),
      pan,
      rgb: color.rgbString,
      velocity,
    });
  }

  const spectrumHeightsHero = melodySteps.map((step, index) => {
    const base = 20 + step.velocity * 60 + (step.accent ? 14 : 0);
    const undulation = Math.sin((index / melodySteps.length) * Math.PI * 2) * 7;
    return clamp(base + undulation, 8, 100);
  });

  const spectrumHeightsMusic = Array.from({ length: 28 }, (_, index) => {
    const step = melodySteps[index % melodySteps.length];
    const phase = index / 28;
    const base = 18 + step.velocity * 58 + (step.accent ? 16 : 0);
    return clamp(base + Math.sin(phase * Math.PI * 4) * 6, 8, 100);
  });

  return {
    beatDuration: 60 / tempo,
    baseOctave,
    instrument,
    keyName: NOTE_NAMES[rootIndex],
    melodySteps,
    modeLabel: scale.label,
    progression,
    rootIndex,
    rootMidi,
    scaleName,
    scaleLabel: scale.label,
    seed,
    swing,
    tempo,
    timelineLabel: `${scale.label} · ${tempo} BPM · 4 такта · 16 шагов`,
    visualizer: {
      hero: spectrumHeightsHero,
      music: spectrumHeightsMusic,
    },
  };
}

function buildAnalysis(imageData, file) {
  const { averageSaturation, palette } = extractPalette(imageData);
  const metrics = analyzeStructure(imageData, palette);
  const sound = buildSoundProfile(metrics, palette, metrics.objects);
  const primaryColor = palette[0] || {
    hex: DEFAULT_THEME.accent,
    hue: 0,
    label: 'нейтральный',
    lightness: 0.5,
    saturation: 0.35,
    rgb: [124, 92, 255],
    rgbString: DEFAULT_THEME.accentRgb,
    weightPct: 1,
  };
  const title = `${describeColor(primaryColor)} groove`;
  const summary = `Палитра из ${palette.length} тонов, ${metrics.objects.length} визуальных кластеров и ${sound.tempo} BPM превращает это фото в ${sound.scaleLabel} с ${sound.instrument.label}.`;
  const musicCaption = `${sound.timelineLabel} · ${metrics.objects.length} кластера · ${formatPercent(metrics.complexity)} детализации`;

  const sequence = sound.melodySteps.map((step, index) => ({
    accent: step.accent,
    bar: Math.floor(index / 4) + 1,
    color: step.color,
    duration: step.duration,
    midi: step.midi,
    note: step.note,
    pan: step.pan,
    rgb: step.rgb,
    step: index + 1,
    velocity: step.velocity,
  }));

  const objects = metrics.objects.map((object, index) => {
    const paletteColor = object.color || primaryColor;
    const note = formatNoteLabel(
      degreeToMidi(
        sound.rootMidi,
        SCALE_LIBRARY[sound.scaleName].intervals,
        Math.round((object.hue / 360) * SCALE_LIBRARY[sound.scaleName].intervals.length) + Math.round((0.5 - object.centerY) * 2),
        sound.baseOctave + (object.centerY < 0.28 ? 1 : 0),
      ),
    );

    return {
      accent: index === 0,
      barWidth: clamp(object.share * 2.8 + object.energy * 0.5, 0.18, 1),
      centerX: object.centerX,
      centerY: object.centerY,
      colorHex: paletteColor.hex,
      colorName: paletteColor.label,
      energy: object.energy,
      label:
        object.spanCols > object.spanRows * 1.4
          ? 'широкая зона'
          : object.spanRows > object.spanCols * 1.35
            ? 'высокая зона'
            : object.size > 12
              ? 'плотный кластер'
              : 'компактная форма',
      note,
      pan: object.pan,
      panLabel: object.pan < -0.2 ? 'слева' : object.pan > 0.2 ? 'справа' : 'центр',
      positionLabel: object.centerX < 0.33 ? 'левая' : object.centerX > 0.66 ? 'правая' : 'центральная',
      role: object.role,
      rgbString: paletteColor.rgbString,
      share: object.share,
      size: object.size,
      verticalLabel: object.centerY < 0.33 ? 'верхняя' : object.centerY > 0.66 ? 'нижняя' : 'средняя',
    };
  });

  const stats = [
    { label: 'Темп', value: `${sound.tempo} BPM` },
    { label: 'Лад', value: sound.scaleLabel },
    { label: 'Контраст', value: formatPercent(metrics.contrast) },
    { label: 'Насыщенность', value: formatPercent(metrics.saturation) },
    { label: 'Баланс', value: formatPercent(metrics.balance) },
    { label: 'Детали', value: formatPercent(metrics.complexity) },
  ];

  return {
    averageSaturation,
    file,
    heroSubtitle: `${palette[0]?.label || 'Нейтральный'} цветовой тон, ${metrics.objects.length} объектных зон и ${sound.tempo} BPM.`,
    metrics,
    musicCaption,
    objects,
    palette,
    primaryColor,
    sequence,
    sound,
    stats,
    summary,
    title,
  };
}

function createStatCard({ label, value }, placeholder = false) {
  const card = document.createElement('article');
  card.className = `stat-card${placeholder ? ' is-placeholder' : ''}`;
  card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
  return card;
}

function createPaletteCard(color, index, placeholder = false) {
  const card = document.createElement('article');
  card.className = `palette-item${placeholder ? ' is-placeholder' : ''}`;
  card.style.setProperty('--swatch', color?.hex || DEFAULT_THEME.accent);

  const swatch = document.createElement('div');
  swatch.className = 'palette-swatch';

  const meta = document.createElement('div');
  meta.className = 'palette-meta';

  const label = document.createElement('strong');
  label.textContent = placeholder ? `Цвет ${index + 1}` : color.label;

  const description = document.createElement('span');
  description.textContent = placeholder
    ? 'Здесь появится swatch'
    : `${color.hex.toUpperCase()} · ${Math.round(color.weightPct * 100)}%`;

  meta.append(label, description);
  card.append(swatch, meta);
  return card;
}

function createObjectCard(object, index, placeholder = false) {
  const card = document.createElement('article');
  card.className = `object-card${placeholder ? ' is-placeholder' : ''}`;
  card.style.setProperty('--card-rgb', object?.rgbString || DEFAULT_THEME.accentRgb);

  if (placeholder) {
    card.innerHTML = `
      <div class="object-card__head">
        <div>
          <span class="object-index">00</span>
          <strong>Визуальная зона</strong>
        </div>
      </div>
      <p>После анализа здесь появится информация об объектах и формах.</p>
      <div class="object-meta">
        <span class="chip">позиция</span>
        <span class="chip">нота</span>
      </div>
      <div class="meter"><span style="width: 36%"></span></div>
    `;
    return card;
  }

  card.innerHTML = `
    <div class="object-card__head">
      <div>
        <span class="object-index">${String(index + 1).padStart(2, '0')}</span>
        <strong>${object.label}</strong>
      </div>
      <span class="chip">${Math.round(object.share * 100)}%</span>
    </div>
    <p>${object.colorName} · ${object.positionLabel} ${object.verticalLabel} · ${object.role}</p>
    <div class="object-meta">
      <span class="chip">${object.panLabel}</span>
      <span class="chip">нота ${object.note}</span>
      <span class="chip">${object.role}</span>
    </div>
    <div class="meter"><span style="width: ${Math.round(object.barWidth * 100)}%"></span></div>
  `;

  return card;
}

function createTimelineStep(step, placeholder = false) {
  const card = document.createElement('article');
  card.className = `timeline-step${placeholder ? ' is-placeholder' : ''}`;

  if (placeholder) {
    card.innerHTML = `
      <span>Шаг</span>
      <strong>—</strong>
    `;
    return card;
  }

  card.dataset.step = String(step.step - 1);
  card.style.setProperty('--step-rgb', step.rgb);
  card.innerHTML = `
    <span>Шаг ${String(step.step).padStart(2, '0')}</span>
    <strong>${step.note}</strong>
  `;
  return card;
}

function renderPlaceholderState() {
  elements.analysisSummary.textContent =
    'Выберите изображение, чтобы увидеть цветовую палитру, объектные кластеры и музыкальную карту.';
  elements.heroTitle.textContent = 'Загрузите фото';
  elements.heroSubtitle.textContent =
    'Я соберу палитру, ритм и тембр на основе визуальных признаков.';
  elements.tempoValue.textContent = '—';
  elements.modeValue.textContent = '—';
  elements.keyValue.textContent = '—';
  elements.instrumentValue.textContent = '—';
  elements.objectsValue.textContent = '—';
  elements.objectCountTag.textContent = '—';
  elements.musicCaption.textContent = 'Фрагмент появится здесь после анализа фотографии.';
  elements.statusLine.textContent = 'Ожидаю фотографию.';
  elements.statusChip.textContent = 'Ожидание фото';
  elements.fileName.textContent = '—';
  elements.fileName.title = '';
  elements.fileSize.textContent = '—';
  elements.imageSize.textContent = '—';
  elements.previewOverlay.hidden = true;
  elements.previewFileName.textContent = '—';
  elements.previewFileName.title = '';
  elements.previewFileMeta.textContent = 'Выберите фотографию, чтобы увидеть её подпись.';

  elements.statsGrid.replaceChildren(
    ...[
      ['Темп', '—'],
      ['Лад', '—'],
      ['Контраст', '—'],
      ['Насыщенность', '—'],
      ['Баланс', '—'],
      ['Детали', '—'],
    ].map((item) => createStatCard({ label: item[0], value: item[1] }, true)),
  );

  elements.paletteGrid.replaceChildren(
    ...Array.from({ length: 5 }, (_, index) => createPaletteCard(null, index, true)),
  );

  elements.objectList.replaceChildren(
    ...Array.from({ length: 3 }, (_, index) => createObjectCard(null, index, true)),
  );

  elements.timeline.replaceChildren(
    ...Array.from({ length: 16 }, () => createTimelineStep(null, true)),
  );

  updateTheme(DEFAULT_THEME);
  updateSpectrumHeights(visualizers.hero, Array.from({ length: visualizers.hero.length }, (_, index) => 18 + (index % 5) * 10));
  updateSpectrumHeights(visualizers.music, Array.from({ length: visualizers.music.length }, (_, index) => 16 + (index % 7) * 8));
  syncButtons();
}

function updateTheme(theme) {
  document.documentElement.style.setProperty('--accent', theme.accent || DEFAULT_THEME.accent);
  document.documentElement.style.setProperty('--accent-2', theme.accent2 || DEFAULT_THEME.accent2);
  document.documentElement.style.setProperty('--accent-3', theme.accent3 || DEFAULT_THEME.accent3);
  document.documentElement.style.setProperty('--accent-rgb', theme.accentRgb || DEFAULT_THEME.accentRgb);
  document.documentElement.style.setProperty('--accent-2-rgb', theme.accent2Rgb || DEFAULT_THEME.accent2Rgb);
  document.documentElement.style.setProperty('--accent-3-rgb', theme.accent3Rgb || DEFAULT_THEME.accent3Rgb);
}

function updateSpectrumHeights(bars, heights) {
  updateBars(bars, heights);
}

function setInitialThemeFromPalette(palette) {
  const [primary, secondary, tertiary] = palette;
  const primaryRgb = primary ? hexToRgb(primary.hex) : hexToRgb(DEFAULT_THEME.accent);
  const secondaryRgb = secondary ? hexToRgb(secondary.hex) : hexToRgb(DEFAULT_THEME.accent2);
  const tertiaryRgb = tertiary ? hexToRgb(tertiary.hex) : hexToRgb(DEFAULT_THEME.accent3);

  updateTheme({
    accent: primary?.hex || DEFAULT_THEME.accent,
    accent2: secondary?.hex || DEFAULT_THEME.accent2,
    accent3: tertiary?.hex || DEFAULT_THEME.accent3,
    accent2Rgb: secondaryRgb.join(', '),
    accent3Rgb: tertiaryRgb.join(', '),
    accentRgb: primaryRgb.join(', '),
  });
}

function syncButtons() {
  const hasAnalysis = Boolean(state.analysis);

  elements.playBtn.disabled = !hasAnalysis || state.playing;
  elements.stopBtn.disabled = !state.playing;
  elements.resetBtn.disabled = !hasAnalysis && !state.currentFile;
  elements.playBtn.textContent = state.playing ? 'Играет...' : 'Слушать фрагмент';
}

function setStatus(chipText, lineText) {
  if (chipText) {
    elements.statusChip.textContent = chipText;
  }

  if (lineText) {
    elements.statusLine.textContent = lineText;
  }
}

function renderAnalysis(analysis) {
  state.analysis = analysis;

  setInitialThemeFromPalette(analysis.palette);

  elements.analysisSummary.textContent = analysis.summary;
  elements.heroTitle.textContent = analysis.title;
  elements.heroSubtitle.textContent = analysis.heroSubtitle;
  elements.tempoValue.textContent = String(analysis.sound.tempo);
  elements.modeValue.textContent = analysis.sound.scaleLabel;
  elements.keyValue.textContent = analysis.sound.keyName;
  elements.instrumentValue.textContent = analysis.sound.instrument.label;
  elements.objectsValue.textContent = `${analysis.objects.length}`;
  elements.objectCountTag.textContent = `${analysis.objects.length} зоны`;
  elements.musicCaption.textContent = analysis.musicCaption;
  elements.statusChip.textContent = 'Готово';
  elements.statusLine.textContent = 'Фрагмент готов. Нажмите «Слушать фрагмент», чтобы запустить звук.';

  elements.statsGrid.replaceChildren(...analysis.stats.map((stat) => createStatCard(stat)));
  elements.paletteGrid.replaceChildren(
    ...analysis.palette.map((color, index) => createPaletteCard(color, index)),
  );
  elements.objectList.replaceChildren(
    ...analysis.objects.map((object, index) => createObjectCard(object, index)),
  );
  elements.timeline.replaceChildren(
    ...analysis.sequence.map((step) => createTimelineStep(step)),
  );

  updateSpectrumHeights(visualizers.hero, analysis.sound.visualizer.hero);
  updateSpectrumHeights(visualizers.music, analysis.sound.visualizer.music);
  syncButtons();
}

function renderPreview(file, image) {
  if (state.previewUrl) {
    URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = null;
  }

  const previewUrl = URL.createObjectURL(file);
  state.previewUrl = previewUrl;
  elements.previewImage.hidden = false;
  elements.previewPlaceholder.hidden = true;
  elements.previewOverlay.hidden = false;
  elements.previewImage.alt = `Предпросмотр: ${file.name}`;
  elements.previewFileName.textContent = file.name;
  elements.previewFileName.title = file.name;
  elements.previewFileMeta.textContent = `${formatFileSize(file.size)} • ${image.width} × ${image.height}`;

  elements.previewImage.onload = () => {
    if (state.previewUrl === previewUrl) {
      URL.revokeObjectURL(previewUrl);
      state.previewUrl = null;
    }
  };

  elements.previewImage.onerror = () => {
    if (state.previewUrl === previewUrl) {
      URL.revokeObjectURL(previewUrl);
      state.previewUrl = null;
    }

    elements.previewImage.hidden = true;
    elements.previewPlaceholder.hidden = false;
    elements.previewOverlay.hidden = true;
  };

  elements.previewImage.src = previewUrl;

  elements.fileName.textContent = file.name;
  elements.fileName.title = file.name;
  elements.fileSize.textContent = formatFileSize(file.size);
  elements.imageSize.textContent = `${image.width} × ${image.height}`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение.'));
    };

    image.src = url;
  });
}

async function analyzeFile(file) {
  const image = file instanceof Image ? file : await loadImage(file);
  const maxSide = 180;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(24, Math.round(image.width * scale));
  const height = Math.max(24, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    throw new Error('Canvas недоступен в этом браузере.');
  }

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const analysis = buildAnalysis(imageData, file);
  analysis.image = image;
  analysis.dimensions = { height, width };
  return analysis;
}

function updateIdleVisuals(analysis) {
  if (!analysis) {
    return;
  }

  updateSpectrumHeights(visualizers.hero, analysis.sound.visualizer.hero);
  updateSpectrumHeights(visualizers.music, analysis.sound.visualizer.music);
}

function createNoiseBuffer(ctx, duration) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function scheduleTone(destination, ctx, time, midi, duration, options = {}) {
  const oscillator = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const panner = ctx.createStereoPanner();

  oscillator.type = options.type || 'triangle';
  oscillator.frequency.setValueAtTime(midiToFrequency(midi), time);
  filter.type = options.filterType || 'lowpass';
  filter.frequency.setValueAtTime(options.cutoff || 2400, time);
  filter.Q.value = options.q || 0.72;
  panner.pan.setValueAtTime(options.pan || 0, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(clamp(options.velocity || 0.5, 0.05, 1), time + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.18);

  oscillator.connect(filter).connect(panner).connect(gain).connect(destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.22);
}

function scheduleKick(destination, ctx, time, velocity = 0.9) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(150, time);
  oscillator.frequency.exponentialRampToValueAtTime(48, time + 0.12);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(180, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(clamp(velocity, 0.1, 1), time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

  oscillator.connect(filter).connect(gain).connect(destination);
  oscillator.start(time);
  oscillator.stop(time + 0.24);
}

function scheduleNoiseHit(destination, ctx, time, kind = 'snare', velocity = 0.16) {
  const duration = kind === 'hat' ? 0.08 : 0.16;
  const buffer = createNoiseBuffer(ctx, duration);
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  source.buffer = buffer;
  filter.type = kind === 'hat' ? 'highpass' : 'bandpass';
  filter.frequency.setValueAtTime(kind === 'hat' ? 7000 : 1800, time);
  filter.Q.value = kind === 'hat' ? 0.8 : 1.2;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(clamp(velocity, 0.05, 0.32), time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  source.connect(filter).connect(gain).connect(destination);
  source.start(time);
  source.stop(time + duration + 0.04);
}

function scheduleFragment(analysis, audio) {
  const { ctx, master } = audio;
  const beat = analysis.sound.beatDuration;
  const start = ctx.currentTime + 0.1;

  audio.startTime = start;
  audio.endTime = start + beat * 16 + 0.4;
  audio.sequence = analysis.sequence;

  analysis.sound.progression.forEach((chord, barIndex) => {
    const barStart = start + barIndex * 4 * beat;
    const padDuration = beat * 4;
    chord.forEach((midi, noteIndex) => {
      const type = noteIndex === 0 ? analysis.sound.instrument.padType : 'triangle';
      scheduleTone(master, ctx, barStart, midi, padDuration, {
        cutoff: analysis.sound.instrument.leadCutoff,
        pan: noteIndex === 0 ? -0.1 : noteIndex === 1 ? 0.1 : 0,
        type,
        velocity: noteIndex === 0 ? 0.16 : 0.11,
      });
    });

    scheduleTone(master, ctx, barStart, chord[0] - 12, beat * 2.75, {
      cutoff: 220,
      pan: 0,
      type: analysis.sound.instrument.bassType,
      velocity: 0.14,
    });

    scheduleKick(master, ctx, barStart, 0.86);
  });

  analysis.sequence.forEach((step, stepIndex) => {
    const barStart = start + Math.floor(stepIndex / 4) * 4 * beat;
    const stepStart = barStart + (stepIndex % 4) * beat + (stepIndex % 2 === 1 ? beat * analysis.sound.swing : 0);

    scheduleTone(master, ctx, stepStart, step.midi, beat * step.duration, {
      cutoff: analysis.sound.instrument.leadCutoff,
      filterType: 'lowpass',
      pan: step.pan,
      type: analysis.sound.instrument.toneType,
      velocity: step.velocity,
    });

    if (stepIndex % 4 === 2) {
      scheduleNoiseHit(master, ctx, stepStart, 'snare', 0.17 + step.velocity * 0.2);
    }

    if (stepIndex % 2 === 1) {
      scheduleNoiseHit(master, ctx, stepStart + beat * 0.5, 'hat', 0.08 + step.velocity * 0.08);
    }
  });
}

function updatePlayhead() {
  if (!state.audio || !state.playing || !state.analysis) {
    return;
  }

  const { ctx, startTime, beatDuration } = state.audio;
  const elapsedBeats = (ctx.currentTime - startTime) / beatDuration;
  const activeStep = clamp(Math.floor(elapsedBeats), 0, state.analysis.sequence.length - 1);

  if (activeStep !== state.currentStep) {
    state.currentStep = activeStep;

    const steps = [...elements.timeline.children];
    steps.forEach((step, index) => {
      step.classList.toggle('is-active', index === activeStep);
      step.classList.toggle('is-past', index < activeStep);
    });
  }

  if (ctx.currentTime < state.audio.endTime) {
    const analyser = state.audio.analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    updateBars(visualizers.hero, sampleFrequencyData(data, visualizers.hero.length).map((value) => 10 + (value / 255) * 90));
    updateBars(visualizers.music, sampleFrequencyData(data, visualizers.music.length).map((value) => 10 + (value / 255) * 90));
    state.audio.frame = window.requestAnimationFrame(updatePlayhead);
    return;
  }

  void stopPlayback('Фрагмент завершён.');
}

function startPlaybackLoop() {
  if (!state.audio) {
    return;
  }

  state.audio.frame = window.requestAnimationFrame(updatePlayhead);
}

async function ensureAudio() {
  if (state.audio) {
    return state.audio;
  }

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error('Этот браузер не поддерживает Web Audio API.');
  }

  const ctx = new AudioContextConstructor();
  const master = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();
  const analyser = ctx.createAnalyser();

  master.gain.value = 0.9;
  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.22;
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = 0.82;

  master.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(ctx.destination);

  state.audio = {
    analyser,
    ctx,
    endTime: 0,
    frame: 0,
    master,
    sequence: [],
    startTime: 0,
  };

  return state.audio;
}

async function playFragment() {
  if (!state.analysis || state.playing) {
    return;
  }

  try {
    const audio = await ensureAudio();
    await audio.ctx.resume();
    scheduleFragment(state.analysis, audio);
    state.playing = true;
    state.currentStep = -1;
    setStatus('Воспроизведение', 'Воспроизводится музыкальный фрагмент, собранный из фото.');
    syncButtons();
    startPlaybackLoop();
    audio.stopTimer = window.setTimeout(() => {
      void stopPlayback('Фрагмент завершён.');
    }, Math.max(0, (audio.endTime - audio.ctx.currentTime + 0.1) * 1000));
  } catch (error) {
    setStatus('Ошибка', error instanceof Error ? error.message : 'Не удалось запустить звук.');
  }
}

async function stopPlayback(message = 'Фрагмент остановлен.') {
  if (state.audio) {
    if (state.audio.stopTimer) {
      window.clearTimeout(state.audio.stopTimer);
    }

    if (state.audio.frame) {
      window.cancelAnimationFrame(state.audio.frame);
    }

    if (state.audio.ctx.state !== 'closed') {
      await state.audio.ctx.close();
    }

    state.audio = null;
  }

  state.playing = false;
  state.currentStep = -1;

  if (state.analysis) {
    updateIdleVisuals(state.analysis);
    setStatus('Готово', message);
  } else {
    renderPlaceholderState();
    setStatus('Ожидание фото', 'Ожидаю фотографию.');
  }

  syncButtons();
}

function clearPreview() {
  if (state.previewUrl) {
    URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = null;
  }

  elements.previewImage.src = '';
  elements.previewImage.alt = 'Предпросмотр выбранной фотографии';
  elements.previewImage.hidden = true;
  elements.previewPlaceholder.hidden = false;
  elements.previewOverlay.hidden = true;
  elements.previewFileName.textContent = '—';
  elements.previewFileName.title = '';
  elements.previewFileMeta.textContent = 'Выберите фотографию, чтобы увидеть её подпись.';
}

async function handleFile(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    setStatus('Ошибка', 'Нужен файл изображения.');
    return;
  }

  state.loadingToken += 1;
  const token = state.loadingToken;

  if (state.playing) {
    await stopPlayback('Новый файл выбран.');
  }

  state.currentFile = file;
  clearPreview();
  elements.fileName.textContent = file.name;
  elements.fileName.title = file.name;
  elements.fileSize.textContent = formatFileSize(file.size);
  elements.imageSize.textContent = '…';
  elements.previewOverlay.hidden = false;
  elements.previewFileName.textContent = file.name;
  elements.previewFileName.title = file.name;
  elements.previewFileMeta.textContent = 'Подготавливаю предпросмотр…';
  setStatus('Анализ', 'Разбираю цвета, контраст и объектные зоны...');
  syncButtons();

  try {
    const image = await loadImage(file);

    if (token !== state.loadingToken) {
      return;
    }

    renderPreview(file, image);
    const analysis = await analyzeFile(file, image);

    if (token !== state.loadingToken) {
      return;
    }

    renderAnalysis(analysis);
    setStatus('Готово', 'Фрагмент готов. Нажмите «Слушать фрагмент», чтобы запустить звук.');
  } catch (error) {
    if (token !== state.loadingToken) {
      return;
    }

    renderPlaceholderState();
    setStatus('Ошибка', error instanceof Error ? error.message : 'Не удалось обработать изображение.');
  }
}

function bindEvents() {
  elements.photoInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    void handleFile(file);
  });

  elements.playBtn.addEventListener('click', () => {
    void playFragment();
  });

  elements.stopBtn.addEventListener('click', () => {
    void stopPlayback('Фрагмент остановлен пользователем.');
  });

  elements.resetBtn.addEventListener('click', () => {
    state.loadingToken += 1;
    state.currentFile = null;
    state.analysis = null;
    state.currentStep = -1;

    if (state.playing) {
      void stopPlayback('Сброс выполнен.');
    }

    elements.photoInput.value = '';
    clearPreview();
    renderPlaceholderState();
  });

  elements.dropzone.addEventListener('dragenter', (event) => {
    event.preventDefault();
    state.dragCounter += 1;
    elements.dropzone.classList.add('is-dragover');
  });

  elements.dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    elements.dropzone.classList.add('is-dragover');
  });

  elements.dropzone.addEventListener('dragleave', (event) => {
    event.preventDefault();
    state.dragCounter = Math.max(0, state.dragCounter - 1);

    if (state.dragCounter === 0) {
      elements.dropzone.classList.remove('is-dragover');
    }
  });

  elements.dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    state.dragCounter = 0;
    elements.dropzone.classList.remove('is-dragover');

    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
    }
  });
}

renderPlaceholderState();
bindEvents();
