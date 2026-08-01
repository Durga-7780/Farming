"""SIP participant display/attribute extraction for inbound calls (e.g. trunk DID 1001)."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Dict, Optional, Tuple

logger = logging.getLogger(__name__)

_FROM_HEADER_DISPLAY_RE = re.compile(r'^"?([^"<>]+)"?\s*<', re.IGNORECASE)


def extract_digits(value: str, *, min_len: int = 3, max_len: int = 15) -> Optional[str]:
    if not value:
        return None
    digits = "".join(ch for ch in str(value) if ch.isdigit())
    if min_len <= len(digits) <= max_len:
        return digits
    return None


def extract_phone_like(value: str) -> Optional[str]:
    return extract_digits(value, min_len=7, max_len=15)


def extract_did_like(value: str) -> Optional[str]:
    """Called/trunk number — allows short extensions like 1001."""
    return extract_digits(value, min_len=3, max_len=15)


def parse_sip_display_data(raw: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """
    Parse caller number / call id from SIP From display name or metadata.

    Asterisk example::
        From: "8970158135,89701581351785305414" <sip:0729114027@...>
        → from_number=8970158135, call_id=89701581351785305414

    Also supports JSON, ``number|call_id``, and plain digit strings.
    """
    text = str(raw or "").strip().strip('"').strip("'")
    if not text:
        return None, None

    from_number: Optional[str] = None
    call_id: Optional[str] = None

    if text.startswith("{"):
        try:
            payload = json.loads(text)
            if isinstance(payload, dict):
                for key in (
                    "from",
                    "from_number",
                    "caller",
                    "caller_id",
                    "phone",
                    "phoneNumber",
                    "mobile",
                ):
                    candidate = payload.get(key)
                    if candidate and not from_number:
                        from_number = extract_phone_like(str(candidate)) or extract_did_like(str(candidate))
                for key in ("call_id", "callId", "call_sid", "callSid", "sip_call_id", "uuid"):
                    candidate = payload.get(key)
                    if candidate and not call_id:
                        call_id = str(candidate).strip() or None
                return from_number, call_id
        except Exception:
            pass

    # Asterisk / ConVox: "from_number,call_id" in SIP From display name
    if "," in text:
        left, right = text.split(",", 1)
        left = left.strip()
        right = right.strip()
        from_number = extract_phone_like(left) or extract_did_like(left)
        call_id = right or None
        if from_number or call_id:
            logger.info(
                "Parsed SIP display data comma form from=%s call_id=%s raw=%r",
                from_number,
                call_id,
                text[:120],
            )
            return from_number, call_id

    if "|" in text:
        left, right = text.split("|", 1)
        from_number = extract_phone_like(left.strip()) or extract_did_like(left.strip())
        right = right.strip()
        call_id = right if right else None
        return from_number, call_id

    digits = extract_phone_like(text) or extract_did_like(text)
    if digits:
        from_number = digits
    return from_number, call_id


def parse_from_sip_header(from_header: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract display-data from a SIP From header value.

    Example::
        "8970158135,89701581351785305414" <sip:0729114435@192.168.0.130>;tag=...
    """
    text = str(from_header or "").strip()
    if not text:
        return None, None

    m = _FROM_HEADER_DISPLAY_RE.match(text)
    if m:
        display = m.group(1).strip().strip('"').strip("'")
        if display and not display.lower().startswith("sip:"):
            return parse_sip_display_data(display)

    if "<" not in text:
        bare = text.split(";", 1)[0].strip()
        return parse_sip_display_data(bare)

    return None, None


_DISPLAY_ATTR_KEYS = (
    "sip.displayName",
    "sip.fromDisplayName",
    "sip.display",
    "sip.fromDisplay",
    "displayName",
    "display_name",
    "from_display",
)

_FROM_HEADER_ATTR_KEYS = (
    "sip.h.From",
    "sip.h.from",
    "sip.h.FROM",
    "sip.fromHeader",
    "sip.from_header",
)

