// Zufallszahlen genau wie Pythons random.Random(seed).
//
// Warum nicht einfach Math.random()? scene.py verteilt Bäume, Blumen und Gras mit
// random.Random(7) bzw. (11). Ein fester Startwert ("Seed") heisst: jedes Mal dieselben
// "zufälligen" Zahlen, also stehen die Bäume immer am selben Ort. Math.random() hat keinen
// Startwert, die Landschaft sähe bei jedem Laden anders aus und nicht wie die Vorlage.
//
// Python benutzt den Mersenne Twister (MT19937), einen bekannten, genau beschriebenen
// Algorithmus. Wir bauen ihn hier nach, samt der Art, wie Python daraus random(),
// uniform() und choice() macht. Ergebnis: dieselbe Zahlenfolge bis aufs letzte Bit.

const N = 624;
const M = 397;

export class PyRandom {
  constructor(seed) {
    this.mt = new Uint32Array(N);
    this.i = N;
    this.#seed(seed);
  }

  // Python: seed(int) zerlegt die Zahl in 32-Bit-Stücke und ruft init_by_array auf
  #seed(seed) {
    let n = Math.abs(seed);
    const key = [];
    do { key.push(n % 0x100000000); n = Math.floor(n / 0x100000000); } while (n > 0);
    this.#initByArray(key);
  }

  #initGenrand(s) {
    const mt = this.mt;
    mt[0] = s >>> 0;
    for (let i = 1; i < N; i++) {
      const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
      // Math.imul = 32-Bit-Multiplikation wie in C (normale * würde Kommazahlen runden)
      mt[i] = (Math.imul(1812433253, p) + i) >>> 0;
    }
    this.i = N;
  }

  #initByArray(key) {
    const mt = this.mt;
    this.#initGenrand(19650218);
    let i = 1, j = 0;
    for (let k = Math.max(N, key.length); k; k--) {
      const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ Math.imul(p, 1664525)) + key[j] + j) >>> 0;
      i++; j++;
      if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
      if (j >= key.length) j = 0;
    }
    for (let k = N - 1; k; k--) {
      const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ Math.imul(p, 1566083941)) - i) >>> 0;
      i++;
      if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
    }
    mt[0] = 0x80000000;
  }

  // Eine 32-Bit-Zufallszahl (der eigentliche Mersenne Twister)
  uint32() {
    const mt = this.mt;
    if (this.i >= N) {
      for (let k = 0; k < N; k++) {
        const y = (mt[k] & 0x80000000) | (mt[(k + 1) % N] & 0x7fffffff);
        mt[k] = mt[(k + M) % N] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      }
      this.i = 0;
    }
    let y = mt[this.i++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  // Python: random() = Kommazahl in [0, 1) aus 53 Bits (zwei 32-Bit-Zahlen)
  random() {
    const a = this.uint32() >>> 5, b = this.uint32() >>> 6;
    return (a * 67108864.0 + b) * (1.0 / 9007199254740992.0);
  }

  // Python: uniform(a, b) = a + (b - a) * random()
  uniform(a, b) {
    return a + (b - a) * this.random();
  }

  // Python: getrandbits(k) für k ≤ 32 nimmt die obersten k Bits
  #bits(k) {
    return this.uint32() >>> (32 - k);
  }

  // Python: choice() zieht so lange k Bits, bis die Zahl kleiner als die Länge ist
  choice(liste) {
    const n = liste.length;
    const k = n.toString(2).length; // Pythons n.bit_length()
    let r = this.#bits(k);
    while (r >= n) r = this.#bits(k);
    return liste[r];
  }
}
