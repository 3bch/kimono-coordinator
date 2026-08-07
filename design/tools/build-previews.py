# /// script
# requires-python = ">=3.12"
# dependencies = ["fonttools>=4.63", "brotli>=1.1"]
# ///
"""Claude Design 用のプレビュー HTML をビルドする

`design/templates/` の下を入力に、`design/` の下へ出力する。実行方法は
`docs/theme.md` を参照（依存はこのファイル先頭の PEP 723 で宣言しており、
uv が解決するため事前の準備は要らない）。

やっていること:

- `<!-- @include foo.html -->` を `templates/partials/foo.html` の内容で置き換える
- `__WOFF2_<フォントファイル名>__` を、そのページの表示テキストに含まれる
  グリフだけへサブセット化した woff2 の base64 に置き換える

フォントを埋め込むのは、Claude Design のプレビューが外部へ通信できないため。
和文フォントは元が数 MB あるので、そのままでは埋め込めずサブセット化が要る。
"""

import base64
import io
import re
import string
import sys
import urllib.request
from pathlib import Path

from fontTools import subset

DESIGN_DIR = Path(__file__).resolve().parent.parent
TEMPLATES = DESIGN_DIR / "templates"
PARTIALS = TEMPLATES / "partials"
FONT_CACHE = DESIGN_DIR / "tools" / ".fonts"

INCLUDE = re.compile(r"[ \t]*<!--\s*@include\s+([A-Za-z0-9._-]+)\s*-->")
PLACEHOLDER = re.compile(r"__WOFF2_([A-Za-z0-9-]+)__")

# Google Fonts 上のフォントファイル置き場（フォント名 -> ofl 配下のパス）
FONT_SOURCES = {
    "KaiseiDecol-Regular": "kaiseidecol/KaiseiDecol-Regular.ttf",
    "KaiseiDecol-Bold": "kaiseidecol/KaiseiDecol-Bold.ttf",
    "ZenMaruGothic-Regular": "zenmarugothic/ZenMaruGothic-Regular.ttf",
    "ZenMaruGothic-Bold": "zenmarugothic/ZenMaruGothic-Bold.ttf",
}

FONT_BASE_URL = "https://raw.githubusercontent.com/google/fonts/main/ofl"


def font_path(name: str) -> Path:
    """フォントの TTF を取得する。無ければ Google Fonts から落としてキャッシュする"""
    if name not in FONT_SOURCES:
        sys.exit(f"未知のフォント: {name}（FONT_SOURCES に追加が要る）")
    cached = FONT_CACHE / f"{name}.ttf"
    if not cached.exists():
        FONT_CACHE.mkdir(parents=True, exist_ok=True)
        url = f"{FONT_BASE_URL}/{FONT_SOURCES[name]}"
        print(f"download {name} <- {url}")
        with urllib.request.urlopen(url) as response:
            cached.write_bytes(response.read())
    return cached


def resolve_includes(html: str, depth: int = 0) -> str:
    """@include を partials の内容で再帰的に置き換える"""
    if depth > 5:
        sys.exit("@include が深すぎる（循環している可能性がある）")

    def replace(match: re.Match[str]) -> str:
        partial = PARTIALS / match.group(1)
        if not partial.exists():
            sys.exit(f"partial が無い: {partial}")
        return resolve_includes(partial.read_text(encoding="utf-8").rstrip("\n"), depth + 1)

    return INCLUDE.sub(replace, html)


def visible_text(html: str) -> str:
    """HTML から style・コメント・タグを除いた、画面に出る文字だけを取り出す"""
    html = re.sub(r"<style>.*?</style>", "", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    return re.sub(r"<[^>]+>", "", html)


def subset_font(ttf: Path, text: str) -> bytes:
    """フォントを、指定した文字のグリフだけに絞った woff2 として返す"""
    options = subset.Options()
    options.flavor = "woff2"
    # 縦書きや異体字などの機能はプレビューでは使わないので、水平組みの分だけ残す
    options.layout_features = ["kern", "palt"]
    options.hinting = False
    options.desubroutinize = True
    font = subset.load_font(str(ttf), options)
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    buffer = io.BytesIO()
    font.save(buffer)
    return buffer.getvalue()


def build(template: Path) -> None:
    """テンプレート 1 つを、対応する出力先へビルドする"""
    html = resolve_includes(template.read_text(encoding="utf-8"))
    # 文字集合はページごとに求める。全ページで共通にすると使わないグリフまで抱える
    text = "".join(sorted(set(string.printable) | set(visible_text(html))))
    for name in sorted(set(PLACEHOLDER.findall(html))):
        woff2 = subset_font(font_path(name), text)
        html = html.replace(f"__WOFF2_{name}__", base64.b64encode(woff2).decode("ascii"))

    out_path = DESIGN_DIR / template.relative_to(TEMPLATES)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    print(f"{out_path.relative_to(DESIGN_DIR)} ({out_path.stat().st_size // 1024} KiB)")


def main() -> None:
    templates = sorted(p for p in TEMPLATES.rglob("*.html") if PARTIALS not in p.parents)
    if not templates:
        sys.exit(f"テンプレートが無い: {TEMPLATES}")
    for template in templates:
        build(template)


if __name__ == "__main__":
    main()