# Inbound trunk headers_to_attributes mapping (see Redis sip_inbound_trunk / create_inbound_trunk.py).
# X-Lead-Name → sip.x-lead-name
_CUSTOM_HEADER_SPECS: tuple[tuple[str, tuple[str, ...]], ...] = (
    (
        "lead_name",
        (
            "sip.x-lead-name",
            "sip.h.X-Lead-Name",
            "sip.h.x-lead-name",
            "X-Lead-Name",
        ),
    ),
)

_RPC_HEADER_NAMES = ("From", "X-Lead-Name")


def _is_sip_participant(participant) -> bool:
    kind = getattr(participant, "kind", None)
    if kind is None:
        identity = str(getattr(participant, "identity", "") or "").lower()
        return identity.startswith("sip-") or identity.startswith("sip_") or "sip" in identity
    try:
        from livekit import rtc

        return kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
    except Exception:
        return True


def scan_sip_from_header_attrs(ctx) -> Tuple[Optional[str], Optional[str]]:
    """Parse From header if exposed as sip.h.* participant attribute."""
    from_number: Optional[str] = None
    call_id: Optional[str] = None
    try:
        for participant in ctx.room.remote_participants.values():
            attrs = getattr(participant, "attributes", None) or {}
            for key in _FROM_HEADER_ATTR_KEYS:
                if attrs.get(key):
                    parsed_from, parsed_call_id = parse_from_sip_header(str(attrs.get(key)))
                    from_number = from_number or parsed_from
                    call_id = call_id or parsed_call_id
            for k, v in attrs.items():
                lk = str(k).lower()
                if lk.startswith("sip.h.") and lk.endswith(".from") and isinstance(v, str):
                    parsed_from, parsed_call_id = parse_from_sip_header(v)
                    from_number = from_number or parsed_from
                    call_id = call_id or parsed_call_id
            if from_number and call_id:
                break
    except Exception:
        pass
    return from_number, call_id


def scan_sip_participant_display(ctx) -> Tuple[Optional[str], Optional[str]]:
    """Read from_number / call_id from participant name/metadata/display attrs."""
    from_number: Optional[str] = None
    call_id: Optional[str] = None
    try:
        for participant in ctx.room.remote_participants.values():
            candidates = [
                getattr(participant, "name", None),
                getattr(participant, "metadata", None),
            ]
            attrs = getattr(participant, "attributes", None) or {}
            for key in _DISPLAY_ATTR_KEYS:
                if attrs.get(key):
                    candidates.append(attrs.get(key))
            for raw in candidates:
                parsed_from, parsed_call_id = parse_sip_display_data(raw)
                from_number = from_number or parsed_from
                call_id = call_id or parsed_call_id
            if from_number and call_id:
                break
    except Exception:
        pass
    return from_number, call_id


def _find_header_value(headers: Dict[str, str], *names: str) -> Optional[str]:
    """Return header value if present (empty string counts as present)."""
    if not headers:
        return None
    lower_map = {str(k).lower(): str(k) for k in headers}
    for name in names:
        key = lower_map.get(str(name).lower())
        if key is not None:
            value = headers[key]
            if value is None:
                return ""
            return str(value)
    return None


async def fetch_sip_headers_via_rpc(
    ctx,
    include: Optional[tuple[str, ...]] = _RPC_HEADER_NAMES,
) -> Dict[str, str]:
    """
    Read SIP INVITE headers via LiveKit lk.sip.GetRemoteHeaders RPC.

    Use this for custom X-* headers (e.g. X-Lead-Name) and for From display data.
    Empty header values are kept (e.g. X-Lead-Name with no value).
    """
    local = getattr(ctx.room, "local_participant", None)
    if not local:
        return {}

    merged: Dict[str, str] = {}
    rpc_payload = json.dumps({"include": list(include)}) if include else json.dumps({})

    try:
        for participant in ctx.room.remote_participants.values():
            if not _is_sip_participant(participant):
                continue
            identity = str(getattr(participant, "identity", "") or "").strip()
            if not identity:
                continue
            try:
                response = await local.perform_rpc(
                    destination_identity=identity,
                    method="lk.sip.GetRemoteHeaders",
                    payload=rpc_payload,
                    response_timeout=3.0,
                )
                payload = json.loads(response or "{}")
                headers = payload.get("headers") or {}
                if not isinstance(headers, dict):
                    continue
                for name, value in headers.items():
                    if value is None:
                        continue
                    # Keep empty strings — Asterisk may send X-Lead-Name with no value.
                    merged[str(name)] = str(value)
                if merged:
                    logger.info(
                        "SIP headers via RPC identity=%s keys=%s",
                        identity,
                        sorted(merged.keys()),
                    )
                    break
            except Exception as exc:
                logger.warning(
                    "GetRemoteHeaders RPC failed identity=%s: %s",
                    identity,
                    exc,
                )
    except Exception as exc:
        logger.warning("fetch_sip_headers_via_rpc failed: %s", exc)

    return merged


