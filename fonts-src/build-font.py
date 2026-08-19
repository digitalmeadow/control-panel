#!/usr/bin/env python3
"""Rebuild src/fonts/IosevkaTermNF-Regular.woff2 from glyphs.txt.

    pip install fonttools brotli
    python3 fonts-src/build-font.py

Subsets the Nerd Font source down to glyphs.txt. Layout features and hinting are
dropped: calt alone drags in ~200 ligature alternates, and a control panel wants
"->" to stay two characters rather than silently becoming an arrow.

pyftsubset ignores codepoints the source lacks without complaint, so the output
is read back and every requested codepoint verified — that check is the whole
reason this exists instead of a raw pyftsubset call.

Nothing in this folder ships. Only OUTPUT is written, and vite inlines it into
dist/index.js as a data URI.

SOURCE is committed (SIL OFL 1.1) so the subset is reproducible and version-pinned.
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options

HERE = Path(__file__).parent
SOURCE = HERE / "IosevkaTermNerdFont-Regular.ttf"
GLYPHS = HERE / "glyphs.txt"
OUTPUT = HERE.parent / "src" / "fonts" / "IosevkaTermNF-Regular.woff2"


def fail(message):
    sys.exit(f"error: {message}")


def codepoints(font):
    return set().union(*[set(t.cmap) for t in font["cmap"].tables])


def wanted():
    text = GLYPHS.read_text(encoding="utf-8")
    # The file doubles as its own instructions; every printable character counts.
    # Space is included — the font needs its glyph; newlines and tabs are not.
    return {ord(c) for c in text if ord(c) >= 0x20}


def main():
    if not SOURCE.exists():
        fail(f"{SOURCE.name} not found. It is committed alongside this script — see glyphs.txt.")

    want = wanted()

    options = Options()
    options.layout_features = []
    options.hinting = False
    options.desubroutinize = True
    # OFL requires the notice and licence to travel with the font, and the subset is
    # redistributed inlined in dist/index.js. pyftsubset keeps 0-6 by default, dropping
    # the licence (13) and its URL (14).
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]

    font = TTFont(SOURCE)
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=sorted(want))
    subsetter.subset(font)

    font.flavor = "woff2"
    font.save(OUTPUT)

    # Read back rather than trusting the in-memory font.
    missing = sorted(want - codepoints(TTFont(OUTPUT)))
    if missing:
        fail(
            "these codepoints are in glyphs.txt but missing from the built font:\n"
            + "\n".join(f"  U+{cp:04X} {chr(cp)!r}" for cp in missing)
            + "\n  Check the source TTF version."
        )

    print(f"{OUTPUT.name}: {len(want)} codepoints, {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
