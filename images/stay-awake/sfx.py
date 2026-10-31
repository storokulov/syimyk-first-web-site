"""sfx.py - synthesize the cartoon sound effects (48 kHz mono WAV, peak -1 dBFS).

Everything is made from sines and filtered noise, so there are no licences to track.
Writes public/stay-awake/sfx/<name>.wav and prints each file's length and peak time.
"""
import os
import wave

import numpy as np

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "stay-awake", "sfx")
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(n, a, d, curve=4.0):
    """attack a seconds, exponential-ish decay over the rest."""
    x = np.arange(n) / SR
    at = np.clip(x / max(a, 1e-4), 0, 1)
    rel = np.exp(-curve * np.clip(x - a, 0, None) / max(d, 1e-4))
    return at * rel


def svf(x, fc, q=0.7, mode="bp"):
    """time-varying state-variable filter; fc can be an array."""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    low = band = 0.0
    out = np.empty_like(x)
    k = 1.0 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(fc[i], SR / 6) / SR)
        high = x[i] - low - k * band
        band += f * high
        low += f * band
        out[i] = band if mode == "bp" else low if mode == "lp" else high
    return out


def sweep(f0, f1, d, shape=1.0):
    x = t(d) / d
    f = f0 + (f1 - f0) * x ** shape
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def noise(d):
    return rng.standard_normal(int(d * SR))


def save(name, x):
    x = np.asarray(x, float)
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (-1 / 20)
    fade = min(len(x), int(0.004 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(OUT, f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    print(f"{name:10s} {len(x) / SR:5.2f}s peak@{np.abs(x).argmax() / SR:.3f}s")


def whoosh(d=0.55, f0=350, f1=2600, q=1.2):
    n = noise(d)
    x = t(d) / d
    fc = f0 + (f1 - f0) * np.sin(np.pi * x * 0.5) ** 2
    e = np.sin(np.pi * x) ** 1.6
    return svf(n, fc, q) * e


def thud(d=0.4, f0=120, f1=48):
    body = sweep(f0, f1, d, 0.4) * env(int(d * SR), 0.003, d * 0.5, 5)
    hit = svf(noise(d), 600, 0.8, "lp") * env(int(d * SR), 0.001, 0.03, 6)
    return body + 0.5 * hit


def main():
    os.makedirs(OUT, exist_ok=True)
    save("whoosh", whoosh())
    save("swish", whoosh(0.3, 900, 4200, 1.5))
    d = 0.12
    save("pop", sweep(900, 260, d, 0.5) * env(int(d * SR), 0.002, d * 0.55, 5) + 0.15 * noise(d) * env(int(d * SR), 0.0005, 0.006, 6))
    d = 0.07
    save("bubble", sweep(1700, 700, d, 0.6) * env(int(d * SR), 0.001, d * 0.5, 5) + 0.3 * svf(noise(d), 3000, 1.0) * env(int(d * SR), 0.0005, 0.01, 6))
    d = 0.05
    save("tick", np.sin(2 * np.pi * 3100 * t(d)) * env(int(d * SR), 0.0005, 0.02, 6) + 0.2 * noise(d) * env(int(d * SR), 0.0002, 0.003, 6))
    save("thud", thud())
    d = 0.09
    c = svf(noise(d), 4500, 1.2, "hp") * env(int(d * SR), 0.0003, 0.006, 6)
    c2 = np.roll(c, int(0.028 * SR)) * 0.7
    save("click", c + c2)
    d = 0.16
    save("switch", svf(noise(d), 3800, 1.0, "hp") * env(int(d * SR), 0.0003, 0.008, 6) + 0.6 * sweep(220, 120, d, 0.5) * env(int(d * SR), 0.001, 0.05, 6))
    d = 1.8
    boom = sweep(62, 28, d, 0.35) * env(int(d * SR), 0.004, 1.2, 4) + 0.8 * svf(noise(d), 180, 0.7, "lp") * env(int(d * SR), 0.002, 0.5, 4)
    save("boom", np.tanh(1.6 * boom))
    d = 1.5
    x = t(d) / d
    rattle = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 24 * t(d)))
    snore = svf(noise(d), 420 + 220 * np.sin(np.pi * x), 2.5) * rattle * np.sin(np.pi * x) ** 1.2
    save("snore", snore + 0.3 * svf(noise(d), 160, 1.0, "lp") * np.sin(np.pi * x))
    d = 0.16
    save("beep", np.sin(2 * np.pi * 1250 * t(d)) * np.clip(np.minimum(t(d) / 0.01, (d - t(d)) / 0.02), 0, 1))
    d = 0.13
    save("page", svf(noise(d), 2400 + 2000 * t(d) / d, 0.9) * env(int(d * SR), 0.01, 0.07, 4) * (0.7 + 0.3 * np.sin(2 * np.pi * 60 * t(d))))
    d = 0.45
    save("stamp", thud(d, 150, 60) + 0.8 * svf(noise(d), 1600, 1.4) * env(int(d * SR), 0.0005, 0.04, 6))
    d = 0.5
    save("slam", 1.2 * thud(d, 95, 40) + 0.9 * svf(noise(d), 900, 0.8) * env(int(d * SR), 0.0008, 0.09, 5))
    d = 0.9
    bell = np.zeros(int(d * SR))
    for start, fs in [(0.0, [2093, 2637, 4186]), (0.12, [2637, 3136, 5274])]:
        s = int(start * SR)
        n = len(bell) - s
        tone = sum(np.sin(2 * np.pi * f * np.arange(n) / SR) / (k + 1) for k, f in enumerate(fs))
        bell[s:] += tone * env(n, 0.002, 0.5, 5)
    cha = svf(noise(d), 5000, 1.0, "hp") * env(int(d * SR), 0.001, 0.05, 6)
    save("cash", bell + 0.6 * cha)
    d = 0.6
    vib = 1 + 0.25 * np.exp(-5 * t(d)) * np.sin(2 * np.pi * 17 * t(d))
    save("boing", np.sin(2 * np.pi * np.cumsum(240 * vib * (1 + 0.6 * t(d))) / SR) * env(int(d * SR), 0.003, 0.5, 3))
    d = 1.3
    saw = 2 * ((110 * t(d)) % 1) - 1
    flick = np.repeat(rng.random(int(d * 25) + 1) > 0.35, SR // 25)[: int(d * SR)].astype(float)
    flick = np.convolve(flick, np.ones(200) / 200, "same")
    save("buzz", svf(saw, 700, 0.7, "lp") * flick)
    d = 0.32
    save("whoop", sweep(320, 760, d, 0.8) * np.sin(np.pi * t(d) / d) ** 1.5)
    d = 0.3
    save("sparkle", sum(np.sin(2 * np.pi * f * t(d)) * env(int(d * SR), 0.002 + k * 0.03, 0.15, 5) for k, f in enumerate([1568, 2093, 2637, 3136])))
    d = 0.22
    flap = svf(noise(d), 1500, 0.9) * (env(int(d * SR), 0.002, 0.04, 6) + np.roll(env(int(d * SR), 0.002, 0.05, 6), int(0.07 * SR)))
    save("flip", flap)
    d = 0.5
    save("rewind", svf(noise(d), 800 + 3000 * (t(d) / d) ** 2, 3.0) * np.sin(np.pi * t(d) / d) * (0.6 + 0.4 * np.sin(2 * np.pi * 40 * t(d))))


if __name__ == "__main__":
    main()