async def fetch_from_display_via_rpc(ctx) -> Tuple[Optional[str], Optional[str]]:
    """
    Read Asterisk From display name via LiveKit lk.sip.GetRemoteHeaders RPC.

    LiveKit sip.phoneNumber comes from the SIP URI user part (e.g. 0729114435),
    not the quoted display name — this RPC returns the real From header.
    """
    headers = await fetch_sip_headers_via_rpc(ctx, include=("From",))
    from_header = headers.get("From") or headers.get("from") or headers.get("FROM")
    if not from_header:
        return None, None

    parsed_from, parsed_call_id = parse_from_sip_header(from_header)
    if parsed_from or parsed_call_id:
        logger.info(
            "From header via RPC from=%s call_id=%s header=%r",
            parsed_from,
            parsed_call_id,
            str(from_header)[:160],
        )
    return parsed_from, parsed_call_id


def _header_value_from_attrs(
    attrs: dict,
    *keys: str,
    allow_empty: bool = False,
) -> Optional[str]:
    for key in keys:
        if key not in attrs:
            continue
        value = attrs.get(key)
        if value is None:
            if allow_empty:
                return ""
            continue
        text = str(value)
        if allow_empty or text.strip():
            return text.strip() if not allow_empty else text
    lowered = {str(k).lower(): k for k in attrs}
    for key in keys:
        orig = lowered.get(str(key).lower())
        if orig is None:
            continue
        value = attrs.get(orig)
        if value is None:
            if allow_empty:
                return ""
            continue
        text = str(value)
        if allow_empty or text.strip():
            return text.strip() if not allow_empty else text
    return None


def scan_custom_sip_header_attrs(ctx) -> Dict[str, str]:
    """Read trunk-mapped custom headers from SIP participant attributes."""
    found: Dict[str, str] = {}
    try:
        for participant in ctx.room.remote_participants.values():
            attrs = getattr(participant, "attributes", None) or {}
            for logical_name, attr_keys in _CUSTOM_HEADER_SPECS:
                if logical_name in found:
                    continue
                value = _header_value_from_attrs(attrs, *attr_keys, allow_empty=True)
                if value is None:
                    for k, v in attrs.items():
                        lk = str(k).lower()
                        if "lead-name" in lk or "lead_name" in lk:
                            value = "" if v is None else str(v)
                            break
                if value is not None:
                    found[logical_name] = value
            if len(found) >= len(_CUSTOM_HEADER_SPECS):
                break
    except Exception:
        pass
    return found


def parse_custom_headers_from_rpc(headers: Dict[str, str]) -> Dict[str, str]:
    """Map raw SIP INVITE header names to logical fields used by the agent."""
    parsed: Dict[str, str] = {}
    lead = _find_header_value(headers, "X-Lead-Name", "x-lead-name", "X-LEAD-NAME")
    if lead is not None:
        parsed["lead_name"] = lead.strip() if lead else ""
    return parsed


def extract_sip_to_number(ctx) -> Optional[str]:
    to_number = None
    to_keys = (
        "sip.trunkPhoneNumber",
        "sip.toNumber",
        "sip.to_number",
        "sip.to",
        "sip.did",
        "sip.destination",
        "sip.called",
        "sip.request_uri",
        "destination",
        "called",
        "to",
    )

    def _scan_to(attrs: dict) -> Optional[str]:
        for key in to_keys:
            if attrs.get(key):
                digits = extract_did_like(attrs.get(key)) or extract_phone_like(attrs.get(key))
                if digits:
                    return digits
        for k, v in attrs.items():
            if not isinstance(v, str):
                continue
            lk = str(k).lower()
            if "to" in lk or "called" in lk or "destination" in lk or "did" in lk or "trunk" in lk:
                digits = extract_did_like(v) or extract_phone_like(v)
                if digits:
                    return digits
        return None

    try:
        room_attrs = getattr(ctx.room, "attributes", None) or {}
        to_number = to_number or _scan_to(room_attrs)
    except Exception:
        pass

    try:
        for participant in ctx.room.remote_participants.values():
            attrs = getattr(participant, "attributes", None) or {}
            to_number = to_number or _scan_to(attrs)
            if to_number:
                break
    except Exception:
        pass

    return to_number


