#!/usr/bin/env python3
"""
Clean up Figma-exported SVG artifacts:
- Remove degenerate subpaths (bbox < 5px)
- Remove micro-segments (anchors within 3px of previous)
- Remove needle zigzag spikes (A → intermediate → back-to-A pattern)
- Remove phantom paths (no fill, no stroke)
- Add stroke-linejoin=miter stroke-miterlimit=10 on stroked elements
  missing stroke-linejoin/linecap attributes

Usage:
    python3 clean_figma_svg.py input.svg output.svg
"""
import re
import sys

ARITY = {'M':2,'L':2,'H':1,'V':1,'C':6,'S':4,'Q':4,'T':2,'A':7,'Z':0}

def tokenize(d):
    tokens = []
    i = 0
    while i < len(d):
        c = d[i]
        if c.isalpha(): tokens.append(('cmd', c)); i += 1
        elif c in ' ,\t\n\r': i += 1
        else:
            m = re.match(r'-?\d+\.?\d*(?:[eE][-+]?\d+)?', d[i:])
            if m: tokens.append(('num', float(m.group()))); i += len(m.group())
            else: i += 1
    return tokens

def parse_to_anchors(d):
    tokens = tokenize(d)
    anchors = []
    cx = cy = 0; sx = sy = 0
    i = 0
    while i < len(tokens):
        if tokens[i][0] != 'cmd': i += 1; continue
        cmd = tokens[i][1]; i += 1
        ucmd = cmd.upper(); relative = cmd.islower()
        arity = ARITY.get(ucmd, 0)
        if ucmd == 'Z':
            anchors.append(('Z', sx, sy, []))
            cx, cy = sx, sy
            continue
        while i < len(tokens) and tokens[i][0] == 'num':
            group = []
            for _ in range(arity):
                if i >= len(tokens) or tokens[i][0] != 'num': break
                group.append(tokens[i][1]); i += 1
            if len(group) < arity: break
            abs_group = list(group)
            if relative:
                if ucmd in ('M','L','T'): abs_group[0]+=cx; abs_group[1]+=cy
                elif ucmd == 'C':
                    for k in (0,2,4): abs_group[k]+=cx
                    for k in (1,3,5): abs_group[k]+=cy
                elif ucmd in ('Q','S'):
                    for k in (0,2): abs_group[k]+=cx
                    for k in (1,3): abs_group[k]+=cy
                elif ucmd == 'H': abs_group[0]+=cx
                elif ucmd == 'V': abs_group[0]+=cy
                elif ucmd == 'A':
                    abs_group[5]+=cx; abs_group[6]+=cy
            if ucmd in ('M','L','T'): nx, ny = abs_group[0], abs_group[1]
            elif ucmd == 'C': nx, ny = abs_group[4], abs_group[5]
            elif ucmd in ('Q','S'): nx, ny = abs_group[2], abs_group[3]
            elif ucmd == 'H': nx, ny = abs_group[0], cy
            elif ucmd == 'V': nx, ny = cx, abs_group[0]
            elif ucmd == 'A': nx, ny = abs_group[5], abs_group[6]
            else: nx, ny = cx, cy
            if ucmd == 'M': sx, sy = nx, ny
            anchors.append((cmd.upper(), nx, ny, abs_group))
            cx, cy = nx, ny
    return anchors

def anchors_to_d(anchors):
    parts = []
    for a in anchors:
        cmd, ex, ey, args = a
        if cmd == 'Z': parts.append('Z')
        elif cmd == 'M': parts.append(f'M{ex:g} {ey:g}')
        elif cmd in ('L','T','H','V'): parts.append(f'L{ex:g} {ey:g}')
        elif cmd == 'C': parts.append(f'C{args[0]:g} {args[1]:g} {args[2]:g} {args[3]:g} {args[4]:g} {args[5]:g}')
        elif cmd == 'Q': parts.append(f'Q{args[0]:g} {args[1]:g} {args[2]:g} {args[3]:g}')
        elif cmd == 'S': parts.append(f'S{args[0]:g} {args[1]:g} {args[2]:g} {args[3]:g}')
        elif cmd == 'A': parts.append(f'A{args[0]:g} {args[1]:g} {args[2]:g} {args[3]:g} {args[4]:g} {args[5]:g} {args[6]:g}')
    return ''.join(parts)

def dist(a, b): return ((a[1]-b[1])**2 + (a[2]-b[2])**2)**0.5

def clean_micro_segments(anchors, tol=3.0):
    if not anchors: return anchors
    out = [anchors[0]]
    for a in anchors[1:]:
        if a[0] in ('Z','M'): out.append(a); continue
        if dist(out[-1], a) < tol: continue
        out.append(a)
    return out

