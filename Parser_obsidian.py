import re
from dataclasses import dataclass


@dataclass
class TagResult:
    tag: str
    original: str
    position: int


class TagParser:
    TAG_RE = re.compile(r'(?<!\w)#(\w+)', re.UNICODE)

    def __init__(self, min_length: int = 1, max_length: int = 50,
                 lower_case: bool = True):
        self.min_length = min_length
        self.max_length = max_length
        self.lower_case = lower_case

    def parse(self, text: str, unique: bool = False) -> list[TagResult]:
        results = []
        seen = set()

        for match in self.TAG_RE.finditer(text):
            raw = match.group(1)

            if not (self.min_length <= len(raw) <= self.max_length):
                continue
            if raw.isdigit():
                continue

            norm = raw.lower() if self.lower_case else raw
            if unique:
                if norm in seen:
                    continue
                seen.add(norm)

            results.append(TagResult(
                tag=norm,
                original=raw,
                position=match.start(1)
            ))
        return results