def extract_sip_phone_number_fallback(ctx) -> Optional[str]:
    """Last resort: SIP URI user part via sip.phoneNumber (not the display name)."""
    phone_keys = ("sip.phoneNumber", "sip.fromNumber", "sip.from_number", "sip.from")
    try:
        for participant in ctx.room.remote_participants.values():
            attrs = getattr(participant, "attributes", None) or {}
            for key in phone_keys:
                if attrs.get(key):
                    digits = extract_phone_like(str(attrs.get(key))) or extract_did_like(str(attrs.get(key)))
                    if digits:
                        return digits
    except Exception:
        pass
    return None


def extract_sip_call_id_from_attrs(ctx) -> Optional[str]:
    call_id_keys = (
        "sip.callID",
        "sip.callId",
        "sip.call_id",
        "sip.call-id",
        "sip.callid",
        "sip.callIDFull",
        "sip.callIdFull",
        "sip.twilio.callSid",
        "sip.call",
    )

    def _scan(attrs: dict) -> Optional[str]:
        for key in call_id_keys:
            value = attrs.get(key)
            if value:
                return str(value).strip()
        return None

    try:
        room_attrs = getattr(ctx.room, "attributes", None) or {}
        found = _scan(room_attrs)
        if found:
            return found
    except Exception:
        pass

    try:
        for participant in ctx.room.remote_participants.values():
            attrs = getattr(participant, "attributes", None) or {}
            found = _scan(attrs)
            if found:
                return found
    except Exception:
        pass

    return None


def extract_sip_numbers(ctx) -> Tuple[Optional[str], Optional[str]]:
    display_from, _ = scan_sip_participant_display(ctx)
    header_from, _ = scan_sip_from_header_attrs(ctx)
    from_number = display_from or header_from or extract_sip_phone_number_fallback(ctx)
    to_number = extract_sip_to_number(ctx)
    return from_number, to_number


def extract_sip_call_id(ctx) -> Optional[str]:
    _, display_call_id = scan_sip_participant_display(ctx)
    if display_call_id:
        return display_call_id
    _, header_call_id = scan_sip_from_header_attrs(ctx)
    if header_call_id:
        return header_call_id
    return extract_sip_call_id_from_attrs(ctx)


def _from_header_from_rpc_headers(headers: Dict[str, str]) -> Optional[str]:
    return headers.get("From") or headers.get("from") or headers.get("FROM")


def _resolve_from_display_context(
    ctx,
    rpc_headers: Dict[str, str],
) -> Tuple[Optional[str], Optional[str]]:
    """
    Resolve caller number and call id from SIP From *display* data.

    Priority (unchanged — custom X-headers are handled separately):
      1. From header via GetRemoteHeaders RPC (quoted display: "num,callid")
      2. sip.h.From / sip.fromHeader participant attributes
      3. participant name / metadata / displayName attributes
    """
    from_header = _from_header_from_rpc_headers(rpc_headers)
    rpc_from: Optional[str] = None
    rpc_call_id: Optional[str] = None
    if from_header:
        rpc_from, rpc_call_id = parse_from_sip_header(from_header)
        if rpc_from or rpc_call_id:
            logger.info(
                "From display via RPC from=%s call_id=%s header=%r",
                rpc_from,
                rpc_call_id,
                str(from_header)[:160],
            )

    header_from, header_call_id = scan_sip_from_header_attrs(ctx)
    display_from, display_call_id = scan_sip_participant_display(ctx)

    from_number = rpc_from or header_from or display_from
    call_id = rpc_call_id or header_call_id or display_call_id
    return from_number, call_id


