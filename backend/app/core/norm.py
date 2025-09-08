import re
def norm(s: str | None) -> str | None:
    if not s: return None
    out = re.sub(r'[^a-z0-9]+', '', s.lower())
    return out or None
