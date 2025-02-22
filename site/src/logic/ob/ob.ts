// ++  ob
//
// See arvo/sys/hoon.hoon.
import { BN } from 'bn.js';
import { muk } from './muk';
import type { Bn, Number } from './types';

const ux_1_0000 = new BN('10000', 'hex');
const ux_ffff_ffff = new BN('ffffffff', 'hex');
const ux_1_0000_0000 = new BN('100000000', 'hex');
const ux_ffff_ffff_ffff_ffff = new BN('ffffffffffffffff', 'hex');
const ux_ffff_ffff_0000_0000 = new BN('ffffffff00000000', 'hex');

const u_65535 = new BN('65535');
const u_65536 = new BN('65536');

// a PRF for j in { 0, .., 3 }
const F = (j: number, arg: Bn): Bn => {
  const raku = [0xb76d5eed, 0xee281300, 0x85bcae01, 0x4b387af7];

  return muk(raku[j], 2, arg);
};

/**
 * Conceal structure v3.
 *
 */
const fein = (arg: Number): Bn => {
  const loop = (pyn: Bn): Bn => {
    const lo = pyn.and(ux_ffff_ffff);
    const hi = pyn.and(ux_ffff_ffff_0000_0000);

    return pyn.gte(ux_1_0000) && pyn.lte(ux_ffff_ffff)
      ? ux_1_0000.add(feis(pyn.sub(ux_1_0000)))
      : pyn.gte(ux_1_0000_0000) && pyn.lte(ux_ffff_ffff_ffff_ffff)
        ? hi.or(loop(lo))
        : pyn;
  };

  return loop(new BN(arg));
};

/**
 * Restore structure v3.
 *
 */
const fynd = (arg: Number): Bn => {
  const loop = (cry: Bn): Bn => {
    const lo = cry.and(ux_ffff_ffff);
    const hi = cry.and(ux_ffff_ffff_0000_0000);

    return cry.gte(ux_1_0000) && cry.lte(ux_ffff_ffff)
      ? ux_1_0000.add(tail(cry.sub(ux_1_0000)))
      : cry.gte(ux_1_0000_0000) && cry.lte(ux_ffff_ffff_ffff_ffff)
        ? hi.or(loop(lo))
        : cry;
  };

  return loop(new BN(arg));
};

/**
 * Generalised Feistel cipher.
 *
 * See: Black and Rogaway (2002), "Ciphers with arbitrary finite domains."
 *
 * Note that this has been adjusted from the reference paper in order to
 * support some legacy behaviour.
 *
 * @param  {String, Number, BN}
 * @return  {BN}
 */
const feis = (arg: Number): Bn => Fe(4, u_65535, u_65536, ux_ffff_ffff, F, new BN(arg));

const Fe = (r: number, a: Bn, b: Bn, k: Bn, f: typeof F, m: Bn): Bn => {
  const c = fe(r, a, b, f, m);
  return c.lt(k) ? c : fe(r, a, b, f, c);
};

const fe = (r: number, a: Bn, b: Bn, f: typeof F, m: Bn) => {
  const loop = (j: number, ell: Bn, arr: Bn): Bn => {
    if (j > r) {
      return r % 2 !== 0
        ? a.mul(arr).add(ell)
        : arr.eq(a)
          ? a.mul(arr).add(ell)
          : a.mul(ell).add(arr);
    } else {
      const eff = f(j - 1, arr);

      const tmp = j % 2 !== 0 ? ell.add(eff).mod(a) : ell.add(eff).mod(b);

      return loop(j + 1, arr, tmp);
    }
  };

  const L = m.mod(a);
  const R = m.div(a);

  return loop(1, L, R);
};

/**
 * Reverse 'feis'.
 *
 * See: Black and Rogaway (2002), "Ciphers with arbitrary finite domains."
 *
 * Note that this has been adjusted from the reference paper in order to
 * support some legacy behaviour.
 *
 * @param {Number, String, BN}  arg
 * @return  {BN}
 */
const tail = (arg: Number): Bn => Fen(4, u_65535, u_65536, ux_ffff_ffff, F, new BN(arg));

const Fen = (r: number, a: Bn, b: Bn, k: Bn, f: typeof F, m: Bn): Bn => {
  const c = fen(r, a, b, f, m);
  return c.lt(k) ? c : fen(r, a, b, f, c);
};

const fen = (r: number, a: Bn, b: Bn, f: typeof F, m: Bn) => {
  const loop = (j: number, ell: Bn, arr: Bn): Bn => {
    if (j < 1) {
      return a.mul(arr).add(ell);
    } else {
      const eff = f(j - 1, ell);

      // NB (jtobin):
      //
      // Slight deviation from B&R (2002) here to prevent negative values.  We
      // add 'a' or 'b' to arr as appropriate and reduce 'eff' modulo the same
      // number before performing subtraction.
      //
      const tmp =
        j % 2 !== 0
          ? arr.add(a).sub(eff.mod(a)).mod(a)
          : arr.add(b).sub(eff.mod(b)).mod(b);

      return loop(j - 1, tmp, ell);
    }
  };

  const ahh = r % 2 !== 0 ? m.div(a) : m.mod(a);

  const ale = r % 2 !== 0 ? m.mod(a) : m.div(a);

  const L = ale.eq(a) ? ahh : ale;

  const R = ale.eq(a) ? ale : ahh;

  return loop(r, L, R);
};

export const ob = {
  F,

  fe,
  Fe,
  feis,
  fein,

  fen,
  Fen,
  tail,
  fynd,
};