async def extract_sip_call_context_with_retry(
    ctx,
    attempts: int = 8,
    delay_s: float = 0.25,
) -> Tuple[Optional[str], Optional[str], Optional[str], Dict[str, str]]:
    """Return (from_number, to_number, sip_call_id, custom_headers) with brief retries."""
    last_from: Optional[str] = None
    last_to: Optional[str] = None
    last_call_id: Optional[str] = None
    custom_headers: Dict[str, str] = {}

    for attempt in range(max(1, attempts)):
        # One RPC fetch for From display + custom X-* headers (e.g. X-Lead-Name).
        rpc_headers = await fetch_sip_headers_via_rpc(ctx)

        # --- From display data (Asterisk "7780158135,77801581351785305414") ---
        display_from, display_call_id = _resolve_from_display_context(ctx, rpc_headers)
        if not display_from and not display_call_id:
            # Retry From-only RPC if combined header fetch returned nothing useful.
            display_from, display_call_id = await fetch_from_display_via_rpc(ctx)

        last_from = display_from or last_from
        last_call_id = display_call_id or last_call_id
        last_to = extract_sip_to_number(ctx) or last_to

        # --- Custom SIP headers (separate from From display) ---
        if _find_header_value(rpc_headers, "X-Lead-Name", "x-lead-name") is None:
            # Empty X-* headers may be omitted from include-filtered RPC — fetch all headers once.
            all_rpc_headers = await fetch_sip_headers_via_rpc(ctx, include=None)
            rpc_headers = {**all_rpc_headers, **rpc_headers}

        attr_headers = scan_custom_sip_header_attrs(ctx)
        rpc_custom = parse_custom_headers_from_rpc(rpc_headers)
        custom_headers = {**attr_headers, **rpc_custom, **custom_headers}

        if not last_from:
            last_from = extract_sip_phone_number_fallback(ctx)

        if not last_call_id:
            last_call_id = extract_sip_call_id_from_attrs(ctx)

        core_ready = bool(last_from and last_to and last_call_id)
        # headers_to_attributes (e.g. sip.x-lead-name) can arrive after From display — keep retrying.
        _MIN_ATTEMPTS_FOR_CUSTOM_HEADERS = 3
        if core_ready and (
            "lead_name" in custom_headers
            or attempt + 1 >= _MIN_ATTEMPTS_FOR_CUSTOM_HEADERS
        ):
            break

        if attempt == 0:
            if "lead_name" not in custom_headers and _find_header_value(
                rpc_headers, "X-Lead-Name", "x-lead-name"
            ) is None:
                logger.info(
                    "X-Lead-Name not in SIP INVITE (RPC keys=%s). "
                    "Add X-Lead-Name on Asterisk INVITE or check trunk headers_to_attributes.",
                    sorted(rpc_headers.keys()),
                )
            elif "lead_name" in custom_headers and custom_headers["lead_name"] == "":
                logger.info("X-Lead-Name present in SIP INVITE but empty")
            try:
                for participant in ctx.room.remote_participants.values():
                    attrs = getattr(participant, "attributes", {}) or {}
                    logger.info(
                        "SIP participant debug identity=%s name=%r from_display=%s lead_attr=%s attrs_keys=%s",
                        getattr(participant, "identity", "?"),
                        getattr(participant, "name", None),
                        _header_value_from_attrs(
                            attrs,
                            *_FROM_HEADER_ATTR_KEYS,
                            *_DISPLAY_ATTR_KEYS,
                        ),
                        _header_value_from_attrs(attrs, "sip.x-lead-name", "sip.h.X-Lead-Name"),
                        sorted(attrs.keys()),
                    )
            except Exception:
                logger.exception("Error while logging participant attributes")

        await asyncio.sleep(delay_s)

    if custom_headers:
        logger.info("SIP custom headers resolved: %s", custom_headers)

    return last_from, last_to, last_call_id, custom_headers


def resolve_call_sid(sip_call_id: Optional[str], fallback: str) -> str:
    """Prefer provider call id from From display data for downstream correlation."""
    candidate = str(sip_call_id or "").strip()
    return candidate or fallback
dddddddddddd