def remove_needle_spikes(anchors, close_tol=5.0, max_intermediate=3):
    result = []
    i = 0; n = len(anchors)
    while i < n:
        if anchors[i][0] in ('Z','M'): result.append(anchors[i]); i += 1; continue
        found = False
        for j in range(i+2, min(i+max_intermediate+2, n)):
            if anchors[j][0] in ('Z','M'): break
            if dist(anchors[i], anchors[j]) < close_tol:
                result.append(anchors[i])
                i = j + 1
                found = True
                break
        if not found:
            result.append(anchors[i])
            i += 1
    return result

def remove_tiny_subpaths(d, bbox_min=5):
    subpaths = re.split(r'(?=M)', d)
    subpaths = [s for s in subpaths if s.strip()]
    kept = []
    for sp in subpaths:
        nums = [float(n) for n in re.findall(r'-?\d+\.?\d*', sp)]
        if len(nums) >= 2:
            xs = nums[0::2]; ys = nums[1::2]
            if max(xs) - min(xs) > bbox_min or max(ys) - min(ys) > bbox_min:
                kept.append(sp)
    return ''.join(kept)

def clean_path_d(d):
    d = remove_tiny_subpaths(d)
    if len(d) < 500: return d
    anchors = parse_to_anchors(d)
    anchors = clean_micro_segments(anchors, tol=3.0)
    anchors = remove_needle_spikes(anchors, close_tol=5.0, max_intermediate=3)
    anchors = clean_micro_segments(anchors, tol=3.0)
    return anchors_to_d(anchors)

def clean_svg(svg):
    # Protect contents of <defs>, <mask>, <clipPath>, <pattern>, <symbol>
    # by temporarily replacing them with placeholders
    protected_blocks = []
    def save_block(match):
        protected_blocks.append(match.group(0))
        return f'<!--PROTECTED_{len(protected_blocks)-1}-->'
    
    for tag in ('defs', 'mask', 'clipPath', 'pattern', 'symbol'):
        svg = re.sub(
            rf'<{tag}\b[^>]*>.*?</{tag}>',
            save_block,
            svg,
            flags=re.DOTALL
        )
    
    # 1. Remove phantom paths (no fill, no stroke, AND no mask/filter/clip-path reference)
    def remove_phantom(match):
        tag = match.group(0)
        has_fill = 'fill="' in tag and 'fill="none"' not in tag
        has_stroke = 'stroke="' in tag and 'stroke="none"' not in tag
        has_mask = 'mask=' in tag or 'filter=' in tag or 'clip-path=' in tag
        if not has_fill and not has_stroke and not has_mask:
            return ''
        return tag
    svg = re.sub(r'<path[^/]*/>', remove_phantom, svg)
    
    # 2. Clean path d attributes (micro-segments, needles, tiny subpaths)
    # GUARD: only clean paths that have a stroke. Filled-only paths have thin contours
    # whose two sides are deliberately close, and our cleaning would collapse them.
    def fix_path(match):
        tag = match.group(0)
        stroke_m = re.search(r'stroke="([^"]*)"', tag)
        has_stroke = stroke_m and stroke_m.group(1) != 'none'
        d_m = re.search(r'd="([^"]+)"', tag)
        if not d_m:
            return tag
        d = d_m.group(1)
        if has_stroke:
            new_d = clean_path_d(d)
        else:
            new_d = remove_tiny_subpaths(d)
        return tag.replace(f'd="{d}"', f'd="{new_d}"')
    svg = re.sub(r'<path[^/]*/>', fix_path, svg)
    
    # 3. Add pointy joins with generous miter on stroked elements
    def fix_stroke_attrs(match):
        tag = match.group(0)
        if 'stroke=' in tag and 'stroke-width' in tag and 'stroke="none"' not in tag:
            if 'stroke-linejoin' not in tag and 'stroke-linecap' not in tag:
                tag = tag.replace('stroke-width', 'stroke-linejoin="miter" stroke-miterlimit="10" stroke-width', 1)
        return tag
    svg = re.sub(r'<(path|line|ellipse|rect|polyline|polygon)[^/]*/>', fix_stroke_attrs, svg)
    
    # Restore protected blocks
    for i, block in enumerate(protected_blocks):
        svg = svg.replace(f'<!--PROTECTED_{i}-->', block)
    
    return svg

if __name__ == '__main__':
    inp = sys.argv[1] if len(sys.argv) > 1 else 'input.svg'
    out = sys.argv[2] if len(sys.argv) > 2 else 'output.svg'
    with open(inp) as f: svg = f.read()
    cleaned = clean_svg(svg)
    with open(out, 'w') as f: f.write(cleaned)
    print(f"Cleaned: {len(svg)} bytes → {len(cleaned)} bytes")
