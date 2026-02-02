import json
import sys

from argostranslate import translate


def main():
    payload = json.load(sys.stdin)
    source = payload.get("from") or "de"
    target = payload.get("to") or "en"
    texts = payload.get("texts") or []
    translations = [translate.translate(text, source, target) for text in texts]
    json.dump(translations, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        sys.stderr.write(f"argos_translate_failed: {exc}\n")
        sys.exit(1)
